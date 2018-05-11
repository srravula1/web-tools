import logging
from flask import jsonify, request
import flask_login
import json
import os
import re
import time
import codecs
from werkzeug.utils import secure_filename
import csv as pycsv

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
# from sklearn.model_selection import StratifiedKFold
from sklearn.externals import joblib
# from sklearn.metrics import precision_score, recall_score

from server import app, base_dir, TOOL_API_KEY
from server.views.sources.collection import allowed_file
from server.util.request import api_error_handler, json_error_response, form_fields_required, arguments_required
from server.auth import user_mediacloud_key, user_mediacloud_client, user_admin_mediacloud_client

logger = logging.getLogger(__name__)

MODEL_FILENAME_TEMPLATE = 'topic-{}-{}.pkl' # topic id, model_name
VECTORIZER_FILENAME_TEMPLATE = 'topic-{}-{}-vec.pkl' # topic id, model_name
SAMPLE_STORIES_FILENAME_TEMPLATE = 'topic-{}-{}-sample-stories.txt' # topic id, model name
SAMPLE_STORIES_IDS_FILENAME_TEMPLATE = 'topic-{}-{}-sample-stories-ids.txt' # topic id, model name
TRAINING_SET_HEADERS = ['stories_id', 'label']

MIN_DF_DEFAULT = 0.1
MAX_DF_DEFAULT = 0.9

def download_template():
    # TODO
    pass

def _parse_stories_from_csv_upload(filepath):
    # only allow 'stories_id' and 'label' columns
    acceptable_column_names = TRAINING_SET_HEADERS

    # TODO: look up what rU means
    with open(filepath, 'rU') as f:
        reader = pycsv.DictReader(f)
        reader.fieldnames = acceptable_column_names
        stories_ids = []
        labels = []
        reader.next()   # skip column headers
        for row_num, row in enumerate(reader):
            stories_id = row['stories_id']
            label = row['label']

            # validate row entries
            try:
                stories_id = int(stories_id)
            except Exception as e:
                # TODO: should return row number and failed id
                logger.error("Couldn't process a CSV row: " + str(e))
                raise Exception("couldn't process a CSV row: " + str(e))
            try:
                label = int(label)
            except Exception as e:
                # TODO: should return row number and failed id
                logger.error("Couldn't process a CSV row: " + str(e))
                raise Exception("couldn't process a CSV row: " + str(e))
            if label != 1 and label != 0:
                # TODO: should return row number and failed id
                logger.error("couldn't process a CSV row: invalid label on row {}".format(row_num))
                raise Exception("couldn't process a CSV row: invalid label on row {}".format(row_num))

            stories_ids.append(stories_id)
            labels.append(label)

    return stories_ids, labels

def _save_model_and_vectorizer(model, vectorizer, topics_id, model_name):
    # See: http://scikit-learn.org/stable/modules/model_persistence.html
    MODEL_FILENAME = MODEL_FILENAME_TEMPLATE.format(topics_id, model_name)
    VECTORIZER_FILENAME = VECTORIZER_FILENAME_TEMPLATE.format(topics_id, model_name)
    joblib.dump(model, os.path.join(base_dir, 'server', 'static', 'data', MODEL_FILENAME))
    joblib.dump(vectorizer, os.path.join(base_dir, 'server', 'static', 'data', VECTORIZER_FILENAME))

def _load_model_and_vectorizer(topics_id, subtopic_name):
    model_name = subtopic_name.strip().replace(' ', '-')
    MODEL_FILENAME = MODEL_FILENAME_TEMPLATE.format(topics_id, model_name)
    VECTORIZER_FILENAME = VECTORIZER_FILENAME_TEMPLATE.format(topics_id, model_name)
    model = joblib.load(os.path.join(base_dir, 'server', 'static', 'data', MODEL_FILENAME))
    vectorizer = joblib.load(os.path.join(base_dir, 'server', 'static', 'data', VECTORIZER_FILENAME))
    return (model, vectorizer)

def _download_stories_text(stories_ids, filepath):
    """
    Story IDs to Text file
    - For now create new text files and write to them...
    - perhaps there's a better way to do this, not sure if memory will ever be an issue
    """
    user_mc = user_admin_mediacloud_client(user_mc_key=TOOL_API_KEY)
    with codecs.open(filepath, 'w', 'utf-8') as fp:
        for story_id in stories_ids:
            print story_id
            print type(story_id)
            story_details = user_mc.story(story_id, sentences=True)
            sentences = story_details['story_sentences']
            for sd in sentences:
                sent = re.sub(r'[^\w\s-]', '', sd['sentence'])
                sent = re.sub(r'[\s-]', ' ', sent)
                fp.write(sent.lower() + ' ')
            fp.write(u'\n')


@app.route('/api/topics/focal-sets/matching-stories/upload-training-set', methods=['POST'])
@flask_login.login_required
@api_error_handler
def upload_reference_set():
    time_start = time.time()

    # verify the file
    if 'file' not in request.files:
        return json_error_response('No file part')
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return json_error_response('No selected file')
    if not(uploaded_file and allowed_file(uploaded_file.filename)):
        return json_error_response('Invalid file')

    # have to save b/c otherwise we can't locate the file path (security restriction)... can delete afterwards
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(uploaded_file.filename))
    uploaded_file.save(filepath)
    time_file_saved = time.time()

    # parse story data out of the file
    # QUESTION: Should I add a try-catch here and handle error message nicely?
    stories_ids, labels = _parse_stories_from_csv_upload(filepath)

    if len(stories_ids) > 300:
        # TODO: discuss/determine appropriate training set limit
        return jsonify({'status': 'Error', 'message': 'Too many stories in training set. The limit is 300.'})
    else:
        time_end = time.time()
        logger.debug("upload_file: {}".format(time_end - time_start))
        logger.debug("  save file: {}".format(time_file_saved - time_start))
        logger.debug(" processing: {}".format(time_end - time_file_saved))

        return jsonify({'storiesIds': stories_ids, 'labels': labels})


@app.route('/api/topics/<topics_id>/focal-sets/matching-stories/generate-model', methods=['POST'])
@flask_login.login_required
@api_error_handler
def generate_model(topics_id):
    # @param trainingSet: tuple of story_ids list and labels list
    # print request.form

    subtopic_name = request.form.get('topicName')
    model_name = subtopic_name.strip().replace(' ', '-')
    stories_ids = request.form.get('ids')
    stories_ids = '[' + stories_ids + ']'  # blah supah hack
    stories_ids = json.loads(stories_ids)
    labels = request.form.get('labels')
    labels = '[' + labels + ']'  # blah supah hack
    labels = json.loads(labels)
    filename = 'training-story-text.txt'

    # download text of stories from story_ids list
    print 'downloading raw text from story ids...'
    filepath = os.path.join(base_dir, 'server', 'static', 'data', filename)
    if not os.path.isfile(filepath): # add this check for dev so we aren't downloading these stories a zillion times
        _download_stories_text(stories_ids, filepath)

    # Load and vectorize data
    with open(filepath) as f:
        stories = f.readlines()
    print len(stories)
    vectorizer = TfidfVectorizer(sublinear_tf=True, stop_words='english', min_df=MIN_DF_DEFAULT, max_df=MAX_DF_DEFAULT)
    vectorizer.fit(stories)
    X_train = vectorizer.transform(stories)
    y_train = np.asarray(labels)
    print 'number of examples:', X_train.shape
    print 'number of labels:', y_train.shape
    print

    # Train model
    print 'Training model...'
    clf = MultinomialNB()
    model = clf.fit(X_train, y_train)
    print '...done!'
    print
    print 'Training Score Accuracy:'
    # TODO: figure out structure of output here
    print model.score(X_train, y_train)

    # Cross-Validation
    # print "Cross-Validation..."
    # skf = StratifiedKFold(n_splits=3)
    # test_prec_scores = []
    # test_rec_scores = []
    # for train_index, test_index in skf.split(X_train, y_train):
    #     # print("TRAIN:", train_index, "TEST:", test_index)
    #     X_train_val, X_test_val = X_train[train_index], X_train[test_index]
    #     y_train_val, y_test_val = y_train[train_index], y_train[test_index]
    #     clf = MultinomialNB()
    #     model = clf.fit(X_train_val, y_train_val)
    #
    #     # get precision and recall
    #     test_prec_score = precision_score(y_test_val, model.predict(X_test_val))
    #     test_rec_score = recall_score(y_test_val, model.predict(X_test_val))
    #
    #     # add scores to lists
    #     test_prec_scores.append(test_prec_score)
    #     test_rec_scores.append(test_rec_score)
    #
    # print 'average test precision:', np.mean(test_prec_scores)
    # print 'std:', np.std(test_prec_scores)
    # print 'average test recall:', np.mean(test_rec_scores)
    # print 'std:', np.std(test_rec_scores)

    # Pickle model and vectorizer
    # TODO: pickle precision and recall scores
    _save_model_and_vectorizer(model, vectorizer, topics_id, subtopic_name)

    # clean up
    # TODO: remove comment once ready to deploy
    # os.remove(filepath)

    return jsonify({'results': model_name})


@app.route('/api/topics/<topics_id>/focal-sets/<focalset_name>/matching-stories/prob-words', methods=['GET'])
@flask_login.login_required
@api_error_handler
def get_probable_words_list(topics_id, focalset_name):
    print 'reached prob word function'
    model, vectorizer = _load_model_and_vectorizer(topics_id, focalset_name)

    # Get list of probabilities
    probs_0 = model.feature_log_prob_[0].tolist()
    probs_1 = model.feature_log_prob_[1].tolist()

    # Get model vocab
    vocab = vectorizer.vocabulary_ # (maps terms to feature indices)

    # Map words to model probabilities
    word_to_probs_0 = {}
    word_to_probs_1 = {}
    for v in vocab.keys():
        feature_idx = vocab[v]
        prob_0 = probs_0[feature_idx]
        prob_1 = probs_1[feature_idx]
        word_to_probs_0[v] = prob_0
        word_to_probs_1[v] = prob_1

    # Get most probable words
    top_words_0 = sorted(word_to_probs_0.items(), key=lambda x: x[1])[:12]  # TODO: make constant
    top_words_0 = map(lambda x: x[0], top_words_0)
    top_words_1 = sorted(word_to_probs_1.items(), key=lambda x: x[1])[:12] # TODO: make constant
    top_words_1 = map(lambda x: x[0], top_words_1)
    return jsonify({'list': [top_words_0, top_words_1]})

@app.route('/api/topics/<topics_id>/focal-sets/<focalset_name>/matching-stories/sample', methods=['GET'])
@flask_login.login_required
@api_error_handler
def classify_random_sample(topics_id, focalset_name):
    print 'focal set name:', focalset_name

    # Get ids for 30 random Stories
    # TODO: figure out randomization later, for now just grab the first 30 stories from api
    user_mc = user_admin_mediacloud_client(user_mc_key=TOOL_API_KEY)
    sample_stories = user_mc.storyList(solr_query='{~ topic:'+topics_id+'}', rows=30, sentences=True)

    # Process story sentences and ids
    test_stories_text = []
    test_stories = []
    for i, story in enumerate(sample_stories):
        test_stories.append(story)
        test_stories_text.append('')
        for sentence in story['story_sentences']:
            sent = re.sub(r'[^\w\s-]', '', sentence['sentence'])
            sent = re.sub(r'[\s-]', ' ', sent)
            test_stories_text[i] += (sent.lower() + ' ')

    print test_stories_text[0]

    # Get predictions on samples
    model, vectorizer = _load_model_and_vectorizer(topics_id, focalset_name)
    X_test = vectorizer.transform(test_stories_text)
    predicted_labels = model.predict(X_test).tolist()
    predicted_probs = model.predict_proba(X_test).tolist()

    return jsonify({'sampleStories': test_stories, 'labels': predicted_labels, 'probs': predicted_probs})


# end

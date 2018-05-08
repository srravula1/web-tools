import logging
from flask import jsonify, request
import flask_login
import json
import os
import math

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
# from sklearn.model_selection import StratifiedKFold
from sklearn.externals import joblib
# from sklearn.metrics import precision_score, recall_score

from server import app, base_dir
from server.util.request import api_error_handler, json_error_response, form_fields_required, arguments_required
from server.auth import user_mediacloud_key, user_mediacloud_client

logger = logging.getLogger(__name__)

MODEL_FILENAME_TEMPLATE = 'topic-{}-{}.pkl' # topic id, model_name
VECTORIZER_FILENAME_TEMPLATE = 'topic-{}-{}-vec.pkl' # topic id, model_name


def download_template():
    # TODO
    pass

def _parse_stories_from_csv_upload(filepath):
    pass
    # with open(filepath, 'rb') as csvfile:
    #     id_reader = csv.DictReader(csvfile)
    #     story_ids = []
    #     labels = []
    #     for row in id_reader:
    #         story_ids.append(row['positive'])  # TODO: think of a good name...
    #         story_ids.append(row['negative'])
    #         labels.append(1.0)
    #         labels.append(0.0)
    # return (story_ids, labels)

def _save_model_and_vectorizer(topics_id, subtopic_name):
    # See: http://scikit-learn.org/stable/modules/model_persistence.html
    model_name = subtopic_name.strip().replace(' ', '-')
    MODEL_FILENAME = MODEL_FILENAME_TEMPLATE.format(topics_id, model_name)
    VECTORIZER_FILENAME = VECTORIZER_FILENAME_TEMPLATE.format(topics_id, model_name)
    joblib.dump(model, MODEL_FILENAME)
    joblib.dump(vectorizer, VECTORIZER_FILENAME)

def _load_model_and_vectorizer(topics_id, subtopic_name):
    model_name = subtopic_name.strip().replace(' ', '-')
    MODEL_FILENAME = MODEL_FILENAME_TEMPLATE.format(topics_id, model_name)
    VECTORIZER_FILENAME = VECTORIZER_FILENAME_TEMPLATE.format(topics_id, model_name)
    model = joblib.load(os.path.join(base_dir, 'server', 'static', 'data', MODEL_FILENAME))
    vectorizer = joblib.load(os.path.join(base_dir, 'server', 'static', 'data', VECTORIZER_FILENAME))
    return (model, vectorizer)

def download_stories(story_ids, file_name):
    """
    Story IDs to Text file
    - For now create new text files and write to them...
    - perhaps there's a better way to do this, not sure if memory will ever be an issue
    """
    with codecs.open(file_name, 'w', 'utf-8') as fp:
        for story_id in story_ids:
            story_details = mc.story(story_id, sentences=True)
            sentences = story_details['story_sentences']
            for sd in sentences:
                #fp.write(re.sub(r'\s', ' ', sd['sentence']))
                #fp.write(u' ')
                sent = re.sub(r'[^\w\s-]', '', sd['sentence'])
                sent = re.sub(r'[\s-]', ' ', sent)
                fp.write(sent.lower() + ' ')
            fp.write(u'\n')


# @app.route('/api/topics/<topics_id>/focal-sets/matching-stores/upload-reference-set', methods=['POST'])
# @flask_login.login_required
# @api_error_handler
# NOTE: this will be called when user clicks 'upload' button
#           will pass results into request object for generate_model when 'Next' button is clicked
def upload_reference_set():
    pass
    # time_start = time.time()
    # # grab and verify the file
    # if 'file' not in request.files:
    #     return json_error_response('No file part')
    # uploaded_file = request.files['file']
    # if uploaded_file.filename == '':
    #     return json_error_response('No selected file')
    # if not(uploaded_file and allowed_file(uploaded_file.filename)):
    #     return json_error_response('Invalid file')
    # filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(uploaded_file.filename))
    # # have to save b/c otherwise we can't locate the file path (security restriction)... can delete afterwards
    # uploaded_file.save(filepath)
    # time_file_saved = time.time()
    # # parse all the source data out of the file
    # sources_to_update, sources_to_create = _parse_sources_from_csv_upload(filepath)
    # all_results = []
    # all_errors = []
    # if len(sources_to_create) > 300:
    #     return jsonify({'status': 'Error', 'message': 'Too many sources to upload. The limit is 300.'})
    # else:
    #     audit = []
    #     if len(sources_to_create) > 0:
    #         audit_results, successful, errors = _create_or_update_sources(sources_to_create, True)
    #         all_results += successful
    #         audit += audit_results
    #         all_errors += errors
    #     if len(sources_to_update) > 0:
    #         audit_results, successful, errors = _create_or_update_sources(sources_to_update, False)
    #         all_results += successful
    #         audit += audit_results
    #         all_errors += errors
    #     try:
    #         mail_enabled = config.get('SMTP_ENABLED')
    #         if mail_enabled is '1':
    #             _email_batch_source_update_results(audit)
    #     except ConfigException:
    #         logger.debug("Skipping collection file upload confirmation email")
    #     for media in all_results:
    #         if 'media_id' in media:
    #             media['media_id'] = int(
    #                 media['media_id'])  # make sure they are ints so no-dupes logic works on front end
    #     time_end = time.time()
    #     logger.debug("upload_file: {}".format(time_end - time_start))
    #     logger.debug("  save file: {}".format(time_file_saved - time_start))
    #     logger.debug("  processing: {}".format(time_end - time_file_saved))
    #     return jsonify({'results': all_results})

# NOTE: will be called when 'Next' button pressed on EditMatchingStoriesContainer page
# @app.route('/api/topics/<topics_id>/focal-sets/matching-stories/...TODO...', methods=['GET'])
# @flask_login.login_required
# @arguments_required('trainingSet')
# @api_error_handler

def generate_model(topics_id, training_set, subtopic_name):
    pass
    # @param trainingSet: tuple of story_ids list and labels list
    # story_ids = trainingSet[0]
    # labels = trainingSet[1]
    #
    # # download text of stories from story_ids list
    #
    # print 'downloading raw text from story ids...'
    # STORY_TEXT_FILEPATH = 'path/to/storytext'
    # download_stories(story_ids, STORY_TEXT_FILEPATH)
    #
    #
    # # Load and vectorize data
    #
    # with open(STORY_TEXT_FILEPATH) as fp:
    #     stories = fp.readlines()
    # print len(stories)
    # min_doc_freq = os.getenv('MIN_DF', MIN_DF_DEFAULT)
    # max_doc_freq = os.getenv('MAX_DF', MAX_DF_DEFAULT)
    # # TODO: set params might be cleaner?
    # vectorizer = TfidfVectorizer(sublinear_tf=True, stop_words='english', min_df=min_doc_freq, max_df=max_doc_freq)
    # vectorizer.fit(stories)
    # X_train = vectorizer.transform(stories)
    # y_train = np.asarray(labels)
    # print 'number of examples:', X_train.shape
    # print 'number of labels:', y_train.shape
    # print
    #
    #
    # # Train model
    #
    # print 'Training model...'
    # clf = MultinomialNB()
    # model = clf.fit(X_train, y_train)
    # print '...done!'
    # print
    # print 'Training Score Accuracy:'
    # # TODO: figure out structure of output here
    # print model.score(X_train, y_train)
    #
    #
    # # Cross-Validation
    #
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
    #
    #
    # # Pickle model and vectorizer
    #
    # _save_model_and_vectorizer(topics_id, subtopic_name)
    #
    #
    # # TODO: return precision and recall scores here?

# NOTE: will be called when 'Understanding Model' page loads
@app.route('/api/topics/<topics_id>/focal-sets/<focalset_name>/matching-stories/prob-words', methods=['GET'])
@flask_login.login_required
@api_error_handler
def get_probable_words_list(topics_id, focalset_name):
    print 'reached prob word function'
    model, vectorizer = _load_model_and_vectorizer(topics_id, focalset_name)

    # Get list of probabilities
    probs_0 = map(lambda x: math.exp(x), model.feature_log_prob_[0])
    probs_1 = map(lambda x: math.exp(x), model.feature_log_prob_[1])

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

# def classify_random_sample(topics_id):
#     # TODO: figure out if there's a general admin key we can use here...
#     #       Code below will only work if user is an Admin
#     # user_mc = user_admin_mediacloud_client(user_mc_key='?')
#     user_mc = user_mediacloud_client()
#
#     # Get ids for 30 random Stories
#     # TODO: figure out randomization later, for now just grab the first 30 stories from api
#     sample_stories = user_mc.storyList(solr_query='{~ topic:}'.format(topics_id), rows=30, sentences=True)
#
#     # Process story sentences and ids
#     test_stories_text = []
#     test_stories_ids = []
#     for i, story in enumerate(sample_stories):
#         test_stories_ids.append(story['stories_id'])
#         test_stories_text.append('')
#     	for sentence in story['story_sentences']:
#     		sent = re.sub(r'[^\w\s-]', '', sentence['sentence'])
#     		sent = re.sub(r'[\s-]', ' ', sent)
#             test_stories_text[i] += (sent.lower() + ' ')
#
#     # Get predictions on samples
#     focalset_name = request.form['focalSetName']
#     model, vectorizer = _load_model_and_vectorizer(topics_id, focalset_name)
#     X_test = vectorizer.transform(test_stories_text)
#     predicted_labels = model.predict(X_test)
#     predicted_probs = model.predict_proba(X_test)
#
#     return (test_stories_ids, predicted_labels, predicted_probs)








# end

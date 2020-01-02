import logging
from flask import jsonify, request
import flask_login
import json
import os
import re
import tempfile
import time
import csv
from werkzeug.utils import secure_filename
from sklearn.externals import joblib

from server import app, base_dir, TOOL_API_KEY
from server.views.sources.collection import allowed_file
from server.util.request import api_error_handler, json_error_response
from server.auth import user_mediacloud_key
import server.util.classifier as classifier
import server.views.topics.apicache as apicache
import server.views.apicache as base_apicache

logger = logging.getLogger(__name__)

MODEL_FILENAME_TEMPLATE = 'topic-{}-{}.pkl'  # topic id, model_name
VECTORIZER_FILENAME_TEMPLATE = 'topic-{}-{}-vec.pkl'  # topic id, model_name
SAMPLE_STORIES_FILENAME_TEMPLATE = 'topic-{}-{}-sample-stories.txt'  # topic id, model name
SAMPLE_STORIES_IDS_FILENAME_TEMPLATE = 'topic-{}-{}-sample-stories-ids.txt'  # topic id, model name
TRAINING_SET_HEADERS = ['stories_id', 'label']


def download_template():
    # TODO - download CSV with TRAINING_SET_HEADERS column names
    pass


def _parse_stories_from_csv_upload(filepath):
    acceptable_column_names = TRAINING_SET_HEADERS

    with open(filepath, 'rU') as f:
        reader = csv.DictReader(f)
        reader.fieldnames = acceptable_column_names
        stories_ids = []
        labels = []
        row_num = 1
        next(reader)  # skip column headers
        for row in reader:
            stories_id = row['stories_id']
            label = row['label']

            # validate row entries
            try:
                stories_id = int(stories_id)
            except Exception:
                err_msg = "Couldn't process row number {}: invalid stories_id".format(str(row_num + 2))
                logger.error(err_msg)
                raise Exception(err_msg)
            try:
                label = int(label)
            except Exception:
                err_msg = "Couldn't process row number {}: label must be 0 or 1".format(str(row_num + 2))
                logger.error(err_msg)
                raise Exception(err_msg)
            if label != 1 and label != 0:
                err_msg = "Couldn't process row number {}: label must be 0 or 1".format(row_num + 2)
                logger.error(err_msg)
                raise Exception(err_msg)

            stories_ids.append(stories_id)
            labels.append(label)
            row_num += 1

    return stories_ids, labels


def _save_model_and_vectorizer(model, vectorizer, topics_id, subtopic_name):
    # See: http://scikit-learn.org/stable/modules/model_persistence.html
    model_name = subtopic_name.strip().replace(' ', '-')
    model_filename = MODEL_FILENAME_TEMPLATE.format(topics_id, model_name)
    vectorizer_filename = VECTORIZER_FILENAME_TEMPLATE.format(topics_id, model_name)
    joblib.dump(model, os.path.join(base_dir, 'server', 'static', 'data', model_filename))
    joblib.dump(vectorizer, os.path.join(base_dir, 'server', 'static', 'data', vectorizer_filename))


def _load_model_and_vectorizer(topics_id, subtopic_name):
    model_name = subtopic_name.strip().replace(' ', '-')
    model_filename = MODEL_FILENAME_TEMPLATE.format(topics_id, model_name)
    vectorizer_filename = VECTORIZER_FILENAME_TEMPLATE.format(topics_id, model_name)
    model = joblib.load(os.path.join(base_dir, 'server', 'static', 'data', model_filename))
    vectorizer = joblib.load(os.path.join(base_dir, 'server', 'static', 'data', vectorizer_filename))
    return model, vectorizer


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
    try:
        stories_ids, labels = _parse_stories_from_csv_upload(filepath)
    except Exception as e:
        return json_error_response(str(e))

    if len(stories_ids) > 500:
        # TODO: determine appropriate training set limit
        return json_error_response('Too many stories in training set. The limit is 300.')
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
    subtopic_name = request.form.get('modelName')
    story_ids = json.loads('[{}]'.format(request.form.get('ids')))
    labels = json.loads('[{}]'.format(request.form.get('labels')))
    if len(story_ids) != len(labels):
        # a useful sanity check
        return json_error_response('Not all stories labeled ({} stories, {} labels)'.format(len(story_ids), len(labels)))
    # download text and train model
    fp = tempfile.NamedTemporaryFile(mode='w')
    story_ids, labels = classifier.download_training_data(story_ids, labels, fp.name)  # removes any stories with no text
    results = classifier.train_multinomial_naive_bayes_classifier(fp.name, labels)
    # pickle model and vectorizer (RISK: forwards binary compatability? should we save trianing data instead?)
    _save_model_and_vectorizer(results['model'], results['vectorizer'], topics_id, subtopic_name)
    return jsonify({'precision': results['precision'], 'recall': results['recall'],
                    'topWords': [list(results['top_words_0']), list(results['top_words_1'])]})


@app.route('/api/topics/<topics_id>/focal-sets/<focalset_name>/matching-stories/sample', methods=['GET'])
@flask_login.login_required
@api_error_handler
def classify_random_sample(topics_id, focalset_name):
    # Grab 30 stories from topic
    sample_stories = [s['stories_id'] for s in apicache.topic_story_list(user_mediacloud_key, topics_id, limit=30)['stories']]
    test_stories = [base_apicache.story(TOOL_API_KEY, stories_id, text=True) for stories_id in sample_stories]
    test_stories_text = []
    for story in test_stories:
        test_stories_text.append(classifier.clean_text(story['story_text']))
    # Get predictions on samples
    model, vectorizer = _load_model_and_vectorizer(topics_id, focalset_name)
    x_test = vectorizer.transform(test_stories_text)
    predicted_labels = model.predict(x_test).tolist()
    predicted_probs = model.predict_proba(x_test).tolist()
    # return results for client to display
    for story in test_stories:
        del story['story_text']
    return jsonify({'sampleStories': test_stories, 'labels': predicted_labels, 'probs': predicted_probs})

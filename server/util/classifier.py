import re
import logging
import time
import numpy as np
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import precision_score, recall_score

from server import TOOL_API_KEY
import server.views.apicache as api_cache

MIN_DF_DEFAULT = 0.1
MAX_DF_DEFAULT = 0.9

logger = logging.getLogger(__name__)


def clean_text(raw_text: str) -> str:
    try:
        text = re.sub(r'[^\w\s-]', '', raw_text)
        text = re.sub(r'[\s-]', ' ', text)
        return text.lower()
    except TypeError:
        logging.error("Couldn't process string {}".format(raw_text))
        return ''


def download_training_data(story_ids: List[int], labels: List[int], dest_path: str):
    """
    This needs to remove any stories that don't have text
    """
    logger.debug('Downloading story sentences...')
    start = time.time()
    # need to use the tool client here to get raw sentences, and fetch one-by-one to ensure results appear
    stories = [api_cache.story(TOOL_API_KEY, stories_id, text=True) for stories_id in story_ids]
    story_ids_with_text = []
    labels_with_text = []
    with open(dest_path, 'w') as fp:
        for idx in range(0, len(story_ids)):
            story = stories[idx]
            if (story['story_text'] is None) or (len(story['story_text']) is 0):
                logger.warning("Story {} has no text :-(".format(story['stories_id']))
                continue
            story_ids_with_text.append(story['stories_id'])
            labels_with_text.append(labels[idx])
            text = clean_text(story['story_text'])
            fp.write(text + '\n')
    end = time.time()
    logger.debug('Download + write time: {}'.format(end - start))
    return story_ids_with_text, labels_with_text


def train_multinomial_naive_bayes_classifier(text_path: str, labels: List[int]) -> dict:
    # Load and vectorize data
    with open(text_path) as f:
        stories = f.readlines()
    logger.debug('number of stories: {}'.format(len(stories)))
    vectorizer = TfidfVectorizer(sublinear_tf=True, stop_words='english', min_df=MIN_DF_DEFAULT, max_df=MAX_DF_DEFAULT)
    vectorizer.fit(stories)
    x_train = vectorizer.transform(stories)
    y_train = np.asarray(labels)
    logger.debug('number of examples: {}'.format(str(x_train.shape)))
    logger.debug('number of labels: {}'.format(str(y_train.shape)))

    # Train model
    logger.debug('Training model...')
    clf = MultinomialNB()
    model = clf.fit(x_train, y_train)

    # Cross-Validation
    logger.debug('Cross-Validating...')
    skf = StratifiedKFold(n_splits=3)
    test_prec_scores = []
    test_rec_scores = []
    for train_index, test_index in skf.split(x_train, y_train):
        x_train_val, x_test_val = x_train[train_index], x_train[test_index]
        y_train_val, y_test_val = y_train[train_index], y_train[test_index]
        clf = MultinomialNB()
        model = clf.fit(x_train_val, y_train_val)

        # get precision and recall
        test_prec_score = precision_score(y_test_val, model.predict(x_test_val))
        test_rec_score = recall_score(y_test_val, model.predict(x_test_val))

        # add scores to lists
        test_prec_scores.append(test_prec_score)
        test_rec_scores.append(test_rec_score)

    precision = np.mean(test_prec_scores)
    recall = np.mean(test_rec_scores)
    logger.debug('average test precision: {}'.format(str(precision)))
    logger.debug('average test recall: {}'.format(str(recall)))

    # Get most likely words
    num_top_words = 20
    probs_0 = model.feature_log_prob_[0].tolist()
    probs_1 = model.feature_log_prob_[1].tolist()

    # Map words to model probabilities
    vocab = vectorizer.vocabulary_  # (maps terms to feature indices)
    word_to_probs_0 = {}
    word_to_probs_1 = {}
    for v in vocab.keys():
        feature_idx = vocab[v]
        prob_0 = probs_0[feature_idx]
        prob_1 = probs_1[feature_idx]
        word_to_probs_0[v] = prob_0
        word_to_probs_1[v] = prob_1

    # Get most probable words
    top_words_0 = sorted(word_to_probs_0.items(), key=lambda x: x[1], reverse=True)[:num_top_words]
    top_words_0 = map(lambda x: x[0], top_words_0)
    top_words_1 = sorted(word_to_probs_1.items(), key=lambda x: x[1], reverse=True)[:num_top_words]
    top_words_1 = map(lambda x: x[0], top_words_1)

    return {
        'model': model,
        'vectorizer': vectorizer,
        'precision': precision,
        'recall': recall,
        'top_words_0': list(top_words_0),
        'top_words_1': list(top_words_1),
    }

import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const UPLOAD_TRAINING_SET = 'UPLOAD_TRAINING_SET';
export const GENERATE_MODEL = 'GENERATE_MODEL';
export const FETCH_MATCHING_STORIES_PROBABLE_WORDS = 'FETCH_MATCHING_STORIES_PROBABLE_WORDS';
export const FETCH_MATCHING_STORIES_SAMPLE = 'FETCH_MATCHING_STORIES_SAMPLE';

// pass in file
export const uploadTrainingSet = createAsyncAction(UPLOAD_TRAINING_SET, api.matchingStoriesUploadTrainingSet);

// pass in topic name, subtopic name, stories id, labels
export const generateModel = createAsyncAction(GENERATE_MODEL, api.matchingStoriesGenerateModel);

// pass in topic id, subtopic name
export const fetchMatchingStoriesProbableWords = createAsyncAction(FETCH_MATCHING_STORIES_PROBABLE_WORDS, api.matchingStoriesProbableWords);

// pass in topic id, subtopic name
export const fetchMatchingStoriesSample = createAsyncAction(FETCH_MATCHING_STORIES_SAMPLE, api.matchingStoriesSample);

import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const MATCHING_STORIES_MODEL_NAME = 'MATCHING_STORIES_MODEL_NAME';
export const UPLOAD_TRAINING_SET = 'UPLOAD_TRAINING_SET';
export const GENERATE_MODEL = 'GENERATE_MODEL';
export const FETCH_MATCHING_STORIES_SAMPLE = 'FETCH_MATCHING_STORIES_SAMPLE';

// pass in the model name
export const modelName = createAction(MATCHING_STORIES_MODEL_NAME, name => name);

// pass in file
export const uploadTrainingSet = createAsyncAction(UPLOAD_TRAINING_SET, api.matchingStoriesUploadTrainingSet);

// pass in topic name, subtopic name, stories id, labels
export const generateModel = createAsyncAction(GENERATE_MODEL, api.matchingStoriesGenerateModel);

// pass in topic id, subtopic name
export const fetchMatchingStoriesSample = createAsyncAction(FETCH_MATCHING_STORIES_SAMPLE, api.matchingStoriesSample);

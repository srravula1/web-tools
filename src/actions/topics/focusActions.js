import { createAction } from 'redux-actions';
import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const UPDATE_OR_CREATE_FOCUS_DEFINITION = 'UPDATE_OR_CREATE_FOCUS_DEFINITION';

export const CREATE_FOCUS_DEFINITION = 'CREATE_FOCUS_DEFINITION';
export const DELETE_FOCUS_DEFINITION = 'DELETE_FOCUS_DEFINITION';
export const GO_TO_CREATE_FOCUS_STEP = 'GO_TO_CREATE_FOCUS_STEP';
export const FETCH_CREATE_FOCUS_KEYWORD_STORIES = 'FETCH_CREATE_FOCUS_KEYWORD_STORIES';
export const FETCH_CREATE_FOCUS_KEYWORD_STORY_COUNTS = 'FETCH_CREATE_FOCUS_KEYWORD_STORY_COUNTS';
export const CREATE_RETWEET_FOCUS_SET = 'CREATE_RETWEET_FOCUS_SET';
export const CREATE_TOP_COUNTRIES_FOCUS_SET = 'CREATE_TOP_COUNTRIES_FOCUS_SET';
export const CREATE_NYT_THEME_FOCUS_SET = 'CREATE_NYT_THEME_FOCUS_SET';
export const CREATE_MEDIA_TYPE_FOCUS_SET = 'CREATE_MEDIA_TYPE_FOCUS_SET';
export const GO_TO_MATCHING_STORIES_CONFIG_STEP = 'GO_TO_MATCHING_STORIES_CONFIG_STEP';

export const submitFocusUpdateOrCreate = createAsyncAction(UPDATE_OR_CREATE_FOCUS_DEFINITION, api.updateOrCreateFocusDefinition);

// pass in topicId and focusDefenitionId
export const deleteFocusDefinition = createAsyncAction(DELETE_FOCUS_DEFINITION, api.deleteFocusDefinition);

// pass in the number of the step to go to
export const goToCreateFocusStep = createAction(GO_TO_CREATE_FOCUS_STEP, step => step);

// pass in topicId, limit, q
export const fetchCreateFocusKeywordStories = createAsyncAction(FETCH_CREATE_FOCUS_KEYWORD_STORIES, api.topicTopStories);

// pass in topicId, q
export const fetchCreateFocusKeywordStoryCounts = createAsyncAction(FETCH_CREATE_FOCUS_KEYWORD_STORY_COUNTS, api.topicStoryCounts);

export const createRetweetFocalSet = createAsyncAction(CREATE_RETWEET_FOCUS_SET, api.createRetweetFocalSet);

export const createTopCountriesFocalSet = createAsyncAction(CREATE_TOP_COUNTRIES_FOCUS_SET, api.createTopCountriesFocalSet);

export const createMediaTypeFocalSet = createAsyncAction(CREATE_MEDIA_TYPE_FOCUS_SET, api.createMediaTypeFocalSet);

export const createNytThemeFocalSet = createAsyncAction(CREATE_NYT_THEME_FOCUS_SET, api.createNytThemeFocalSet);

// pass in the number of the step to go to
export const goToMatchingStoriesConfigStep = createAction(GO_TO_MATCHING_STORIES_CONFIG_STEP, step => step);

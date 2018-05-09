import { FETCH_MATCHING_STORIES_SAMPLE } from '../../../../../actions/topics/matchingStoriesActions';
import { createAsyncReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesSample = createAsyncReducer({
  initialState: {
    sampleStories: [],
    labels: [],
    probs: [],
  },
  action: FETCH_MATCHING_STORIES_SAMPLE,
});

export default matchingStoriesSample;

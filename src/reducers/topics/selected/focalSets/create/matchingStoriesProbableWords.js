import { FETCH_MATCHING_STORIES_PROBABLE_WORDS } from '../../../../../actions/topics/matchingStoriesActions';
import { createAsyncReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesProbableWords = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_MATCHING_STORIES_PROBABLE_WORDS,
});

export default matchingStoriesProbableWords;

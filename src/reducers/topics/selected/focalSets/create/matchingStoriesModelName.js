import { MATCHING_STORIES_MODEL_NAME } from '../../../../../actions/topicActions';
import { createReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesModelName = createReducer({
  initialState: {
    name: '',
  },
  [MATCHING_STORIES_MODEL_NAME]: payload => ({
    name: payload,
  }),
});

export default matchingStoriesModelName;

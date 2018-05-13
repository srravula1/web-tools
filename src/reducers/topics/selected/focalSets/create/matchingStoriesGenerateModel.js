import { GENERATE_MODEL } from '../../../../../actions/topics/matchingStoriesActions';
import { createAsyncReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesGenerateModel = createAsyncReducer({
  initialState: {
    precision: 0.0,
    recall: 0.0,
  },
  action: GENERATE_MODEL,
});

export default matchingStoriesGenerateModel;

import { GENERATE_MODEL } from '../../../../../actions/topics/matchingStoriesActions';
import { createAsyncReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesGenerateModel = createAsyncReducer({
  initialState: {
    results: '',
  },
  action: GENERATE_MODEL,
});

export default matchingStoriesGenerateModel;

import { UPLOAD_TRAINING_SET } from '../../../../../actions/topics/matchingStoriesActions';
import { createAsyncReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesUploadCSV = createAsyncReducer({
  initialState: {
    storiesIds: [],
    labels: [],
  },
  action: UPLOAD_TRAINING_SET,
});

export default matchingStoriesUploadCSV;

import { GO_TO_MATCHING_STORIES_CONFIG_STEP } from '../../../../../actions/topicActions';
import { createReducer } from '../../../../../lib/reduxHelpers';

const matchingStoriesConfigWorkflow = createReducer({
  initialState: {
    currentStep: 0,
  },
  [GO_TO_MATCHING_STORIES_CONFIG_STEP]: payload => ({
    currentStep: payload,
  }),
});

export default matchingStoriesConfigWorkflow;

import { combineReducers } from 'redux';
import matchingStories from './matchingStories';
import matchingStoryCounts from './matchingStoryCounts';
import retweetCoverage from './retweetCoverage';
import retweetStoryCounts from './retweetStoryCounts';
import topCountriesCoverage from './topCountriesCoverage';
import topCountriesStoryCounts from './topCountriesStoryCounts';
import nytThemeCoverage from './nytThemeCoverage';
import nytThemeStoryCounts from './nytThemeStoryCounts';
import mediaTypeCoverage from './mediaTypeCoverage';
import mediaTypeStoryCounts from './mediaTypeStoryCounts';
import workflow from './workflow';
import mediaTypes from './mediaTypes';
import matchingStoriesConfigWorkflow from './matchingStoriesConfigWorkflow';

const createFocusReducer = combineReducers({
  matchingStories,
  matchingStoryCounts,
  retweetCoverage,
  retweetStoryCounts,
  topCountriesCoverage,
  topCountriesStoryCounts,
  nytThemeCoverage,
  nytThemeStoryCounts,
  mediaTypeCoverage,
  mediaTypeStoryCounts,
  workflow,
  mediaTypes,
  matchingStoriesConfigWorkflow,
});

export default createFocusReducer;

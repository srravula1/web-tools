import { createAsyncAction } from '../../lib/reduxHelpers';
import * as api from '../../lib/serverApi/topics';

export const FETCH_MATCHING_STORIES_PROBABLE_WORDS = 'FETCH_MATCHING_STORIES_PROBABLE_WORDS';
// export const FETCH_TOPIC_NYT_TAG_COUNTS = 'FETCH_TOPIC_NYT_TAG_COUNTS';

// pass in topic id, subtopic name
export const fetchMatchingStoriesProbableWords = createAsyncAction(FETCH_MATCHING_STORIES_PROBABLE_WORDS, api.matchingStoriesProbableWords);

// pass in topic id, filters
// export const fetchTopicNytLabelCounts = createAsyncAction(FETCH_TOPIC_NYT_TAG_COUNTS, api.topicNytTaggedStoryCounts);

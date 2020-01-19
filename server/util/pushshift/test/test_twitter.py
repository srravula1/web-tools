import unittest
import datetime as dt

import server.util.pushshift.twitter as ps_twitter

TERM = "trump"


class TwitterTest(unittest.TestCase):

    def testMatchingTweets(self):
        results = ps_twitter.matching_tweets(TERM)
        assert isinstance(results, list) is True
        for tweet in results:
            assert TERM in tweet['title'].lower()

    def testDatedMatchingTweets(self):
        results = ps_twitter.matching_tweets(TERM, start_date=dt.datetime.now() - dt.timedelta(days=5),
                                             end_date=dt.datetime.now())
        assert isinstance(results, list) is True
        for tweet in results:
            assert TERM in tweet['title'].lower()
            # TODO: check `created_at` to validate the search limits worked

    def testSplitCount(self):
        results = ps_twitter.tweet_split_count(TERM, start_date=dt.datetime.now() - dt.timedelta(days=5),
                                               end_date=dt.datetime.now())
        assert 'counts' in results
        assert isinstance(results['counts'], list) is True
        assert len(results['counts']) is 6

    def testTotalCount(self):
        results = ps_twitter.tweet_count(TERM, start_date=dt.datetime.now() - dt.timedelta(days=5),
                                         end_date=dt.datetime.now())
        assert results > 0

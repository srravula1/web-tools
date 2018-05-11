import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  intro: { id: 'focus.create.confirm.matchingStories.intro', defaultMessage: 'We will create 2 subtopics:' },
};

const MatchingStoriesSummary = (props) => {
  const { modelName } = props;
  return (
    <div className="focus-create-cofirm-retweet-partisanship">
      <p><FormattedMessage {...localMessages.intro} /></p>
      <ul>
        <li> { modelName } </li>
        <li> NOT {modelName} </li>
      </ul>
    </div>
  );
};

MatchingStoriesSummary.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  formValues: PropTypes.object.isRequired,
  // from state
  modelName: PropTypes.string.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
};
const mapStateToProps = state => ({
  modelName: state.topics.selected.focalSets.create.matchingStoriesModelName.name,
});

export default
  injectIntl(
    connect(mapStateToProps)(
      MatchingStoriesSummary
    )
  );

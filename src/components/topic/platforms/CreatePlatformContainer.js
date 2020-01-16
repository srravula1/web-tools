import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push, reset } from 'react-router-redux';
import PlatformWizard from './builder/PlatformWizard';
import { topicCreatePlatform, setTopicNeedsNewSnapshot } from '../../../actions/topicActions';
// import { LEVEL_ERROR } from '../../common/Notice';
import { updateFeedback } from '../../../actions/appActions';
import { platformChannelDataFormatter } from '../../util/topicUtil';

const DEFAULT_SELECTED_NUMBER = 5;

const localMessages = {
  platformNotSaved: { id: 'platform.create.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
  platformSaved: { id: 'platform.create.saved', defaultMessage: 'That worked!' },
  duplicateName: { id: 'platform.create.invalid', defaultMessage: 'Duplicate name. Choose a unique platform name.' },
  openWebSaved: { id: 'platform.create.openWebSaved', defaultMessage: 'We created a new Open Web platform' },
  twitterSaved: { id: 'platform.create.twitterSaved', defaultMessage: 'We created a new Twitter platform' },
  redditSaved: { id: 'platform.create.reddit.saved', defaultMessage: 'We created a new Reddit platform' },
};


const CreatePlatformContainer = (props) => {
  const { topicInfo, location, handleDone, selectedPlatform } = props;
  const initialValues = { numberSelected: DEFAULT_SELECTED_NUMBER, selectedPlatform };
  // default to any solr seed query they might be using already
  const initAndTopicInfoValues = { ...initialValues, ...topicInfo, query: topicInfo.solr_seed_query };
  return (
    <PlatformWizard
      topicId={topicInfo.topics_id}
      currentStep={0}
      initialValues={initAndTopicInfoValues}
      location={location}
      onDone={(id, values) => handleDone(initAndTopicInfoValues, values)}
    />
  );
};

CreatePlatformContainer.propTypes = {
  // from dispatch
  submitDone: PropTypes.func.isRequired,
  handleDone: PropTypes.func.isRequired,
  // from state
  values: PropTypes.object,
  selectedPlatform: PropTypes.object.isRequired,
  // from context:
  topicInfo: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
  topicInfo: state.topics.selected.info,
  selectedPlatform: state.topics.selected.platforms.selected,
});

const mapDispatchToProps = (dispatch, { intl }) => ({
  submitDone: (topicInfo, formValues) => {
    const formatPlatformChannelData = platformChannelDataFormatter(formValues.selectedPlatform.platform);
    const infoForQuery = {
      platform_type: formValues.selectedPlatform.platform,
      platform_query: formValues.query,
      platform_source: formValues.selectedPlatform.source,
      platform_channel: formatPlatformChannelData ? JSON.stringify(formatPlatformChannelData(formValues)) : JSON.stringify(formValues),
      start_date: topicInfo.start_date,
      end_date: topicInfo.end_date,
    };
    return dispatch(topicCreatePlatform(topicInfo.topics_id, infoForQuery))
      .then((results) => {
        if (results.success) {
          const platformSavedMessage = intl.formatMessage(localMessages.platformSaved);
          dispatch(setTopicNeedsNewSnapshot(true)); // user feedback
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: platformSavedMessage })); // user feedback
          dispatch(push(`/topics/${topicInfo.topics_id}/platforms/manage`));
          dispatch(reset('platform')); // it is a wizard so we have to do this by hand
        } else {
          const platformNotSavedMessage = intl.formatMessage(localMessages.platformNotSaved);
          dispatch(updateFeedback({ open: true, message: platformNotSavedMessage })); // user feedback
        }
      });
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps, ...dispatchProps, ...ownProps, handleDone: (topicId, formValues) => dispatchProps.submitDone(stateProps.topicInfo, formValues, stateProps) };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    CreatePlatformContainer
  )
);

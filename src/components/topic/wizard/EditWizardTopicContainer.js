import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import TopicBuilderWizard from './TopicBuilderWizard';
import PageTitle from '../../common/PageTitle';
import { TOPIC_FORM_MODE_EDIT } from './TopicForm';

const localMessages = {
  introTitle: { id: 'topic.modify.pageTitle', defaultMessage: 'Change Topic Dates / Spidering: Configure' },
  introDesc: { id: 'topic.modify.pageDesc', defaultMessage: 'Updating these fields will create a new version of your topic.' },
  previewTitle: { id: 'topic.modify.preview.title', defaultMessage: 'Change Topic Dates / Spidering: Preview' },
  previewDesc: { id: 'topic.modify.preview.about',
    defaultMessage: '<b>Make sure your topic looks right before you create a new version</b>. We start your version by finding all the stories in our database that match your query. From there we follow all the links and download them. We check if they match your keywords, and if they do then we add them to your topic (this is called "spidering"). Check the result below and make sure your topic is finding you the stories you want before creating it.' },
  validateTitle: { id: 'topic.modify.validate.title', defaultMessage: 'Change Topic Dates / Spidering: Validate 30 Sample Stories' },
  validateDesc: { id: 'topic.modify.validate.about',
    defaultMessage: 'To make sure the stories that match your seed query are relevant to your research, you need to review these samples to see if these are the kinds of stories you want. For each story, click "yes" if it is about the topic you are interested in.  Click "no" if it is not about the topic you are intereseted in.' },
  confirmTitle: { id: 'topic.modify.confirm.title', defaultMessage: 'Change Topic Dates / Spidering: Review and Confirm' },
  name: { id: 'topic.modify.confirm.name', defaultMessage: 'Name' },
  confirmDesc: { id: 'topic.modify.confirm.description', defaultMessage: 'Description' },
  confirmFeedback: { id: 'topic.modify.failed', defaultMessage: 'Successfully created a new version of your new topic!' },
  saveTopic: { id: 'topic.modify', defaultMessage: 'Generate The New Version' },
  updatingTitle: { id: 'topic.modify.title', defaultMessage: 'Please wait - we\'re creating a new version of your Topic now' },
  updatingDesc: { id: 'topic.modify.detail', defaultMessage: 'We are creating a new version of your topic now.  This can take a minute or so, just to make sure everyting is in order.  Once the new version is created, you\'ll be shown a page telling you we are gathering the stories.' },
  newVersion: { id: 'topic.modify.newVersion', defaultMessage: 'New Version' },
};

const EditWizardTopicContainer = ({ topic, location, intl }) => {
  const { formatMessage } = intl;
  const stepTexts = [
    {
      title: formatMessage(localMessages.introTitle),
      description: formatMessage(localMessages.introDesc),
    },
    {
      title: formatMessage(localMessages.previewTitle),
      description: formatMessage(localMessages.previewDesc),
    },
    {
      title: formatMessage(localMessages.validateTitle),
      description: formatMessage(localMessages.validateDesc),
    },
    {
      title: formatMessage(localMessages.confirmTitle),
      description: 'not used',
      saveTopic: formatMessage(localMessages.saveTopic),
      savingTitle: formatMessage(localMessages.updatingTitle),
      savingDesc: formatMessage(localMessages.updatingDesc),
    },
  ];
  return (
    <>
      <PageTitle value={localMessages.pageTitle} />
      <TopicBuilderWizard
        startStep={0}
        location={location}
        mode={TOPIC_FORM_MODE_EDIT}
        currentStepTexts={stepTexts}
        topic={topic}
      />
    </>
  );
};

EditWizardTopicContainer.propTypes = {
  // from compositional chain
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  // from store
  canCreateTopic: PropTypes.bool,
  runningTopics: PropTypes.array,
  topic: PropTypes.object,
};

const mapStateToProps = state => ({
  topic: state.topics.selected.info,
});

export default
injectIntl(
  connect(mapStateToProps)(
    EditWizardTopicContainer
  )
);

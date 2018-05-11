import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { ReadItNowButton } from '../../../../../common/IconButton';
import AppButton from '../../../../../common/AppButton';
import composeIntlForm from '../../../../../common/IntlForm';
import composeAsyncContainer from '../../../../../common/AsyncContainer';
import messages from '../../../../../../resources/messages';
// import MatchingStoriesSummaryContainer from './MatchingStoriesSummaryContainer';
import LinkWithFilters from '../../../../LinkWithFilters';
// import TopicStoryTable from '../../../../TopicStoryTable';
import { notEmptyString } from '../../../../../../lib/formValidators';
import { fetchMatchingStoriesSample } from '../../../../../../actions/topics/matchingStoriesActions';
import { goToCreateFocusStep, goToMatchingStoriesConfigStep } from '../../../../../../actions/topicActions';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.validate.title', defaultMessage: 'Validating the Model' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'Here are 30 stories from the topic. Check to see if our model\'s predictions were correct.' },
  errorNoTopicName: { id: 'focalTechnique.matchingStories.error', defaultMessage: 'You need to specify a topic name.' },
  match: { id: 'focus.create.validate.match', defaultMessage: 'Match' },
  notMatch: { id: 'focus.create.validate.noMatch', defaultMessage: 'Not a match' },
};


class ValidateMatchingStoriesContainer extends React.Component {

  handleReadItClick = (story) => {
    window.open(story.url, '_blank');
  }

  handleMatch = (e) => {
    console.log('match');
    console.log(e);
  }

  handleNotAMatch = (e) => {
    console.log('not a match');
    console.log(e);
  }

  render() {
    const { currentFocalTechnique, handleSubmit, handlePreviousStep, handleNextStep, topicId, sampleStories, sampleProbs, sampleLabels } = this.props;
    const { formatMessage } = this.props.intl;
    // const nextButtonDisabled = true;
    return (
      <Grid>
        <Row center="lg">
          <Col lg={8}>
            <form className="focus-create-validate-matchingStories" name="focusCreateValidateMatchingStoriesForm" onSubmit={handleSubmit(handleNextStep.bind(this))}>
              <Row start="lg">
                <Col lg={10}>
                  <h2><FormattedMessage {...localMessages.title} values={{ technique: currentFocalTechnique }} /></h2>
                  <p>
                    <FormattedMessage {...localMessages.about} />
                  </p>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={8} xs={12}>
                  <p>Recall: 100%</p>
                  <p>Precision: 100%</p>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={12}>
                  <div className="sample-story-table">
                    <table>
                      <tbody>
                        <tr>
                          <th className="story-title-col"><b>Sample Story</b></th>
                          <th>{}</th>
                          <th className="match-col"><b>Is this story a match?</b></th>
                        </tr>
                        {sampleStories.map((story, idx) => {
                          const match = (sampleLabels[idx] === 1.0);
                          const prob = Math.round(sampleProbs[idx][match ? 1 : 0] * 100 * 100) / 100;
                          let firstSentence = '';
                          // NOTE: the very first sentence tends to repeat the title word-for-word...
                          if (story.story_sentences[1]) {
                            firstSentence = story.story_sentences[1].sentence;
                          }

                          let modelGuess;
                          if (match) {
                            modelGuess = (
                              <div>
                                <Col lg={6}>
                                  <p> Our guess: ({prob}%) </p>
                                </Col>
                                <Col lg={6} />
                              </div>
                            );
                          } else {
                            modelGuess = (
                              <div>
                                <Row around="lg">
                                  <Col lg={6} />
                                  <Col lg={6}>
                                    <p> Our guess: ({prob}%) </p>
                                  </Col>
                                </Row>
                              </div>
                            );
                          }


                          return (<tr key={story.stories_id}>
                            <td>
                              <Row>
                                <Col lg={12}>
                                  <LinkWithFilters to={`/topics/${topicId}/stories/${story.stories_id}`}>
                                    { story.title }
                                  </LinkWithFilters>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg={12}>
                                  { firstSentence }
                                </Col>
                              </Row>
                            </td>
                            <td><ReadItNowButton onClick={this.handleReadItClick.bind(this, story)} /></td>
                            <td>
                              <Row around="lg">
                                <Col lg={6}>
                                  <AppButton className="match" flat onClick={this.handleMatch} label={formatMessage(localMessages.match)} />
                                </Col>
                                <Col lg={6}>
                                  <AppButton className="not-match" flat onClick={this.handleNotAMatch} label={formatMessage(localMessages.notMatch)} />
                                </Col>
                              </Row>
                              { modelGuess }
                            </td>
                          </tr>);
                        })
                        }
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={12}>
                  <br />
                  <AppButton flat onClick={handlePreviousStep} label={formatMessage(messages.previous)} />
                  &nbsp; &nbsp;
                  <AppButton type="submit" label={formatMessage(messages.next)} primary />
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }

}

ValidateMatchingStoriesContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  // from state
  formData: PropTypes.object,
  currentKeywords: PropTypes.string,
  currentFocalTechnique: PropTypes.string,
  sampleStories: PropTypes.array.isRequired,
  sampleProbs: PropTypes.array.isRequired,
  sampleLabels: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  // from dispatch
  handleNextStep: PropTypes.func.isRequired,
  handlePreviousStep: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentKeywords: formSelector(state, 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
  fetchStatus: state.topics.selected.focalSets.create.matchingStoriesSample.fetchStatus,
  sampleStories: state.topics.selected.focalSets.create.matchingStoriesSample.sampleStories,
  sampleProbs: state.topics.selected.focalSets.create.matchingStoriesSample.probs,
  sampleLabels: state.topics.selected.focalSets.create.matchingStoriesSample.labels,
  modelName: state.topics.selected.focalSets.create.matchingStoriesModelName.name,
});

const mapDispatchToProps = dispatch => ({
  handlePreviousStep: () => {
    dispatch(goToMatchingStoriesConfigStep(1));
  },
  handleNextStep: () => {
    dispatch(goToCreateFocusStep(2));
  },
  fetchStoriesSample: (topicId, modelName) => {
    dispatch(fetchMatchingStoriesSample(topicId, modelName));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      console.log(stateProps.sampleStories);
      if (stateProps.sampleStories && stateProps.sampleStories.length === 0) {
        dispatchProps.fetchStoriesSample(ownProps.topicId, stateProps.modelName);
      }
    },
  });
}

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.keywords)) {
    errors.keywords = localMessages.errorNoTopicName;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  validate,
};

export default
  injectIntl(
    composeIntlForm(
      reduxForm(reduxFormConfig)(
        connect(mapStateToProps, mapDispatchToProps, mergeProps)(
          composeAsyncContainer(
            ValidateMatchingStoriesContainer
          )
        )
      )
    )
  );

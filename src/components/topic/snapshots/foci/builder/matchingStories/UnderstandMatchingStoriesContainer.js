import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import composeIntlForm from '../../../../../common/IntlForm';
import composeAsyncContainer from '../../../../../common/AsyncContainer';
// import messages from '../../../../../../resources/messages';
import { notEmptyString } from '../../../../../../lib/formValidators';
import { generateModel, fetchMatchingStoriesProbableWords } from '../../../../../../actions/topics/matchingStoriesActions';
import { goToMatchingStoriesConfigStep } from '../../../../../../actions/topicActions';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.understand.title', defaultMessage: 'Understanding the Model' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'Stories including these words are likely to be classified as your topic:' },
  errorNoTopicName: { id: 'focalTechnique.matchingStories.error', defaultMessage: 'You need to specify a topic name.' },
  directions: { id: 'focalTechnique.matchingStories.directions', defaultMessage: 'Upload training data' },
  directionsDetails: { id: 'focalTechnique.matchingStories.directionsDetails', defaultMessage: 'Classify at least 25 stories manually to train our machine learning model. You can use this template to format the data' },
};

class UnderstandMatchingStoriesContainer extends React.Component {

  componentWillMount = () => {
    console.log('component mounting...');
  }

  render() {
    const { currentFocalTechnique, handleSubmit, handlePreviousStep, handleNextStep, probableWords } = this.props;
    // const { formatMessage } = this.props.intl;
    return (
      <Grid>
        <Row center="lg">
          <Col lg={8}>
            <form className="focus-create-understand-matchingStories" name="focusCreateUnderstandMatchingStoriesForm" onSubmit={handleSubmit(handleNextStep.bind(this))}>
              <Row start="lg">
                <Col lg={8} md={12}>
                  <h1><FormattedMessage {...localMessages.title} values={{ technique: currentFocalTechnique }} /></h1>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={12}>
                  <div>
                    <h3> {'Stories including these words are likely to be classified as your topic: '} </h3>
                    <div className="words-container">
                      <table>
                        <tbody>
                          <tr>
                            {probableWords[0].slice(0, 4).map((word, idx) => <td key={idx}>{word}</td>)}
                          </tr>
                          <tr>
                            {probableWords[0].slice(4, 8).map((word, idx) => <td key={idx}>{word}</td>)}
                          </tr>
                          <tr>
                            {probableWords[0].slice(8).map((word, idx) => <td key={idx}>{word}</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={12}>
                  <div>
                    <h3> {'Stories including these words are likely to NOT be classified as your topic: '} </h3>
                    <div className="words-container">
                      <table>
                        <tbody>
                          <tr>
                            {probableWords[1].slice(0, 4).map((word, idx) => <td key={idx}>{word}</td>)}
                          </tr>
                          <tr>
                            {probableWords[1].slice(4, 8).map((word, idx) => <td key={idx}>{word}</td>)}
                          </tr>
                          <tr>
                            {probableWords[1].slice(8).map((word, idx) => <td key={idx}>{word}</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={12} md={12}>
                  <br />
                  <h3> {'Do these words seem correct?'} </h3>
                  <p> {'If the words are correct, you can proceed to validating the model. If they are incorrect, you can upload a new set of training data.'} </p>
                  <FlatButton className="incorrect-words" onClick={handlePreviousStep} label={'No'} />
                  &nbsp; &nbsp;
                  <AppButton type="submit" label={'Yes'} primary />
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }

}

UnderstandMatchingStoriesContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  // from state
  formData: PropTypes.object,
  currentKeywords: PropTypes.string,
  currentFocalTechnique: PropTypes.string,
  probableWords: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  modelName: PropTypes.string.isRequired,
  // from dispatch
  handleNextStep: PropTypes.func.isRequired,
  handlePreviousStep: PropTypes.func.isRequired,
  fetchModel: PropTypes.func.isRequired,
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
  fetchStatus: state.topics.selected.focalSets.create.matchingStoriesProbableWords.fetchStatus,
  probableWords: state.topics.selected.focalSets.create.matchingStoriesProbableWords.list,
  modelName: state.topics.selected.focalSets.create.matchingStoriesModelName.name,
  storiesIds: state.topics.selected.focalSets.create.matchingStoriesUploadCSV.storiesIds,
  labels: state.topics.selected.focalSets.create.matchingStoriesUploadCSV.labels,
});

const mapDispatchToProps = dispatch => ({
  handlePreviousStep: () => {
    dispatch(goToMatchingStoriesConfigStep(0));
  },
  handleNextStep: () => {
    dispatch(goToMatchingStoriesConfigStep(2));
  },
  fetchModel: (topicId, topicName, ids, labels) => {
    dispatch(generateModel(topicId, { topicName, ids, labels }))
      .then(() => dispatch(fetchMatchingStoriesProbableWords(topicId, topicName)));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => dispatchProps.fetchModel(ownProps.topicId, stateProps.modelName, stateProps.storiesIds, stateProps.labels),
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
            UnderstandMatchingStoriesContainer
          )
        )
      )
    )
  );

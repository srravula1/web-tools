import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
// import LoadingSpinner from '../../../../../common/LoadingSpinner';
import AppButton from '../../../../../common/AppButton';
import composeIntlForm from '../../../../../common/IntlForm';
import messages from '../../../../../../resources/messages';
// import CollectionUploadConfirmer from '../../../../../source/collection/form/CollectionUploadConfirmer';
import { notEmptyString } from '../../../../../../lib/formValidators';
import { updateFeedback } from '../../../../../../actions/appActions';
import { goToCreateFocusStep, goToMatchingStoriesConfigStep, modelName, uploadTrainingSet } from '../../../../../../actions/topicActions';

const formSelector = formValueSelector('snapshotFocus');

const localMessages = {
  title: { id: 'focus.create.edit.title', defaultMessage: 'Create New Classification' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'After naming your new classification and providing some training data, you will be able to see our model\'s prediction on a sample set of stories.' },
  errorNoTopicName: { id: 'focalTechnique.matchingStories.error', defaultMessage: 'You need to specify a topic name.' },
  directions: { id: 'focalTechnique.matchingStories.directions', defaultMessage: 'Upload training data' },
  directionsDetails: { id: 'focalTechnique.matchingStories.directionsDetails', defaultMessage: 'Classify at least 50 stories manually to train our machine learning model. You can use this template to format the data' },
  feedback: { id: 'focalTechnique.matchingStories.upload.feedback', defaultMessage: 'This upload was successful' },
};


class EditMatchingStoriesContainer extends React.Component {

  selectedCSV = () => {
    this.setState({ confirmTemplate: true });
  }

  confirmLoadCSV = () => {
    this.setState({ confirmTemplate: false });
  }

  uploadCSV = () => {
    console.log('upload csv button was pressed');
    const { uploadCSVFile } = this.props;
    const fd = this.textInput.files[0];
    uploadCSVFile(fd);
    this.selectedCSV();
  }

  render() {
    const { renderTextField, currentFocalTechnique, handleSubmit, handlePreviousStep, handleNextStep } = this.props;
    const { formatMessage } = this.props.intl;
    // const btnLabel = 'gen model';

    // let confirmContent = null;
    // if (storiesIds && storiesIds.length > 0 && this.state && this.state.confirmTemplate) {
    //   confirmContent = (
    //     <p> Upload Successful! </p>
    //   );
    // } else if (this.state && this.state.confirmTemplate) {
    //   confirmContent = <LoadingSpinner />;
    // }

    return (
      <Grid>
        <Row center="lg">
          <Col lg={8}>
            <form className="focus-create-edit-matchingStories" name="focusCreateEditMatchingStoriesForm" onSubmit={handleSubmit(handleNextStep.bind(this))}>
              <Row start="lg">
                <Col lg={12}>
                  <h2><FormattedMessage {...localMessages.title} values={{ technique: currentFocalTechnique }} /></h2>
                  <p>
                    <FormattedMessage {...localMessages.about} />
                  </p>
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={6}>
                  <Field
                    name="topicName"
                    component={renderTextField}
                    floatingLabelText={'Enter a name'}
                    fullWidth
                  />
                </Col>
              </Row>
              <Row start="lg">
                <Col lg={8} xs={12}>
                  <h2><FormattedMessage {...localMessages.directions} /></h2>
                  <p>
                    <FormattedMessage {...localMessages.directionsDetails} />
                  </p>
                  <input type="file" onChange={this.uploadCSV} ref={(input) => { this.textInput = input; }} disabled={this.state && this.state.confirmTemplate} />
                </Col>
              </Row>
              <Row end="lg">
                <Col lg={8}>
                  <br />
                  <AppButton flat onClick={handlePreviousStep} label={formatMessage(messages.previous)} />
                  &nbsp; &nbsp;
                  <AppButton type="submit" label={formatMessage(messages.next)} primary />
                  { /* <AppButton flat onClick={handleNextStep} label={btnLabel} /> */ }
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }

}

EditMatchingStoriesContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  // from state
  formData: PropTypes.object,
  currentKeywords: PropTypes.string,
  currentFocalTechnique: PropTypes.string,
  fetchStatus: PropTypes.string.isRequired,
  storiesIds: PropTypes.array,
  labels: PropTypes.array,
  // from dispatch
  handleNextStep: PropTypes.func.isRequired,
  handlePreviousStep: PropTypes.func.isRequired,
  uploadCSVFile: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentKeywords: formSelector(state, 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
  fetchStatus: state.topics.selected.focalSets.create.matchingStoriesUploadCSV.fetchStatus,
  storiesIds: state.topics.selected.focalSets.create.matchingStoriesUploadCSV.storiesIds,
  labels: state.topics.selected.focalSets.create.matchingStoriesUploadCSV.labels,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handlePreviousStep: () => {
    dispatch(goToCreateFocusStep(0));
  },
  handleNextStep: (e) => {
    console.log(e.topicName);
    // dispatch(generateModel(ownProps.topicId, { topicName: e.topicName, ids: props.storiesIds, labels: props.labels }))
    //   .then(() => dispatch(goToMatchingStoriesConfigStep(1)));
    // dispatch(modelName(e.topicName))
    //   .then(() => dispatch(goToMatchingStoriesConfigStep(1)));
    dispatch(modelName(e.topicName));
    dispatch(goToMatchingStoriesConfigStep(1));
  },
  uploadCSVFile: (csvFile) => {
    dispatch(uploadTrainingSet({ file: csvFile }))
      .then((results) => {
        if (results.status === 'Error') {
          updateFeedback({ open: true, message: ownProps.intl.formatMessage({ id: 'focalTechnique.matchingStories.upload.error', defaultMessage: results.message }) });
        } else {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
        }
      });
  },
});

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.keywords)) {
    errors.keywords = localMessages.errorNoTopicName;
  }
  return errors;
}

// TODO: figure out what this is
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
        connect(mapStateToProps, mapDispatchToProps)(
          EditMatchingStoriesContainer
        )
      )
    )
  );

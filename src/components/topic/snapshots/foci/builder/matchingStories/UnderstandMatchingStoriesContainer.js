import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../../../common/AppButton';
import composeIntlForm from '../../../../../common/IntlForm';
// import messages from '../../../../../../resources/messages';
import { notEmptyString } from '../../../../../../lib/formValidators';
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

  onUploadCSV = () => {
    console.log('upload csv button was pressed');
    // want to update state of 'nextButtonDisabled' if file name is success
  }

  render() {
    const { currentFocalTechnique, handleSubmit, handlePreviousStep, handleNextStep } = this.props;
    // const { formatMessage } = this.props.intl;
    // const nextButtonDisabled = true;
    return (
      <Grid>
        <form className="focus-create-understand-matchingStories" name="focusCreateUnderstandMatchingStoriesForm" onSubmit={handleSubmit(handleNextStep.bind(this))}>
          <Row>
            <Col lg={10}>
              <h2><FormattedMessage {...localMessages.title} values={{ technique: currentFocalTechnique }} /></h2>
              <p>
                <FormattedMessage {...localMessages.about} />
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={8} xs={12}>
              <p> {'Stories including these words are likely to be classified as your topic: '} </p>
              <code> {'freedom free speech Europen court'} </code>
            </Col>
          </Row>
          <Row>
            <Col lg={8} xs={12}>
              <p> {'Stories including these words are likely to NOT be classified as your topic: '} </p>
              <code> {'cupcake iPhone holidays horror-thriller obliterated'} </code>
            </Col>
          </Row>
          <Row>
            <Col lg={8} xs={12}>
              <br />
              <p> {'Do these words seem correct?'} </p>
              <p> {'If the words are correct, you can proceed to validating the model. If they are incorrect, you can upload a new set of training data.'} </p>
              <AppButton flat onClick={handlePreviousStep} label={'No they are incorrect'} />
              &nbsp; &nbsp;
              <AppButton type="submit" label={'Yes they are correct'} primary />
            </Col>
          </Row>
        </form>
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
  // from dispatch
  handleNextStep: PropTypes.func.isRequired,
  handlePreviousStep: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  formData: state.form.snapshotFocus,
  currentKeywords: formSelector(state, 'keywords'),
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = dispatch => ({
  handlePreviousStep: () => {
    dispatch(goToMatchingStoriesConfigStep(0));
  },
  handleNextStep: () => {
    dispatch(goToMatchingStoriesConfigStep(2));
  },
});

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.keywords)) {
    errors.keywords = localMessages.errorNoTopicName;
  }
  // TODO: add csv validation
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
          UnderstandMatchingStoriesContainer
        )
      )
    )
  );

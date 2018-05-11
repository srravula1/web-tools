import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
// import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
// import BackLinkingControlBar from '../../../BackLinkingControlBar';
import { FormattedMessage, injectIntl } from 'react-intl';
import EditMatchingStoriesContainer from './EditMatchingStoriesContainer';
import UnderstandMatchingStoriesContainer from './UnderstandMatchingStoriesContainer';
import ValidateMatchingStoriesContainer from './ValidateMatchingStoriesContainer';
import messages from '../../../../../../resources/messages';
import { goToMatchingStoriesConfigStep } from '../../../../../../actions/topicActions';

// const localMessages = {
//   backToFociManager: { id: 'backToFociManager', defaultMessage: 'back to Subtopic Builder' },
//   step0Name: { id: 'focus.create.step0Name', defaultMessage: 'Pick a Technique' },
//   step1Name: { id: 'focus.create.step1Name', defaultMessage: 'Configure' },
//   step2Name: { id: 'focus.create.step2Name', defaultMessage: 'Describe' },
//   step3Name: { id: 'focus.create.step3Name', defaultMessage: 'Confirm' },
// };

class MatchingStoriesConfigureWizard extends React.Component {

  componentWillMount = () => {
    const { startStep, goToStep } = this.props;
    console.log('component mounting...');
    goToStep(startStep || 0);
  }

  shouldComponentUpdate = (nextProps) => {
    const { currentStep } = this.props;
    return currentStep !== nextProps.currentStep;
  }

  // componentWillUnmount = () => {
  //   const { handleUnmount } = this.props;
  //   handleUnmount();
  // }

  render() {
    const { topicId, initialValues, currentStep } = this.props;
    // const steps = [
    //   EditMatchingStoriesContainer,
    //   // FocusForm2ConfigureContainer,
    //   // FocusForm3DescribeContainer,
    //   // FocusForm4ConfirmContainer,
    // ];
    // const CurrentStepComponent = steps[currentStep];
    // const stepLabelStyle = { height: 45 };
    let content = null;
    switch (currentStep) {
      // TODO: remove case/switch if props are all the same...
      case 0:
        content = (<EditMatchingStoriesContainer
          topicId={topicId}
          initialValues={initialValues}
        />);
        break;
      case 1:
        content = (<UnderstandMatchingStoriesContainer
          topicId={topicId}
          initialValues={initialValues}
        />);
        break;
      case 2:
        content = (<ValidateMatchingStoriesContainer
          topicId={topicId}
          initialValues={initialValues}
        />);
        break;
      default:
        content = <FormattedMessage {...messages.unimplemented} />;
    }
    return (
      <div className="matching-stories-configure-wizard">
        {content}
      </div>
    );
  }

}

// <CurrentStepComponent topicId={topicId} location={location} initialValues={initialValues} onDone={onDone} />

MatchingStoriesConfigureWizard.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  startStep: PropTypes.number,
  location: PropTypes.object,
  // onDone: PropTypes.func.isRequired,
  // from state
  currentStep: PropTypes.number.isRequired,
  // from dispatch
  goToStep: PropTypes.func.isRequired,
  handleUnmount: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentStep: state.topics.selected.focalSets.create.matchingStoriesConfigWorkflow.currentStep,
});

const mapDispatchToProps = dispatch => ({
  goToStep: (step) => {
    console.log('matching stories go to step');
    dispatch(goToMatchingStoriesConfigStep(step));
  },
  // handleUnmount: () => {
  //   console.log('matching stories handle unmount');
  //   dispatch(goToMatchingStoriesConfigStep(0)); // reset for next time
  // },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      MatchingStoriesConfigureWizard
    )
  );

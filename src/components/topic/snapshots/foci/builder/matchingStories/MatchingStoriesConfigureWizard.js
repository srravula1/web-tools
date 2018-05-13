import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import EditMatchingStoriesContainer from './EditMatchingStoriesContainer';
import UnderstandMatchingStoriesContainer from './UnderstandMatchingStoriesContainer';
import ValidateMatchingStoriesContainer from './ValidateMatchingStoriesContainer';
import { goToMatchingStoriesConfigStep } from '../../../../../../actions/topicActions';

class MatchingStoriesConfigureWizard extends React.Component {

  componentWillMount = () => {
    const { startStep, goToStep } = this.props;
    goToStep(startStep || 0);
  }

  shouldComponentUpdate = (nextProps) => {
    const { currentStep } = this.props;
    return currentStep !== nextProps.currentStep;
  }

  componentWillUnmount = () => {
    const { handleUnmount } = this.props;
    handleUnmount();
  }

  render() {
    const { topicId, initialValues, currentStep } = this.props;
    const steps = [
      EditMatchingStoriesContainer,
      UnderstandMatchingStoriesContainer,
      ValidateMatchingStoriesContainer,
    ];
    const CurrentStepComponent = steps[currentStep];
    return (
      <div className="matching-stories-configure-wizard">
        <CurrentStepComponent topicId={topicId} location={location} initialValues={initialValues} />
      </div>
    );
  }

}

MatchingStoriesConfigureWizard.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  startStep: PropTypes.number,
  location: PropTypes.object,
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
    dispatch(goToMatchingStoriesConfigStep(step));
  },
  handleUnmount: () => {
    dispatch(goToMatchingStoriesConfigStep(0)); // reset for next time
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      MatchingStoriesConfigureWizard
    )
  );

import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import StoryFeedbackRow, { MATCH_STATES } from '../../../../wizard/StoryFeedbackRow';

const localMessages = {
  match: { id: 'focus.create.validate.match', defaultMessage: 'Match' },
  notMatch: { id: 'focus.create.validate.noMatch', defaultMessage: 'Not a match' },
};

class MatchingStory extends React.Component {
  constructor(props) {
    super(props);
    const { label } = this.props;
    this.state = {
      predictedMatch: (label === 1.0),
      matchState: (label === 1.0) ? MATCH_STATES.match : MATCH_STATES.notMatch,
      guess: 'undecided',
    };
  }

  handleMatch = () => {
    this.setState((prevState) => ({ matchState: MATCH_STATES.match, guess: (prevState.predictedMatch) ? 'correct' : 'incorrect' }));
  }

  handleNotAMatch = () => {
    this.setState((prevState) => ({ matchState: MATCH_STATES.notMatch, guess: (prevState.predictedMatch) ? 'incorrect' : 'correct' }));
  }

  render() {
    const { story, prob, label } = this.props;

    const isMatch = (label === 1.0);
    const roundedProb = Math.round(prob[isMatch ? 1 : 0] * 100 * 100) / 100;

    let modelGuess;
    if (this.state.predictedMatch) {
      modelGuess = (
        <div>
          <Row bottom="lg">
            <Col lg={6}>
              <p className={`${this.state.guess}-guess`}> Our guess: ({roundedProb}%) </p>
            </Col>
            <Col lg={6} />
          </Row>
        </div>
      );
    } else {
      modelGuess = (
        <div>
          <Row bottom="lg">
            <Col lg={6} />
            <Col lg={6}>
              <p className={`${this.state.guess}-guess`}> Our guess: ({roundedProb}%) </p>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <StoryFeedbackRow
        defaultMatchState={this.state.matchState}
        key={story.stories_id}
        story={story}
        maxTitleLength={85}
        yesMessage={localMessages.match}
        handleYesClick={this.handleMatch}
        noMessage={localMessages.noMatch}
        handleNoClick={this.handleNotAMatch}
        feedbackContent={modelGuess}
      />
    );
  }
}

MatchingStory.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  story: PropTypes.object.isRequired,
  prob: PropTypes.array.isRequired,
  label: PropTypes.number.isRequired,
  // from state
  formData: PropTypes.object,
  currentKeywords: PropTypes.string,
  currentFocalTechnique: PropTypes.string,
  // from compositional helper
  intl: PropTypes.object.isRequired,
};

export default injectIntl(MatchingStory);

import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import FlatButton from 'material-ui/FlatButton';
import { ReadItNowButton } from '../../../../../common/IconButton';

const localMessages = {
  match: { id: 'focus.create.validate.match', defaultMessage: 'Match' },
  notMatch: { id: 'focus.create.validate.noMatch', defaultMessage: 'Not a match' },
};

class MatchingStory extends React.Component {

  state = {
    guess: 'undecided',
    selection: 'none',
  };

  handleReadItClick = (story) => {
    window.open(story.url, '_blank');
  }

  handleMatch = () => {
    const { label } = this.props;
    const isMatch = label === 1.0;

    if (isMatch) {
      this.setState({ selection: 'match', guess: 'correct' });
    } else {
      this.setState({ selection: 'match', guess: 'incorrect' });
    }
  }

  handleNotAMatch = () => {
    const { label } = this.props;
    const isMatch = label === 1.0;

    if (isMatch) {
      this.setState({ selection: 'not-match', guess: 'incorrect' });
    } else {
      this.setState({ selection: 'not-match', guess: 'correct' });
    }
  }

  render() {
    const { story, prob, label } = this.props;
    const { formatMessage } = this.props.intl;

    const storyTitle = story.title.length > 75 ? (`${story.title.substring(0, 75)}...`) : story.title;
    // NOTE: the very first sentence tends to repeat the title word-for-word...
    let storyPreview = story.story_sentences[0] ? story.story_sentences[0].sentence : '';
    storyPreview = storyPreview.length > 125 ? (`${storyPreview.substring(0, 125)}...`) : storyPreview;
    const isMatch = (label === 1.0);
    const roundedProb = Math.round(prob[isMatch ? 1 : 0] * 100 * 100) / 100;

    // button selection logic
    const matchSelectedClass = this.state.selection === 'match' ? '-selected' : '';
    const notMatchSelectedClass = this.state.selection === 'not-match' ? '-selected' : '';

    let modelGuess;
    if (isMatch) {
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
      <Row className={`story ${this.state.guess}`} middle="lg">
        <Col lg={7}>
          <Row>
            <Col lg={12}>
              <h3>
                { storyTitle }
              </h3>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <div>
                { storyPreview }
              </div>
            </Col>
          </Row>
        </Col>
        <Col lg={1}>
          <ReadItNowButton onClick={this.handleReadItClick.bind(this, story)} />
        </Col>
        <Col lg={4}>
          <Row>
            <Col lg={6}>
              <FlatButton className={`match-btn${matchSelectedClass}`} onClick={this.handleMatch} label={formatMessage(localMessages.match)} />
            </Col>
            <Col lg={6}>
              <FlatButton className={`not-match-btn${notMatchSelectedClass}`} onClick={this.handleNotAMatch} label={formatMessage(localMessages.notMatch)} />
            </Col>
          </Row>
          { modelGuess }
        </Col>
      </Row>
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

export default
  injectIntl(
    MatchingStory
  );

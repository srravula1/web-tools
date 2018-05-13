import PropTypes from 'prop-types';
import React from 'react';
// import { connect } from 'react-redux';
// FormattedMessage
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import FlatButton from 'material-ui/FlatButton';
import { ReadItNowButton } from '../../../../../common/IconButton';
// import AppButton from '../../../../../common/AppButton';
// import messages from '../../../../../../resources/messages';
// import LinkWithFilters from '../../../../LinkWithFilters';

const localMessages = {
  title: { id: 'focus.create.validate.title', defaultMessage: 'Validating the Model' },
  about: { id: 'focus.create.edit.about',
    defaultMessage: 'Here are 30 stories from the topic. Check to see if our model\'s predictions were correct.' },
  errorNoTopicName: { id: 'focalTechnique.matchingStories.error', defaultMessage: 'You need to specify a topic name.' },
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

  handleMatch = (e) => {
    const { label } = this.props;
    const isMatch = label === 1.0;
    console.log('match');
    console.log(e);

    // undo selection if clicking button twice in a row
    // if (this.state.selected && this.state.selection === 'match') {
    //   this.setState({ selection: 'none', selected: false });
    // } else if (isMatch) {
    // if (isMatch) {
    //   this.setState({ selection: 'match' }); // , selected: true });
    // } else {
    //   this.setState({ selection: 'not-match' }); // , selected: true });
    // }

    if (isMatch) {
      this.setState({ selection: 'match', guess: 'correct' }); // , selected: true });
    } else {
      this.setState({ selection: 'match', guess: 'incorrect' }); // , selected: true });
    }
  }

  handleNotAMatch = (e) => {
    const { label } = this.props;
    const isMatch = label === 1.0;
    console.log('not a match');
    console.log(e);
    // undo selection if clicking button twice in a row
    // if (this.state.selected && this.state.selection === 'not-match') {
    //   this.setState({ selection: 'none', selected: false });
    // } else {
    //   this.setState({ selection: 'not-match', selected: true });
    // }

    if (isMatch) {
      this.setState({ selection: 'not-match', guess: 'incorrect' }); // , selected: true });
    } else {
      this.setState({ selection: 'not-match', guess: 'correct' }); // , selected: true });
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
    // TODO: double-check that I'm showing the right probability...
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
  initialValues: PropTypes.object,      // not sure what this is; something to do with the form
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

// const mapStateToProps = state => ({
//   formData: state.form.snapshotFocus,
//   currentKeywords: formSelector(state, 'keywords'),
//   currentFocalTechnique: formSelector(state, 'focalTechnique'),
//   fetchStatus: state.topics.selected.focalSets.create.matchingStoriesSample.fetchStatus,
//   sampleStories: state.topics.selected.focalSets.create.matchingStoriesSample.sampleStories,
//   sampleProbs: state.topics.selected.focalSets.create.matchingStoriesSample.probs,
//   sampleLabels: state.topics.selected.focalSets.create.matchingStoriesSample.labels,
//   modelName: state.topics.selected.focalSets.create.matchingStoriesModelName.name,
// });


export default
  injectIntl(
    MatchingStory
  );

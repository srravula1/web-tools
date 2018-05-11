import PropTypes from 'prop-types';
import React from 'react';
// import { connect } from 'react-redux';
// FormattedMessage
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import { ReadItNowButton } from '../../../../../common/IconButton';
import AppButton from '../../../../../common/AppButton';
// import messages from '../../../../../../resources/messages';
import LinkWithFilters from '../../../../LinkWithFilters';

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
    selection: 'none',
    selected: false,
  };

  handleReadItClick = (story) => {
    window.open(story.url, '_blank');
  }

  handleMatch = (e) => {
    console.log('match');
    console.log(e);

    // undo selection if clicking button twice in a row
    if (this.state.selected && this.state.selection === 'match') {
      this.setState({ selection: 'none', selected: false });
    } else {
      this.setState({ selection: 'match', selected: true });
    }
  }

  handleNotAMatch = (e) => {
    console.log('not a match');
    console.log(e);
    // undo selection if clicking button twice in a row
    if (this.state.selected && this.state.selection === 'not-match') {
      this.setState({ selection: 'none', selected: false });
    } else {
      this.setState({ selection: 'not-match', selected: true });
    }
  }

  render() {
    const { topicId, story, prob, label } = this.props;
    const { formatMessage } = this.props.intl;

    const storyTitle = story.title.length > 50 ? (`${story.title.substring(0, 50)}...`) : story.title;
    // NOTE: the very first sentence tends to repeat the title word-for-word...
    let storyPreview = story.story_sentences[0] ? story.story_sentences[0].sentence : '';
    storyPreview = storyPreview.length > 30 ? (`${storyPreview.substring(0, 30)}...`) : storyPreview;
    const isMatch = (label === 1.0);
    // TODO: double-check that I'm showing the right probability...
    const roundedProb = Math.round(prob[isMatch ? 1 : 0] * 100 * 100) / 100;

    let modelGuess;
    if (isMatch) {
      modelGuess = (
        <div>
          <Col lg={6}>
            <p> Our guess: ({roundedProb}%) </p>
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
              <p> Our guess: ({roundedProb}%) </p>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <tr key={story.stories_id} className={`story ${this.state.selection}`}>
        <td>
          <Row>
            <Col lg={12}>
              <LinkWithFilters to={`/topics/${topicId}/stories/${story.stories_id}`}>
                <p>
                  { storyTitle }
                </p>
              </LinkWithFilters>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <p>
                { storyPreview }
              </p>
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
              <AppButton className="not-match hovering" flat onClick={this.handleNotAMatch} label={formatMessage(localMessages.notMatch)} />
            </Col>
          </Row>
          { modelGuess }
        </td>
      </tr>
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

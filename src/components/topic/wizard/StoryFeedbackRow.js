import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../common/AppButton';
import { googleFavIconUrl, storyDomainName } from '../../../lib/urlUtil';
import { trimToMaxLength } from '../../../lib/stringUtil';

export const MATCH_STATES = {
  none: 'none',
  match: 'match',
  notMatch: 'not-match',
};

const localMessages = {
  defaultYesMessage: { id: 'topic.create.validate.btn.yes', defaultMessage: 'Yes' },
  defaultNoMessage: { id: 'topic.create.validate.btn.no', defaultMessage: 'No' },
};

class StoryFeedbackRow extends React.Component {
  constructor(props) {
    super(props);
    const { defaultMatchState } = this.props;
    this.state = { selection: (defaultMatchState === undefined) ? MATCH_STATES.none : defaultMatchState };
  }

  handleMatch = () => {
    const { handleYesClick } = this.props;
    // update local state
    if (this.state.selection !== MATCH_STATES.match) {
      this.setState({ selection: MATCH_STATES.match });
    } else {
      // allow user to undo selection
      this.setState({ selection: MATCH_STATES.none });
    }
    // update parent state
    if (handleYesClick) {
      this.props.handleYesClick(MATCH_STATES, this.state.selection);
    }
  }

  handleNotAMatch = () => {
    const { handleNoClick } = this.props;
    // update local state
    if (this.state.selection !== MATCH_STATES.notMatch) {
      this.setState({ selection: MATCH_STATES.notMatch });
    } else {
      // allow user to undo selection
      this.setState({ selection: MATCH_STATES.none });
    }
    // update parent state
    if (handleNoClick) {
      this.props.handleNoClick(MATCH_STATES, this.state.selection);
    }
  }

  render() {
    const { story, maxTitleLength, feedbackContent, yesMessage, noMessage } = this.props;
    const { formatMessage, formatDate } = this.props.intl;
    const storyTitle = maxTitleLength !== undefined ? trimToMaxLength(story.title, maxTitleLength) : story.title;
    const domain = storyDomainName(story);
    return (
      <Row className={`story story-feedback-row ${this.state.selection}`} middle="lg">
        <Col lg={8}>
          <Row>
            <Col lg={12}>
              <b><a href={story.url} rel="noopener noreferrer" target="_blank">{ storyTitle }</a></b>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <a href={story.media_url} rel="noopener noreferrer" target="_blank">
                <img className="google-icon" src={googleFavIconUrl(domain)} alt={domain} />
              </a>
              { domain }
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              { formatDate(story.publish_date, { year: 'numeric', month: 'numeric', day: 'numeric' }) }
            </Col>
          </Row>
        </Col>
        <Col lg={4}>
          <Row>
            <Col lg={6}>
              <AppButton
                className={`match-btn${this.state.selection === MATCH_STATES.match ? '-selected' : ''}`}
                label={formatMessage(yesMessage || localMessages.defaultYesMessage)}
                onClick={this.handleMatch}
              />
            </Col>
            <Col lg={6}>
              <AppButton
                className={`not-match-btn${this.state.selection === MATCH_STATES.notMatch ? '-selected' : ''}`}
                label={formatMessage(noMessage || localMessages.defaultNoMessage)}
                onClick={this.handleNotAMatch}
              />
            </Col>
          </Row>
          {feedbackContent}
        </Col>
      </Row>
    );
  }
}

StoryFeedbackRow.propTypes = {
  // from parent
  story: PropTypes.object.isRequired,
  defaultMatchState: PropTypes.string, // should be one of selectedOptions constants
  yesMessage: PropTypes.object,
  handleYesClick: PropTypes.func.isRequired,
  noMessage: PropTypes.object,
  handleNoClick: PropTypes.func.isRequired,
  maxTitleLength: PropTypes.number,
  feedbackContent: PropTypes.node,
  // from compositional helper
  intl: PropTypes.object.isRequired,
};

export default injectIntl(StoryFeedbackRow);

import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';

const localMessages = {
  answer: { id: 'faq.answer', defaultMessage: 'show answer' },
};

class FaqItem extends React.Component {
  state = {
    showAnswer: false,
  };

  static getDerivedStateFromProps(nextState) {
    if (nextState.expanded) {
      this.setState({ showAnswer: nextState.expanded });
    }
    return nextState;
  }


  toggleVisible = (evt) => {
    evt.preventDefault();
    this.setState(prevState => ({ showAnswer: !prevState.showAnswer }));
  }

  render() {
    const { question, answer } = this.props;
    const { formatMessage } = this.props.intl;
    const answerContent = this.state.showAnswer ? <p className="answer"><FormattedHTMLMessage {...answer} /></p> : null;
    return (
      <div className="faq-item">
        <h4 className="question">
          <a href={`#${formatMessage(localMessages.answer)}`} onClick={this.toggleVisible}>
            <FormattedMessage {...question} />
          </a>
        </h4>
        {answerContent}
      </div>
    );
  }
}

FaqItem.propTypes = {
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from parent
  question: PropTypes.object.isRequired,
  answer: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
};

export default
injectIntl(
  FaqItem
);

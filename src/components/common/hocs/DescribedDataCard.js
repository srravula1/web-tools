import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';

const localMessage = {
  showDescription: { id: 'describedDataCard.description.show', defaultMessage: ' Learn more' },
  hideDescription: { id: 'describedDataCard.description.hide', defaultMessage: ' Hide details' },
};

/**
 * Use this with the JS Composition pattern to make a DataCard that has help on the side.
 */
function withDescription(introMessage, descriptionMessage) {
  return (ChildComponent) => {
    class DescribedDataCard extends React.Component {
      state = {
        showDescription: false,
      };

      toggleVisible = () => {
        this.setState(prevState => ({ showDescription: !prevState.showDescription }));
      }

      render() {
        let descriptionContent;
        let toggleButton;
        if (descriptionMessage) { // only toggle extra text if there is any
          if (this.state.showDescription) {
            toggleButton = (
              <a onTouchTap={this.toggleVisible}>
                <FormattedHTMLMessage {...localMessage.hideDescription} />
              </a>
            );
            if (Array.isArray(descriptionMessage)) {
              descriptionContent = descriptionMessage.map(msgId => <FormattedHTMLMessage key={msgId.id} {...msgId} />);
            } else {
              descriptionContent = <FormattedHTMLMessage {...descriptionMessage} />;
            }
          } else {
            toggleButton = (
              <a onTouchTap={this.toggleVisible}>
                <FormattedHTMLMessage {...localMessage.showDescription} />
              </a>
            );
          }
        }
        return (
          <span className="described-data-card">
            <Row>
              <Col lg={8}>
                <ChildComponent {...this.props} showingDetails={this.state.showDescription} />
              </Col>
              <Col lg={4}>
                <div className="helpful-content">
                  <p>
                    <FormattedHTMLMessage {...introMessage} />
                    {toggleButton}.
                  </p>
                  {descriptionContent}
                </div>
              </Col>
            </Row>
          </span>
        );
      }
    }

    DescribedDataCard.propTypes = {
      intl: PropTypes.object.isRequired,
    };

    return injectIntl(DescribedDataCard);
  };
}

export default withDescription;

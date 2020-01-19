import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../../../common/AppButton';
import withIntlForm from '../../../common/hocs/IntlForm';
import messages from '../../../../resources/messages';
import PlatformPreview from './preview/PlatformPreview';
import { platformChannelDataFormatter } from '../../../util/topicUtil';
import { PLATFORM_OPEN_WEB, PLATFORM_TWITTER, PLATFORM_REDDIT } from '../../../../lib/platformTypes';
import EditOpenWebForm from './forms/EditOpenWebForm';
import EditQueryForm from './forms/EditQueryForm';
import EditRedditForm from './forms/EditRedditForm';
import { platformNameMessage, sourceNameMessage, platformDescriptionMessage } from '../AvailablePlatform';

const localMessages = {
  title: { id: 'platform.create.edit.title', defaultMessage: 'Step 1: Configure Your Platform: ' },
};

class PlatformFormContainer extends React.Component {
  constructor(props) {
    // To catch when they click search we track the time of their click onthe button
    // so we know when to refetch all the data
    super(props);
    this.state = { lastUpdated: null };
  }

  handleSearchClick = () => {
    this.setState({ lastUpdated: Date.now() });
  }

  handleEnterKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        this.updateQuery();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  render() {
    const { initialValues, handleSubmit, finishStep, currentPlatform, change /* redux form helper */ } = this.props;
    let FormRenderer;
    switch (currentPlatform.platform) {
      case PLATFORM_OPEN_WEB:
        FormRenderer = EditOpenWebForm;
        break;
      case PLATFORM_REDDIT:
        FormRenderer = EditRedditForm;
        break;
      case PLATFORM_TWITTER:
        FormRenderer = EditQueryForm;
        break;
      default:
        break;
    }
    return (
      <Grid>
        <form className="platform-edit-form" name="platform-form" onSubmit={handleSubmit(finishStep.bind(this))}>
          <Row>
            <Col lg={10}>
              <h2>
                <FormattedMessage {...localMessages.title} />
                <FormattedHTMLMessage {...platformNameMessage(currentPlatform.platform, currentPlatform.source)} />
                &nbsp;
                ( <FormattedHTMLMessage {...sourceNameMessage(currentPlatform.source)} /> )
              </h2>
              <p>
                <FormattedHTMLMessage {...platformDescriptionMessage(currentPlatform.platform, currentPlatform.source)} />
              </p>
            </Col>
          </Row>
          <FormRenderer
            initialValues={initialValues}
            onEnterKey={this.handleEnterKeyDown}
            onFormChange={change}
            onSearch={this.handleSearchClick}
          />
          {this.state.lastUpdated && (
            <PlatformPreview
              lastUpdated={this.state.lastUpdated}
              formatPlatformChannelData={platformChannelDataFormatter(currentPlatform.platform)}
            />
          )}
          <Row>
            <Col lg={8} xs={12}>
              <AppButton className="platform-builder-next" type="submit" label={messages.next} primary />
            </Col>
          </Row>
        </form>
      </Grid>
    );
  }
}

PlatformFormContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  onNextStep: PropTypes.func.isRequired,
  // from state
  currentPlatform: PropTypes.object,
  change: PropTypes.func.isRequired,
  // from dispatch
  finishStep: PropTypes.func.isRequired,
  // from compositional helper
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  renderTextField: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentPlatform: state.topics.selected.platforms.selected,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  finishStep: (values) => {
    const customProps = {
      query: values.query,
    };
    ownProps.onNextStep(customProps);
  },
});

const reduxFormConfig = {
  form: 'platform', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps)(
        PlatformFormContainer
      )
    )
  )
);

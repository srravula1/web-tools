import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
// import { hot } from 'react-hot-loader/root';
import Snackbar from '@material-ui/core/Snackbar';
import intl from 'intl';  // eslint-disable-line
import intlEn from 'intl/locale-data/jsonp/en.js';  // eslint-disable-line
import { Row } from 'react-flexbox-grid/lib';
import NavToolbar from './common/header/NavToolbar';
import ErrorBoundary from './common/ErrorBoundary';
import messages from '../resources/messages';
import { getVersion } from '../config';
import { ErrorNotice, WarningNotice } from './common/Notice';
import { assetUrl } from '../lib/assetUtil';
import AppNoticesContainer from './common/header/AppNoticesContainer';
import { fetchStaticTags } from '../actions/systemActions';
import withAsyncData from './common/hocs/AsyncDataContainer';

const localMessages = {
  privacyPolicy: { id: 'app.privacyPolicy', defaultMessage: 'Read our privacy policy.' },
  maintenance: { id: 'app.maintenance', defaultMessage: 'Sorry, we have taken our system down right now for maintenance' },
};

class AppContainer extends React.Component {
  state = {
    open: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { feedback } = this.props;
    if (nextProps.feedback.message !== feedback.message) {
      this.setState({ open: true });
    }
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { children, feedback, name } = this.props;
    let content = children;
    if (document.appConfig.maintenanceMode === 1) {
      content = (
        <div className="maintenance">
          <Row center="lg">
            <ErrorNotice>
              <br /><br />
              <FormattedMessage {...localMessages.maintenance} />
              <br /><br />
              <img alt="under-constrction" src={assetUrl('/static/img/under-construction.gif')} />
              <br /><br />
            </ErrorNotice>
          </Row>
        </div>
      );
    }

    return (
      <div className={`app-container app-${name}`}>
        <AppNoticesContainer />
        <header>
          <NavToolbar />
        </header>
        <ErrorBoundary>
          <div id="content">
            { document.appConfig.systemWarning
              && (
              <div style={{ textAlign: 'center' }}>
                <WarningNotice>
                  {document.appConfig.systemWarning}
                </WarningNotice>
              </div>
)}
            {content}
          </div>
        </ErrorBoundary>
        <footer>
          <p>
            <small>
              {'Created by the '}
              <a href="https://civic.mit.edu/">
                <FormattedMessage {...messages.c4cmName} />
              </a>
              {' and the '}
              <a href="https://cyber.law.harvard.edu">
                <FormattedMessage {...messages.berkmanName} />
              </a>.
              <br />
              <FormattedHTMLMessage {...messages.supportOptions} />
              <br />
              <a href="https://mediacloud.org/privacy-policy"><FormattedHTMLMessage {...localMessages.privacyPolicy} /></a>
              <br />
              v{getVersion()}
            </small>
          </p>
        </footer>
        <Snackbar
          className={feedback.classes ? feedback.classes : 'info_notice'}
          open={this.state.open}
          onClose={this.handleClose}
          message={feedback.message}
          action={feedback.action}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={5000}
        />
      </div>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.node,
  handleTouchTapLeftIconButton: PropTypes.func,
  intl: PropTypes.object.isRequired,
  // from state
  feedback: PropTypes.object.isRequired,
  // from parent
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showLoginButton: PropTypes.bool,
};

AppContainer.contextTypes = {
  router: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.staticTags.fetchStatus,
  feedback: state.app.feedback,
});

const fetchAsyncData = (dispatch) => {
  dispatch(fetchStaticTags());
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      AppContainer
    )
  )
);

import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import messages from '../../resources/messages';

class BrandMasthead extends React.Component {

  onRouteToLogout = () => {
    this.context.router.push('/logout');
  }

  onRouteToLogin = () => {
    this.context.router.push('/logout');
  }

  render() {
    const { user, name, description, backgroundColor, mastheadText } = this.props;
    const { formatMessage } = this.props.intl;
    const styles = {
      root: {
        backgroundColor,
      },
      right: {
        float: 'right',
      },
      clear: {
        clear: 'both',
      },
    };
    let loginLogoutButton = null;
    if (user.isLoggedIn) {
      loginLogoutButton = <RaisedButton label={formatMessage(messages.userLogout)} onTouchTap={this.onRouteToLogout} />;
    } else {
      loginLogoutButton = <RaisedButton label={formatMessage(messages.userLogin)} onTouchTap={this.onRouteToLogin} />;
    }
    const createMastheadText = () => ({ __html: (mastheadText !== null) ? mastheadText : name });
    return (
      <div id="branding-masthead" style={styles.root} >
        <Grid>
          <Row>
            <Col lg={6} md={6} sm={6}>
              <h1>
                <a href="/"><img src={'/static/mediacloud-logo-green-2x.png'} width={65} height={65} /></a>
                <strong dangerouslySetInnerHTML={createMastheadText()} />
              </h1>
            </Col>
            <Col lg={6} md={6} sm={6}>
              <div style={styles.right} >
                <small>{description}</small>
              </div>
              <div style={styles.clear} />
              <div style={styles.right} >
                {loginLogoutButton}
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}

BrandMasthead.propTypes = {
  user: React.PropTypes.object.isRequired,
  name: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  backgroundColor: React.PropTypes.string.isRequired,
  lightColor: React.PropTypes.string.isRequired,
  intl: React.PropTypes.object.isRequired,
  mastheadText: React.PropTypes.string,
};

BrandMasthead.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
  mastheadText: state.app.mastheadText,
});

export default injectIntl(connect(mapStateToProps, null)(BrandMasthead));

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { push } from 'react-router-redux';
import AvailablePlatformList from './AvailablePlatformList';
import messages from '../../../resources/messages';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import { deleteTopicPlatform, setTopicNeedsNewSnapshot, fetchPlatformsInTopicList, selectPlatform } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import PlatformComparisonContainer from './PlatformComparisonContainer';
import NeedsNewVersionWarning from '../versions/NeedsNewVersionWarning';
import { filteredLinkTo } from '../../util/location';

const localMessages = {
  listTitle: { id: 'platform.list.title', defaultMessage: 'Platform Details' },
  platformManageAbout: { id: 'platform.manage.about',
    defaultMessage: 'empty' },
  removePlatform: { id: 'platform.manage.remove', defaultMessage: 'Remove Platform' },
  removeOk: { id: 'platform.manage.remove.ok', defaultMessage: 'Remove It' },
  removePlatformSucceeded: { id: 'platform.manage.remove.succeeded', defaultMessage: 'Removed the Platform' },
  removePlatformFailed: { id: 'platform.manage.remove.failed', defaultMessage: 'Sorry, but removing the platform failed :-(' },
  backToTopic: { id: 'backToTopic', defaultMessage: 'back to the topic' },
};

class ManagePlatformsContainer extends React.Component {
  state = {
    removeDialogOpen: false,
    // idToEdit: null,
    idToRemove: null,
    typeToRemove: null,
  };

  onCancelDeletePlatform = () => {
    this.setState({ removeDialogOpen: false, idToRemove: null });
  }

  onDeletePlatform = () => {
    const { topicId, handleDeletePlatform } = this.props;
    handleDeletePlatform(topicId, this.state.idToRemove, this.state.typeToRemove);
    this.setState({ removeDialogOpen: false, idToRemove: null });
  }

  onEditPlatform = (platform) => {
    const { topicId, filters, handleSelectPlatform } = this.props;
    // filteredLinkTo link to edit wizard
    // in edit, we will find latest topic_seed_query for this platform
    handleSelectPlatform(
      { topic_seed_queries_id: platform.topic_seed_queries_id, platform: platform.platform },
      filteredLinkTo(`/topics/${topicId}/platforms/${platform.topic_seed_queries_id}/edit`, filters)
    );
  }

  onNewPlatform = (platform) => {
    const { topicId, filters, handleSelectNewPlatform } = this.props;
    handleSelectNewPlatform(platform, filteredLinkTo(`/topics/${topicId}/platforms/create`, filters));
  }

  handleDelete = (platformId, platformType) => {
    this.setState({ removeDialogOpen: true, idToRemove: platformId });
    this.setState({ typeToRemove: platformType });
  }

  render() {
    const { platforms, topicInfo, selectedSnapshot } = this.props;
    const { formatMessage } = this.props.intl;
    /* TODO get the latest platform info of each category if exists, relevantPlatforms = platform.map... */
    /* and, compare previous version with current to see if new platforms and if so, offer spider and generate */
    /* { new vs old platforms are different ? <PlatformComparisonContainer platforms={platforms} onEditClicked={this.onEditPlatform} onAddClicked={this.onNewPlatform} /> : '' }
    */
    return (
      <div>
        <NeedsNewVersionWarning />
        <div className="manage-platforms">
          <Grid>
            <Row>
              <Col lg={10} xs={12}>
                <h1>
                  <FormattedMessage {...messages.managePlatforms} />
                </h1>
              </Col>
            </Row>
            <PlatformComparisonContainer
              topicInfo={topicInfo}
              platforms={selectedSnapshot ? selectedSnapshot.platform_seed_queries : []}
              newPlatforms={platforms.filter(p => p.isEnabled)}
              latestVersionRunning={topicInfo.latestVersionRunning}
            />
            <AvailablePlatformList
              platforms={platforms}
              onEdit={this.onEditPlatform}
              onAdd={this.onNewPlatform}
              onDelete={this.handleDelete}
            />
          </Grid>
          <ConfirmationDialog
            open={this.state.removeDialogOpen}
            title={formatMessage(localMessages.removePlatform)}
            okText={formatMessage(localMessages.removeOk)}
            onCancel={this.onCancelDeletePlatform}
            onOk={this.onDeletePlatform}
          >
            <FormattedHTMLMessage {...localMessages.removePlatform} />
          </ConfirmationDialog>
        </div>
      </div>
    );
  }
}

ManagePlatformsContainer.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  // from state
  topicId: PropTypes.number.isRequired,
  topicInfo: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  platforms: PropTypes.array.isRequired,
  selectedSnapshot: PropTypes.object,
  // from dispatch
  handleDeletePlatform: PropTypes.func.isRequired,
  handleSelectPlatform: PropTypes.func.isRequired,
  handleSelectNewPlatform: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  topicInfo: state.topics.selected.info,
  platforms: state.topics.selected.platforms.all.results,
  filters: state.topics.selected.filters,
  selectedSnapshot: state.topics.selected.snapshots.selected,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleDeletePlatform: (topicId, platformId, platformType) => {
    dispatch(selectPlatform({ topic_seed_queries_id: platformId, platformType }));
    dispatch(deleteTopicPlatform(topicId, platformId, { current_platform_type: platformType }))
      .then((res) => {
        if (res.success === 0) {
          dispatch(updateFeedback({ classes: 'error-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removePlatformFailed) }));
        } else {
          dispatch(updateFeedback({ classes: 'info-notice', open: true, message: ownProps.intl.formatMessage(localMessages.removePlatformSucceeded) }));
          dispatch(setTopicNeedsNewSnapshot(true));
          dispatch(fetchPlatformsInTopicList(topicId));
        }
      });
  },
  handleSelectPlatform: (args, url) => {
    dispatch(selectPlatform(args));
    dispatch(push(url));
  },
  handleSelectNewPlatform: (args, url) => {
    dispatch(selectPlatform(args));
    dispatch(push(url));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    ManagePlatformsContainer
  )
);

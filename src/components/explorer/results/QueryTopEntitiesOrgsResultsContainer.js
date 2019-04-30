import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import EntitiesTable from '../../common/EntitiesTable';
import { resetEntitiesOrgs, fetchTopEntitiesOrgs, fetchDemoTopEntitiesOrgs } from '../../../actions/explorerActions';
import { postToDownloadUrl, COVERAGE_REQUIRED, ENTITY_DISPLAY_TOP_TEN } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';
import { TAG_SET_CLIFF_ORGS } from '../../../lib/tagUtil';

// const NUM_TO_SHOW = 20;

const localMessages = {
  title: { id: 'explorer.entities.title', defaultMessage: 'Top Organizations' },
  organization: { id: 'explorer.entities.organization', defaultMessage: 'Organization' },
  helpIntro: { id: 'explorer.entities.help.title', defaultMessage: '<p>Looking at which organizations and companies are being talked about can give you a sense of how the media is focusing on the issue you are investigating. This is a list of the organizations mentioned most often in a sampling of stories. Click on a name to add it to all your queries. Click the menu on the bottom right to download a CSV of the organizations mentioned in all the stories matching your query.</p>' },
  downloadCsv: { id: 'explorer.entities.downloadCsv', defaultMessage: 'Download { name } all organizations CSV' },
};

class QueryTopEntitiesOrgsResultsContainer extends React.Component {
  downloadCsv = (query) => {
    postToDownloadUrl(`/api/explorer/tags/${TAG_SET_CLIFF_ORGS}/top-tags.csv`, query);
  }

  render() {
    const { results, queries, handleEntitySelection, selectedTabIndex, tabSelector } = this.props;
    const { formatNumber } = this.props.intl;
    let content = null;
    if (results) {
      const rawData = (results[selectedTabIndex] && results[selectedTabIndex].results) ? results[selectedTabIndex].results.slice(0, ENTITY_DISPLAY_TOP_TEN) : [];
      const coverageRatio = results[selectedTabIndex] ? results[selectedTabIndex].coverage_percentage : 0;
      if (coverageRatio > COVERAGE_REQUIRED) {
        content = (
          <div>
            {rawData && (
              <EntitiesTable
                className="explorer-entity"
                entityColNameMsg={localMessages.organization}
                entities={rawData}
                onClick={e => handleEntitySelection(e, queries[0].searchId)}
                maxTitleLength={50}
              />
            )}
          </div>
        );
      } else {
        content = (
          <p>
            <FormattedHTMLMessage
              {...messages.notEnoughCoverage}
              values={{ pct: formatNumber(coverageRatio, { style: 'percent', maximumFractionDigits: 2 }) }}
            />
          </p>
        );
      }
    }
    return (
      <div>
        { tabSelector }
        { content }
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              onClick={() => this.downloadCsv(queries[selectedTabIndex])}
            >
              <ListItemText>
                <FormattedMessage {...localMessages.downloadCsv} values={{ name: queries[selectedTabIndex].label }} />
              </ListItemText>
              <ListItemIcon>
                <DownloadButton />
              </ListItemIcon>
            </MenuItem>
          </ActionMenu>
        </div>
      </div>
    );
  }
}

QueryTopEntitiesOrgsResultsContainer.propTypes = {
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  handleEntitySelection: PropTypes.func.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from state
  lastSearchTime: PropTypes.number.isRequired,
  results: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topEntitiesOrgs.fetchStatus,
  results: state.explorer.topEntitiesOrgs.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleEntitySelection: (entity, isCannedSearch) => {
    const queryClauseToAdd = ` tags_id_stories:${entity}`;
    if (isCannedSearch === undefined) {
      ownProps.onQueryModificationRequested(queryClauseToAdd);
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSummary(localMessages.title, localMessages.helpIntro, [messages.entityHelpDetails])(
      withQueryResults(resetEntitiesOrgs, fetchTopEntitiesOrgs, fetchDemoTopEntitiesOrgs)(
        QueryTopEntitiesOrgsResultsContainer
      )
    )
  )
);

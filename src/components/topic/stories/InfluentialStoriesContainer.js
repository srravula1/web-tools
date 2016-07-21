import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import StoryTable from '../StoryTable';
import { fetchTopicInfluentialStories, sortTopicInfluentialStories } from '../../../actions/topicActions';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import FlatButton from 'material-ui/FlatButton';
import messages from '../../../resources/messages';
import DownloadButton from '../../common/DownloadButton';
import DataCard from '../../common/DataCard';
import composeAsyncWidget from '../../util/composeAsyncWidget';

const localMessages = {
  title: { id: 'topic.influentialStories.title', defaultMessage: 'Influential Stories' },
};

class InfluentialStoriesContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { fetchData } = this.props;
    if ((nextProps.filters !== this.props.filters) || (nextProps.sort !== this.props.sort)) {
      if ((nextProps.filters.snapshotId !== null) && (nextProps.filters.timespanId !== null)) {
        fetchData(nextProps);
      }
    }
  }
  onChangeSort = (newSort) => {
    const { sortData } = this.props;
    sortData(newSort);
  }
  refetchData = () => {
    const { fetchData } = this.props;
    fetchData(this.props);
  }
  nextPage = () => {
    const { fetchPagedData, links } = this.props;
    fetchPagedData(this.props, links.next);
  }
  previousPage = () => {
    const { fetchPagedData, links } = this.props;
    fetchPagedData(this.props, links.previous);
  }
  downloadCsv = () => {
    const { filters, sort, topicId } = this.props;
    const url = `/api/topics/${topicId}/stories.csv?snapshotId=${filters.snapshotId}&timespanId=${filters.timespanId}&sort=${sort}`;
    window.location = url;
  }
  render() {
    const { stories, sort, topicId, links } = this.props;
    const { formatMessage } = this.props.intl;
    let previousButton = null;
    if ((links !== undefined) && links.hasOwnProperty('previous')) {
      previousButton = <FlatButton label={formatMessage(messages.previousPage)} primary onClick={this.previousPage} />;
    }
    let nextButton = null;
    if ((links !== undefined) && links.hasOwnProperty('next')) {
      nextButton = <FlatButton label={formatMessage(messages.nextPage)} primary onClick={this.nextPage} />;
    }
    return (
      <Grid>
        <Row>
          <Col lg={12} md={12} sm={12}>
            <DataCard>
              <div className="actions">
                <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.downloadCsv} />
              </div>
              <h2><FormattedMessage {...localMessages.title} /></h2>
              <StoryTable topicId={topicId} stories={stories} onChangeSort={this.onChangeSort} sortedBy={sort} />
              { previousButton }
              { nextButton }
            </DataCard>
          </Col>
        </Row>
      </Grid>
    );
  }
}

InfluentialStoriesContainer.ROWS_PER_PAGE = 50;

InfluentialStoriesContainer.propTypes = {
  // from context
  intl: React.PropTypes.object.isRequired,
  location: React.PropTypes.object.isRequired,
  // from parent
  // from dispatch
  fetchData: React.PropTypes.func.isRequired,
  fetchPagedData: React.PropTypes.func.isRequired,
  sortData: React.PropTypes.func.isRequired,
  // from state
  fetchStatus: React.PropTypes.string.isRequired,
  sort: React.PropTypes.string.isRequired,
  stories: React.PropTypes.array.isRequired,
  topicInfo: React.PropTypes.object.isRequired,
  filters: React.PropTypes.object.isRequired,
  links: React.PropTypes.object,
  topicId: React.PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  fetchStatus: state.topics.selected.stories.fetchStatus,
  sort: state.topics.selected.stories.sort,
  stories: state.topics.selected.stories.stories,
  links: state.topics.selected.stories.link_ids,
  filters: state.topics.selected.filters,
  topicInfo: state.topics.selected.info,
  topicId: state.topics.selected.id,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchPagedData: (props, linkId) => {
    dispatch(fetchTopicInfluentialStories(props.topicId, props.filters.snapshotId,
      props.filters.timespanId, props.sort, InfluentialStoriesContainer.ROWS_PER_PAGE,
      linkId))
      .then((results) => {
        const newLocation = Object.assign({}, ownProps.location, {
          query: {
            ...ownProps.location.query,
            linkId: results.link_ids.current,
          },
        });
        dispatch(push(newLocation));
      });
  },
  fetchData: (props) => {
    dispatch(fetchTopicInfluentialStories(props.topicId, props.filters.snapshotId,
      props.filters.timespanId, props.sort, InfluentialStoriesContainer.ROWS_PER_PAGE))
      .then((results) => {
        const newLocation = Object.assign({}, ownProps.location, {
          query: {
            ...ownProps.location.query,
            linkId: results.link_ids.current,
          },
        });
        dispatch(push(newLocation));
      });
  },
  sortData: (sort) => {
    dispatch(sortTopicInfluentialStories(sort));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeAsyncWidget(
        InfluentialStoriesContainer
      )
    )
  );

import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import withSampleSize from '../../common/hocs/SampleSize';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import { filtersAsUrlParams, combineQueryParams } from '../../util/location';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import EditableWordCloudDataCard from '../../common/EditableWordCloudDataCard';
import { fetchTopicAnalysisWords } from '../../../actions/topicActions';
import { generateParamStr } from '../../../lib/apiUtil';
import { topicDownloadFilename } from '../../util/topicUtil';

const TopicWordCloudContainer = (props) => (
  <EditableWordCloudDataCard
    width={720}
    initSampleSize={props.sampleSize}
    downloadUrl={`/api/topics/${props.topicInfo.topics_id}/provider/words.csv?${filtersAsUrlParams({
      ...props.filters, q: combineQueryParams(props.filters.q, props.extraQueryClause) })}&sampleSize=${props.sampleSize}`}
    onViewModeClick={(word) => props.handleWordCloudClick(word, props.topicInfo.topics_id, props.filters)}
    onViewSampleSizeClick={props.onViewSampleSizeClick}
    svgDownloadPrefix={`${topicDownloadFilename(props.topicInfo.name, props.filters)}-${props.svgName}-words`}
    hideGoogleWord2Vec
    includeTopicWord2Vec
    actionsAsLinksUnderneath
    {...props}
  />
);

TopicWordCloudContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  onViewSampleSizeClick: PropTypes.func.isRequired,
  sampleSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  // from parent
  svgName: PropTypes.string.isRequired,
  extraQueryClause: PropTypes.string,
  // from dispatch
  handleWordCloudClick: PropTypes.func.isRequired,
  // from state
  topicInfo: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  words: PropTypes.array,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  topicInfo: state.topics.selected.info,
  filters: state.topics.selected.filters,
  fetchStatus: state.topics.selected.provider.words.fetchStatus,
  words: state.topics.selected.provider.words.list,
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicAnalysisWords(props.topicInfo.topics_id,
  { ...props.filters, sampleSize: props.sampleSize, q: combineQueryParams(props.filters.q, props.extraQueryClause) }));

const mapDispatchToProps = (dispatch) => ({
  handleWordCloudClick: (word, topicId, filters) => {
    // important to pick term with the OR clause for other languages that we don't stem well
    const params = generateParamStr({ ...filters, stem: word.stem, term: word.term || word.stem });
    const url = `/topics/${topicId}/words/${word.term}?${params}`;
    dispatch(push(url));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSampleSize(
      withCsvDownloadNotifyContainer(
        withFilteredAsyncData(fetchAsyncData, ['sampleSize'])(
          TopicWordCloudContainer,
        )
      )
    )
  )
);

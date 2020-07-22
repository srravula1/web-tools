import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withQueryResults from './QueryResultsSelector';
import { selectComparativeWordField, updateQuery } from '../../../actions/explorerActions';
import { getBrandDarkColor } from '../../../styles/colors';
import ComparativeOrderedWordCloud from '../../vis/ComparativeOrderedWordCloud';
import WordSelectWrapper, { LEFT, RIGHT } from './WordSelectWrapper';

const localMessages = {
  title: { id: 'explorer.comparativeWords.title', defaultMessage: 'Compare Top Words' },
  intro: { id: 'explorer.comparativeWords.intro', defaultMessage: ' These words are the most used in each query. They are sized according to total count across all words in ...' },
  centerTitle: { id: 'explorer.comparativeWords.center', defaultMessage: 'Word used in both' },
  sideTitle: { id: 'explorer.comparativeWords.right', defaultMessage: 'Words unique to {name} in the top 100 words in the sampled stories' },
  downloadCsv: { id: 'explorer.entities.downloadCsv', defaultMessage: 'Download { name } word count comparison CSV' },
  error: { id: 'explorer.comparativeWords.error', defaultMessage: 'Error loading comparison' },
};

class QueryWordComparisonResultsContainer extends React.Component {
  state = {
    leftQuery: undefined,
    rightQuery: undefined,
  };

  UNSAFE_componentWillMount() {
    const { queries } = this.props;
    this.setDefaultQueries(queries);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { queries } = this.props;
    if (nextProps.queries !== queries) {
      this.setDefaultQueries(nextProps.queries);
    }
  }

  setDefaultQueries(queries) {
    this.setState({
      leftQuery: queries[0],
      rightQuery: queries[1],
    });
  }

  handleQuerySelectionChange = (queryObj, target) => {
    if (target === LEFT) {
      this.setState({ leftQuery: queryObj });
    } else if (target === RIGHT) {
      this.setState({ rightQuery: queryObj });
    }
  }

  render() {
    const { queries, results, handleWordCloudClick } = this.props;
    const { leftQuery, rightQuery } = this.state;
    let wordClouds;
    let wordSelectorContent;
    if (results && Object.keys(results).length > 1) {
      // only show selector if more than two queries
      if (queries.length > 2) {
        wordSelectorContent = (
          <WordSelectWrapper
            queries={queries}
            onQuerySelectionChange={this.handleQuerySelectionChange}
            leftQuery={leftQuery}
            rightQuery={rightQuery}
          />
        );
      }
      wordClouds = (
        <>
          {wordSelectorContent}
          <ComparativeOrderedWordCloud
            leftWords={results[leftQuery.uid].results}
            rightWords={results[rightQuery.uid].results}
            leftTextColor={leftQuery.color}
            rightTextColor={rightQuery.color}
            textColor={getBrandDarkColor()}
            onWordClick={handleWordCloudClick}
            leftTitleMsg={<FormattedMessage {...localMessages.sideTitle} values={{ name: this.state.leftQuery.label }} />}
            centerTitleMsg={<FormattedMessage {...localMessages.centerTitle} />}
            rightTitleMsg={<FormattedMessage {...localMessages.sideTitle} values={{ name: this.state.rightQuery.label }} />}
          />
        </>
      );
    } else {
      wordClouds = <FormattedMessage {...localMessages.error} />;
    }
    return (
      <div className="comparison-summary">
        <Grid>
          <Row>
            <Col lg={12}>
              <h2><FormattedMessage {...localMessages.title} /></h2>
              {wordSelectorContent}
              {wordClouds}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

QueryWordComparisonResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onQueryModificationRequested: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  results: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  handleWordCloudClick: PropTypes.func.isRequired,
  selectComparativeWords: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topWords.fetchStatus,
  results: state.explorer.topWords.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectComparativeWords: (query, target) => {
    dispatch(selectComparativeWordField({ query, target }));
  },
  updateCurrentQuery: (query, fieldName) => {
    if (query) {
      dispatch(updateQuery({ query, fieldName }));
    }
  },
  handleWordCloudClick: (word) => {
    ownProps.onQueryModificationRequested(word.term);
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withQueryResults()(
      QueryWordComparisonResultsContainer
    )
  )
);

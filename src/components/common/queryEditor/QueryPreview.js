import PropTypes from 'prop-types';
import React from 'react';
import { formValues } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { searchTermsToQuery } from '../../../lib/querySyntaxUtil';

const localMessages = {
  title: { id: 'simpleQuery.preview.title', defaultMessage: 'Your query preview:' },
  advancedMode: { id: 'simpleQuery.preview.advancedMode', defaultMessage: 'Edit your query in advanced mode' },
};

const QueryPreview = ({ onAdvancedModeRequest, matches, negations, matchType, platform, source }) => {
  const queryString = searchTermsToQuery(platform, source, matchType, matches, negations);
  const handler = (evt) => { evt.preventDefault(); onAdvancedModeRequest(queryString); };
  return (
    <div className="query-preview">
      <h3><FormattedMessage {...localMessages.title} /></h3>
      <code>{queryString}</code>
      <a onClick={handler} onKeyDown={handler}>
        <b><FormattedMessage {...localMessages.advancedMode} /></b>
      </a>
    </div>
  );
};

QueryPreview.propTypes = {
  // from parent
  onAdvancedModeRequest: PropTypes.func.isRequired,
  // from compositional chain
  matches: PropTypes.array,
  negations: PropTypes.array,
  matchType: PropTypes.string,
  platform: PropTypes.string,
  source: PropTypes.string,
};

export default
injectIntl(
  formValues('platform', 'source', 'matches', 'negations', 'matchType')(
    QueryPreview
  )
);

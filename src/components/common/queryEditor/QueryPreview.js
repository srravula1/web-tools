import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  title: { id: 'simpleQuery.preview.title', defaultMessage: 'Your query preview:' },
  advancedMode: { id: 'simpleQuery.preview.advancedMode', defaultMessage: 'Edit this in advanced mode' },
};

const QueryPreview = ({ onAdvancedModeRequest, query }) => (
  <>
    <b><FormattedMessage {...localMessages.title} /></b>
    <code>{query}</code>
    <a href="#" onClick={onAdvancedModeRequest}><FormattedMessage {...localMessages.advancedMode} /></a>
  </>
);

QueryPreview.propTypes = {
  onAdvancedModeRequest: PropTypes.func.isRequired,
  query: PropTypes.string,
};

export default injectIntl(QueryPreview);

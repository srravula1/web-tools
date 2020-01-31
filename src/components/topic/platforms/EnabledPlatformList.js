import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import EnabledPlatformSummary from './EnabledPlatformSummary';

const EnabledPlatformList = ({ platforms, titleMsg, latestVersionNumber }) => (
  <div className="topic-info-sidebar">
    <h2><FormattedMessage {...titleMsg} values={{ versionNumber: latestVersionNumber }} /></h2>
    {platforms.map((p) => <EnabledPlatformSummary key={`${p.topic_seed_queries_id}.${p.platform}.${p.source}`} platform={p} />)}
  </div>
);

EnabledPlatformList.propTypes = {
  // from parent
  platforms: PropTypes.array.isRequired,
  latestVersionNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  titleMsg: PropTypes.object.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
};

export default injectIntl(EnabledPlatformList);

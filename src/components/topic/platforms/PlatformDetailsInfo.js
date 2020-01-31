import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import OpenWebMediaItem from '../../common/OpenWebMediaItem';
import { PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_TWITTER, CRIMSON_HEXAGON_SOURCE } from '../../../lib/platformTypes';
import messages from '../../../resources/messages';

const localMessages = {
  crimsonHexagonId: { id: 'crimsonHexagonId', defaultMessage: 'Crimson Hexagon Id' },
};

const PlatformDetailsInfo = ({ platform }) => {
  let content = null;
  switch (platform.platform) {
    case PLATFORM_OPEN_WEB:
      content = (
        <>
          <FormattedMessage {...messages.topicQueryProp} />:
          &nbsp;
          <code>{platform.query}</code>
          <br />
          <FormattedMessage {...messages.topicSourceCollectionsProp} />: &nbsp;
          {platform.media_tags && platform.media_tags.map(t => <OpenWebMediaItem justText key={t.tags_id} object={t} />)}
          {platform.media && platform.media.map(m => <OpenWebMediaItem justText key={m.media_id} object={m} />)}
        </>
      );
      break;
    case PLATFORM_REDDIT:
      content = (
        <>
          <FormattedMessage {...messages.topicQueryProp} />:
          &nbsp;
          <code>{platform.query}</code>
          <br />
          <p>platform.channel</p>
        </>
      );
      break;
    case PLATFORM_TWITTER:
      if (platform.source === CRIMSON_HEXAGON_SOURCE) {
        content = (
          <>
            <FormattedMessage {...localMessages.crimsonHexagonId} />:
            &nbsp;
            <code>{platform.query}</code>
          </>
        );
      } else {
        content = (
          <>
            <FormattedMessage {...messages.topicQueryProp} />:
            &nbsp;
            <code>{platform.query}</code>
          </>
        );
      }
      break;
    default:
      break;
  }
  return (
    <div className="platform-summary">
      {content}
    </div>
  );
};

PlatformDetailsInfo.propTypes = {
  // from parent
  platform: PropTypes.object.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
};

export default injectIntl(PlatformDetailsInfo);

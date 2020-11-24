import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import OpenWebMediaItem from '../../common/OpenWebMediaItem';
import { PLATFORM_OPEN_WEB, PLATFORM_REDDIT, PLATFORM_TWITTER, CRIMSON_HEXAGON_SOURCE,
  BRANDWATCH_SOURCE, MEDIA_CLOUD_SOURCE } from '../../../lib/platformTypes';
import messages from '../../../resources/messages';
import { parseQueryProjectId } from '../../util/topicUtil';

const localMessages = {
  crimsonHexagonId: { id: 'crimsonHexagonId', defaultMessage: 'Crimson Hexagon Id' },
  brandwatchProjectId: { id: 'brandwatchProjectId', defaultMessage: 'BrandWatch Project ID' },
  brandwatchQueryId: { id: 'brandwatchQueryId', defaultMessage: 'BrandWatch Query ID' },
};

const PlatformDetailsInfo = ({ platform, media_tags }) => {
  let content = null;
  let channelContent = null;

  // TODO: set the channels here...
  const channels = media_tags || (platform.channel || []);

  switch (platform.platform) {
    case PLATFORM_OPEN_WEB:
      content = (
        <>
          <FormattedMessage {...messages.topicQueryProp} />:
          &nbsp;
          <code>{typeof platform.query === 'object' ? platform.query.getValue() : platform.query}</code>
          <br />
        </>
      );
      if (platform.source === MEDIA_CLOUD_SOURCE) {
        channelContent = (
          <>
            <FormattedMessage {...messages.topicSourceCollectionsProp} />: &nbsp;
            {channels.map((m, i) => <> <OpenWebMediaItem justText key={m.media_id || m.tags_id} object={m} /> {i === channels.length - 1 ? ' ' : ','}</>)}
          </>
        );
      }
      break;
    case PLATFORM_REDDIT:
      content = (
        <>
          <FormattedMessage {...messages.topicQueryProp} />:
          &nbsp;
          <code>{platform.query}</code>
          <br />
          <p>{channels}</p>
        </>
      );
      break;
    case PLATFORM_TWITTER:
      if (platform.source === CRIMSON_HEXAGON_SOURCE) {
        content = (
          <>
            <FormattedMessage {...localMessages.crimsonHexagonId} />:
            &nbsp;
            <code>{typeof platform.query === 'object' ? platform.query.getValue() : platform.query}</code>
          </>
        );
      } else if (platform.source === BRANDWATCH_SOURCE) {
        const fullQuery = typeof platform.query === 'object' ? platform.query.getValue() : platform.query;
        const parsedIds = parseQueryProjectId(platform.platform, platform.source, fullQuery);
        content = (
          <>
            <div>
              <FormattedMessage {...localMessages.brandwatchProjectId} />:
              &nbsp;
              <code>{parsedIds.project ? parsedIds.project : platform.project}</code>
            </div>
            <div>
              <FormattedMessage {...localMessages.brandwatchQueryId} />:
              &nbsp;
              <code>{parsedIds.query}</code>
            </div>
          </>
        );
      } else {
        content = (
          <>
            <FormattedMessage {...messages.topicQueryProp} />:
            &nbsp;
            <code>{typeof platform.query === 'object' ? platform.query.getValue() : platform.query}</code>
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
      {channelContent}
    </div>
  );
};

PlatformDetailsInfo.propTypes = {
  // from parent
  platform: PropTypes.object.isRequired,
  media_tags: PropTypes.array,
  // form context
  intl: PropTypes.object.isRequired,
};

export default injectIntl(PlatformDetailsInfo);

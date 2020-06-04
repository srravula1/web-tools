import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import messages from '../../resources/messages';
import LinkWithFilters from './LinkWithFilters';
import { googleFavIconUrl } from '../../lib/urlUtil';
import StorySearchFilterMediaWarning from './StorySearchFilterMediaWarning';
import SafelyFormattedNumber from '../common/SafelyFormattedNumber';
import { constructUrlSharingDataColumns } from './TopicStoryTable';

const ICON_STYLE = { margin: 0, padding: 0, width: 12, height: 12 };

const localMessages = {
  undateable: { id: 'media.publishDate.undateable', defaultMessage: 'Undateable' },
  foci: { id: 'media.foci.list', defaultMessage: 'List of Subtopics {list}' },
  facebookSharesHelp: { id: 'media.help.facebookShares', defaultMessage: '<p>The total number of shares this link has had on Facebook. It is important to note that this is captures at the time we first pulled this link into our system. Also note that many of these shares could have been for reasons totalled unrealted to the topic you are researching. Based on those caveats, we don\'t recommend using this for much.<p>' },
  authorCountHelp: { id: 'media.help.authorCount', defaultMessage: '<p>The number of unique users that posted this link to the platform you are looking at.<p>' },
  postCountHelp: { id: 'media.help.postCount', defaultMessage: '<p>The number of posts that included this link on the platform you are looking at.<p>' },
  channelCountHelp: { id: 'media.help.channelCount', defaultMessage: '<p>This varies by platform:</p><ul><li>Twitter: it is identical to the author count</li></ul>' },
  urlSharingSubtopicDataNames: { id: 'media.urlSharingSubtopicDataNames', defaultMessage: 'post/author/channel' },
};

class MediaTable extends React.Component {
  sortableHeader = (sortKey, textMsg) => {
    const { onChangeSort, sortedBy } = this.props;
    const { formatMessage } = this.props.intl;
    let content;
    if (onChangeSort) {
      if (sortedBy === sortKey) {
        // currently sorted by this key
        content = (
          <a>
            <b><FormattedMessage {...textMsg} /></b>
            <ArrowDropDownIcon style={ICON_STYLE} />
          </a>
        );
      } else {
        // link to sort by this key
        content = (
          <a
            href={`#${formatMessage(textMsg)}`}
            onClick={(e) => { e.preventDefault(); onChangeSort(sortKey); }}
            title={formatMessage(textMsg)}
          >
            <FormattedMessage {...textMsg} />
          </a>
        );
      }
    } else {
      // not sortable
      content = <FormattedMessage {...textMsg} />;
    }
    return content;
  }

  render() {
    const { media, topicId, includeMetadata, showTweetCounts, usingUrlSharingSubtopic, hasAUrlSharingFocalSet } = this.props;
    let urlSharingSubtopicNames = null;
    if (hasAUrlSharingFocalSet && (media.length > 0)) {
      // intuit a list of the subtopics from the url sharing counts on the first media source
      // alternatively, we could pass in the subtopics and use those, but this information is already here
      urlSharingSubtopicNames = media[0].url_sharing_counts.map(d => d.focus_name);
    }
    return (
      <div className="media-table">
        <StorySearchFilterMediaWarning />
        <table>
          <tbody>
            <tr>
              <th colSpan="2"><FormattedMessage {...messages.mediaName} /></th>
              <th><FormattedMessage {...messages.storyPlural} /></th>
              { !usingUrlSharingSubtopic && (
                <>
                  <th className="numeric">{this.sortableHeader('inlink', messages.mediaInlinks)}</th>
                  <th className="numeric"><FormattedMessage {...messages.outlinks} /></th>
                </>
              )}
              <th className="numeric">{this.sortableHeader('facebook', messages.facebookShares)}</th>
              { usingUrlSharingSubtopic && (
                <>
                  <th className="numeric">{this.sortableHeader('sum_post_count', messages.postCount)}</th>
                  <th className="numeric">{this.sortableHeader('sum_author_count', messages.authorCount)}</th>
                  <th className="numeric">{this.sortableHeader('sum_channel_count', messages.channelCount)}</th>
                </>
              )}
              { showTweetCounts && (
                <th className="numeric">{this.sortableHeader('twitter', messages.tweetCounts)}</th>
              )}
              {(includeMetadata !== false) && (
                <>
                  <th><FormattedMessage {...messages.mediaType} /></th>
                  <th><FormattedMessage {...messages.primaryLanguage} /></th>
                  <th><FormattedMessage {...messages.pubCountry} /></th>
                  <th><FormattedMessage {...messages.pubState} /></th>
                  <th><FormattedMessage {...messages.countryOfFocus} /></th>
                </>
              )}
              {hasAUrlSharingFocalSet && urlSharingSubtopicNames.map((name, idx) => <th key={`subtopic-${idx}`}>{name}<br /><FormattedMessage {...localMessages.urlSharingSubtopicDataNames} /></th>)}
            </tr>
            {media.map((m, idx) => (
              <tr key={m.media_id} className={(idx % 2 === 0) ? 'even' : 'odd'}>
                <td>
                  <img src={googleFavIconUrl(m.url)} alt={m.name} />
                </td>
                <td>
                  <LinkWithFilters to={`/topics/${topicId}/media/${m.media_id}`}>
                    {m.name}
                  </LinkWithFilters>
                </td>
                <td className="numeric"><FormattedNumber value={m.story_count !== undefined ? m.story_count : '?'} /></td>
                { !usingUrlSharingSubtopic && (
                  <>
                    <td className="numeric"><FormattedNumber value={m.media_inlink_count !== undefined ? m.media_inlink_count : '?'} /></td>
                    <td className="numeric"><FormattedNumber value={m.outlink_count !== undefined ? m.outlink_count : '?'} /></td>
                  </>
                )}
                <td className="numeric"><FormattedNumber value={m.facebook_share_count !== undefined ? m.facebook_share_count : '?'} /></td>
                { usingUrlSharingSubtopic && (
                  <>
                    <td className="numeric"><SafelyFormattedNumber value={m.sum_post_count} /></td>
                    <td className="numeric"><SafelyFormattedNumber value={m.sum_author_count} /></td>
                    <td className="numeric"><SafelyFormattedNumber value={m.sum_channel_count} /></td>
                  </>
                )}
                { showTweetCounts && (
                  <td className="numeric"><SafelyFormattedNumber value={m.simple_tweet_count} /></td>
                )}
                {(includeMetadata !== false) && (
                  <>
                    <td>{m.metadata.media_type ? m.metadata.media_type.label : '?'}</td>
                    <td>{m.metadata.language ? m.metadata.language.label : '?'}</td>
                    <td>{m.metadata.pub_country ? m.metadata.pub_country.label : '?'}</td>
                    <td>{m.metadata.pub_state ? m.metadata.pub_state.label : '?'}</td>
                    <td>{m.metadata.about_country ? m.metadata.about_country.label : '?'}</td>
                  </>
                )}
                {hasAUrlSharingFocalSet && constructUrlSharingDataColumns(urlSharingSubtopicNames, m)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

MediaTable.propTypes = {
  // from parent
  media: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  onChangeSort: PropTypes.func,
  sortedBy: PropTypes.string,
  includeMetadata: PropTypes.bool, // default true
  // from parent container
  showTweetCounts: PropTypes.bool,
  usingUrlSharingSubtopic: PropTypes.bool.isRequired,
  hasAUrlSharingFocalSet: PropTypes.bool.isRequired,
};

export default injectIntl(MediaTable);

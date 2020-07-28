import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import DataCard from './DataCard';
import CollectionTable from './CollectionTable';
import { isCollectionTagSet, compareTagNames } from '../../lib/tagUtil';
import { DownloadButton } from './IconButton';
import messages from '../../resources/messages';
import { getUserRoles, hasPermissions, PERMISSION_MEDIA_EDIT } from '../../lib/auth';

const CollectionList = (props) => {
  const { title, intro, collections, onDownload, helpButton, user, linkToFullUrl } = props;
  const { formatMessage } = props.intl;
  // show private collections only if user has right permission
  const canSeePrivateCollections = hasPermissions(getUserRoles(user), PERMISSION_MEDIA_EDIT);
  const validCollections = collections ? collections.filter(c => (isCollectionTagSet(c.tag_sets_id) && (c.show_on_media || canSeePrivateCollections))) : [];
  validCollections.sort(compareTagNames);
  let actions = null;
  if (onDownload) {
    actions = (
      <div className="actions">
        <DownloadButton tooltip={formatMessage(messages.download)} onClick={onDownload} />
      </div>
    );
  }
  return (
    <DataCard className="collection-list">
      {actions}
      <h2>{title}{helpButton}</h2>
      {intro && <p>{intro}</p>}
      <div className="collection-list-item-wrapper">
        <CollectionTable collections={validCollections} absoluteLink={linkToFullUrl} />
      </div>
    </DataCard>
  );
};

CollectionList.propTypes = {
  // from parent
  title: PropTypes.string.isRequired,
  intro: PropTypes.string,
  collections: PropTypes.array.isRequired,
  linkToFullUrl: PropTypes.bool,
  onDownload: PropTypes.func,
  helpButton: PropTypes.node,
  // from compositional chain
  intl: PropTypes.object.isRequired,
  user: PropTypes.object,
};

const mapStateToProps = state => ({
  user: state.user,
});

export default
injectIntl(
  connect(mapStateToProps)(
    CollectionList
  )
);

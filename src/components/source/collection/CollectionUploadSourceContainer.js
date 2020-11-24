import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { uploadSourceListFromTemplate } from '../../../actions/sourceActions';
import { updateFeedback } from '../../../actions/appActions';
import LoadingSpinner from '../../common/LoadingSpinner';
import CollectionUploadConfirmer from './form/CollectionUploadConfirmer';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import { DownloadButton } from '../../common/IconButton';
import messages from '../../../resources/messages';
import { HELP_SOURCES_CSV_COLUMNS } from '../../../lib/helpConstants';
import { FETCH_SUCCEEDED } from '../../../lib/fetchConstants';

const localMessages = {
  downloadEmpty: { id: 'collections.download.emptycsv', defaultMessage: 'Download a template in CSV format' },
  downloadFull: { id: 'collections.download.fullcsv', defaultMessage: 'Download current sources in CSV format' },
  helpText: { id: 'collection.upload.help.text',
    defaultMessage: 'You can modify or add sources in batch using a CSV file.  First download the CSV template by clicking the Download button. Then edit it, and upload it.',
  },
  feedbackGood: { id: 'collection.upload.feedbackGood', defaultMessage: 'This upload was successful' },
  feedbackBad: { id: 'collection.upload.feedback.bad', defaultMessage: 'The upload failed ({message}).' },
};

class CollectionUploadSourceContainer extends React.Component {
  downloadCsv = (evt) => {
    const { myCollectionId, notifyOfCsvDownload } = this.props;
    if (evt) {
      evt.preventDefault();
    }
    let url = null;
    if (myCollectionId) {
      url = `/api/collections/${myCollectionId}/sources.csv`;
    } else {
      url = '/api/template/sources.csv';
    }
    window.location = url;
    notifyOfCsvDownload(HELP_SOURCES_CSV_COLUMNS);
  }

  selectedCSV = () => {
    this.setState({ confirmTemplate: true });
  }

  confirmLoadCSV = () => {
    this.setState({ confirmTemplate: false });
  }

  uploadCSV = () => {
    const { uploadCSVFile } = this.props;
    const fd = this.textInput.files[0];
    uploadCSVFile(fd);
    this.selectedCSV();
  }

  render() {
    const { onConfirm, mysources, myCollectionId, fetchStatus, error } = this.props;
    const { formatMessage } = this.props.intl;
    let confirmContent = null;
    if (mysources && mysources.length > 0 && this.state && this.state.confirmTemplate) {
      confirmContent = (
        <CollectionUploadConfirmer onConfirm={onConfirm} onCancel={this.confirmLoadCSV} onClickButton={this.confirmLoadCSV} />
      );
    } else if (this.state && this.state.confirmTemplate && fetchStatus !== FETCH_SUCCEEDED) {
      confirmContent = <LoadingSpinner />;
    } else if (fetchStatus === FETCH_SUCCEEDED && error) {
      confirmContent = <h3>Error. Try Again</h3>;
    }
    let downloadLabel;
    if (mysources && mysources.length > 0 && myCollectionId != null) {
      downloadLabel = formatMessage(localMessages.downloadFull);
    } else {
      downloadLabel = formatMessage(localMessages.downloadEmpty);
    }
    return (
      <div>
        <p>
          <FormattedMessage {...localMessages.helpText} />
        </p>
        <a href="#download" onClick={this.downloadCsv}>
          {downloadLabel}
        </a>
        &nbsp;
        <DownloadButton tooltip={downloadLabel} onClick={this.downloadCsv} />
        <br />
        <br />
        <b><FormattedMessage {...messages.upload} />:</b> &nbsp;
        <input type="file" onChange={this.uploadCSV} ref={(input) => { this.textInput = input; }} disabled={this.state && this.state.confirmTemplate} />
        { confirmContent }
      </div>
    );
  }
}

CollectionUploadSourceContainer.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  total: PropTypes.number,
  error: PropTypes.string,
  // from parent
  onConfirm: PropTypes.func.isRequired,
  mysources: PropTypes.array,
  myCollectionId: PropTypes.string,
  // from parent
  // from compositional chain
  notifyOfCsvDownload: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  uploadCSVFile: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.form.toUpload.fetchStatus,
  uploadErrors: state.sources.collections.form.toUpload.error,
  mysources: state.sources.collections.form.toUpload.list, // this will activate confirmation message and button
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  uploadCSVFile: (csvFile) => {
    dispatch(uploadSourceListFromTemplate({ file: csvFile }))
      .then((results) => {
        if (results.status === 'Error') {
          return dispatch(updateFeedback({
            classes: 'error-notice',
            open: true,
            message: ownProps.intl.formatMessage(localMessages.feedbackBad, { message: results.message }),
          }));
        }
        if (results.status === 'Success') {
          return dispatch(updateFeedback({
            classes: 'info-notice',
            open: true,
            message: ownProps.intl.formatMessage(localMessages.feedbackGood),
          }));
        }
        return null;
      });
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withCsvDownloadNotifyContainer(
      CollectionUploadSourceContainer
    )
  )
);

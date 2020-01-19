import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../../../common/hocs/IntlForm';
import messages from '../../../../../resources/messages';
import MediaPickerDialog from '../../../../common/mediaPicker/MediaPickerDialog';
import QueryHelpDialog from '../../../../common/help/QueryHelpDialog';
import OpenWebMediaFieldArray from '../../../../common/form/OpenWebMediaFieldArray';
import SimpleQueryForm from '../../../../common/queryEditor/SimpleQueryForm';

class EditOpenWebForm extends React.Component {
  state = {
    inSimpleMode: true,
  };

  render() {
    const { initialValues, renderSolrTextField, onEnterKey, onFormChange, intl } = this.props;
    return (
      <>
        {this.state.inSimpleMode && (
          <SimpleQueryForm
            onAdvancedModeRequest={(generatedQueryString) => {
              onFormChange('query', generatedQueryString);
              this.setState({ inSimpleMode: false });
            }}
          />
        )}
        <Row>
          {!this.state.inSimpleMode && (
            <Col lg={6}>
              <label htmlFor="query"><FormattedMessage {...messages.query} /></label>
              <Field
                name="query"
                component={renderSolrTextField}
                multiline
                rows={2}
                rowsMax={4}
                fullWidth
                variant="outlined"
                onKeyDown={onEnterKey}
              />
              <small>
                <b><QueryHelpDialog trigger={intl.formatMessage(messages.queryHelpLink)} /></b>
              </small>
            </Col>
          )}
          <Col lg={6}>
            <div className="media-field-wrapper">
              <label htmlFor="media"><FormattedMessage {...messages.topicSourceCollectionsProp} /></label>
              <OpenWebMediaFieldArray
                fieldName="media"
                form="platform"
                initialValues={{
                  ...initialValues,
                  media: initialValues.media_tags,
                }} // to and from MediaPicker
                allowRemoval
              />
              <MediaPickerDialog
                initMedia={initialValues.media_tags} // {selected.media ? selected.media : cleanedInitialValues.media}
                onConfirmSelection={selections => onFormChange('media', selections)}
              />
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

EditOpenWebForm.propTypes = {
  // from parent
  initialValues: PropTypes.object,
  onEnterKey: PropTypes.func,
  // from dispatch
  onFormChange: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  renderSolrTextField: PropTypes.func.isRequired,
};

export default
withIntlForm(
  EditOpenWebForm
);

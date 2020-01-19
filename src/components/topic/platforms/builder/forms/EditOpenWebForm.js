import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import { Field, formValues } from 'redux-form';
import withIntlForm from '../../../../common/hocs/IntlForm';
import messages from '../../../../../resources/messages';
import MediaPickerDialog from '../../../../common/mediaPicker/MediaPickerDialog';
import QueryHelpDialog from '../../../../common/help/QueryHelpDialog';
import OpenWebMediaFieldArray from '../../../../common/form/OpenWebMediaFieldArray';
import SimpleQueryForm from '../../../../common/queryEditor/SimpleQueryForm';
import AppButton from '../../../../common/AppButton';
import { searchTermsToQuery } from '../../../../../lib/querySyntaxUtil';

class EditOpenWebForm extends React.Component {
  state = {
    inSimpleMode: true,
  };

  render() {
    const { initialValues, renderSolrTextField, onEnterKey, onFormChange, intl, onSearch, platform, source, matchType, matches, negations } = this.props;
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
        <Row>
          <Col lg={2} xs={12}>
            <AppButton
              id="preview-search-button"
              label={messages.search}
              style={{ marginTop: 33 }}
              onClick={() => {
                if (this.state.inSimpleMode) {
                  const queryString = searchTermsToQuery(platform, source, matchType, matches, negations);
                  onFormChange('query', queryString);
                }
                onSearch();
              }}
            />
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
  onSearch: PropTypes.func.isRequired,
  // from dispatch
  onFormChange: PropTypes.func.isRequired,
  // from compositional helper
  intl: PropTypes.object.isRequired,
  renderSolrTextField: PropTypes.func.isRequired,
  matches: PropTypes.array,
  negations: PropTypes.array,
  matchType: PropTypes.string,
  platform: PropTypes.string,
  source: PropTypes.string,
};

export default
withIntlForm(
  formValues('platform', 'source', 'matches', 'negations', 'matchType')(
    EditOpenWebForm
  ),
);

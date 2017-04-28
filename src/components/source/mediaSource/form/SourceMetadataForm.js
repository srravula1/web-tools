import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import MetadataPickerContainer from '../../../common/MetadataPickerContainer';
import { TAG_SET_PUBLICATION_COUNTRY, TAG_SET_PUBLICATION_STATE } from '../../../../lib/tagUtil';

const localMessages = {
  title: { id: 'source.add.metadata.title', defaultMessage: 'Source Metadata' },
};

const SourceMetadataForm = props => (
  <div className="form-section source-metadata-form">
    <Row>
      <Col lg={12}>
        <h2><FormattedMessage {...localMessages.title} /></h2>
      </Col>
    </Row>
    <Row>
      <Col lg={4} xs={12}>
        <MetadataPickerContainer
          id={TAG_SET_PUBLICATION_COUNTRY}
          name={'publicationCountry'}
          form="sourceForm"
          initialValues={props.initialValues}
        />
      </Col>
      <Col lg={4} xs={12}>
        <MetadataPickerContainer
          id={TAG_SET_PUBLICATION_STATE}
          name={'publicationState'}
          form="sourceForm"
          initialValues={props.initialValues}
        />
      </Col>
    </Row>
  </div>
);

SourceMetadataForm.propTypes = {
  // from compositional chain
  initialValues: React.PropTypes.object,
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    SourceMetadataForm
  );

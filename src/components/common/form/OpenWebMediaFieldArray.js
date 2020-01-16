import PropTypes from 'prop-types';
import React from 'react';
import { FieldArray, Field } from 'redux-form';
import withIntlForm from '../hocs/IntlForm';
import OpenWebMediaItem from '../OpenWebMediaItem';

const renderCollectionSelector = ({ fields, meta, onDelete, allowRemoval }) => (
  <div>
    {fields.map((name, index) => (
      <Field
        key={name}
        name={name}
        component={(info) => {
          const handleDelete = ((allowRemoval || info.meta.dirty)) ? () => { fields.remove(index); onDelete(info.input.value); } : undefined;
          const val = info.input.value;
          let tempObj = {};
          if (val && typeof val === 'number') {
            tempObj.id = val;
          } else {
            tempObj = info.input.value;
          }
          return (
            <OpenWebMediaItem object={tempObj} onDelete={handleDelete} />
          );
        }}
      />
    ))}
    { meta.error !== null && meta.error !== undefined ? <div className="error">{meta.error}</div> : '' }
  </div>
);

renderCollectionSelector.propTypes = {
  fields: PropTypes.object,
  meta: PropTypes.object,
  allowRemoval: PropTypes.bool,
  validate: PropTypes.func,
  onDelete: PropTypes.func,
};

const OpenWebMediaFieldArray = ({ fieldName, initialValues, allowRemoval, onDelete }) => (
  <div className="open-web-field-array">
    <FieldArray
      name={fieldName}
      allowRemoval={allowRemoval}
      component={renderCollectionSelector}
      initialValues={initialValues}
      onDelete={onDelete}
    />
  </div>
);

OpenWebMediaFieldArray.propTypes = {
  // from parent
  intl: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  selected: PropTypes.object,
  allowRemoval: PropTypes.bool,
  fieldName: PropTypes.string.isRequired,
  // valid: PropTypes.bool,  not using - but this is helpful to determine if validation is getting
  onDelete: PropTypes.func,
};

export default
withIntlForm(
  OpenWebMediaFieldArray
);

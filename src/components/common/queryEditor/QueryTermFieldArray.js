import PropTypes from 'prop-types';
import React from 'react';
import { FieldArray, Field } from 'redux-form';
import withIntlForm from '../hocs/IntlForm';
import { intlIfObject } from '../../../lib/stringUtil';
import { DeleteButton, AddButton } from '../IconButton';

const renderKeywords = ({ fields, meta, onDelete, renderTextField, conjunction, formatMessage }) => (
  <>
    {fields.map((name, index) => {
      const isLastOne = (index === (fields.length - 1));
      return (
        <div className="query-term" key={`${name}.${index}`}>
          <Field
            name={name}
            component={(info) => (
              <>
                <span className="delete">
                  {(fields.length > 1) && (
                    <DeleteButton onClick={(evt) => {
                      fields.remove(index);
                      if (onDelete) onDelete(index, info.input.value, evt);
                    }}
                    />
                  )}
                </span>
                <span className="term">
                  <Field
                    name={name}
                    component={renderTextField}
                    fullWidth
                  />
                </span>
                {!isLastOne && <span className="conjunction">{intlIfObject(formatMessage, conjunction)}</span>}
                {isLastOne && <AddButton onClick={() => fields.push()} />}
              </>
            )}
          />
        </div>
      );
    })}
    { meta.error !== null && meta.error !== undefined ? <div className="error">{meta.error}</div> : '' }
  </>
);

renderKeywords.propTypes = {
  fields: PropTypes.object,
  meta: PropTypes.object,
  allowRemoval: PropTypes.bool,
  validate: PropTypes.func,
  onDelete: PropTypes.func,
  formatMessage: PropTypes.func,
  conjunction: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // from compositional chain
  renderTextField: PropTypes.func.isRequired,
};

const QueryTermFieldArray = ({ conjunction, initialValues, fieldName, onDelete, intl }) => (
  <div className="query-term-list">
    <FieldArray
      name={fieldName}
      component={withIntlForm(renderKeywords)}
      initialValues={initialValues}
      onDelete={onDelete}
      conjunction={conjunction}
      formatMessage={intl.formatMessage}
    />
  </div>
);

QueryTermFieldArray.propTypes = {
  // from parent
  initialValues: PropTypes.object,
  fieldName: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  conjunction: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
withIntlForm(
  QueryTermFieldArray
);

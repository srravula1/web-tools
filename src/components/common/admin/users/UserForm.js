import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../hocs/IntlForm';
import AppButton from '../../AppButton';
import UserDetailsForm from './UserDetailsForm';
import UserPermissionsForm from './UserPermissionsForm';
import { emptyString } from '../../../../lib/formValidators';

const localMessages = {
  mainTitle: { id: 'user.maintitle', defaultMessage: 'Update User' },
  addButton: { id: 'user.update.saveAll', defaultMessage: 'Save' },
  feedback: { id: 'user.update.feedback', defaultMessage: 'We saved your updates' },
  userError: { id: 'user.update.error', defaultMessage: 'Sorry something happened' },
};

const UserForm = (props) => {
  const { initialValues, buttonLabel, pristine, submitting, handleSubmit, onSave } = props;
  return (
    <Grid>
      <form className="app-form user-form" name="userForm" onSubmit={handleSubmit(onSave.bind(this))}>
        <UserDetailsForm initialValues={initialValues} form="userForm" />
        <UserPermissionsForm initialValues={initialValues} form="userForm" />
        <Row>
          <Col lg={12}>
            <AppButton
              type="submit"
              style={{ marginTop: 30 }}
              label={buttonLabel}
              disabled={pristine || submitting}
              primary
            />
          </Col>
        </Row>
      </form>
    </Grid>
  );
};

UserForm.propTypes = {
  // from parent
  onSave: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  // from context
  intl: PropTypes.object.isRequired,
  collections: PropTypes.array,
  // from form helper
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.name)) {
    errors.name = localMessages.nameError;
  }
  if (emptyString(values.email)) {
    errors.email = localMessages.urlError;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'userForm',
  validate,
  enableReinitialize: true,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      UserForm
    ),
  ),
);

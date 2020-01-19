import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Field } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import QueryTermFieldArray from './QueryTermFieldArray';
import withIntlForm from '../hocs/IntlForm';
import QueryPreview from './QueryPreview';
import ConfirmationDialog from '../ConfirmationDialog';
import messages from '../../../resources/messages';

const localMessages = {
  advancedModeTitle: { id: 'simpleQuery.form.confirm.title', defaultMessage: 'Switch to Advanced Mode?' },
  advancedModeText: { id: 'simpleQuery.form.confirm.text', defaultMessage: 'Switching to advanced mode will let you edit this query text directly. You will not be able to switch back to simple mode afterwards. Are you sure you want to switch modes?' },
  matchConjunctionAll: { id: 'simpleQuery.form.matchConjunction.all', defaultMessage: 'AND' },
  matchConjunctionAny: { id: 'simpleQuery.form.matchConjunction.any', defaultMessage: 'OR' },
  matchTitle1: { id: 'simpleQuery.form.match.title1', defaultMessage: 'Match' },
  matchTitle2: { id: 'simpleQuery.form.match.title2', defaultMessage: 'of these phrases:' },
  negationConjunction: { id: 'simpleQuery.form.negationConjunction', defaultMessage: 'AND NOT' },
  negationTitle: { id: 'simpleQuery.form.negation.title', defaultMessage: 'And <b>none</b> of these phrases:' },
  all: { id: 'simpleQuery.form.match.all', defaultMessage: 'All' },
  any: { id: 'simpleQuery.form.match.any', defaultMessage: 'Any' },
};

class SimpleQueryForm extends React.Component {
  state = {
    open: false,
    generatedQueryString: '',
  };

  render() {
    const { onAdvancedModeRequest, renderSelect } = this.props;
    return (
      <div className="simple-query-form">
        <Row>
          <Col lg={4}>
            <div className="matches">
              <h3>
                <FormattedHTMLMessage {...localMessages.matchTitle1} />
                <Field
                  name="matchType"
                  component={renderSelect}
                  fullWidth={false}
                >
                  <MenuItem
                    key={0}
                    value="all"
                  >
                    <FormattedMessage {...localMessages.all} />
                  </MenuItem>
                  <MenuItem
                    key={1}
                    value="any"
                  >
                    <FormattedMessage {...localMessages.any} />
                  </MenuItem>
                </Field>
                <FormattedHTMLMessage {...localMessages.matchTitle2} />
              </h3>
              <QueryTermFieldArray
                fieldName="matches"
                form="platform"
                conjunction={localMessages.matchConjunction}
              />
            </div>
          </Col>
          <Col lg={4}>
            <div className="negations">
              <h3><FormattedHTMLMessage {...localMessages.negationTitle} /></h3>
              <QueryTermFieldArray
                fieldName="negations"
                conjunction={localMessages.negationConjunction}
              />
            </div>
          </Col>
          <Col lg={4}>
            <QueryPreview onAdvancedModeRequest={(generatedQueryString) => this.setState({ open: true, generatedQueryString })} />
          </Col>
        </Row>
        <ConfirmationDialog
          open={this.state.open}
          title={localMessages.advancedModeTitle}
          okText={messages.ok}
          onOk={() => onAdvancedModeRequest(this.state.generatedQueryString)}
          onCancel={() => this.setState({ open: false })}
        >
          <FormattedMessage {...localMessages.advancedModeText} />
        </ConfirmationDialog>
      </div>
    );
  }
}

SimpleQueryForm.propTypes = {
  initialValues: PropTypes.object,
  onAdvancedModeRequest: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
};

export default
injectIntl(
  withIntlForm(
    SimpleQueryForm
  )
);

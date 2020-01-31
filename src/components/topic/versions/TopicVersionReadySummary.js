import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { platformNameMessage, sourceNameMessage } from '../platforms/AvailablePlatform';
import messages from '../../../resources/messages';

const localMessages = {
  completedDetails: { id: 'topic.state.completedDetails', defaultMessage: 'Includes {total} stories ({discoveredPct} discovered), {platformCount, plural,\n =0 {no platforms}\n =1 {1 platform}\n other {# platforms}}, and {fociCount, plural,\n =0 {no subtopics}\n =1 {1 subtopic}\n other {# subtopics}}.' },
  snapshotDetails: { id: 'topic.state.snapshotDetails', defaultMessage: 'details' },
};

class TopicVersionReadySummary extends React.Component {
  state = {
    showDetails: false,
  };

  render() {
    const { storyCounts, snapshot, intl } = this.props;
    const { formatNumber } = intl;
    return (
      <>
        <FormattedMessage
          {...localMessages.completedDetails}
          values={{
            total: formatNumber(storyCounts.total),
            discoveredPct: storyCounts.total === 0 ? '0%' : formatNumber(storyCounts.spidered / storyCounts.total, { style: 'percent', maximumFractionDigits: 0 }),
            platformCount: snapshot.platform_seed_queries.length,
            fociCount: snapshot.foci_count,
          }}
        />
        &nbsp;
        <a
          href="#version-details"
          onClick={(evt) => {
            evt.preventDefault();
            this.setState(state => ({ showDetails: !state.showDetails }));
          }}
        >
          <FormattedMessage {...localMessages.snapshotDetails} />
        </a>
        <span>
          {this.state.showDetails && (
            <ul>
              <li><FormattedMessage {...messages.platformHeader} />:
                <ul>
                  {snapshot.platform_seed_queries.map((p, idx) => (
                    <li key={idx}>
                      <FormattedMessage {...platformNameMessage(p.platform, p.source)} />
                      &nbsp;
                      (<FormattedMessage {...sourceNameMessage(p.source)} />)
                    </li>
                  ))}
                </ul>
              </li>
              <li><FormattedMessage {...messages.focusHeader} />:
                <ul>
                  {snapshot.foci_names.map((fs, idx) => (
                    <li key={idx}>{fs.focal_set_name}: {fs.foci_names.join(', ')}</li>
                  ))}
                </ul>
              </li>
            </ul>
          )}
        </span>
      </>
    );
  }
}


TopicVersionReadySummary.propTypes = {
  // from parent
  snapshot: PropTypes.object.isRequired,
  storyCounts: PropTypes.object.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  TopicVersionReadySummary
);

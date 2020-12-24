import ReactGA from 'react-ga';

/**
 * Custom tracking
 */
const TrackingEvent = (category, action, label) => {
    ReactGA.event({
        category,
        action,
        label,
    });
};

export default TrackingEvent;

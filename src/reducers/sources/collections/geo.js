import { FETCH_GEO_COLLECTIONS_BY_COUNTRY } from '../../../actions/sourceActions';
import { createAsyncReducer } from '../../../lib/reduxHelpers';

const all = createAsyncReducer({
  initialState: {
    list: [],
  },
  action: FETCH_GEO_COLLECTIONS_BY_COUNTRY,
  handleSuccess: payload => ({ // from json list
    list: payload ? Object.values(payload) : [],
  }),
});

export default all;

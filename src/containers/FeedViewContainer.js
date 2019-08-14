import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {NavigationActions} from 'react-navigation';

import * as UserActions from '../reducers/UserReducer';
import FeedView from '../views/FeedView';

export default connect(
    state => ({

    }),
    dispatch => {
        return {
            navigate: bindActionCreators(NavigationActions.navigate, dispatch),
            userActions: bindActionCreators(UserActions, dispatch),
        };
    }
)(FeedView);

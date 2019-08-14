import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FlashMessage from 'react-native-flash-message';
import {Platform} from 'react-native';
import { NavigationActions } from 'react-navigation';

import AppNavigator from './Navigator';

class NavigatorView extends Component {
  static propTypes = {
      dispatch: PropTypes.func.isRequired,
      navigatorState: PropTypes.shape({
          index: PropTypes.number.isRequired,
          routes: PropTypes.arrayOf(PropTypes.shape({
              key: PropTypes.string.isRequired,
              routeName: PropTypes.string.isRequired
          }))
      }).isRequired
  };

  componentDidMount() {
      if (this.props.userState && this.props.userState.user && this.props.userState.user._id) {
          const navigateAction = NavigationActions.navigate({
              routeName: 'Story',
          });
          this.navigator.dispatch(navigateAction);
      }
  }

  render() {
      return (
          [<AppNavigator ref={ref => this.navigator = ref} key="navigator"/>, <FlashMessage style={Platform.OS === 'android'?{paddingTop: 30}:null} key='flash' icon='auto'/>]
      );
  }
}

export default NavigatorView;

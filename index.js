/** @format */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { AppRegistry, View } from 'react-native';
/***
 * APP ENTRY
 */
import AppContainer from './src/containers/AppContainer';
import PushHandler from './src/views/PushHandler'
import store from './src/redux/store';
import { name } from './app.json';
import MixPanel from 'react-native-mixpanel';
import { BUGSNAG_KEY, MIXPANEL_TOKEN } from "./src/config";

import { Client, Configuration } from 'bugsnag-react-native';
const config = new Configuration();
config.apiKey = BUGSNAG_KEY;
config.codeBundleId = "95"
config.appVersion = require('./package.json').version;
console.disableYellowBox = true;
var PushNotification = require('react-native-push-notification');
import { AsyncStorage, Platform } from 'react-native';



class SoqqleApp extends Component {

    componentDidMount(): void {
        //todo: uncomment this after successful integeration of mixpanel sdk
        MixPanel.sharedInstanceWithToken(MIXPANEL_TOKEN);
        //  setTimeout(() => {
        //     codePush.sync({
        //         installMode: codePush.InstallMode.IMMEDIATE
        //     })
        //  }, 7000)



        const bugsnag = new Client(config);
        console.log("Ramesh ")
        PushNotification.configure({

            // (optional) Called when Token is generated (iOS and Android)
            onRegister: async (token) => {
                console.log('TOKEN:', token);
                await AsyncStorage.setItem("device_token", `${token.token}`);

            },

            // (required) Called when a remote or local notification is opened or received
            onNotification: function (notification) {

                console.log('NOTIFICATION:', notification);
                if (Platform.OS === 'android') {

                    if (notification.mp_message === undefined) {
                        return
                    }
                    PushNotification.localNotificationSchedule({
                        message: `${notification.mp_message}`, // (required)
                        date: new Date(Date.now())
                    });
                }

                // process the notification

                // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
                //notification.finish(PushNotificationIOS.FetchResult.NoData);
            },

            // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
            senderID: "178636075101",

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: false,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             */
            requestPermissions: true,
        });
    }

    render() {
        return (
            <Provider store={store}>
                <AppContainer />
            </Provider>
        );
    }
}

AppRegistry.registerComponent(name, () => SoqqleApp);

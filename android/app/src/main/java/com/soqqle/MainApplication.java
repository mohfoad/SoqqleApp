package com.soqqle;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import androidx.multidex.MultiDex;

import com.facebook.react.ReactApplication;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.realm.react.RealmReactPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.microsoft.codepush.react.CodePush;
import com.bugsnag.BugsnagReactNative;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;

import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.imagepicker.ImagePickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;

import com.bugsnag.BugsnagReactNative;

import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;

import com.google.firebase.FirebaseApp;

import com.kevinejohn.RNMixpanel.RNMixpanel;

import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.imagepicker.ImagePickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;

import com.bugsnag.BugsnagReactNative;
import com.microsoft.appcenter.reactnative.crashes.AppCenterReactNativeCrashesPackage;
import com.microsoft.appcenter.reactnative.analytics.AppCenterReactNativeAnalyticsPackage;
import com.microsoft.appcenter.reactnative.appcenter.AppCenterReactNativePackage;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;

import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.imagepicker.ImagePickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.bugsnag.BugsnagReactNative;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;

import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.bugsnag.BugsnagReactNative;
import com.imagepicker.ImagePickerPackage;
import com.bugsnag.BugsnagReactNative;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.appevents.AppEventsLogger;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

    protected static CallbackManager getCallbackManager() {
        return mCallbackManager;
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
        }
    
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
            new RNFirebasePackage(),            
            new RNFirebaseCrashlyticsPackage(),
            new RealmReactPackage(),
            new RNViewShotPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),






            BugsnagReactNative.getPackage(),
            new AppCenterReactNativeCrashesPackage(MainApplication.this, getResources().getString(R.string.appCenterCrashes_whenToSendCrashes)),
            new AppCenterReactNativeAnalyticsPackage(MainApplication.this, getResources().getString(R.string.appCenterAnalytics_whenToEnableAnalytics)),
            new AppCenterReactNativePackage(MainApplication.this),
            new ReactNativePushNotificationPackage(),
            new RNMixpanel(),



            new ReactVideoPackage(),
            new VectorIconsPackage(),
            new RNGestureHandlerPackage(),
            new ImagePickerPackage(),
                    new FBSDKPackage(mCallbackManager)

            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    protected void attachBaseContext(Context context) {
        super.attachBaseContext(context);
        MultiDex.install(this);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        FirebaseApp.initializeApp(this);

        Log.d("Facebook-SDK", FacebookSdk.getSdkVersion());

        AppEventsLogger.activateApp(this);
        SoLoader.init(this, /* native exopackage */ false);
    }
}

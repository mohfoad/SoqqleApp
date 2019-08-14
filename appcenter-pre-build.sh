npm install -g react-native-cli

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --sourcemap-output android/app/src/main/assets/android-release.bundle.map

rm -rf android/app/src/main/res/drawable-hdpi
rm -rf android/app/src/main/res/drawable-mdpi
rm -rf android/app/src/main/res/drawable-xhdpi
rm -rf android/app/src/main/res/drawable-xxhdpi
rm -rf android/app/src/main/res/drawable-xxxhdpi

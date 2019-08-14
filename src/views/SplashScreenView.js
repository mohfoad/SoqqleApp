import React, { Component } from 'react';
import {
  View,
  Text,
  AsyncStorage,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ScrollView
} from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';
import LoginContainer from '../containers/LoginContainer';
import styles from '../stylesheets/SplashViewStyle.js';


const { width, height } = Dimensions.get('window');
const slides = [
  {
    key: '1',
    title: 'Get together, now',
    image: require('../images/SplashScreen_1.png'),
    titleStyle: { textAlign: 'center' },
    textStyle: { textAlign: 'center' },
    text:
      'Digispace enhances community collaboration between friends, trends and brands. It’s real life, made more real.',
    backgroundColor: 'transparent',
  },
  {
    key: '2',
    title: 'Our world, but better - Thank to you!',
    image: require('../images/SplashScreen_2.png'),
    titleStyle: { textAlign: 'center' },
    textStyle: { textAlign: 'center' },
    text:
      'Plug into our ecosystem for a journey of discovery, rewards and glory. You have a more interesting journey inside of you then you even know.',
    backgroundColor: 'transparent',
  },
  {
    key: '3',
    title: 'Grow yourself and millions around the planet',
    image: require('../images/SplashScreen_3.png'),
    titleStyle: { textAlign: 'center' },
    textStyle: { textAlign: 'center' },
    text:
      'Digispace pushes the boundary by creating new ways for you to unlock achievements for intrinsic qualities.',
    backgroundColor: 'transparent',
  },
  {
    key: '4',
    title: 'Seamlessly discover the world around you',
    image: require('../images/SplashScreen_4.png'),
    titleStyle: { textAlign: 'center' },
    textStyle: { textAlign: 'center' },
    text:
      'You unlock special in-platform benefits using Soqqle sparks, earned by completing tasks. Everyday is important and meaningful to your goals.',
    backgroundColor: 'transparent',
  },
];

export default class SplashScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRealApp: false,
      index: 1,
      skip: true,
      loading: true,
    };
  }
  componentDidMount = async () => {
    try {
      let isAppLoaded = await AsyncStorage.getItem('showRealApp');
      if (isAppLoaded === 'true') {
        this.setState({
          showRealApp: true,
          loading: false
        });
      } else {
        this.setState({
          loading: false,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  _onDone = async () => {
    this.setState({ showRealApp: true });
    await AsyncStorage.setItem('showRealApp', 'true');
  };
  renderSkip = () => {
    return this.state.skip ? (
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 0 }}
        onPress={() => this.onSkip()}
      >
        <Text style={{ color: '#1FBEB8' }}>Skip</Text>
      </TouchableOpacity>
    ) : null;
  };
  onSkip = () => {
    //  let { index } = this.state;
    //index =index+ 1;
    // alert(index)
    this.setState({ skip: false });

    this.AppIntroSlider.goToSlide(3);
  };
  renderDone = () => {
    return (
      <View style={styles.signUp}>
        <Text style={styles.signupText}>Sign Up</Text>
      </View>
    );
  };
  _renderItem = props => {
    return (
      <View
        style={[
          styles.mainContent,
          {
            // paddingTop: 120,
            // paddingBottom: 50,
            width: props.width,
            height: props.height,
            paddingHorizontal: 15,
          },
        ]}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{props.title}</Text>
        </View>
        <Image
          source={props.image}
          style={{ width: width, height:height/3+50, alignSelf: 'center',marginVertical:-10}}
          resizeMode="contain"
        />
        <Text style={[styles.text,{ marginTop: props.key !== '4' ? 40 : 10 }]}>{props.text}</Text>
        {props.key === '4' ? (
          <View>
            <TouchableOpacity
              style={styles.signUp}
              onPress={() => this._onDone()}
            >
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
            <Text style={styles.textBottom}>
              {'Now is the time to take charge of your life.'}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  showSplashAgain=()=>{
    this.setState({
      showRealApp:false,
      skip:true
    })
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator />;
    } else {
      if (this.state.showRealApp) {
        return <LoginContainer showSplashAgain={this.showSplashAgain} {...this.props} />;
      } else {
        return (
          <ScrollView style={{flex:1}} contentContainerStyle={{minHeight:height}}>
          <View
            style={[styles.container, { marginTop: StatusBar.currentHeight }]}
          >
            <StatusBar
              backgroundColor="#130C38"
              barStyle={'light-content'}
              hidden={false}
              translucent={true}
            />
            <AppIntroSlider
              slides={slides}
              onDone={this._onDone}
              dotStyle={styles.dotView}
              renderItem={this._renderItem}
              activeDotStyle={styles.activedotView}
              showSkipButton={false}
              showNextButton={false}
              showDoneButton={false}
              buttonStyle={{ textAlign: 'right' }}
              bottomButton
              hidePagination={!this.state.skip}
              ref={ref => (this.AppIntroSlider = ref)}
              onSlideChange={index =>
                index === 3
                  ? this.setState({ skip: false })
                  : this.setState({ skip: true })
              }
            />
            {this.state.skip ? (
              <TouchableOpacity
                style={{ position: 'absolute', top: height*0.04, right: 15 }}
                onPress={() => this.onSkip()}
              >
                <Text style={{ color: '#1FBEB8' }}>Skip</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          </ScrollView>
        );
      }
    }
  }
}

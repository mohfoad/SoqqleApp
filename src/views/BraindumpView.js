import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import VerticalSlider from '../components/Slider';
import ColorPalette from '../components/ColorPalette';
import { captureScreen } from 'react-native-view-shot';
import {checkUnlockAllParties, checkUnlockNextSequence} from '../utils/grouputil';

import styles from '../stylesheets/braindumpViewStyle';
import {
  ADD_BRAINDUMP,
  UPDATE_USER_TASK_GROUP_API_PATH,
  UPLOAD_BRAINDUMP_IMAGE,
  CHAT_SOCKET_URL
} from '../endpoints';
import * as axios from 'axios';
import { API_BASE_URL, BUGSNAG_KEY } from '../config';
import SocketIOClient from 'socket.io-client';
import {EVENT_BRAINDUMP_COMPLETE} from '../../src/constants';
import BaseComponent from "./BaseComponent";
import {Client} from 'bugsnag-react-native';
const bugsnag = new Client(BUGSNAG_KEY);


// More info on all the options is below in the API Reference... just some common use cases shown here
const options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

const TITLE_CONTENT_SIZE_DIFFERENCE = 18;
const CONTENT_SIZE = 18;
const SLIDE_VALUE_MIN = 12;
const SLIDER_VALUE_MAX = 30;
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: { 'Content-type': 'application/json' }
});

export default class BraindumpView extends BaseComponent {

  constructor(props) {
    super(props);
    const {
      navigation: { state: { params: { group } = {} } = {} } = {},
      navigation: { state: { params: { user } = {} } = {} } = {}
    } = props;
    this.state = {
      pan: new Animated.ValueXY(),
      sliderHeight: 0,
      sliderWidth: 0,
      inputEditable: false,
      enableDrag: false,
      group,
      user,
      isNeedsToVisibleComponent: true,
      braindump: {
        currentPage: 0,
        pages: [
          {
            image: '',
            content1: '',
            content2: '',
            color: 'transparent',
            contentSize: CONTENT_SIZE
          }
        ]
      }
    };
    this.titleText = '';
  }

  componentWillMount() {
    super.componentDidMount();
    // this.initBrainDump();
    // Add a listener for the delta value change
    this._val = { x: 0, y: 0 };
    this.state.pan.addListener(value => (this._val = value));

    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => this.state.enableDrag,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.state.enableDrag,
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y
        });
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: (e, gesture) => {
        this.setState({ enableDrag: false });
      }
    });
  }

  componentDidMount() {
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (this.state.inputEditable) {
          this.setState({ inputEditable: false });
        }
      }
    );
    let user = this.state.user;
    let query = `userID=${user._id}&username=${user._id}&firstName=${user.profile.firstName ? user.profile.firstName : ''}&lastName=${user.profile.lastName ? user.profile.lastName : ''}&userType=test`;
    this.socket = SocketIOClient(CHAT_SOCKET_URL, {query: query, transports: ['websocket']});
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
  }

  initBrainDump() {
    const { braindump } = this.state;
    // set content1 and content2
    braindump.pages[braindump.currentPage].content1 = 'Title';
    braindump.pages[braindump.currentPage].content2 = 'Enter your Description';

    this.setState({ braindump });
  }

  uploadImage(photo) {
    let { group } = this.state;
    let data = this.createFormData(photo, { userId: '123' });
    let path = UPLOAD_BRAINDUMP_IMAGE.replace('{}', group._id);
    fetch(path, {
      method: 'POST',
      body: data
    })
      .then(response => response.json())
      .then(response => {
        return this.saveBrainDump({ imageLocation: response.Location });

        // alert("Upload success!");
        //   this.setState({ photo: null });
      })
      .catch(error => {
        bugsnag.notify(error);
        console.log('upload errorxddddddddddddddddddddd', error);
        // alert("Upload failed!");
      });
  }

  captureScreenShot() {
    this.setState(
      (prevState, props) => ({
        isNeedsToVisibleComponent: false
      }),
      () => {
        captureScreen({
          result: 'tmpfile'
        }).then(
          uri => {
            let obj = {
              uri,
              fileName: new Date().getTime() + '',
              type: 'image/png'
            };
            let successMessage = this.uploadImage(obj);

            //this.props.navigation.push('SnapShotView', { uri });
            this.props.navigation.navigate("Chat", {
                task_group_id: this.state.group._id,
                taskUpdated: false,
                statusMessage: successMessage,
                taskGroup: this.state.group
            });

            this.setState({ isNeedsToVisibleComponent: true });
          },
          error => {
            bugsnag.notify(error);
            console.error('Oops, snapshot failed', error)
          }
        );
      }
    );
  }

  saveBrainDump(data) {
    let image = data.imageLocation;
    let {
      braindump: {
        pages: [{ content1, content2 }]
      },
      group
    } = this.state;
    let contentObj = { content1, content2, image };
    // Share obj to hold array of content obj.
    let share = { content: [contentObj], userId: this.state.user._id };
    let path = ADD_BRAINDUMP.replace('{}', group._id);
    instance
      .post(path, { ...share })
      .then(res => {
        console.log('BRAINDUMP Saved ', res);
      })
      .catch(err => {
        console.log('BrainDump Err ', err);
        return 'Unable to upload your snapshot :(';
      });

      this.socket.emit('client:message', {
      sender: this.state.user._id,
      receiver: this.state.group._team._id,
      chatType: 'GROUP_MESSAGE',
      type: EVENT_BRAINDUMP_COMPLETE,
      image: image,
      userProfile: this.props.user,
      message: EVENT_BRAINDUMP_COMPLETE,
      }
    )
    return 'Snapshot Uploaded! :)';

  }

  createFormData(photo, body) {
    const data = new FormData();
    data.append('image', {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', '')
    });

    Object.keys(body).forEach(key => {
      data.append(key, body[key]);
    });

    return data;
  }

  renderResponse(response) {
    if (response.didCancel) {
      // this.props.navigation.pop();
    } else if (response.error) {
      bugsnag.notify(response.error);
      console.log('ImagePicker Error: ', response.error);
      // this.props.navigation.pop();
    } else {
      const source = { uri: response.uri, type: response.type };
      const { braindump } = this.state;
      braindump.pages[braindump.currentPage].image = response.data;
      // You can also display the image using data:

      this.setState({
        selectedImage: source,
        braindump
      });
    }
  }

  openCamera() {
    ImagePicker.launchCamera(options, response => {
      // Same code as in above section!
      this.renderResponse(response);
    });
  }

  openGallery() {
    // Open Image Library:
    ImagePicker.launchImageLibrary(options, response => {
      // Same code as in above section!
      this.renderResponse(response);
    });
  }

  updateText(prop, text) {
    const { braindump } = this.state;
    braindump.pages[0][prop] = text;
    this.setState({ braindump });
  }

  updateTextSize = (size: number) => {
    const { braindump } = this.state;
    const page = braindump.pages[braindump.currentPage];
    page.contentSize = size;
    braindump.pages.splice(braindump.currentPage, 1, page);
    this.setState({ braindump: { ...braindump } });
  };

  updateTextBackground = (color: string) => {
    const { braindump } = this.state;
    const page = braindump.pages[braindump.currentPage];
    page.color = color;
    braindump.pages.splice(braindump.currentPage, 1, page);
    this.setState({ braindump: { ...braindump } });
  };

  hideKeyboard = () => {
    Keyboard.dismiss();
    if (this.state.inputEditable) {
      this.setState({ inputEditable: false });
    }
  };

  showKeyboard = (id: number) => {
    this.setState({ inputEditable: true }, () => {
      if (id == 1) {
        this.titleText.focus();
      } else if (id == 2) {
        this.contentText.focus();
      }
    });
  };

  renderBottom = () => {
    return (
      <View
        style={{
          flexDirection: 'column',
          backgroundColor: 'rgba(0,0,0,0.2)',
          position: 'absolute',
          bottom: 0,
          width: '100%'
        }}
      >
        <ColorPalette
          onChange={this.updateTextBackground}
          title=""
          titleStyles={{ height: 0, width: 0 }}
          defaultColor={'#FFFFFF'}
          colors={[
            '#534988',
            '#89229B',
            '#E53EEF',
            '#FFFFFF',
            '#59BBB7',
            '#F7C744',
            '#2F7CF6'
          ]}
          icon={<View style={styles.dot} />}
        />
        <View style={styles.topActionView}>
          <TouchableOpacity onPress={() => this.openCamera()}>
            <Image source={require('../../assets/images/camera.png')} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.showKeyboard(1)}>
            <Text style={{ color: 'white', fontSize: 24 }}>Aa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.openGallery()}>
            <Image source={require('../../assets/images/add_pic.png')} />
          </TouchableOpacity>
        </View>
        <View style={styles.submitView}>
          <TouchableOpacity
            onPress={() => {
              this.captureScreenShot();
              this.props.navigation.pop();
            }}
          >
            <Text style={[styles.likeModalAction, styles.submit]}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const { selectedImage: { uri } = {}, braindump } = this.state;
    const {
      color: backgroundColor,
      contentSize,
      content1,
      content2
    } = braindump.pages[braindump.currentPage];

    const contentStyle = { backgroundColor, fontSize: contentSize };
    const titleStyle = {
      fontSize: contentSize + TITLE_CONTENT_SIZE_DIFFERENCE
    };

    const panStyle = { transform: this.state.pan.getTranslateTransform() };

    return (
      <TouchableWithoutFeedback onPress={this.hideKeyboard} accessible={true}>
        <ImageBackground
          source={{ uri: uri ? uri : '' }}
          style={[
            {
              width: '100%',
              height: '100%'
            },
            { backgroundColor: uri ? '' : 'black' }
          ]}
          imageStyle={{ opacity: 0.6 }}
        >
          {/** vertical slider */}
          {this.state.isNeedsToVisibleComponent && (
            <View
              style={[
                styles.sliderContainer,
                { height: this.state.inputEditable ? '90%' : '60%' }
              ]}
            >
              <Image
                style={{ width: 17, height: 17, marginBottom: 6 }}
                source={require('../../assets/images/icon-text.png')}
              />
              <VerticalSlider
                style={styles.slider}
                value={contentSize}
                orientation="vertical"
                onValueChange={this.updateTextSize}
                thumbTintColor="#C4C4C4"
                trackStyle={[
                  styles.sliderTrack,
                  { borderBottomWidth: this.state.sliderHeight }
                ]}
                minimumTrackTintColor="transparent"
                inverted
                minimumValue={SLIDE_VALUE_MIN}
                maximumValue={SLIDER_VALUE_MAX}
                step={1}
                onLayout={event => {
                  const { width, height } = event.nativeEvent.layout;
                  this.setState({ sliderHeight: height, sliderWidth: width });
                }}
              />
            </View>
          )}
          <View style={styles.container}>
            {/* <View /> */}
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: this.state.sliderWidth + 25,
                width: '100%'
              }}
            >
              <Animated.View
                {...this.panResponder.panHandlers}
                style={[panStyle, { width: '100%' }]}
              >
                {this.state.inputEditable && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <TextInput
                      onChangeText={text => this.updateText('content1', text)}
                      ref={ref => (this.titleText = ref)}
                      placeholder={'Story Title'}
                      placeholderTextColor={'white'}
                      style={[styles.textInputTitle, titleStyle]}
                      value={content1}
                      blurOnSubmit={true}
                      returnKeyType="done"
                      onSubmitEditing={()=>{Keyboard.dismiss()}}
                      multiline={true}
                    />
                    <TextInput
                      multiline={true}
                      onChangeText={text => this.updateText('content2', text)}
                      placeholder={'Enter your story'}
                      ref={ref => (this.contentText = ref)}
                      placeholderTextColor={'white'}
                      style={[styles.textInputContent, contentStyle]}
                      value={content2}
                      blurOnSubmit={true}
                      returnKeyType="done"
                      onSubmitEditing={()=>{Keyboard.dismiss()}}
                    />
                  </View>
                )}
                {!this.state.inputEditable && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => this.showKeyboard(1)}
                      onLongPress={e => {
                        this.setState({ enableDrag: true });
                      }}
                    >
                      <Text style={[styles.textInputTitle, titleStyle]}>
                        {content1.trim() == '' ? 'Story Title' : content1}
                      </Text>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback
                      onPress={() => this.showKeyboard(2)}
                      onLongPress={e => {
                        this.setState({ enableDrag: true });
                      }}
                    >
                      <Text style={[styles.textInputContent, contentStyle]}>
                        {content2.trim() == '' ? 'Enter your story' : content2}
                      </Text>
                    </TouchableWithoutFeedback>
                  </View>
                )}
              </Animated.View>
            </View>
            {!this.state.inputEditable &&
              this.state.isNeedsToVisibleComponent &&
              this.renderBottom()}
            {/* {this.state.inputEditable && <View />} */}
          </View>
          {this.state.inputEditable && this.state.isNeedsToVisibleComponent && (
            <TouchableOpacity
              onPress={this.hideKeyboard}
              style={styles.tickContainer}
            >
              <Image
                style={styles.tick}
                source={require('../../assets/images/icon-tick.png')}
              />
            </TouchableOpacity>
          )}
        </ImageBackground>
      </TouchableWithoutFeedback>
    );
  }
}

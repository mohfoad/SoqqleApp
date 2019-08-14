/**
 * @Updated taskViews
 **/

import React, { Component } from 'react';
import {
  View,
  ImageBackground,
  FlatList,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image
} from 'react-native';

import * as axios from 'axios';
import { Button, Text } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import _ from 'lodash';
import { API_BASE_URL } from '../config';
import {
  SAVE_ANSWERS_PATH_API,
  USER_SPARK_LIST_PATH_API,
  CHAT_SOCKET_URL,
  TASK_GROUP_SEQUENCE_API_PATH,
  TASK_GROUP_SET_TASK_COUNTER_API_PATH,
  TASK_GROUP_SET_SEQUENCE_API_PATH
} from '../endpoints';
import Header from '../components/Header';
import QuestionCard from '../components/QuestionCard';
import styles from '../stylesheets/taskViewStyles';
import MixPanel from 'react-native-mixpanel';
import Modal from 'react-native-modal';
import IconIonicon from 'react-native-vector-icons/Ionicons';

import { Client } from 'bugsnag-react-native';
import { BUGSNAG_KEY } from '../config';
import { getGroupUserDetails } from '../utils/common';
import { ILLUMINATE_STRINGS } from '../utils/strings';
import { black } from 'ansi-colors';

const bugsnag = new Client(BUGSNAG_KEY);

const { width } = Dimensions.get('window'); //full width

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: { 'Content-type': 'application/json' }
});

export default class IlluminateView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      task: this.props.navigation.state.params.group,
      questionContentArray: this.getRandomQuestions(
        this.props.navigation.state.params.group._typeObject
      ),
      currentQuestionIndex: 0,
      dummyText: 'Select and Answer',
      isVisible: true,
      selectedBottomBtnIndex: 3,
      strAnswer: '',
      name: '',
      showShareModal: false,
      userThoughts:''
    };
    this.onFooterButtonClick = this.onFooterButtonClick.bind(this);
  }

  componentDidMount() {
    console.log('QuestionArray:', this.state.questionContentArray);
  }

  getRandomQuestions(taskDetail) {
    const noOfquestions = parseInt(taskDetail.objectiveValue);
    const requiredSkill = taskDetail.skill;
    const listOfQuestion = this.props.world.questions.listQuestion;

    // Fitering of questions as per required skill.
    const listOfMatchedSkilledQuestions = listOfQuestion
      .filter(function(item) {
        return item.roadmapSkill == requiredSkill;
      })
      .map(function(item) {
        return item;
      });

    return this.shuffleArray(listOfMatchedSkilledQuestions, noOfquestions);
  }

  /*Shuffling for Questions and pick the requied number of question
    
     params : 
               array - Total number of questions for shuffle 
                pickCount -  Required nubmer of questions 
      Return  :
        [
            {
                content1: "What is the difference between problem solving and critical thinking skills?",
                content2: undefined
            }
        ]
    ]
     
     */
  shuffleArray(array, pickCount) {
    let i = array.length - 1;
    for (; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    var contentArray = new Array();

    for (i = 0; i < pickCount; i++) {
      question = array[i];
      const content = {
        content1: question.question,
        content2: question.preLoad,
        contnet3: null, // For Answers
        content4: null
      };
      contentArray.push(content);
    }
    return contentArray;
  }

  /*  */
  onFooterButtonClick(buttonText) {
    const { questionContentArray, currentQuestionIndex } = this.state;
    if (currentQuestionIndex >= questionContentArray.length - 1) {
      alert('You have answered, All questions');
      return;
    }

    let selectedIndx = 3;
    if (buttonText == ILLUMINATE_STRINGS.btnTextDontCare) {
      selectedIndx = 1;
    } else if (buttonText == ILLUMINATE_STRINGS.btnTextNutral) {
      selectedIndx = 2;
    }

    const questionOne = questionContentArray[currentQuestionIndex];

    questionOne.content4 = buttonText;
    questionContentArray[currentQuestionIndex] = questionOne;
    this.setState({
      questionContentArray: questionContentArray,
      currentQuestionIndex: currentQuestionIndex + 1,
      selectedBottomBtnIndex: selectedIndx
    });
  }

  saveAnswer = () => {
    this.setState({
      isVisible: true
    });
  };
  cancelThisCustomAnswer = () => {
    this.setState({
      isVisible: true
    });
  };

  onTextInputFocus = () => {
    this.setState({
      isVisible: false
    });
  };

  renderTextInput = () => {
    return (
      <View>
        <View style={taskStyles.customInputContainer}>
          <View>
            <TextInput
              style={taskStyles.inputStyle}
              multiline
              placeholder={'Enter your answer here.'}
              placeholderTextColor={'white'}
            />
          </View>
        </View>
        <View style={taskStyles.btnContainer}>
          <TouchableOpacity
            style={taskStyles.borderLessButton}
            onPress={this.saveAnswer}
          >
            <Text style={taskStyles.btnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={taskStyles.borderedButton}
            onPress={this.cancelThisCustomAnswer}
          >
            <Text style={taskStyles.btnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // renderItem = ({ item }) => {
  //   console.log('hello called again');
  //   const questionContent = item;
  //   if (
  //     typeof questionContent == 'string' ||
  //     typeof questionContent == 'undefined'
  //   ) {
      // alert(questionContent); // Network Busy
  //     return;
  //   }

  //   return (
  //     <TouchableOpacity style={taskStyles.dataRow}>
  //       <View style={taskStyles.roundColor} />
  //       <Text style={taskStyles.textAnsColor}>{questionContent.content}</Text>
  //     </TouchableOpacity>
  //   );
  // };

  onGoBack = () => {
    this.props.navigation.navigate({ routeName: 'Chat' });
  };

  callApiToCreateShareObject( content1, content2, content3) {
    const { userActions } = this.props; 
    var loginUserId = this.props.user._id;
    let arrayParam = { 'user_id': loginUserId, 'content1': content1, 'content2': content2, 'content3': content3 };
    userActions.shareContentRequest({arrayParam});
  }

  render() {
    console.log('hello render');
    const {
      dummyText,
      isVisible,
      questionContentArray,
      currentQuestionIndex
    } = this.state;
    const questionOne = questionContentArray[currentQuestionIndex];
    if (questionOne.content2 == null || questionOne.content2.length <= 0) {
      // Show Alert here , No answers avaiable
      alert(ILLUMINATE_STRINGS.eMNoAnswersNotAvailable);
    }

    return (
      <View style={taskStyles.taskContainer}>
        {/* Part 1 : Questions */}
        <ImageBackground
          source={require('src/images/backpurple.png')}
          style={taskStyles.questionContainer}
        >
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              height: 30,
              marginTop: 20
            }}
          >
            <TouchableOpacity onPress={this.onGoBack}>
              <IconIonicon
                style={{ marginLeft: 20 }}
                name={'ios-arrow-back'}
                size={30}
                color={'white'}
              />
            </TouchableOpacity>
            <Text style={taskStyles.titleText}>{dummyText}</Text>
          </View>
          <Text style={taskStyles.questionText}>{questionOne.content1}</Text>
        </ImageBackground>

        {/* Part 2 , Answers  */}
        <View style={taskStyles.ansContainer}>
          {isVisible && (
            <View
              style={{
                flex: 1
              }}c
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  height: 56,
                  alignItems: 'center'
                }}
              >
                <View style={[taskStyles.roundColor, { marginLeft: 26 }]} />
                {/* <View style={{ paddingLeft: 10 }}> */}
                <View style={taskStyles.ansInputTextContainer}>
                  <TextInput
                    style={taskStyles.textInput}
                    onFocus={this.onTextInputFocus}
                    placeholder={ILLUMINATE_STRINGS.placeHolderEnterAnswer}
                    placeholderTextColor={'rgba(255,255,255,0.7)'}
                  />
                </View>
              </TouchableOpacity>
              <ScrollView>
                {questionOne.content2 && questionOne.content2.map(questionContent => {
                  return (<TouchableOpacity style={taskStyles.dataRow} >
                        <TouchableOpacity  style={{  }} onPress={ () => {
                          this.setState({ name:  this.state.name == questionContent.title ? '' : questionContent.title})
                          this.setState({ showShareModal: !this.state.showShareModal })
                          this.setState({ strAnswer:  questionContent.content})
                        }}
                        >
                        {this.state.name == questionContent.title ?
                            <Image style={{ width: 30, width: 30 }} source={require('../../assets/images/Share.png')}/>
                            :<View style={taskStyles.roundColor} />
                          }
                          </TouchableOpacity>
                    <Text style={taskStyles.textAnsColor}>{questionContent.content}</Text>
                  </TouchableOpacity>)
                })}
              </ScrollView>
            {console.log('flt: ', questionOne.content2)}
            <Modal isVisible={this.state.showShareModal} style={taskStyles.modalView}>
                <View style={{ position: 'absolute', left: 47, top: 100, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <Image style={{ width: 30, width: 30 }} source={require('../../assets/images/whiteShare.png')}/>
                  <Text style={taskStyles.headingText}>
                    Share your Thoughts
                  </Text>
                </View> 
                  <TextInput style={taskStyles.inputText}
                    onChangeText ={(text) => this.setState({userThoughts: text}) }
                  />
                  <Text style={taskStyles.modalQuestionText}>
                    {questionOne.content1}
                  </Text>
                <View style={taskStyles.answerView}>
                <Image style={{ width: 30, width: 30 }} source={require('../../assets/images/Share.png')}/>
                  <ScrollView>
                    <Text style={taskStyles.answerText}>
                      {this.state.strAnswer}
                    </Text>
                  </ScrollView>
                </View>
                <TouchableOpacity style={taskStyles.shareBtn}
                  onPress={() =>{
                    this.callApiToCreateShareObject(this.state.userThoughts,questionOne.content1, this.state.strAnswer)
                    this.setState({ showShareModal: !this.state.showShareModal })
                  }
                  }>
                  <Text style={taskStyles.shareBtnText}>Share</Text>
                </TouchableOpacity>
            </Modal>
 
              {/* <FlatList
                renderItem={this.renderItem}
                data={questionOne.content2}
                initialNumToRender={100}
                keyExtractor={(item, index) => {
                  return item + index;
                }}
              /> */}
            </View>
          )}

          {!isVisible && this.renderTextInput()}
        </View>

        {/* Part 3, Footer  */}
        {isVisible && (
          <View style={taskStyles.footerContainer}>
            <Button
              bordered
              style={[
                taskStyles.bottomBtn,
                this.state.selectedBottomBtnIndex === 1
                  ? taskStyles.bottomBtnSelected
                  : taskStyles.bottomBtnUnSelected
              ]}
              onPress={() => {
                this.onFooterButtonClick(ILLUMINATE_STRINGS.btnTextDontCare);
              }}
            >
              <Text uppercase={false} style={taskStyles.bottomBtnText}>
                {ILLUMINATE_STRINGS.btnTextDontCare}
              </Text>
            </Button>
            <Button
              bordered
              style={[
                taskStyles.bottomBtn,
                this.state.selectedBottomBtnIndex === 2
                  ? taskStyles.bottomBtnSelected
                  : taskStyles.bottomBtnUnSelected
              ]}
              onPress={() => {
                this.onFooterButtonClick(ILLUMINATE_STRINGS.btnTextNutral);
              }}
            >
              <Text uppercase={false} style={taskStyles.bottomBtnText}>
                {ILLUMINATE_STRINGS.btnTextNutral}
              </Text>
            </Button>
            <Button
              bordered
              style={[
                taskStyles.bottomBtn,
                this.state.selectedBottomBtnIndex === 3
                  ? taskStyles.bottomBtnSelected
                  : taskStyles.bottomBtnUnSelected
              ]}
              onPress={() => {
                this.onFooterButtonClick(ILLUMINATE_STRINGS.btnTextLikeThis);
              }}
            >
              <Text uppercase={false} style={taskStyles.bottomBtnText}>
                {ILLUMINATE_STRINGS.btnTextLikeThis}
              </Text>
            </Button>
          </View>
        )}
      </View>
    );
  }
}

const taskStyles = StyleSheet.create({
  taskContainer: {
    flex: 1,
    backgroundColor: 'rgba(68,0,104,1.0)'
  },
  questionContainer: {
    flex: 3
  },
  roundColor: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#FF4763'
  },
  roundColor1: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'yellow'
  },
  ansContainer: {
    flex: 6,
    backgroundColor: 'rgba(68,0,104,1.0)'
  },
  titleText: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
    paddingRight: 10
  },
  questionText: {
    marginTop: Platform.OS === 'ios' ? 25 : 18,
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 25 : 22,
    fontWeight: '500',
    fontFamily: 'SF UI Display',
    marginLeft: 40,
    marginRight: 40
  },
  flatListContainer: {
    flex: 1
  },
  dataRow: {
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 26,
    marginRight: 26,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderColor: '#FF4763',
    flexDirection: 'row'
  },

  /* Ans TextView  */
  ansInputTextContainer: {
    marginLeft: 8,
    marginRight: 26,
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF4763',
    height: 40
  },
  textInput: {
    color: 'white'
  },
  textAnsColor: {
    color: 'white',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'SF UI Display',
    marginLeft: 8,
    marginRight: 18,
    marginBottom: 10
  },
  customInputContainer: {
    margin: 40,
    borderColor: '#FF4763',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(68,0,104,1.0)',
    justifyContent: 'flex-start'
  },
  inputStyle: {
    height: Platform.OS === 'ios' ? 160 : 130,
    color: 'white'
  },
  borderLessButton: {
    borderWidth: 1,
    borderColor: '#FF4763',
    height: 45,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  borderedButton: {
    borderColor: '#FF4763',
    height: 45,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  btnText: { color: 'white' },
  btnContainer: {
    paddingHorizontal: 80,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  /* Footer  */
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginLeft: 26,
    marginRight: 26
  },
  bottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: '#FF4763',
    height: 40,
    width: 100,
    marginRight: 10
  },
  bottomBtnUnSelected: {
    backgroundColor: 'transparent'
  },
  bottomBtnSelected: {
    backgroundColor: '#FF4763'
  },
  bottomBtnText: {
    color: 'white',
    fontSize: 14
  },
  modalView: {
    backgroundColor: '#fff',
    height: '30%',
    // width: '80%',
    display: 'flex' ,
    flexDirection: 'row',
    alignItems: 'flex-start',
    // alignSelf: 'center'
  },
  headingText: {
    position: 'absolute',
    // width: 239,
    // height: 68,
    left: 43,
    // top: 150,
    fontFamily: 'SF UI Display',
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    lineHeight: 18,
  },

  inputView: {
    height: '20%',
    marginHorizontal: 20 ,
    // marginTop: 10,
    display:'flex',
    backgroundColor: 'red',
    flexDirection: 'row',
  },
  inputText: {
    position: 'absolute',
    width: '75%',
    height: '20%',
    left: 50,
    top: 147,
    fontFamily: 'SF UI Display',
    lineHeight: 18,
    color: '#000',
    fontSize: 14,
    // width: '100%',
    textAlignVertical: 'top',
  },
  questionView: {
    position: 'absolute',
    // height: '10%',
    width: 252,
    backgroundColor: 'red',
    height: 68,
    left: 47,
    top: 347,
    borderTopWidth: 2,
    marginHorizontal: 20,
    borderTopColor: 'red',
    alignItems: 'center' ,
    // marginVertical: 10,
    display:'flex',
    flexDirection: 'row',
    paddingTop: 20
  },

  modalQuestionText: {
    position: 'absolute',
    fontFamily: 'SF UI Display',
    width: '75%',
    // height: 68,
    left: 47,
    top: 300,
    textAlign: 'center',
    display:'flex',
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: 'red',
    paddingTop: 20,
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 20,
  },
  answerView: {
    borderTopWidth: 2,
    borderTopColor: 'red',
    position: 'absolute',
    width: '75%',
    height: 105,
    left: 47,
    top: 400,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  answerText: {
    // position: 'absolute',
    width: 243,
    // height: 94,
    left: 10,
    // top: 420,
    fontFamily: 'SF UI Display',
    // textAlign: 'center',
    // paddingTop: 10,
    color: '#0E0E0E',
    fontSize: 15,
    fontWeight: '600'
  },

  shareBtn: {
    position: 'absolute',
    height: 39,
    borderRadius: 5,
    width: 124,
    backgroundColor: '#FF4763',
    alignSelf: 'center',
    justifyContent: 'center',
    left: 100,
    top: 529,
  },
  shareBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 10
  }
});
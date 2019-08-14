import React, {Component, Fragment} from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Image,
    Alert,
    Platform,
    Dimensions,
    Animated,
    Modal,
    FlatList,
    TouchableHighlight,
    KeyboardAvoidingView,
    Keyboard,
    ImageBackground,
} from 'react-native';
import * as axios from 'axios';
import {Thumbnail, Fab, Card, CardItem, Body} from 'native-base';
import {SystemMessage, Bubble} from 'react-native-gifted-chat';
// When we keyboard appears and rest of screen componenets disappear it messes up calculation for MessageContainer in default gifted chat.
// To compensate that we are using our customized GiftedChat so MessageContainer takes flex:1 size instead dynamic caluclation.
import {GiftedChat} from '../giftedChat/GiftedChat';
import InputToolbar from '../giftedChat/InputToolbar';
import {EVENT_BRAINDUMP_COMPLETE, EVENT_TASK_COMPLETE, EVENT_CHAT_MESSAGE} from '../constants'
import SocketIOClient from 'socket.io-client';
import {CountDownText} from 'react-native-countdown-timer-text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-picker';
import MixPanel from "react-native-mixpanel";
import {API_BASE_URL} from '../config';
import {TASK_GROUP_TYPES, TASK_GROUP_OBJECTIVE} from '../constants';
import {
    SAVE_TASK_PATH_API,
    UPDATE_USER_TASK_GROUP_API_PATH,
    GET_OBJECTIVE_API_PATH,
    CHAT_SOCKET_URL,
    GET_OBJECTIVE_BY_NAME_API_PATH,
    UPLOAD_TASK_FILE_API_PATH,
    TEAM_UPDATE_API,
    USER_TASK_GROUP_LIST_PATH_API,
    SAVE_USER_REWARD_LAST_USED_API_PATH
} from '../endpoints';
import styles from '../stylesheets/chatViewStyles';
import Header from '../components/Header';
import {getMessages} from '../utils/common';
import ReadMore from 'react-native-read-more-text';
//import Card from "../components/Card";
import {Client} from 'bugsnag-react-native';
import {BUGSNAG_KEY} from "../config";
import _ from 'lodash';
import RewardModalHeader from "../components/RewardModalHeader";
import {getGroupUserDetails} from "../utils/common";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import BaseComponent from "./BaseComponent";
import { isSystemEvent, isUserEvent, setText } from "../utils/EventUtil";
import {showMessage} from 'react-native-flash-message';
import {MAIN_COLOR} from '../constants';


const fontFamilyName = Platform.OS === 'ios' ? "SFUIDisplay-Regular" : "SF-UI-Display-Regular";

const bugsnag = new Client(BUGSNAG_KEY);
import {getUser} from '../utils/grouputil';


const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 25000,
    headers: {'Content-type': 'application/json'}
});

const deviceWidth = Dimensions.get('window').width;
// TODO: Update this class to new Lifecycle methods
export default class ChatView extends BaseComponent {

  static flashMessage = message => showMessage({message, type: MAIN_COLOR});

    constructor(props) {
        super(props);
        const {navigation: {state: {params: {taskGroup = {}} = {}} = {}} = {}} = props;
        this.state = {
            taskGroup, //userTaskGroup
            userTask: {},
            processing: false,
            messages: [],
            userId: null,
            isReport: false,
            storyItemTextStyle: styles.storyItemImage,
            animatedStyle: {maxHeight: new Animated.Value(styles.contentHeight.maxHeight)},
            contentHeight: styles.contentHeight,
            rewardsVisible: false, //use this to show/hide Purchased Rewards model.
            dialogVisible: false,
            selectedReward: {},
            keyboardShow: false
        };

        this.onSend = this.onSend.bind(this);
        this._storeMessages = this._storeMessages.bind(this);
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.setTaskAndTaskGroup();

    }

    componentDidMount() {
        super.componentDidMount();
        const {userActions} = this.props;
        this.props.navigation.addListener(
            'willFocus',
            () => {
                //  userActions.getMessageListRequest(this.state.taskGroup._team._id);
            }
        );

    }

    componentWillReceiveProps(nextProps) {

      if (nextProps.navigation.state.params.statusMessage) {
          ChatView.flashMessage(nextProps.navigation.state.params.statusMessage);
      }

        if (nextProps.navigation.state.params.taskUpdated) {
            this.setTaskAndTaskGroup();
        }

        if (nextProps.reportUserSuccess && nextProps.reportUserSuccess != this.props.reportUserSuccess) {
            alert('Your report has been successfully submitted. We will take action against him.')
        }
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({keyboardShow: true})
    }

    _keyboardDidHide = () => {
        this.setState({keyboardShow: false})
    }

    //this sets the group that will be used in the page
    setTaskAndTaskGroup() {
        let id = this.props.navigation.state.params.task_group_id;
        const {navigation: {state: {params: {taskGroup: propsTaskGroup = {}, userTaskGroups} = {}} = {}} = {}} = this.props;
        let userTask = {};
        const {taskGroups: {taskGroups = []} = {}} = this.props;
        let taskGroup = id && [propsTaskGroup, ...taskGroups].filter(t => t._id === id)[0] || {};
        if (Object.keys(taskGroup).length && taskGroup._tasks.length) {
            userTask = taskGroup._tasks.filter(task => {
                return task.userID == this.props.user._id &&
                    task.metaData.subject.skill._id == taskGroup._typeObject._id;
            })[0];
        }

        this.setState({taskGroup, userTask: userTask || {}});
        if (Array.isArray(taskGroup.messages) && taskGroup.messages.length > 0) {
            let arrayMessages = getMessages(taskGroup, taskGroup    .messages, this.props.user.blockUserIds, this.props.user);
            this.setState({messages: arrayMessages});
            } else if (Array.isArray(userTaskGroups)) {
            let messages = [];
            userTaskGroups.forEach(item => {
                if (item._id === id) {
                    messages = item.messages
                }
            });
            if (messages.length > 0) {
                let arrayMessages = getMessages(taskGroup, messages, this.props.user.blockUserIds, this.props.user);
                this.setState({messages: arrayMessages});
            }
        }
    }

    componentWillUnmount() {
        let st = this.state;
    }

    renderSystemMessage(props) {
        if (props.currentMessage.isReward || props.currentMessage.isJoining) {
            return (
                <SystemMessage
                    {...props}
                    wrapperStyle={{
                        backgroundColor: 'white',
                        width: deviceWidth
                    }}
                    textStyle={{
                        textAlign: 'center',
                        color: 'grey'
                    }}
                />
            );
        } else {
            return (
                <SystemMessage
                    {...props}
                    wrapperStyle={{
                        backgroundColor: '#dd79c9',
                        width: deviceWidth
                    }}
                    textStyle={{
                        textAlign: 'center',
                        color: 'white'
                    }}
                />
            );
        }

    }

    //this is not required anymore as we dont do challenges anymore from this page We will remove this in future.
    /*openImagePicker = () => {
        const options = {
            title: 'Select a file',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
           else {
                const source = {uri: response.uri, type: response.type};
                this.setState({
                    selectedImage: source,
                });
            }
        });
    }*/

    //this is not required anymore as we dont do challenges anymore from this page We will remove this in future.
    /*uploadSelectedImage = async (challenge) => {
        try {
            this.setState({
                processing: true
            });
            if (!Object.keys(this.state.userTask).length) {
                let response = await instance.get(GET_OBJECTIVE_BY_NAME_API_PATH.replace('{}', challenge.type))
                let objectiveType = response.data && response.data[0].name.toLocaleLowerCase();
                let data = challenge;
                let taskGroupId = this.props.navigation.state.params.task_group_id;
                if (objectiveType) {
                    const userId = this.props.user._id;
                    const profile = this.props.user.profile || {};
                    const {
                        taskGroup
                    } = this.state;
                    const {
                        firstName,
                        lastName
                    } = profile;
                    const taskData = {
                        type: objectiveType,
                        userName: `${firstName}${lastName ? ` ${lastName}` : ''}`,
                        userID: userId,
                        isHidden: 0,
                        creator: {
                            _id: userId,
                            firstName: firstName,
                            ...(lastName ? {
                                lastName: lastName
                            } : {})
                        },
                        metaData: {
                            subject: {
                                roadmap: {
                                    name: '',
                                },
                                skill: {
                                    _id: data._id,
                                    ...(data.skill ? {
                                        name: data.skill
                                    } : {}),
                                    type: taskGroup.type
                                },
                            },
                            participants: [{
                                user: {
                                    _id: userId,
                                    firstName: firstName,
                                    ...(lastName ? {
                                        lastName: lastName
                                    } : {})
                                },
                                status: 'accepted',
                                isCreator: true,
                            },],
                            ratings: [],
                            time: Date.now(),
                            awardXP: null
                        },
                        name: data.name
                    };
                    instance.post(SAVE_TASK_PATH_API, taskData).then(response => {
                        console.log(response);
                        this.setState({
                            userTask: response.data
                        });

                        //this.updateUserTasks(response.data);
                        let task = response.data
                        const {
                            taskGroups: {
                                taskGroups = []
                            } = {}
                        } = this.props;
                        const id = this.props.navigation.state.params.task_group_id;
                        let index = id && taskGroups.findIndex(t => t._id === id);
                        if (index > -1) {
                            let oldTasks = taskGroups[index]['_tasks'] || [];
                            oldTasks.push(task);
                            taskGroups[index]['_tasks'] = oldTasks;
                        }
                        this.props.userActions.getUserTaskGroupsCompleted({
                            ...this.props.taskGroups,
                            taskGroups
                        });
                        //this.updateUserTaskGroup(response.data, taskGroupId);

                        const {
                            taskGroup
                        } = this.state;

                        //const { skill, reward, objectiveValue } = story;
                        let tasks = (taskGroup._tasks || []);
                        tasks.push(task);
                        let path = UPDATE_USER_TASK_GROUP_API_PATH.replace('{}', taskGroup._id);
                        instance.put(path, {
                            '_tasks': tasks
                        }).then(async () => {

                            const formData = new FormData();
                            const config = {
                                headers: {
                                    'content-type': 'multipart/form-data'
                                }
                            }

                            formData.append('image', {
                                uri: this.state.selectedImage.uri,
                                type: this.state.selectedImage.type,
                                name: 'image'
                            })
                            console.log(UPLOAD_TASK_FILE_API_PATH.replace('{}', task._id))
                            axios.post(UPLOAD_TASK_FILE_API_PATH.replace('{}', task._id), formData, config).then(res => {
                                console.log(res);
                                this.setState({
                                    processing: false
                                });
                            }).catch(err => {
                                console.log(err);
                                this.setState({
                                    processing: false
                                });
                                bugsnag.notify(err)
                            })
                            // console.log('uploaded',response);
                        }).catch(err => {
                            bugsnag.notify(err)
                        });
                    }).catch(err => {
                        console.log(err);
                        bugsnag.notify(err)
                    });
                }
            } else {
                const formData = new FormData();
                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    }
                }
                formData.append('image', {
                    uri: this.state.selectedImage.uri,
                    type: this.state.selectedImage.type,
                    name: 'image'
                })
                axios.post(UPLOAD_TASK_FILE_API_PATH.replace('{}', this.state.userTask._id), formData, config).then(res => {
                    console.log(res);
                    this.setState({
                        processing: false
                    });
                }).catch(err => {
                    console.log(err);
                    this.setState({
                        processing: false
                    });
                })
            }
        } catch (error) {
            console.log(error);
            bugsnag.notify(error)
        }
    }*/

    //this is not required anymore as we dont do challenges anymore from this page We will remove this in future.
    /*removeSelectedImage = () => {
        this.setState({
            selectedImage: null,
        });
    }*/

    goToTask = story => {
        MixPanel.track('User started group', {
            'task': this.state.taskGroup
        })
        if (this.state.processing) {
            return;
        }
        const {taskGroup} = this.state;
        let objectiveName = taskGroup._typeObject.name;
        if (objectiveName === TASK_GROUP_OBJECTIVE.BRAINDUMP || objectiveName.includes(TASK_GROUP_OBJECTIVE.BRAINDUMP)) {
            this.props.navigation.navigate('Braindump', {group: taskGroup,user:this.props.user});
            return;
        }

        if (objectiveName === TASK_GROUP_OBJECTIVE.ILLUMINATE || objectiveName.includes(TASK_GROUP_OBJECTIVE.ILLUMINATE)) {
            this.props.navigation.navigate('Illuminate', {group: taskGroup});
            return;
        }

        if (objectiveName === TASK_GROUP_OBJECTIVE.DECODE || objectiveName.includes(TASK_GROUP_OBJECTIVE.DECODE)) {
            this.props.navigation.navigate('DecodeView', {group: taskGroup});
            return;
        }

        //not required as we dont do challenges here anymore We will remove this in future.
        /*if (this.state.taskGroup.type === TASK_GROUP_TYPES.CHALLENGE) {
            console.log('TASK_GROUP =>', this.state.taskGroup);
            this.openImagePicker(story)
            return;
        }*/
        let taskGroupId = this.props.navigation.state.params.task_group_id;
        const {skill, reward, objectiveValue} = story;
        if (!skill) {
            return;
        }

        //deprecated. should only hit here when none of the objectives above are met. We will remove this in future after more testing.
        if (Object.keys(this.state.userTask).length) {
            this.props.navigation.navigate('Task', {
                skill, reward,
                task: this.state.userTask,
                task_group_id: taskGroupId,
                team_id: this.state.taskGroup._team._id,
                taskGroup: this.state.taskGroup,
                objectiveValue
            });
        } else {
            this.setState({
                processing: true
            });
            instance.get(GET_OBJECTIVE_API_PATH.replace('{}', story._objective)).then(response => {
                let objectiveType = response.data && response.data.name.toLocaleLowerCase();
                if (objectiveType) {
                    this.createTask(story, objectiveType, taskGroupId);
                }
            }).catch((error) => {
                bugsnag.notify(error)
            });
        }
    };

    gotoRewards = story => {
        this.props.navigation.navigate('Rewards', {
            user: this.props.user,
        });
    };

    /*deprecated. Will be removed once the new illuminate objective is created. This was required because task was created first in old flow.
    Once the task is created user then goes into the taskview to update it. But that is redundant. So we create task only when submit in new illuminate flow.
    Will remove after more testing of new illuminate flow.
    */
    createTask(data, objectiveType, taskGroupId) {
        const userId = this.props.user._id;
        const profile = this.props.user.profile || {};
        const {taskGroup} = this.state;
        const {firstName, lastName} = profile;
        const taskData = {
            type: objectiveType,
            userName: `${firstName}${lastName ? ` ${lastName}` : ''}`,
            userID: userId,
            isHidden: 0,
            creator: {
                _id: userId,
                firstName: firstName,
                ...(lastName ? {lastName: lastName} : {})
            },
            metaData: {
                subject: {
                    roadmap: {name: '',},
                    skill: {_id: data._id, ...(data.skill ? {name: data.skill} : {}), type: taskGroup.type},
                },
                participants: [
                    {
                        user: {
                            _id: userId,
                            firstName: firstName,
                            ...(lastName ? {lastName: lastName} : {})
                        },
                        status: 'accepted',
                        isCreator: true,
                    },
                ],
                ratings: [],
                time: Date.now(),
                awardXP: null
            },
            name: data.name
        };
        instance.post(SAVE_TASK_PATH_API, taskData).then(response => {
            this.setState({userTask: response.data});
            this.updateUserTasks(response.data);
            this.updateUserTaskGroup(response.data, taskGroupId);
            MixPanel.trackWithProperties('Create a Task', taskData);
        }).catch(err => {
            alert(err)
            bugsnag.notify(err)
        });
    }

    updateUserTaskGroup(task, taskGroupId) {
        const {taskGroup} = this.state;
        const story = taskGroup._typeObject;
        const {skill, reward, objectiveValue} = story;
        let tasks = (taskGroup._tasks || []);
        tasks.push(task);
        let path = UPDATE_USER_TASK_GROUP_API_PATH.replace('{}', taskGroup._id);
        instance.put(path, {'_tasks': tasks}).then(() => {
            this.setState({
                processing: false
            });
            this.props.navigation.navigate('Task', {
                skill, reward,
                task: this.state.userTask, task_group_id: taskGroupId,
                team_id: this.state.taskGroup._team._id,
                taskGroup: this.state.taskGroup,
                objectiveValue
            });
        }).catch(err => {
            alert(JSON.stringify(err))
            bugsnag.notify(err)
        });
    }

    updateUserTasks(task) {
        const {taskGroups: {taskGroups = []} = {}} = this.props;
        const id = this.props.navigation.state.params.task_group_id;
        let index = id && taskGroups.findIndex(t => t._id === id);
        if (index > -1) {
            let oldTasks = taskGroups[index]['_tasks'] || [];
            oldTasks.push(task);
            taskGroups[index]['_tasks'] = oldTasks;
        }
        this.props.userActions.getUserTaskGroupsCompleted({...this.props.taskGroups, taskGroups});
    }

    //used when determining whether to lock the user's start task button
    isTaskCompleted() {
        return this.state.userTask && this.state.userTask.status === 'complete';
    }

    //used when determining whether to lock the user's start task button
    isTaskRepeating() {
        return this.state.taskGroup && this.state.taskGroup._typeObject && this.state.taskGroup.taskCounter && this.state.taskGroup.taskCounter > 0;
    }

    //used when determining whether to lock the user's start task button
    isTaskQuotaOver() {
        return this.state.taskGroup && this.state.taskGroup._typeObject && this.state.taskGroup.taskCounter === this.state.taskGroup._typeObject?.quota;
    }

    secondsUntilMidnight() {
        var midnight = new Date();
        midnight.setHours(24, 0, 0, 0)
        return parseInt((midnight.getTime() - new Date().getTime()) / 1000);
    }

    onSend(messages = []) {
        console.log("CHATVIEW: sending message with userprofile");
        this.socket.emit('client:message', {
            sender: this.props.user._id,
            receiver: this.state.taskGroup._team._id,
            chatType: 'GROUP_MESSAGE',
            type: EVENT_CHAT_MESSAGE,
            userProfile: this.props.user,
            message: messages && messages[0] && messages[0]['text'] ? messages[0]['text'] : ''
        });
        let taskgroup = this.state.taskGroup;
        const {taskGroups: {taskGroups = []} = {}} = this.props;
        const id = this.props.navigation.state.params.task_group_id;
        let index = id && taskGroups.findIndex(t => t._id === id);
        if (index > -1) {
            let oldMessages = [];
            if (taskGroups && taskGroups[index] && taskGroups[index].messages) {
                oldMessages = [...taskGroups[index].messages];
            }
            oldMessages.unshift({
                createdAt: new Date(),
                time: new Date().toISOString(),//new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString(),//new Date(),
                sender: this.props.user._id,
                receiver: this.state.taskGroup._team._id,
                chatType: 'GROUP_MESSAGE',
                type: EVENT_CHAT_MESSAGE,
                userProfile: this.props.user,
                _id: new Date(),
                message: messages && messages[0] && messages[0]['text'] ? messages[0]['text'] : ''
            })
            taskGroups[index]['messages'] = oldMessages;
            this.props.userActions.getUserTaskGroupsCompletedWithMessage({taskGroups});

        }

        this._storeMessages(messages);
    }

    showReportAlertInformation() {
        alert('You need to long press on the chat for reporting it to the admin.')
    }

    reportConfirmation(message) {
        if (message.user._id != this.props.user._id) {
            var alertTitle = 'Report?', alertMessage = 'Are you sure to report this chat?'
            Alert.alert(
                alertTitle,
                alertMessage,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {text: 'Ok', onPress: () => this.callApiToReportUser(message)},
                ]
            )
        }
    }

    callApiToReportUser(message) {
        let username = '';
        if (message.username) {
            username = message.username;
        }
        let arrayParam = {
            'title': "Reported User from Chat",
            'description': `The user ${message.user._id} ${message.user.name} has been reported by ${this.props.user.profile.lastName} ${this.props.user.profile.lastName} in the usergroup chat ${this.state.taskGroup._id}`,
            'reporter': `${this.props.user._id}`,
            'status': 'Open',
            'priority': 3,
            'history': [],
            'comments': [message.text]
        };
        const {userActions} = this.props;
        userActions.reportUserRequested(arrayParam);
        this.setState({isReport: true})
    }

    _storeMessages(messages) {
        this.setState(previousState => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });
    }

    navigateToUserList() {
        this.props.navigation.navigate('UsersList', {taskGroupData: this.state.taskGroup});
    }

    navigateToUserList() {
        this.props.navigation.navigate('UsersList', {taskGroupData: this.state.taskGroup})
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        borderBottomRightRadius: 0,
                        backgroundColor: '#4FBFBA',
                    },
                    left: {
                        borderBottomLeftRadius: 0,
                        backgroundColor: '#56478C',
                    }
                }}
                textProps={{style: {color: 'white'}}}
            />
        )
    }


    onReceivedMessage(message) {
        console.log("CHATVIEW: ONRECEIVED MESSAGE", message)

        let group = this.state.taskGroup;
        // reject messages intended for other groups
        if (message.receiver !== group._team._id) {
            return;
        }

        super.onReceivedMessage(message); //calls the parent received message which will update the task object if the event is suitable


        console.log("chatview: user profile ", message.userProfile)

        let messageReceived = [],  messageProperty = {
          _id: Math.random(),
          createdAt: new Date(),
          user: {
            _id: message.sender,
            name: message.userProfile.profile.firstName ? message.userProfile.profile.firstName : '' + ' ' + message.userProfile.profile.lastName ? message.userProfile.profile.lastName : '',
            avatar: message.userProfile.profile.pictureURL || `https://ui-avatars.com/api/?name=${message.userProfile.profile.firstName ? message.userProfile.profile.firstName : ''}+${message.userProfile.profile.lastName ? message.userProfile.profile.lastName : ''}`,
          } ,
          text: setText( group, message)
        };

        // reject messages from myself
        if (message.userProfile && message.userProfile._id === this.props.user._id && message.fromMe) {
            return;
        }


        /*group._team.emails.find((user) => {
            return user && user.userDetails && user.userDetails._id === message.sender;
        });*/

        let isUnBlocked = true, blockUserIds = this.props.user.blockUserIds;
        if (message.user && blockUserIds.length > 0 && blockUserIds.indexOf(message.user._id) !== -1) {
            isUnBlocked = false;
        }

        if (isSystemEvent(message.type))  {
            messageProperty= { ...messageProperty,
              system: true
            }
        }

        if (message.image) {
            messageProperty= { ...messageProperty,
                image: message.image
            }
        }

        if (message.isJoining) {
            messageProperty= { ...messageProperty,
                isJoining: true
            }
        }

        if (message.isReward) {
            messageProperty= { ...messageProperty,
                isReward: message.isReward
            }
        }


        messageReceived.push(messageProperty)
        this._storeMessages(messageReceived);

        /*if (userData && userData.userDetails && userData.userDetails.profile && isUnBlocked) {
            //if message.isReward is true this means its a reduction message.
            if (message.message == 'Task is completed' || message.isReward) {
                // used lodash so if no Value found default will be present
                // which is last param of get method
                const firstName = _.get(userData, 'userDetails.profile.firstName');
                const storyName = group ? _.get(group, '_tasks[0].name', 'Task') : 'Task';
                const sparks = group ? _.get(group, 'leftBonusSparks', 0) : 0;
                let messageReceived;
                if (message.isReward) {
                    //if message is spark reduction type then send message as it is.
                    messageReceived = [
                        {
                            _id: Math.random(),
                            text: message.message,
                            createdAt: new Date(),
                            system: true,
                            isReward: message.isReward
                        },
                    ];
                } else {
                    messageReceived = [
                        {
                            _id: Math.random(),
                            text: `${firstName} finishes ${storyName}. (${sparks} sparks)`, //this modification is needed because the sender (taskview.js) needs to send a generic message "Task is Completed" so this onReceive message can detect its a completion message. If you have a better idea, let me know! -dan
                            createdAt: new Date(),
                            system: true,
                            isReward: message.isReward
                        },
                    ];
                }
                this._storeMessages(messageReceived);
             //   this.refreshUserTask()


            }else if(message.type == EVENT_BRAINDUMP_COMPLETE && !message.fromMe){
                let messageReceived = [
                    {
                        _id: Math.random(),
                        text: message.message,
                        createdAt: new Date(),
                        user: {
                            _id: userData.userDetails._id,
                            name: userData.userDetails.profile.firstName ? userData.userDetails.profile.firstName : '' + ' ' + userData.userDetails.profile.lastName ? userData.userDetails.profile.lastName : '',
                            avatar: userData.userDetails.profile.pictureURL || `https://ui-avatars.com/api/?name=${userData.userDetails.profile.firstName ? userData.userDetails.profile.firstName : ''}+${userData.userDetails.profile.lastName ? userData.userDetails.profile.lastName : ''}`
                        },
                        image: message.image
                    }
                ];
                this._storeMessages(messageReceived);
            } else if (message.type != EVENT_BRAINDUMP_COMPLETE){
                let messageReceived = [
                    {
                        _id: Math.random(),
                        text: message.message,
                        createdAt: new Date(),
                        isReward: message.isReward,
                        user: {
                            _id: userData.userDetails._id,
                            name: userData.userDetails.profile.firstName ? userData.userDetails.profile.firstName : '' + ' ' + userData.userDetails.profile.lastName ? userData.userDetails.profile.lastName : '',
                            avatar: userData.userDetails.profile.pictureURL || `https://ui-avatars.com/api/?name=${userData.userDetails.profile.firstName ? userData.userDetails.profile.firstName : ''}+${userData.userDetails.profile.lastName ? userData.userDetails.profile.lastName : ''}`
                        },
                    },
                ];
                this._storeMessages(messageReceived);
            }
        }else {
            let messageReceived = [
                {
                    _id: Math.random(),
                    text: message.message,
                    createdAt: new Date(),
                    // user: {
                    //     _id: userData.userDetails._id,
                    //     name: userData.userDetails.profile.firstName ? userData.userDetails.profile.firstName : '' + ' ' + userData.userDetails.profile.lastName ? userData.userDetails.profile.lastName : '',
                    //     avatar: userData.userDetails.profile.pictureURL || `https://ui-avatars.com/api/?name=${userData.userDetails.profile.firstName ? userData.userDetails.profile.firstName : ''}+${userData.userDetails.profile.lastName ? userData.userDetails.profile.lastName : ''}`
                    // },
                },
            ];
            this._storeMessages(messageReceived);
        }*/
    }


    render() {
        const {taskGroup, keyboardShow} = this.state;
        const isCompleted = this.isTaskCompleted();
        const isRepeating = this.isTaskRepeating();
        const isQuotaOver = this.isTaskQuotaOver();
        const secondsUntilMidnight = this.secondsUntilMidnight();

        const user = {
            _id: this.props.user._id,
            name: this.props.user.profile.firstName ? this.props.user.profile.firstName : '' + ' ' + this.props.user.profile.lastName ? this.props.user.profile.lastName : '',
            avatar: this.props.user.profile.pictureURL || `https://ui-avatars.com/api/?name=${this.props.user.profile.firstName ? this.props.user.profile.firstName : ''}+${this.props.user.profile.lastName ? this.props.user.profile.lastName : ''}`,
        };
        const story = taskGroup?._typeObject;
        const taskGroupType = taskGroup.type;
        let countExtraMember = this.state.taskGroup._team.emails.length - 2;
        // Now showing photos
        let image1, image2;
        if (this.state.taskGroup._team.emails.length > 0) {
            let arrayEmail = this.state.taskGroup._team.emails[0];
            let dictUserDetail = arrayEmail.userDetails;
            image1 = <Thumbnail
                style={styles.member1}
                source={{uri: dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.pictureURL || `https://ui-avatars.com/api/?name=${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.firstName ? dictUserDetail.profile.firstName : ''}+${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.lastName ? dictUserDetail.profile.lastName : ''}`}}/>;
        }
        if (this.state.taskGroup._team.emails.length > 1) {
            let arrayEmail1 = this.state.taskGroup._team.emails[1];
            let dictUserDetail = arrayEmail1.userDetails;
            image2 = <Thumbnail
                style={styles.member2}
                source={{uri: dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.pictureURL || `https://ui-avatars.com/api/?name=${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.firstName ? dictUserDetail.profile.firstName : ''}+${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.lastName ? dictUserDetail.profile.lastName : ''}`}}/>;
        }
        return (
            <Fragment>

                <ImageBackground source={require('../images/backblue.png')}
                                 style={{width: '100%', height: Platform.OS === 'ios' ? 94 : 57, flex: 0}}>
                    <SafeAreaView style={{flex: 0, backgroundColor: "transparent"}}>
                        <Header title={story.name + '...'}
                                navigation={this.props.navigation}
                                bottomText={story.quota ? `${taskGroup._team.emails.length} of ${story.quota} Members Online` : ''}
                                headerStyle={styles.headerStyle}
                                fontStyle={styles.fontStyle}
                                headerTitleStyle={styles.headerTitleStyle}
                                ShowInfoIcon={true}
                                TaskGroupData={taskGroup}
                                onInfoPress={this.props.navigation}
                                headerRightTextStyle={styles.headerRightTextStyle}
                        />
                    </SafeAreaView>
                </ImageBackground>

                <SafeAreaView style={{flex: 1, backgroundColor: '#FFF'}}>
                    {!keyboardShow && this._renderRewardsModal()}
                    {!keyboardShow && this._renderUsingRewardModal()}
                    {!keyboardShow && <View style={styles.storyDetailView}>


                        <View style={{
                            backgroundColor: '#3c1464',
                            alignContent: 'center',
                            justifyContent: 'center',
                            padding: 10
                        }}>
                            <Text style={styles.storyDetailTagTitle}>You Gain.</Text>
                            <View style={styles.storyDetailTags}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.storyDetailTag}>50 xp</Text>
                                    {story.reward && (
                                        taskGroupType === TASK_GROUP_TYPES.CHALLENGE ? (
                                            <Text style={styles.storyDetailTag}>
                                                {`${story.rewardValue || ''} ${story.reward} `}
                                            </Text>
                                        ) : (
                                            <Text style={styles.storyDetailTag}>
                                                {`${story.reward.value || ''} ${story.reward.type} `}
                                            </Text>
                                        )
                                    )}
                                    {taskGroup.leftBonusSparks ? (
                                        <View style={styles.storyBonusSparkTag}>
                                            <Text
                                                style={styles.storyBonusSparkTagText}>Bonus: {taskGroup.leftBonusSparks < 1 ? 0 : taskGroup.leftBonusSparks} sparks</Text>
                                            {story.reducePerRefresh && (
                                                <Text
                                                    style={styles.storyBonusSparkTagTextHighlight}>-{story.reducePerRefresh}</Text>
                                            )}
                                        </View>
                                    ) : null}

                                    <TouchableOpacity onPress={() => this.goToTask(story)}
                                                      disabled={isQuotaOver}>
                                        <View style={
                                            {
                                                ...styles.storyDetailActionTag,
                                                backgroundColor: isQuotaOver ? '#0000004D' : '#1FBEB8',
                                            }
                                        }>
                                            {this.state.processing ? (
                                                <ActivityIndicator size={Platform.OS === 'ios' ? 'small' : 18}
                                                                   style={{paddingHorizontal: 14}} color="#ffffff"/>
                                            ) : (isQuotaOver ? (
                                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                            <Icon name="timer" size={16} color="#ffffff"/>
                                                            <CountDownText
                                                                style={{color: '#ffffff', fontSize: 13}}
                                                                countType='date'
                                                                auto={true}
                                                                afterEnd={() => {
                                                                }}
                                                                timeLeft={secondsUntilMidnight}
                                                                step={-1}
                                                                startText='Start Task'
                                                                endText='Start Task'
                                                                intervalText={(date, hour, min, sec) => hour + ':' + min + ':' + sec}
                                                            />
                                                        </View>
                                                    )
                                                    : (
                                                        <Text style={{
                                                            color: '#ffffff',
                                                            fontSize: 13,
                                                            fontFamily: fontFamilyName
                                                        }}>

                                                            {isRepeating ? 'Start Task ' + (this.state.taskGroup.taskCounter + 1) + '/' + this.state.taskGroup._typeObject.quota
                                                                : 'Start Task'}

                                                        </Text>
                                                    )
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                        <View style={{backgroundColor: '#9600A1', height: 5, width: '100%'}}/>
                    </View>}
                    {!keyboardShow && this.state.selectedImage ?
                        <View style={{paddingHorizontal: 15}}>
                            <View style={{padding: 4, borderRadius: 10, flexDirection: 'row'}}>
                                <Image source={this.state.selectedImage}
                                       style={{height: 70, width: 70, borderRadius: 10, marginRight: 5}}/>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity onPress={() => this.uploadSelectedImage(story)} style={{
                                        backgroundColor: "#1FBEB8",
                                        borderRadius: 15,
                                        flexDirection: 'row'
                                    }}>
                                        <View style={{paddingRight: 6, flexDirection: 'row', alignItems: 'center'}}>
                                            {this.state.processing ? (
                                                <ActivityIndicator size={Platform.OS === 'ios' ? 'small' : 30}
                                                                   color="#ffffff"/>
                                            ) : <Icon name="progress-upload" size={30} color="#FFF"/>}
                                            <Text style={{fontSize: 12, color: "#FFF"}}>Submit for approval</Text>
                                        </View>

                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.removeSelectedImage()}>
                                        <Icon name="close-circle-outline" size={30} color="#0000004D"/>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                        : null}
                    {!keyboardShow && <TouchableOpacity style={styles.faceButton}
                                                        onPress={() => this.props.navigation.navigate('UsersList', {taskGroupData: this.state.taskGroup})}>
                        <View style={styles.viewShowMember}>
                            {image1}
                            {image2}
                            {countExtraMember > 0 &&
                            <View style={styles.plusMemberView}>
                                <Text style={styles.plusTxt}>
                                    +{countExtraMember}
                                </Text>
                            </View>
                            }
                        </View>
                    </TouchableOpacity>}


                    <View style={[{flex: 1}]}>
                        <GiftedChat
                            keyboardShouldPersistTaps={"never"}
                            messages={this.state.messages}
                            onSend={messages => this.onSend(messages)}
                            extraData={this.state}
                            user={user}
                            showUserAvatar={true}
                            renderInputToolbar={this._renderGiftedToolBar}
                            showAvatarForEveryMessage={true}
                            onLongPress={(context, message) => this.reportConfirmation(message)}
                            renderSystemMessage={this.renderSystemMessage.bind(this)}
                            renderBubble={this.renderBubble.bind(this)}
                        />
                    </View>
                </SafeAreaView>
                {Platform.OS === 'ios' && <KeyboardSpacer/>}
                <SafeAreaView style={{backgroundColor: '#3C1364', flex: 0}}/>
            </Fragment>
        );

    }

    _renderGiftedToolBar = (inputToolbarProps) => {
        // we customized the gifted chat and input toolbar because of bugs with either the bar missing or a big space when entering text.
        // refer to https://github.com/FaridSafi/react-native-gifted-chat/issues/1102
        // using our customized InputToolbar with textInput position as relative instead of absolute
        // with position relative it always move up when keyboard appears instead of disappering behind it.
        return (
            <InputToolbar
                {...inputToolbarProps}
            />);
    }
    _renderTruncatedFooter = (handlePress) => {
        return (
            <Text style={styles.showOrLess} onPress={() => {
                handlePress();
                Animated.timing(this.state.animatedStyle.maxHeight, {
                    toValue: styles.contentHeightMax.maxHeight,
                    duration: 500
                }).start(function () {

                });
            }}>
                more
            </Text>
        );
    }

    _renderRevealedFooter = (handlePress) => {
        return (
            <Text style={styles.showOrLess} onPress={() => {
                Animated.timing(this.state.animatedStyle.maxHeight, {
                    toValue: styles.contentHeight.maxHeight,
                    duration: 500
                }).start(function () {
                    handlePress();
                });
            }}>
                less
            </Text>
        );
    }



    _renderRewardsModal() {
        return (
            <SafeAreaView>
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.rewardsVisible}
                    onRequestClose={() => {
                        this._handleModalVisibility(false)
                    }}>

                    <View style={styles.modal}>
                        <RewardModalHeader title='Rewards' navigation={this.props.navigation} onLeft={() => {
                            this._handleModalVisibility(false)
                        }}/>

                        <FlatList
                            renderItem={this._renderListItem.bind(this)}
                            data={this.props.user.userRewards}
                            keyExtractor={item => item._id}/>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    };

    _renderListItem(rewardItem) {
        if (rewardItem?.item?.reward?._upgrade != null) {
            return (
                <TouchableOpacity style={styles.rewardItemRoot} onPress={() => {
                    this.setState({
                        selectedReward: rewardItem
                    });
                    this._showUsingRewardPopup()
                }}>
                    <Image style={styles.rewardsImg} source={rewardsImg}/>
                    <View style={styles.rewardItemContainer}>
                        <Text style={styles.rewardItemTitle}>{rewardItem.item.reward._upgrade.name}</Text>
                        <Text style={styles.rewardItemDesc}
                              ellipsizeMode='tail'
                              numberOfLines={3}
                        >
                            {rewardItem.item.reward._upgrade.description}
                        </Text>
                        <Text style={styles.rewardItemCounter}>{rewardItem.item.reward._upgrade.sparks}</Text>
                    </View>

                </TouchableOpacity>
            );
        } else {
            return (
                <View/>
            );
        }
    };

    _handleModalVisibility = (visibility) => {
        this.setState({
            rewardsVisible: visibility
        })
    };

    _handleTextReady = () => {
        // ...
    };

    _showUsingRewardPopup() {
        this._setModalVisible(true)
    }

    onRequestCloseModal() {
        this._setModalVisible(!this.state.dialogVisible);
    }

    _renderUsingRewardModal() {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.dialogVisible}
                onRequestClose={this.onRequestCloseModal.bind(this)}
            >
                <View style={styles.likeModalView}>
                    <View style={styles.likeModalInnerView}>
                        <Text style={styles.likeModalTitle}>You will use the Reward:</Text>
                        <Text
                            style={styles.likeModalTitle}>{this.state.selectedReward?.item?.reward?._upgrade?.name}</Text>
                        <View>
                            <Text style={styles.likeModalText}>Extend the Group Bonus Spark
                                by {this.state.selectedReward?.item?.reward?._upgrade?.usageValue} Number of
                                Uses: {this.state.selectedReward?.item?.reward?._upgrade?.sparks} |
                                Reset Weekly</Text>

                            {this.state.processing ? (
                                <ActivityIndicator size={Platform.OS === 'ios' ? 'small' : 22}
                                                   style={{paddingHorizontal: 14}} color="#1FBEB8"/>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => this._onRewardConfirm()}>
                                    <Text style={{
                                        ...styles.likeModalAction
                                    }}>
                                        Confirm
                                    </Text>
                                </TouchableOpacity>
                            )}

                        </View>
                        <TouchableOpacity
                            onPress={this.onRequestCloseModal.bind(this)}
                            style={styles.likeModalClose}
                        >
                            <View>
                                <Icon name='close' style={styles.likeModalCloseIcon}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    _setModalVisible(visible) {
        this.setState({dialogVisible: visible});
    }

    _onRewardConfirm() {
        if (!this.state.processing) {
            this.setState({processing: true});
            const userId = this.props.user?._id;
            const rewardId = this.state.selectedReward?.item?.reward?._upgrade?._id;
            let endpoint = SAVE_USER_REWARD_LAST_USED_API_PATH.replace('{userId}', userId);
            endpoint = endpoint.replace('{rewardId}', rewardId);
            const reducedSpark = this.state.selectedReward?.item?.reward?._upgrade?.usageValue;
            instance.get(endpoint).then(response => {
                this.setState({processing: false});
                if (response != null) {
                    this.socket.emit('client:message', {
                        sender: this.props.user._id,
                        receiver: this.state.taskGroup._team._id,
                        chatType: 'GROUP_MESSAGE',
                        type: EVENT_CHAT_MESSAGE,
                        userProfile: this.props.user,
                        message: 'Bonus Sparks has reduced by ' + reducedSpark + '! Complete your tasks now!',
                        isReward: true
                    });
                    //this.state.selectedReward?.item?.currentCounter++;
                    this.onRequestCloseModal();
                }

            }).catch((error) => {
                this.setState({processing: false});
                bugsnag.notify(error)
            });
        }
    }

}
const rewardsImg = require('../../assets/images/rewardsImg.png');

import React, {Component} from "react";
import {
    ActivityIndicator,
    DeviceEventEmitter,
    Dimensions,
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Platform,
    StatusBar,
} from 'react-native';
import {Thumbnail} from 'native-base';
import Video from 'react-native-video';
import * as axios from 'axios';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import Carousel from 'react-native-snap-carousel';
import _ from 'lodash';
import TextImage from './TextImage';
import * as grouputil from "../utils/grouputil";
import MixPanel from 'react-native-mixpanel';
import Modal from 'react-native-modal';
import * as Constants from '../constants';

import {
    CHALLENGE_IMAGE_BASE_URL,
    STORY_IMAGE_BASE_URL,
    STORY_VIDEO_BASE_URL,
    TASK_GROUP_TYPES
} from "../constants";
import {API_BASE_URL} from "../config";
import {
    SAVE_USER_TASK_GROUP_API,
    TEAM_UPDATE_API,
    USER_ACHIEVEMENT_LIST_PATH_API,
    USER_TASK_GROUP_LIST_PATH_API,
    CHAT_SOCKET_URL,
    CREATE_TEAM_GROUP_API
} from "../endpoints";
import styles from "../stylesheets/storyViewStyles";
import CustomText from "../components/CustomText";
import {Client} from "bugsnag-react-native";
import {BUGSNAG_KEY} from "../config";
import {getGroupUserDetails} from "../utils/common";
import SocketIOClient from 'socket.io-client';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import codePush from "react-native-code-push";
let codePushOptions = {checkFrequency: codePush.CheckFrequency.MANUAL};

const bugsnag = new Client(BUGSNAG_KEY);
const fontFamilyName = Platform.OS === 'ios' ? "SFUIDisplay-Regular" : "SF-UI-Display-Regular";

const width = Dimensions.get("window").width; //full width

const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 25000,
    headers: {"Content-type": "application/json"}
});

let selectedItemId = null;
let selectedItemType = null;
let selectedItemBonusSparks = null;
import {filterStories} from "../utils/WorldUtil";
import {getStories,createUserTaskGroup} from "../realm/RealmHelper";

// TODO: Update this class to new Lifecycle methods
// TODO: Split this render component into smaller one
class StoryView extends Component {
    goToDashboardScreen = () =>
        this.props.navigation.navigate({routeName: "Dashboard"});
    goToProfileScreen = () =>
        this.props.navigation.navigate({routeName: "FeedView"});
    goToUserTasksScreen = () =>
        this.props.navigation.navigate({routeName: "UserTaskGroup"});
    _renderItem = ({item, index}) => {
        const imageBaseUrl = item.type === TASK_GROUP_TYPES.CHALLENGE ? CHALLENGE_IMAGE_BASE_URL : STORY_IMAGE_BASE_URL;
        return (
            <TouchableOpacity onPress={() => this.itemPressed(item._id, item.type, item.bonusSparks, item.maxnum || 0)}>
                <View
                    style={item.type === TASK_GROUP_TYPES.CHALLENGE ? styles.challengeContainer : styles.storyContainer}>
                    <TextImage go={() => this.itemPressed(item._id, item.type, item.bonusSparks, item.maxnum || 0)}
                               item={item}
                               itemIndex={index} /*isStoryLocked={this.state.isStoryLocked}*//>
                </View>
            </TouchableOpacity>
        );
    };

    itemPressed = (id, type, bonusSparks, maxnum) => {
        if (this.state.isStoryLocked) {
            return //if stories are locked then just bypass the onPress.
        }
        this.setModalVisible(
            !this.state.modalVisible,
            id,
            type,
            bonusSparks,
            maxnum
        );
    }

    _renderStoryTaskItem = item => {
        if (!item._user) {
            return;
        }
        const data = item._typeObject;
        const teamLength = item._team.emails.length;
        let minutes = this.timeDifference(new Date(), new Date(item.createdAt));
        let image1 = "",
            arrayGroupImage = [],
            userName = "";
        if (item._user.profile.firstName) {
            userName = item._user.profile.firstName;
        }
        //Group Created user
        imageUser = (
            <Thumbnail
                style={styles.member1}
                source={{
                    uri:
                        item._user.profile.pictureURL ||
                        `https://ui-avatars.com/api/?name=${
                            item._user.profile.firstName ? item._user.profile.firstName : ""
                            }+${item._user.profile.lastName ? item._user.profile.lastName : ""}`
                }}
            />
        );
        // Group members
        let counter = 0;
        let loopLength =
            item._team.emails.length < 3 ? item._team.emails.length : 3;
        while (counter < loopLength) {
            let user = item._team.emails[counter];

            if (user.userDetails && item._user._id != user.userDetails._id) {
                let imageUser = (
                    <Thumbnail
                        style={styles.groupMember}
                        key={counter}
                        source={{
                            uri:
                                user.userDetails.profile.pictureURL ||
                                `https://ui-avatars.com/api/?name=${
                                    user.userDetails.profile.firstName
                                        ? user.userDetails.profile.firstName
                                        : ""
                                    }+${
                                    user.userDetails.profile.lastName
                                        ? user.userDetails.profile.lastName
                                        : ""
                                    }`
                        }}
                    />
                );
                arrayGroupImage.push(imageUser);
            }
            counter++;
        }
        let countExtraMember = "";
        if (loopLength > 3) {
            countExtraMember = item._team.emails.length - 3;
        }
        return (
            <View style={{paddingHorizontal: 8}} key={item._id}>
                <TouchableOpacity
                    onPress={() => this.addUserToTeam(item._team._id, item._id)}
                >
                    <View style={[styles.taskItem]}>
                        <View style={[styles.taskItemHeader]}>
                            <View style={{flexDirection: 'row'}}>
                                {imageUser}
                                <Text style={styles.taskItemName}>{userName}</Text>
                                <Text style={styles.taskItemXP}>{minutes}</Text>
                            </View>
                            <Text style={[styles.taskItemSize, {marginTop: 10}]}>
                                {data && data.quota ? `${teamLength}/${data.maxnum}` : ""}
                            </Text>
                        </View>
                        <View style={styles.taskItemFooter}>
                            <View style={styles.viewShowMember}>
                                {arrayGroupImage}
                                {countExtraMember > 0 && (
                                    <View style={styles.plusMemberView}>
                                        <Text style={styles.plusTxt}>+{countExtraMember}</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                style={{
                                    ...styles.likeModalAction,
                                    ...{
                                        backgroundColor: "#1FBEB8",
                                        color: "#FFFFFF",
                                        overflow: 'hidden'
                                    }
                                }}
                            >
                                Join Group
                            </Text>
                            {/*<Text style={styles.taskItemSize}>*/}
                            {/*{data && data.quota ? `${teamLength}/${data.quota}` : ""}*/}
                            {/*</Text>*/}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    constructor(props) {
        super(props);

        this.state = {
            challengesFetching: true,
            challengesAndStories: [],
            currentSlideIndex: 0,
            modalVisible: false,
            processing: false,
            tasksFetching: false,
            userTaskGroups: [],
            numberOfLines: 2,
            storyItemTextStyle: styles.storyItemImage,
            animatedStyle: [],
            animatedHeight: new Animated.Value(styles.storyItemImage.height),
            isStoryLocked: false
        };
    }

    timeDifference(current, previous) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;
        if (elapsed < msPerMinute) {
            return Math.round(elapsed / 1000) + "sec ago";
        } else if (elapsed < msPerHour) {
            return Math.round(elapsed / msPerMinute) + "min ago";
        } else if (elapsed < msPerDay) {
            return Math.round(elapsed / msPerHour) + "h ago";
        } else if (elapsed < msPerMonth) {
            return Math.round(elapsed / msPerDay) + "d ago";
        } else if (elapsed < msPerYear) {
            return Math.round(elapsed / msPerMonth) + "mon ago";
        } else {
            return Math.round(elapsed / msPerYear) + "yrs ago";
        }
    }

    componentWillReceiveProps(nextProps) {
      console.log("STORYVIEW component receive props")
        if (
            nextProps.stories &&
            !_.isEqual(nextProps.stories, this.state.challengesAndStories)
        ) {
            let {user, world} = nextProps;

            this._loadStories(user, world.stories);
        }
    }


    /*Loads stories from REALMDB through the helper.
    The stories are additionally filtered via the filterStories method, a worldutil method.*/
    _loadStories = (user, stories) => {

            let heights = new Array(stories.length);
            heights.fill(new Animated.Value(styles.storyItemImage.height), 0);


            const filteredStories = filterStories(user);
            console.log("STORYVIEW loadstories:  ", filteredStories)
            this.setState({
                challengesAndStories: filteredStories,
                animatedStyle: heights
            });
            this.getCodePush()

    };

    refreshUserTask = () => {
      console.log("STORYVIEW refreshusertask:  ")

      let getGroupByUserData  = grouputil.getGroupByUser(this.props.world.groups.recommendGroups,this.props.userProfile._id)
            if (getGroupByUserData) {
                this.setState({userTaskGroups: getGroupByUserData})
                this.props.userActions.updateUserTaskGroup(getGroupByUserData);
                if (getGroupByUserData.length >= 30) {
                   this.setState({
                        isStoryLocked: true
                    })
                } else {
                   this.setState({
                        isStoryLocked: false
                    })
                }

              this.props.userActions.fetchUserProfile(this.props.userProfile._id);
            }




    }

    componentDidMount() {
      console.log("STORYVIEW componentdidmount at API:  ", API_BASE_URL)
        if (this.props.user) {
            let user = this.props.user;
            let query = `userID=${user._id}&username=${user._id}&firstName=${user.profile.firstName ? user.profile.firstName : ''}&lastName=${user.profile.lastName ? user.profile.lastName : ''}&userType=test`;
            this.socket = SocketIOClient(CHAT_SOCKET_URL, {query: query, transports: ['websocket']});
            this._loadStories(user, this.props.world.stories); //will load from realmdb via the utility
            this.refreshUserTask()
        }

    }

    setModalVisible(visible, itemId, itemType, itemBonusSparks, maxnum = 0) {
        this.setState({
            modalVisible: visible,
            tasksFetching: !!itemId,
            userTaskGroups: []
        });
        selectedItemId = itemId;
        selectedItemType = itemType;
        selectedItemBonusSparks = itemBonusSparks;
        if (itemId) {
            this.fetchUserTaskGroupsBasedOnStory(itemId, maxnum);
        }
    }

    getCodePush = () => {
        /*if (API_BASE_URL === 'https://betaapi.soqqle.com') {
            codePush.sync({
                updateDialog: null,
                installMode: codePush.InstallMode.ON_NEXT_RESTART
            })
        }*/

    }

    // TODO: We should define this outside view
    fetchUserTaskGroupsBasedOnStory(storyId, maxnum) {
        let endpoint = USER_TASK_GROUP_LIST_PATH_API.replace("{page}", 1);
        endpoint = endpoint.replace("{type}", selectedItemType);
        endpoint = endpoint.concat("&page_size=", 3);
        endpoint = endpoint.concat("&type_id=", storyId);
        endpoint = endpoint.concat("&user_email=", this.props.user.profile.email);
        endpoint = endpoint.concat("&filter_user=", true);
        //a user can be in multiple teams and the filter for company will be in effect for all teams
        endpoint = endpoint.concat('&_teams=', this.props.user._teams.map((team) => {
            return team._id
        }).join(','));
        endpoint = endpoint.concat('&filter_company=', true);
        instance
            .get(endpoint)
            .then(response => {
                if (response) {
                    let _data = getGroupUserDetails(response.data);
                    _data = _data.latestUserTaskGroups;
                    _data = _data.filter((d) => {
                        return (maxnum === 0 || d._team.emails.length < maxnum)
                    });
                    this.setState({
                        userTaskGroups: _data,
                        tasksFetching: false
                    });
                    //  this.getCodePush()
                }
            })
            .catch(error => {
                bugsnag.notify(error);
                this.setState({tasksFetching: false});
                //  this.getCodePush()

            });
    }

    addUserToTeam(teamId, taskGroupId) {
        if (!this.state.processing) {
            this.setState({processing: true});
            let data = {
                email: this.props.user.profile.email,
                taskGroupId,
                users: this.props.user._id,
                BonusSparks: selectedItemBonusSparks
            };

            MixPanel.track('Join a team');
            fetch(TEAM_UPDATE_API.replace('{}', teamId), {
                method: 'PUT',
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(response => {
                    this.setState({processing: false, modalVisible: false});
                    let _userTaskGroups = this.state.userTaskGroups;
                    // Added 1% to bonus spark while new user join
                    if (_userTaskGroups[0].leftBonusSparks === response.leftBonusSparks) {
                        response.leftBonusSparks = (selectedItemBonusSparks + selectedItemBonusSparks * 0.01 * response._team.emails.length).toFixed(2);
                    }
                    if (this.props.user && response && response._team) {
                        this.socket.emit('client:message', {
                            sender: this.props.user._id,
                            receiver: response._team._id,
                            chatType: 'GROUP_MESSAGE',
                            type: Constants.EVENT_TEAM_JOIN,
                            message: this.props.user.profile.firstName + ' joined the group',
                            isJoining: true,
                            userProfile: this.props.user
                        });
                    }

                    createUserTaskGroup(response);
                    this.props.navigation.navigate("Chat", {
                        task_group_id: taskGroupId, //response._id,
                        taskUpdated: false,
                        taskGroup: response,
                        userTaskGroups: this.state.userTaskGroups // fetched from userTaskGroupWithMessages
                    });
                    this.refreshUserTask()
                })
                .catch(error => {
                    this.setState({processing: false});
                    bugsnag.notify(error);
                });
        }
    }

    //create new team with group
    createNewTeamGroup() {
        if (!this.state.processing) {
            this.setState({processing: true});
            const {profile} = this.props.user;
            let groupData = {
                type: selectedItemType,
                _typeObject: selectedItemId,
                _user: this.props.user._id,
                ...(selectedItemBonusSparks
                    ? {
                        leftBonusSparks: selectedItemBonusSparks,
                        lastBonusSparksRefreshed: new Date()
                    }
                    : {})
            };

            let data = {
                name: `${profile.firstName} - team`,
                emails: {
                    'accepted': true,
                    'email': profile.email
                },
                users: this.props.user._id,
                groupData: groupData
            };

            MixPanel.track('Create a Team with Group')
            instance.post(CREATE_TEAM_GROUP_API.replace('{}/', ''), data).then(response => {
                this.setState({processing: false, modalVisible: false});
                selectedItemId = null;
                selectedItemType = null;
                createUserTaskGroup(response.data);
                this.refreshUserTask()
                this.props.navigation.navigate("Chat", {
                    task_group_id: response.data._id,
                    taskUpdated: false,
                    taskGroup: response.data
                });
            }).catch((error) => {
                this.setState({processing: false})
                bugsnag.notify(error)
            });
        }
    }

    /* called when a user clicks on "start one" in the modal.
    It calls an API to create the team, and then create a new group. This is a double API call we expect to fix */
    createNewTeam() {
        if (!this.state.processing) {
            this.setState({processing: true});
            const {profile} = this.props.user;
            let data = {
                name: `${profile.firstName} - team`,
                emails: {
                    'accepted': true,
                    'email': profile.email
                },
                users: this.props.user._id
            };
            MixPanel.track('Create a Group')
            instance.post(TEAM_UPDATE_API.replace('{}/', ''), data).then(response => {
                this.createNewUserTaskGroup(response.data._id); // double API call
            }).catch((error) => {
                this.setState({processing: false})
                bugsnag.notify(error)
            });
        }
    }

    createNewUserTaskGroup(teamId) {
        let data = {
            type: selectedItemType,
            _typeObject: selectedItemId,
            _user: this.props.user._id,
            _team: teamId,
            ...(selectedItemBonusSparks
                ? {
                    leftBonusSparks: selectedItemBonusSparks,
                    lastBonusSparksRefreshed: new Date()
                }
                : {})
        };
        fetch(SAVE_USER_TASK_GROUP_API, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response = {}) => {
                this.setState({processing: false, modalVisible: false});
                selectedItemId = null;
                selectedItemType = null;
                this.refreshUserTask()
                this.props.navigation.navigate("Chat", {
                    task_group_id: response._id,
                    taskUpdated: false,
                    taskGroup: response
                });
            })
            .catch(error => {
                bugsnag.notify(error);
                this.setState({processing: false});
            });
    }

    //deprecated: to be updated. We currently dont need to filter by achievements yet.
    getChallengesAndStories(user, userAchievements) {
        let {profile} = user;
        if (profile) {
            let data = {
                emailId: profile.email,
                userId: user._id,
                achievementIds: this.getUserAchievementIds(userAchievements)
            };
            this.props.storyActions.getStoriesRequest(data);
        }
    }

    //deprecated: to be updated. We currently dont need to filter by achievements yet.
    getUserAchievementIds(userAchievements) {
        return userAchievements
            .filter(item => item.status === "Complete")
            .map(item => item.achievementId);
    }

    onRequestCloseModal() {
        this.setModalVisible(!this.state.modalVisible);
    }

    calculateDateConstraints(startDate, expNo) {
        // returns everything in time primitives (milliseconds)
        let now = new Date().getTime();
        let unlock = new Date(startDate).getTime();
        let expiry = new Date(startDate).getTime() + expNo * 24 * 60 * 60 * 1000;
        return {now, unlock, expiry};
    }

    render() {
        const {challengesAndStories} = this.state;
        console.log("STORYVIEW RENDER: ", challengesAndStories)
        const challengesAndStoriesFiltered = challengesAndStories.filter(item => {
            if (!!item.requirement && !!item.requirementValue) {
                switch (item.requirement) {
                    case "Achievement": //not used yet, expect to implement in future.
                        return true;
                    case "XP": //not used yet, expect to implement in future.
                        return true;
                    case "Date":
                        if (!!item.expiry) {
                            let {now, unlock, expiry} = this.calculateDateConstraints(
                                item.requirementValue,
                                item.expiry
                            );

                            if (now < unlock || now > expiry) {
                                //If taskgroup.requirementValue is before current system date and not expired then show
                                return false;
                            } else {
                                return true;
                            }
                        } else {
                            return false;
                        }
                    default:
                        return true;
                }
            } else {
                return true;
            }
        });
        return (
            <SafeAreaView style={styles.container}>
                <View style={{backgroundColor: '#10123b', flex: 1}}>
                    <View style={styles.header}>
                        {/* <Image
                        source={require("./../../assets/images/chat.png")}
                        style={styles.headerIcon}
                    /> */}
                        <View style={{justifyContent: 'center', flex: 1}}>
                            <Text
                                style={styles.storyHeaderStyle}>
                                Join Story
                            </Text>
                        </View>
                        <TouchableOpacity onPress={this.goToDashboardScreen}>
                            <Icon name="bars" style={styles.headerFontIcon}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.storyContainerView}>
                        <View>
                            <Carousel
                                ref={c => (this._carousel = c)}
                                data={challengesAndStoriesFiltered}
                                renderItem={this._renderItem.bind(this)}
                                sliderWidth={width}
                                itemWidth={wp("90%")}
                                onBeforeSnapToItem={slideIndex =>
                                    this.setState({currentSlideIndex: slideIndex})
                                }
                            />
                            {
                                this.state.isStoryLocked ?
                                    <View style={{
                                        backgroundColor: 'rgba(0,0,0,0.84)',
                                        position: 'absolute',
                                        top: 0, bottom: 0, left: 0, right: 0,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flex: 1,
                                        zIndex: 999
                                    }}
                                    >
                                        <View style={styles.modalHeight}>
                                            <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                                                {/* <Image source={require('../images/story_lock.png')}/> */}
                                                <MaterialIcon name={'lock-outline'} color={'white'} size={80}/>
                                            </View>
                                            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                                <Text style={{
                                                    color: '#ffffff',
                                                    fontFamily: fontFamilyName,
                                                    fontSize: 16
                                                }}>You have hit the cap of 3 groups</Text>
                                            </View>
                                            <View style={{flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                                                <TouchableOpacity style={{
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    backgroundColor: '#1FBEB8',
                                                    height: 42,
                                                    borderRadius: 21,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }} onPress={() => {
                                                    this.props.navigation.navigate('UserTaskGroup');
                                                }}>
                                                    <Text style={{
                                                        textAlign: 'center',
                                                        fontSize: 18,
                                                        fontFamily: fontFamilyName,
                                                        color: 'white'
                                                    }}>Go to My Groups</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    : <View/>
                            }
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={this.goToProfileScreen}>
                            <View style={styles.footerTab}>
                                <Image source={require("../images/dashboard.png")} style={styles.footerTabIcon}/>
                                <CustomText
                                    styles={{...styles.footerTabText, ...{marginRight: 0}}}
                                    font={fontFamilyName}
                                >
                                    {"Dashboard"}
                                </CustomText>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.footerTab}>
                            <Image source={require('../images/story.png')} style={styles.footerTabIcon}/>
                            <CustomText
                                styles={{...styles.footerTabText, ...{marginRight: 0}}}
                                font={fontFamilyName}
                            >
                                {"Story"}
                            </CustomText>
                        </View>
                        <TouchableOpacity onPress={this.goToUserTasksScreen}>
                            <View style={styles.footerTab}>
                                <Image source={require('../images/groups.png')} style={styles.footerTabIcon}/>
                                <CustomText
                                    styles={{...styles.footerTabText, ...{marginRight: 0}}}
                                    font={fontFamilyName}
                                >
                                    {"Groups"}
                                </CustomText>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{alert("Coming Soon!")}}>
                            <View style={styles.footerTab}>
                                <Image source={require('../images/messages.png')} style={styles.footerTabIcon}/>
                                <CustomText
                                    styles={{...styles.footerTabText, ...{marginRight: 0}}}
                                    font={fontFamilyName}
                                >
                                    {"Messages"}
                                </CustomText>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{alert("Coming Soon!")}}>
                            <View style={styles.footerTab}>
                                <Image source={require('../images/Notifications.png')} style={styles.footerTabIcon}/>
                                <CustomText
                                    styles={{...styles.footerTabText, ...{marginRight: 0}}}
                                    font={fontFamilyName}
                                >
                                    {"Notifications"}
                                </CustomText>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationInTiming={1000}
                        animationType={"slide"}
                        transparent={true}
                        visible={this.state.modalVisible}
                        style={[styles.modalContent, {justifyContent: "flex-end", margin: 0}]}
                        onRequestClose={this.onRequestCloseModal.bind(this)}
                        onBackdropPress={this.onRequestCloseModal.bind(this)}
                        onSwipeComplete={this.onRequestCloseModal.bind(this)}
                    >
                        <View style={styles.likeModalView}>
                            <View style={styles.likeModalInnerView}>
                                <View style={styles.modalTitleView}>
                                    <Text style={styles.likeModalTitle}>Group Matching</Text>
                                    <TouchableOpacity onPress={() => {
                                        this.setState({modalVisible: false});
                                        this.goToUserTasksScreen()
                                    }}
                                                      style={styles.myGroupsBtn}>
                                        <Text style={styles.myGroups}>My Groups</Text>
                                    </TouchableOpacity>
                                </View>
                                {this.state.tasksFetching ? (
                                    <ActivityIndicator size="small" color="#800094"/>
                                ) : this.state.userTaskGroups.length ? (
                                    <View>
                                        {/*<Text style={styles.likeModalText}>*/}
                                        {/*Join a team to surge forward!*/}
                                        {/*</Text>*/}
                                        {this.state.userTaskGroups.map(userTaskGroup => {
                                            if (_.get(userTaskGroup, '_team.emails').length > 0) {
                                                return this._renderStoryTaskItem(userTaskGroup);
                                            }
                                        })}
                                        <Text style={styles.likeModalSeparator}>or</Text>
                                        <TouchableOpacity onPress={() => this.createNewTeamGroup()}>
                                            <Text
                                                style={{
                                                    ...styles.likeModalAction,
                                                    ...{
                                                        backgroundColor: "#56478c",
                                                        color: "#FFFFFF",
                                                        marginTop: 10,
                                                        overflow: 'hidden'
                                                    }
                                                }}
                                            >
                                                Start a Group
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.likeModalText}>
                                            But there are no available teams.
                                        </Text>
                                        <TouchableOpacity onPress={() => this.createNewTeamGroup()}>
                                            <Text style={styles.likeModalAction}>Start A Group</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {/*<TouchableOpacity*/}
                                {/*onPress={this.onRequestCloseModal.bind(this)}*/}
                                {/*style={styles.likeModalClose}*/}
                                {/*>*/}
                                {/*<View>*/}
                                {/*<Icon name="close" style={styles.likeModalCloseIcon}/>*/}
                                {/*</View>*/}
                                {/*</TouchableOpacity>*/}
                            </View>
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
        );
    }
}

export default codePush(codePushOptions)(StoryView)

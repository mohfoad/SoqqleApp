import React, {Component, Fragment} from 'react';
import {
    Image,
    Text,
    View,
    SafeAreaView,
    ImageBackground,
    Platform,
    Dimensions,
    ScrollView,
} from "react-native";
import Header from '../components/Header';
import styles from "../stylesheets/InfoViewStyles";
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {Thumbnail} from "native-base";
import {STORY_IMAGE_BASE_URL} from '../constants';

const deviceWidth = Dimensions.get('window').width;
const {height} = Dimensions.get('window');

const fontFamilyName = Platform.OS === 'ios' ? "SFUIDisplay-Regular" : "SF-UI-Display-Regular";


export default class InfoView extends Component {

    constructor(props) {
        super(props);
        const {navigation} = props;
        const taskGroupData = navigation.getParam('taskGroup', "No Data")
        this.state = {
            taskGroupData: taskGroupData,
        };
    }

    render() {
        const {taskGroupData} = this.state;
        const ImageBaseUri = STORY_IMAGE_BASE_URL;
        const story = taskGroupData._typeObject;

        let countExtraMember = this.state.taskGroupData._team.emails.length - 2;
        let image1, image2;
        if (this.state.taskGroupData._team.emails.length > 0) {
            let arrayEmail = taskGroupData._team.emails[0];
            let dictUserDetail = arrayEmail.userDetails;
            image1 = <Thumbnail
                style={styles.member1}
                source={{uri: dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.pictureURL || `https://ui-avatars.com/api/?name=${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.firstName ? dictUserDetail.profile.firstName : ''}+${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.lastName ? dictUserDetail.profile.lastName : ''}`}}/>;
        }
        if (this.state.taskGroupData._team.emails.length > 1) {
            let arrayEmail1 = this.state.taskGroupData._team.emails[1];
            let dictUserDetail = arrayEmail1.userDetails;
            image2 = <Thumbnail
                style={styles.member2}
                source={{uri: dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.pictureURL || `https://ui-avatars.com/api/?name=${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.firstName ? dictUserDetail.profile.firstName : ''}+${dictUserDetail && dictUserDetail.profile && dictUserDetail.profile.lastName ? dictUserDetail.profile.lastName : ''}`}}/>;
        }

        return (

            <Fragment>
                <ScrollView>
                    <ImageBackground source={require('../images/backblue.png')} style={styles.imageBgContainer}>
                        <SafeAreaView style={{flex: 0, backgroundColor: "transparent"}}>
                            <Header
                                navigation={this.props.navigation}
                                style={{justifyContent: 'center'}}
                                title={story.name}
                                headerStyle={styles.headerStyle}
                                fontStyle={styles.fontStyle}
                                headerTitleStyle={styles.headerTitleStyle}
                                headerRightTextStyle={styles.headerRightTextStyle}
                            />
                        </SafeAreaView>
                    </ImageBackground>
                    <SafeAreaView>
                        <View>
                            <Image source={{uri: ImageBaseUri.replace('{}', story._id)}}
                                   style={styles.storyImageContainer}/>
                        </View>

                        <View style={styles.StoryDetailsContainer}>
                            <View style={{padding: 20}}>
                                <Text style={styles.storyTitleStyle}>
                                    {story.name}
                                </Text>
                                <Text style={styles.storyDiscriptionStyle}>
                                    {
                                        story.description
                                    }
                                </Text>
                            </View>
                            <View style={styles.roundImageContainer}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <View style={{flexDirection: 'row'}}>
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
                                    <View style={{flexDirection: 'row', marginTop: 5}}>
                                        <Image source={require("../images/Sparks_Icon.png")}
                                               style={styles.SparkImageStyle}/>
                                        <Text
                                            style={styles.sparkTextStyle}>{`${story.reward.value || ''} ${story.reward.type} `}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.nextSequenceContainer}>
                            <Image source={require('../images/Swipe.png')} style={styles.swipeImageStyle}/>
                            <View style={{flexDirection: 'row', marginTop: 34, justifyContent: 'center'}}>
                                <View style={styles.rectangleStyle}>
                                    <Text style={styles.rectangleTextStyle}>The Robot Takeover is already here</Text>
                                </View>
                                <View style={{...styles.rectangleStyle, marginLeft: 18}}>
                                    <Text style={styles.rectangleTextStyle}>Human 'employment' and the economy</Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </Fragment>
        )
    }

}
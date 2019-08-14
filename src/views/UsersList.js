import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text, View, SafeAreaView, Image, FlatList, Alert
} from 'react-native';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome'
import CardSection from '../components/CardSection';
import {
    Thumbnail
} from "native-base";
import styles from './../stylesheets/userListViewStyles';


export default class UsersList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataUser: [],
        };
    }
    componentDidMount() {
        if (this.props.navigation.state.params.blockUserList) {
            this.setState({ dataUser: this.props.navigation.state.params.blockUserList });
        } else {
            if (this.props.navigation.state.params.taskGroupData) {
                let dictUserDetail = this.props.navigation.state.params.taskGroupData;
                if (dictUserDetail._team) {
                    this.setState({ dataUser: dictUserDetail._team.emails });
                }
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.error && nextProps.error.message) {
            alert(nextProps.error.message);
        }
        if (nextProps.blockUserSuccess && nextProps.blockUserSuccess !== this.props.blockUserSuccess) {
        }
    }
    handleBackAction() {
        this.props.navigation.goBack();
    }

    blockUnblockConfirmation(userId, isBlocked) {
        var alertTitle = '', alertMessage = ''
        if (isBlocked == 0) {
            alertTitle = 'Unblock?';
            alertMessage = 'Are you sure to unblock this user?';
        } else {
            alertTitle = 'Block?';
            alertMessage = 'Are you sure to block this user?';
        }
        Alert.alert(
            alertTitle,
            alertMessage,
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Ok', onPress: () => this.callApiToBlockUnblock(userId, isBlocked) },
            ]
        )
    }
    callApiToBlockUnblock(userId, isBlocked) {
        const { userActions } = this.props;
        var loginUserId = this.props.user._id;
        let arrayParam = { 'loginUserId': loginUserId, 'blockedUserId': userId, 'isBlocked': isBlocked };
        userActions.blockUserRequested(arrayParam);
        let profile = { ...this.props.user };
        let blockUserIds = [...this.props.user.blockUserIds];
        if (isBlocked) {
            blockUserIds.push(userId);
            profile.blockUserIds = blockUserIds;
            userActions.blockUnlockUserCompleted(profile);
        } else {
            let blockedUserArray = blockUserIds.filter(e => e != userId)
            profile.blockUserIds = blockedUserArray;
            userActions.blockUnlockUserCompleted(profile);
        }
        this.setState({ dataUser: this.state.dataUser });
    }
    renderItem = (item, index) => {

        let arrayBlockedUser = this.props.user.blockUserIds, btnBlockConfirmation = '';
        var name = '', designation = '', imgUser, imgEyes, userId = 0, isBlocked = 1;
        imgEyes = <Image source={require('../../assets/images/eyeOpen.png')} />
        let dictUserDetail;
        if (item.item && item.item.userDetails && item.item.userDetails.profile) {
            if (this.props.navigation.state.params.blockUserList) {
                dictUserDetail = item.item
            } else {
                dictUserDetail = item.item.userDetails;
            }

            if (dictUserDetail.profile.firstName) {
                name = dictUserDetail.profile.firstName
            }
            if (dictUserDetail.profile.lastName) {
                name = name + ' ' + dictUserDetail.profile.lastName;
            }
            if (dictUserDetail.profile.title) {
                designation = dictUserDetail.profile.title;
            }
            if (dictUserDetail._id) {
                userId = dictUserDetail._id;
            }
            var index = -1;
            if (arrayBlockedUser && arrayBlockedUser.length > 0) {
                index = arrayBlockedUser.indexOf(userId);
            }
            if (index >= 0) {
                isBlocked = 0;
                btnBlockConfirmation = <TouchableOpacity style={styles.eyeBtn} onPress={() => this.blockUnblockConfirmation(userId, isBlocked)}>
                    <Image style={styles.eyeWithCross} source={require('../../assets/images/eyeCross.png')} />
                </TouchableOpacity>

            } else {
                isBlocked = 1;
                btnBlockConfirmation = <TouchableOpacity style={styles.eyeBtn} onPress={() => this.blockUnblockConfirmation(userId, isBlocked)}>
                    <Image source={require('../../assets/images/eyeOpen.png')} />
                </TouchableOpacity>
            }
            if (userId === this.props.user._id) {
                btnBlockConfirmation = <TouchableOpacity style={styles.eyeBtn} />
            }
            imgUser = <Thumbnail
                style={styles.imageUser}
                source={{ uri: dictUserDetail.profile.pictureURL || `https://ui-avatars.com/api/?name=${dictUserDetail.profile.firstName}+${dictUserDetail.profile.lastName}` }} />
        }
        return (
            <CardSection>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('UserDetailView', { detailDict: item.item, taskGroupData: this.props.navigation.state.params.taskGroupData })}>
                    <View style={styles.viewMain}>
                        {imgUser}
                        <View>
                            <Text style={styles.txtName}> {name} </Text>
                            <Text style={styles.txtDesignation}> {designation} </Text>
                        </View>
                        {btnBlockConfirmation}
                    </View>
                </TouchableOpacity>
            </CardSection>
        )
    }
    render() {
        let countMbr = 0;
        countMbr = this.state.dataUser.length;
        let mbrTitle = 'Members';
        if (countMbr == 1) {
            mbrTitle = 'Member'
        }
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => this.handleBackAction()}
                        style={styles.headerBackView}>
                        <View>
                            <Icon
                                name='chevron-left'
                                style={styles.headerBackIcon}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewSearchMemCount}>
                    <Text style={styles.txtMemberCount}>{countMbr} {mbrTitle}</Text>
                    <Image style={styles.imgSearchIcon} source={require('../../assets/images/Search.png')} />
                </View>
                <View style={styles.listContainer}>
                    <FlatList
                        style={styles.listStyle}
                        data={this.state.dataUser}
                        extraData={this.props.user}
                        scrollEnabled={true}
                        marginBottom={50}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this.renderItem}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

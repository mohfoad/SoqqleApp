import { Map, List, fromJS, Seq } from 'immutable';
import _ from 'lodash';
import {EVENT_BRAINDUMP_COMPLETE} from '../constants';

export const isValidEmail = email => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
};

export function deepFromJS(js) {
    return typeof js !== 'object' || js === null ? js :
        Array.isArray(js) ?
            Seq(js).map(deepFromJS).toList() :
            Seq(js).map(deepFromJS).toMap();
}

export function getGroupUserDetails(groupDetails) {
    groupDetails.latestUserTaskGroups.map((group, groupIndex) => {
        return group._team.emails.map((email, emailIndex) => {
            return groupDetails.latestUserTaskGroups[groupIndex]._team.emails[emailIndex]['userDetails'] = groupDetails.userDetails.find((element) => {
                return element.profile.email === email.email;
            });
        });
    });
    return groupDetails;
}

export function getMessages(groupDetails, messages, blockUserIds, userProfile) {
  console.log("COMMON: GET MESSAGES", messages );
    let messagesWithUserDetails = [];
    messages.map(message => {
        let userData = groupDetails._team.emails.find(user => {
            return user.userDetails && user.userDetails._id == message.sender;
        });
        let isUnBlocked = true;
        if (blockUserIds.length > 0 && blockUserIds.indexOf(user.userDetails && userData.userDetails._id) !== -1) {
            isUnBlocked = false;
        }
        if (isUnBlocked) {
            if (message.message == 'Task is completed' || message.isReward) {
                // used lodash so if no Value found default will be present
                // which is last param of get method
                // also checking if initial object is not null or undefined
                const  firstName  = _.get(userData, 'userDetails.profile.firstName');
                const storyName = groupDetails ? _.get(groupDetails, '_tasks[0].name', 'Task') : 'Task';
                const sparks = groupDetails ? _.get(groupDetails, 'leftBonusSparks', 0) : 0;
                messagesWithUserDetails.push(
                    {
                        _id: message._id,
                        text: `${firstName} finishes ${storyName}. (${sparks} sparks)`, // message.message,
                        createdAt: new Date(message.time),
                        system: true,
                        isReward: message.isReward,
                        userProfile: userProfile,
                        image: message.image,
                    }
                );
            } else if (message.isJoining){
                messagesWithUserDetails.push(
                {
                    _id: message._id,
                    text: message.message,
                    createdAt: new Date(message.time),
                    system: true,
                    isJoining: true,
                    userProfile: userProfile,
                    image: message.image,
                }
            );
            }/*else if(message.message == EVENT_BRAINDUMP_COMPLETE){
                messagesWithUserDetails.push(
                    {
                        _id: message._id,
                        text: 'You Shared a Story',
                        createdAt: new Date(message.time),
                        user: {
                            _id: userData.userDetails._id,
                            name: userData.userDetails.profile.firstName + ' ' + userData.userDetails.profile.firstName,
                            avatar: userData.userDetails.profile.pictureURL || `https://ui-avatars.com/api/?name=${userData.userDetails.profile.firstName}+${userData.userDetails.profile.lastName}`
                        },
                        image: message.image
                    }
                );
            } */else if (userData && userData.userDetails && userData.userDetails.profile) {
                messagesWithUserDetails.push(
                    {
                        _id: message._id,
                        text: message.message,
                        createdAt: new Date(message.time),
                        user: {
                            _id: userData.userDetails._id,
                            name: userData.userDetails.profile.firstName + ' ' + userData.userDetails.profile.firstName,
                            avatar: userData.userDetails.profile.pictureURL || `https://ui-avatars.com/api/?name=${userData.userDetails.profile.firstName}+${userData.userDetails.profile.lastName}`
                        },
                        userProfile: userProfile,
                        image: message.image,
                    }
                );
            } else {

                messagesWithUserDetails.push(
                    {
                        _id: message._id,
                        text: message.message,
                        createdAt: new Date(message.time),
                        user: {
                            _id: userProfile._id,
                            name: userProfile.profile.firstName + ' ' + userProfile.profile.firstName,
                            avatar: userProfile.profile.pictureURL || `https://ui-avatars.com/api/?name=${userProfile.profile.firstName}+${userProfile.profile.lastName}`
                        },
                        userProfile: userProfile,
                        image: message.image,
                    }
                );
            }

        }
    });
    return messagesWithUserDetails;
}

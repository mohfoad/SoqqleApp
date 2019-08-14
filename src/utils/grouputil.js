import _ from 'lodash';
import { updateTaskGroup, getUserTaskGroup } from '../realm/RealmHelper';
import { DEFAULT_AVATAR } from '../constants';
import {getStories} from "../realm/RealmHelper";
let Realm = require('realm');
import {Client} from 'bugsnag-react-native';
import {BUGSNAG_KEY} from "../config";
const bugsnag = new Client(BUGSNAG_KEY);

let realm = new Realm(updateTaskGroup);

export const getGroupByUser =(recommendGroups ,userid)=> {
  console.log("GROUPUTIL GETGROUPBYUSER ", recommendGroups)
if (!recommendGroups || !userid) { return; }
let recommendGroupsArray =  recommendGroups.filter((item)=>{
    let filterGroupArray = item._team.users.filter(subItem =>{

        return(subItem._id.toString() == userid.toString() )
    })

    return(filterGroupArray.length >0 )
})

return recommendGroupsArray;
}

export const checkUnlockAllParties = (userTaskGroup) => {
    // Retrieve all tasks in the userTaskGroup
    // Retrieve all users in the userTaskGroup (in the _team object)
    // Retrieve the current story in the userTaskGroup
    // Check that all users have completed at least 1 task in the current story
    // If true - allow to sequence to the next story
    // If False - display a message to inform the logged in user that there’s a need to ensure all members need to complete their task. Allow a button to send a reminder
    const tasks = userTaskGroup._tasks;
    const users = userTaskGroup._team.emails.map(e => e.userDetails);
    const currentStory = userTaskGroup._typeObject;

    const pendingUsers = _.filter(users, u => {
        return !_.some(tasks, t => {
            return t.userID === u._id && t.metaData.subject.skill._id === currentStory._id && t.status === "complete";
        });
    });
    return pendingUsers;
}

export const checkUnlockNextSequence = (userTaskGroup) => {
    // Retrieve current story
    // Retrieve the current sequence number
    // Retrieve the next story
    // Check that the requirement is Date and requirementValue is before today
    // If true - allow to sequence to the next story
    // If false - increment userTaskGroup.taskCounter by one
    let stories = getStories;
    console.log("stories from realm ", stories)

    const story = _.find(stories, s => s._id === userTaskGroup._typeObject._id)
    console.log("current story ", story)
    const nextStory = _.find(stories, s => s.groupName === story.groupName && s.taskGroup.sequence === story.taskGroup.sequence + 1)
    console.log("nextStory ", nextStory)
    if (nextStory && nextStory.requirement) {
        switch (nextStory.requirement) {
            case 'Achievement':
                break;
            case 'XP':
                break;
            case 'Date':
                if (nextStory.requirementValue && moment(nextStory.requirementValue).isBefore(moment())) {
                    return nextStory;
                }
            default:
                break;
        }
        return null;
    } else {
        console.log('Completed');
    }

}


export const UpdateUserTaskGroup = (Data) => {
    realm.write(() => {
        Data.forEach((group) => {
            try {
                realm.create(updateTaskGroup, group, Realm.UpdateMode.All)
            }
            catch (e) {
                bugsnag.notify(e)
                console.log(e);
            }
        })
    })
}

export const getUserTaskGroupsById = (idsArray) => {
    /**
     * @param  {strings[]} idsArray
     */
    try {
        let realmResult = getUserTaskGroup().filtered(idsArray
            .map((_id) => "_id == " + `'${_id}'`).join(' OR '));
        return realmResultToObjArray(realmResult);
    } catch (e) {
      bugsnag.notify(e)
        console.log("error -> GetGroups", e)
    }
}

export const getAllSharesFromUserProfiles = (usersProfilesArray) => {
    if(usersProfilesArray != undefined) {
        try {
            let sharesResult = [];
            usersProfilesArray.map(obj => {
                sharesResult.push(obj.shares)
            });
            let sharesArray = realmResultToObjArray(sharesResult);
            let sharesList = [];
            sharesArray.forEach(element => {
                sharesList.push(realmResultToObjArray(element));
            });
            sharesList = sharesList.map((element, index) => {
                element = element.map(el => {
                    el = {
                        ...el,
                        pictureUrl: usersProfilesArray[index].profile.pictureUrl || DEFAULT_AVATAR
                    }
                    return el;
                })
                return element;
            });
            let sharesMerge = [].concat.apply([], sharesList);
            return _.uniqBy(sharesMerge, "_id");
        } catch (e) {
          bugsnag.notify(e)
            console.log("error -> getSharesWithUserDifferentThenSelf", e)
        }
    }
    return null;
}

export const getAllUsersFromUserTaskGroupsTeam = (currentUserId, userTaskGroupArray) => {
   if(userTaskGroupArray != undefined) {
       try {
           let usersResult = [];
           userTaskGroupArray.map(obj => {
               if(obj._team) {
                   usersResult.push(obj._team.users)
               } else {
                   console.log("[getAllUsersFromUserTaskGroupsTeam] - This object has no _team: ", obj)
               }
           });
           let usersListArr = realmResultToObjArray(usersResult);
           let userList = [];
           usersListArr.forEach(element => {
               userList.push(realmResultToObjArray(element));
           });
           let userListMerge = [].concat.apply([], userList);
           let userListWithoutCurrent = userListMerge.filter(obj => obj._id != currentUserId)
           return _.uniqBy(userListWithoutCurrent, "_id");
       } catch (e) {
          bugsnag.notify(e)
           console.log("error -> getAllUsersFromUserTaskGroupTeam", e)
       }
   }
   return null;
}

export const getUser = (group, userid) => {
  console.log("GROUPUTIL: GETTING USER in Group ", group._id);
  let user = group._team.users.map((user)=> {
    console.log("GROUPUTIL: CHECKING FOR USER ", user._id)
     if (user._id == userid)
     { return user;}
   }
 );
}


const realmResultToObjArray = (realmObject) => {
    /**
     * @param  {Realm.Results<any>} realmObject
     */
    let arr = [];
    try {
        realmObject.map(obj => arr.push(obj));
        return arr;
    }
    catch (e) {
        bugsnag.notify(e)
        console.log("error -> realmResultToObjArray", e)
    }
}

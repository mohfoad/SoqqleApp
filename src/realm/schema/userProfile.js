'use strict';

import Realm from 'realm';
import {PROFILE_SCHEMA} from './profile';
import {TEAM_LIST_SCHEMA} from './team'
import {SHARE_LIST_SCHEMA} from "./share";
export const USER_PROFILE_SCHEMA = 'UserProfile';
export const USER_PROFILE_LIST_SCHEMA = 'UserProfile[]';

class UserProfile extends Realm.Object {}
UserProfile.schema = {
    name: USER_PROFILE_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: {
            type: 'string',
            optional: true
        },
        profile: {
            type: PROFILE_SCHEMA,
            optional: true
        },
        facebookID: {
            type: 'string',
            optional: true
        },
        linkedInID: {
            type: 'string',
            optional: true
        },
        roadmaps: {
            type: 'string[]',
            optional: true
        },
        // _teams: {
        //     type: 'Team[]',
        //     default: []
        // },
        userTaskGroupIds: {
            type: 'string[]',
            default: []
        },
        shares: {
            type: SHARE_LIST_SCHEMA,
            default: []
        }
    }

};

export default UserProfile;
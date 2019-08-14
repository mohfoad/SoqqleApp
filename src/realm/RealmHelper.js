import Company from "./schema/company";
import UserLogin, { LOGIN_LIST_SCHEMA, USER_LOGIN_SCHEMA } from "./schema/UserLogin";

const Realm = require('realm');
import Story, {STORY_SCHEMA} from './schema/story';
import Question, {QUESTION_SCHEMA} from './schema/question';
import Content, {CONTENT_SCHEMA} from './schema/content';
import Share, {SHARE_SCHEMA} from './schema/share';
import TaskGroup, {TASK_GROUP_SCHEMA, TASK_GROUP_LIST_SCHEMA} from './schema/taskGroup';
import Team, {TEAM_SCHEMA} from './schema/team';
import UserProfile, {USER_PROFILE_SCHEMA} from './schema/userProfile';
import UserTaskGroup, {USER_TASK_GROUP_SCHEMA} from './schema/userTaskGroup';
import Profile, {PROFILE_SCHEMA} from './schema/profile';
import Messages from "./schema/messages";
import Objective from "./schema/objective";
import {Client} from 'bugsnag-react-native';
import {BUGSNAG_KEY} from "../config";
const bugsnag = new Client(BUGSNAG_KEY);

const uuid = require('react-native-uuid');

const databaseOptions = {
    path: 'soqqle.realm',
    schema: [UserLogin, Company, Story, Question, Content, Share, TaskGroup, Team, Profile, UserProfile, UserTaskGroup, Objective, Messages],
    deleteRealmIfMigrationNeeded: true,
    schemaVersion: 1
};

const realm = new Realm(databaseOptions);

export const saveWorld = (world, user) => {
    let groups;
    let questions;
    let stories;
    if (world.stories && world.stories.lstStories) {
        stories = world.stories.lstStories;
    }
    else {
        stories = [];
    }
    if (world.groups && world.groups.recommendGroups) {
        groups = world.groups.recommendGroups;
    }
    else {
        groups = [];
    }
    if (world.questions && world.questions.listQuestion) {
        questions = world.questions.listQuestion;
    }
    else {
        questions = [];
    }

    realm.write(() => {
        stories.forEach((story) => {
            try {
                realm.create(STORY_SCHEMA, story, Realm.UpdateMode.All)
            } catch (e) {
                bugsnag.notify(e);
                console.log("error1", e);
            }
        });
        questions.forEach((question) => {
            try {
                realm.create(QUESTION_SCHEMA, question, Realm.UpdateMode.All)
            } catch (e) {
                bugsnag.notify(e);
                console.log("error2", e);
            }
        });

        groups.forEach((group) => {
            try {
                const _typeObject = group._typeObject;
                const _user = group._user;
                const _team = group._team;
                const _tasks = group._tasks;

                realm.create(USER_TASK_GROUP_SCHEMA, group, Realm.UpdateMode.All)
                // realm.create(USER_PROFILE_SCHEMA, _user, Realm.UpdateMode.All)
                // let exercise = realm.create(STORY_SCHEMA, _typeObject, Realm.UpdateMode.All)
                // realm.create(TEAM_SCHEMA, _team, Realm.UpdateMode.All)
                // realm.create(TASK_GROUP_LIST_SCHEMA, _tasks, Realm.UpdateMode.All)

            } catch (e) {
                bugsnag.notify(e);
                console.log("error3", e);
            }
        });
    })

};

export const getStories = () => {
    return realm.objects(STORY_SCHEMA);
};

export const getQuestions = () => {
    return realm.objects(QUESTION_SCHEMA)
};

export const getMyProfile = () => {
    return realm.objects(USER_PROFILE_SCHEMA)
};
export const UpdateGroup = (Data) => {
    realm.write(() => {
        Data.forEach((group) => {
            try {
                realm.create(USER_TASK_GROUP_SCHEMA, group, true)
            }
            catch (e) {
                bugsnag.notify(e);
                console.log(e);
            }
        });
    })
}
export const createUserLogin = (user) => {
    try {
        let userLogin = {}
        if (user) {
            userLogin = {
                _id: user._id,
                lastlogin: new Date().toString(),
                sessionid: uuid.v1()
            }
        }

        realm.write(() => {
            realm.create(USER_LOGIN_SCHEMA, userLogin, Realm.UpdateMode.Never);
        })
    } catch (e) {
        bugsnag.notify(e);
        console.log("error4", e);
    }
}

export const UpdateUserTaskGroup = (Data) => {
    realm.write(() => {
        Data.forEach((group) => {
            try {
                realm.create(USER_TASK_GROUP_SCHEMA, group, true)
            }
            catch (e) {
                bugsnag.notify(e);
                console.log(e);
            }
        });
    })
}
export const updateTaskGroup = () => {
    return realm.objects(USER_TASK_GROUP_SCHEMA)
};

export const getUserTaskGroup = () => {
    return realm.objects(USER_TASK_GROUP_SCHEMA)
};

export const createUserTaskGroup = (group) => {
    realm.write(() => {
        try {
            realm.create(USER_TASK_GROUP_SCHEMA, group, Realm.UpdateMode.All)
        } catch (e) {
            bugsnag.notify(e);
            console.log(e);
        }
    })
}

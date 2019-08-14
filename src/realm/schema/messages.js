'use strict';

import Realm from 'realm';
import {CONTENT_SCHEMA} from "./content";
export const MESSAGES_SCHEMA = 'Messages';
export const MESSAGE_LIST_SCHEMA = 'Messages[]';
class Messages extends Realm.Object {}

Messages.schema = {
    name: MESSAGES_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: {
            type: 'string',
            optional: true
        },
        sender: {
            type: 'string',
            optional: true
        },
        message: {
            type: 'string',
            optional: true
        },
        conversationId: {
            type: 'string',
            optional: true
        },
        isJoining: {
            type: 'bool',
            optional: true
        },
        isReward: {
            type: 'bool',
            optional: true
        },
        time: {
            type: 'date',
            optional: true
        },
 
        

    }

};

export default Messages;
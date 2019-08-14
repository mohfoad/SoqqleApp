'use strict';

import Realm from 'realm';
import {CONTENT_SCHEMA} from "./content";
export const SHARE_SCHEMA = 'Share';
export const SHARE_LIST_SCHEMA = 'Share[]';
class Share extends Realm.Object {}

Share.schema = {
    name: SHARE_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: {
            type: 'string',
            optional: true
        },
        content: {
            type: CONTENT_SCHEMA,
            optional: true
        },
        category: {
            type: 'string',
            optional: true
        },
        subCategory: {
            type: 'string',
            optional: true
        },
        type: {
            type: 'string',
            optional: true
        },

    }

};

export default Share;
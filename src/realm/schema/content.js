'use strict';

import Realm from 'realm';
export const CONTENT_SCHEMA = 'Content';
class Content extends Realm.Object {}
Content.schema = {
    name: CONTENT_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: {
            type: 'string',
            optional: true
        },
        author: {
            type: 'string',
            optional: true
        },
        authorName: {
            type: 'string',
            optional: true
        },
        message: {
            type: 'string',
            optional: true
        },
        date: {
            type: 'date',
            optional: true
        },
        type: {
            type: 'string',
            optional: true
        },
        content1: {
            type: 'string',
            optional: true
        },
        content2: {
            type: 'string',
            optional: true
        },
        content3: {
            type: 'string',
            optional: true
        },
        content4: {
            type: 'string',
            optional: true
        },
        content5: {
            type: 'string',
            optional: true
        },
        content6: {
            type: 'string',
            optional: true
        },
        image: {
            type: 'string',
            optional: true
        },
        referenceId: {
            type: 'string',
            optional: true
        },
        media: {
            type: 'string',
            optional: true
        },

    }

};

export default Content;
'use strict';

import Realm from 'realm';
export const QUESTION_SCHEMA = 'Question';
class Question extends Realm.Object {}

Question.schema = {
    name: QUESTION_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: {
            type: 'string',
            optional: true
        },
        question: {
            type: 'string',
            optional: true
        },
        roadmapSkill: {
            type: 'string',
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
        description: {
            type: 'string',
            optional: true
        },
        conditions: {
            type: 'string',
            optional: true
        },
        evaluation: {
            type: 'string',
            optional: true
        },
        complexity: {
            type: 'string',
            optional: true
        },
        type: {
            type: 'string',
            optional: true
        },
    }

};

export default Question;
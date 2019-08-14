'use strict';

import Realm from 'realm';

export const COMPANY_SCHEMA = 'Company';
export const COMPANY_LIST_SCHEMA = 'Company[]';

class Company extends Realm.Object {}
Company.schema = {
    name: COMPANY_SCHEMA,
    primaryKey: '_id',
    properties: {
        _id: {
            type: 'string',
            optional: true
        },
        name: {
            type: 'string',
            optional: true
        },
        email: {
            type: 'string[]',
            default: []
        },

    }

};

export default Company;
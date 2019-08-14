import React, {Component} from 'react';
import SocketIOClient from "socket.io-client";
import * as axios from 'axios';
import {CHAT_SOCKET_URL} from "../endpoints";
import {API_BASE_URL, BUGSNAG_KEY} from '../config';
import { isUpdateGroupEvent } from "../utils/EventUtil";
import {getGroupUserDetails} from "../utils/common";
import {UpdateUserTaskGroup, getUserTaskGroupsById} from '../utils/grouputil';
import {UpdateGroup} from '../realm/RealmHelper';
import {Client} from 'bugsnag-react-native';
const bugsnag = new Client(BUGSNAG_KEY);


const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 25000,
    headers: {'Content-type': 'application/json'}
});

export default class BaseComponent extends Component{

    constructor(props) {
        super(props);
        this.onReceivedMessage = this.onReceivedMessage.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
    }


    componentDidMount(): void {
      console.log("BASECOMPONENT: componentdidmount");
        let user = this.props.user;
        let query = `userID=${user._id}&username=${user._id}&firstName=${user.profile.firstName ? user.profile.firstName : ''}&lastName=${user.profile.lastName ? user.profile.lastName : ''}&userType=test`;
        this.socket = SocketIOClient(CHAT_SOCKET_URL, {query: query, transports: ['websocket']});
        this.socket.on('server:message', this.onReceivedMessage);

    }

    _fetchMessages(email) {
        const data = {
            email: email
        };

        this.props.messageActions.getMessages(data); //messageActions is undefind because its not bound with BaseComponent
    }

    onReceivedMessage(message) {
      console.log("BASECOMPONENT: onreceivedmessage: ", message);
        if (isUpdateGroupEvent(message.type))
        {
            this.refreshUserTask()
        };
    }


    refreshUserTask = () => {
      console.log("BASECOMPONENT: refreshingusertask");
         // fetch latest userTaskGroups
        // refresh the redux state
        instance.get(`${API_BASE_URL}/userTaskGroupWithMessage?user_email=${this.props.user.profile.email}`)
            .then((response) => {
                if (response && response.data && response.data.latestUserTaskGroups) {

                    // populate _team.emails with userDetails
                    // with getGroupUserDetails() from utils/common.js
                    let _data = getGroupUserDetails(response.data)
                    this.setState({
                        userTaskGroups: _data.latestUserTaskGroups
                    })
                    // refresh redux state
                    this.props.userActions.getUserTaskGroupsCompleted({
                        ...this.props.taskGroups,
                        taskGroups: [..._data.latestUserTaskGroups]
                    });
                    let latestUserTaskGroups = [..._data.latestUserTaskGroups];
                    let id = this.props.navigation.state.params.task_group_id;

                    console.log('BASECOMPONENT: latest usertaskgroups filter', latestUserTaskGroups)
                    let taskGroup = id && latestUserTaskGroups.filter(t => t._id === id)[0] || {};

                    //UpdateUserTaskGroup(taskGroup);
                    UpdateGroup(_data.latestUserTaskGroups);
                    // update the component state
                    // refreshed state will reflect on UI

                    this.setState((prevState, props) => {
                        return {
                            ...prevState,
                            taskGroup: {
                                ...prevState.taskGroup,
                                ...taskGroup
                            }
                        }
                    });
                    console.log("BASECOMPONENT: setting state after syncing with server");
                }
            })
            // .then((responseJson) => console.log(JSON.stringify(responseJson, undefined, 2)))
            .catch((error) => bugsnag.notify(error))
        }

    //save message in redux.
    _storeMessages(messages) {

    }
}

import React, {Component} from 'react';
import {ImageBackground, TouchableOpacity, View} from 'react-native';
import {Form, Input, Item, Text} from 'native-base';

import styles from '../../stylesheets/login/step1Styles';

export default class Step1 extends Component {
    render() {
        const {email, onChange, onEmailSubmit} = this.props;

        return (
            <Form>
                <Item rounded style={styles.textInput}>
                    {/*<Label style={styles.inputLabel}>Enter your email</Label>*/}
                    <Input
                        style={styles.textInput}
                        value={email}
                        placeholder="Enter your email"
                        onChangeText={value => onChange('email', value)}
                    />
                </Item>
                <View style={styles.margin10}>
                    <ImageBackground style={{width: '100%', height: 57}} source={require('../../images/Rectangle.png')}>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={onEmailSubmit}
                        >
                            <Text style={styles.loginText}>Next</Text>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
            </Form>
        );
    }
}


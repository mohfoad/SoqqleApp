import React, {Component} from 'react';
import {ImageBackground, TouchableOpacity, View, Image} from 'react-native';
import {Button, Form, Input, Item, Text} from 'native-base';

import styles from '../../stylesheets/login/step2Styles';

export default class Step2 extends Component {
    render() {
        const {password, onChange, onLogin, showforgotPasswordView, onOtherEmail,showPassword3} = this.props;
        return (
            <Form>
                <Item rounded style={styles.textInput}>
                    <Input
                        style={[styles.textInput,styles.InputPassword]}
                        secureTextEntry={showPassword3}
                        value={password}
                        placeholder='Password'
                        onChangeText={value => onChange('password', value)}
                    />
                <TouchableOpacity style={styles.passwordIconValidationEyeContainer} onPress={()=>{
                        onChange('showPassword3', !showPassword3)
                    }}>
                     <Image
                        source={showPassword3 ? require('../../images/eyeBlur.png'):require('../../images/eye.png')}
                        style={styles.passwordIconValidationEye}
                    />
                    </TouchableOpacity>
                </Item>
                {/*<Button transparent style={styles.btnForgotPwd} onPress={onOtherEmail}>
                    <Text style={styles.textForgotpassword}>Login with other email</Text>
                </Button>*/}
                <View style={styles.margin10}>
                    <ImageBackground style={{width: '100%', height: 57}} source={require('../../images/Rectangle.png')}>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={onLogin}
                        >
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                    </ImageBackground>
                </View>
                <Button transparent style={[styles.btnForgotPwd, styles.margin10]} onPress={showforgotPasswordView}>
                    <Text style={styles.textForgotpassword}>Forgot password?</Text>
                </Button>
            </Form>
        );
    }
}


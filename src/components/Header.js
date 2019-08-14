import React from 'react';
import {Text, View, TouchableOpacity, DeviceEventEmitter, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './../stylesheets/HeaderStyles';


export default Header = props => {
    return (
        <View style={{...styles.header, ...props.headerStyle}}>
            <TouchableOpacity onPress={() => props.navigation.pop()} style={styles.headerLeft}>
                <Icon
                    name='chevron-left'
                    style={{...styles.headerBackIcon, ...props.headerIconStyle}}
                />

            </TouchableOpacity>
            <View style={{justifyContent: 'center'}}>
                <Text style={{...props.fontStyle}}>{props.title}</Text>
                {
                    props.showbottomText &&
                    <Text style={styles.bottomTextStyle} disabled={!props.bottomText}>{props.bottomText}</Text>
                }
            </View>
            <TouchableOpacity
                disabled={!props.rightText}
                style={styles.headerRight}
                activeOpacity={0.8}
                onPress={props.onRight}
            >
                {
                    props.showForwardIcon &&
                    <Icon
                        name='share'
                        style={{...styles.headerBackIcon, ...props.headerIconStyle, ...styles.headerRightIconStyle}}
                        onPress={props.onRight}
                    />
                }

                {
                    props.ShowInfoIcon &&
                    <TouchableOpacity onPress={() =>
                        props.onInfoPress.navigate("InfoView", {taskGroup: props.TaskGroupData})
                    }>
                        <Image
                            source={require('../images/info.png')}/>
                    </TouchableOpacity>
                }
                <Text style={{...styles.headerRightText, ...props.headerRightTextStyle}}>{props.rightText}</Text>
            </TouchableOpacity>
        </View>
    );
};

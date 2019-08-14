import {Platform, StyleSheet} from 'react-native';

const fontFamilyName = Platform.OS === 'ios' ? "SFUIDisplay-Regular" : "SF-UI-Display-Regular";

export default StyleSheet.create({
    container:{
        marginTop: 40,
        flex:1,
        width: window.width,
        height: window.height,
    },
    item: {
        paddingTop: 5,
        color: '#9601a1',
    },
});

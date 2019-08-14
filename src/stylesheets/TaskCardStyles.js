import {Dimensions, StyleSheet} from 'react-native';

export const {width, height} = Dimensions.get('window');

export default StyleSheet.create({
    keyText: {
      color: '#fff',
      fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingTop: 5,
    },
    swipeItem: {
        width: width - 20,
        // alignSelf: 'center',
        borderRadius: 5,
        marginVertical: 6,
    },
    topWrapper: {
        padding: 10,
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        // alignItems: 'center'
    },
    subItems:{
        flexDirection: 'row'
    },
    textWhite: {
        color: '#FFFFFF'
    },
    eyeIcon: {
        fontSize: 20,
        paddingHorizontal: 10,
        marginLeft: 5
    },
    facePile: {
        width: '100%',
        justifyContent: 'flex-end',
        padding: 10,
        borderColor: 'white'
    },
    memberWrapper: {
        backgroundColor: '#1FBEB8',
        flex: 1,
        flexDirection: 'column'
    },
    taskItem: {
        backgroundColor: '#FFFFFF',
        padding: 10,
    },
    taskItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    taskItemName: {
        fontSize: 20,
        letterSpacing: 1,
        color: '#000000',
        width: '90%'
    },
    taskItemSize: {
        color: '#1FBEB8',
        fontSize: 16,
    },
    taskItemDescription: {
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: 14,
    },
    taskItemTime: {
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: 14,
    },
    taskItemFooter: {
        marginTop: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskItemExpiry: {
        color: '#2C2649',
        fontSize: 14,
    },
    taskItemExpiryIcon: {},
    taskItemXP: {
        color: '#9600A1',
        fontSize: 19,
    },
    listLoader: {
        paddingVertical: 10,
    },
});

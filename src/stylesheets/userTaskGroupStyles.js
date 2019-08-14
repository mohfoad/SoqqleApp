import {Platform, StyleSheet} from 'react-native';

const statusBarHeight = Platform.OS === 'ios' ? 0 : 0;

export default StyleSheet.create({
    container: {
        padding: 0,
        paddingTop: statusBarHeight,
        backgroundColor: '#2C2649',
        flex: 1,
    },
    activityLoaderContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskItem: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 6,
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
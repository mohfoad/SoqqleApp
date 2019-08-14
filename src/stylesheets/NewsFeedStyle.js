import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { StyleSheet, Dimensions } from 'react-native'

import { MAIN_COLOR } from '../constants'
const { width, height } = Dimensions.get('window')

export default StyleSheet.create({
  horizontalContent: {
    padding: 10,
    maxHeight: 150,

  },
  horizontalContentViewOne: {
    flexDirection: 'row'
  },
  horizontalContentViewTwo: {
    flex: 3,
    height: 130,
    alignSelf: 'flex-start'
  },
  horizontalContentViewImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#9601a1',
    marginTop: 10,
    marginLeft: 8,
    padding: 2
  },
  horizontalContentImageView: {
    height: 90,
    width: 90,
    borderRadius: 50
  },
  horizontalContentViewImageBackground: {
    flexDirection: 'row',
    marginTop: 95,
    marginLeft: 80,
    position: 'absolute'
  },
  tabStyle:{
    backgroundColor: '#9601a1', 
    borderBottomWidth: 5,
     borderBottomColor: '#ce93d2'
  },
  tabTextStyle:{
    color: '#fff'
  },
  tabActiveTabStyle:{
    backgroundColor: '#9601a1'
  },
  favouriteIconStyle:{
    maxHeight: 20, 
    maxWidth: 20, 
    borderRadius: 7
  },
  chatIconStyle:{

  },



})

import React, {Component} from 'react';
import {Text, View, FlatList, ImageBackground} from 'react-native';
import {Picker, Form} from 'native-base';

export default class SparkView extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render () {

    const uri = this.props.navigation.getParam('uri')
    return (
      <View>
        <ImageBackground
          source={{ uri: uri ? uri : "" }}
          style={[
            { width: "100%", height: "100%" },
            { backgroundColor: uri ? "" : "black" }
          ]}
        >

        </ImageBackground>
      </View>
    )
  }
}
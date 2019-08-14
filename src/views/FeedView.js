import React, { Component } from 'react';
import { Image, Dimensions, ScrollView, TouchableHighlight, StyleSheet,TouchableOpacity } from 'react-native';
import { Container, Header, Content, Card, CardItem, Body, Text, Icon, Left, Right, Button, Thumbnail, List, ListItem, Tab, Tabs, ScrollableTab, DeckSwiper, View, Badge } from 'native-base';
import styles from '../stylesheets/NewsFeedStyle';

import SideMenu from 'react-native-side-menu'

import SideBarMenu from '../components/SideBarMenu';
import {NavigationActions, StackActions} from "react-navigation";
import MixPanel from "react-native-mixpanel";

const { width, height } = Dimensions.get('window')
const cards = [
    {
        text: 'Card One',
        name: 'One',
        image: require('../images/Soldier.png'),
    },
    {
        text: 'Card two',
        name: 'One',
        image: require('../images/Soldier.png'),
    },
    {
        text: 'Card three',
        name: 'One',
        image: require('../images/Soldier.png'),
    }
];


export default class FeedView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showRealApp: false,
            index: 1,
            skip: true,
            loading: true,
            isSidebarOpen: false,
        };
    }
    openSidebar(){
        this.setState({isSidebarOpen: !this.state.isSidebarOpen})
    }


    logout = () => {
        this.props.userActions.logout();
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Login' })],
        });
        this.props.navigation.dispatch(resetAction);
    };
    goUserListView = () => {
        const { userActions } = this.props;
        userActions.blockUserListRequested(this.props.user.blockUserIds);
    };

    render() {

        const menu =  <SideBarMenu goUserListView={this.goUserListView} logout={this.logout}/>

        return (

            <Container >
                <SideMenu  menu={menu} menuPosition='right' isOpen={this.state.isSidebarOpen}>
                    <Header  style={{backgroundColor:'white', height:80  }}>
                        <View style={{height:70, flexDirection:'row', flex:1, marginTop:10}}>
                            <View style={{ height: 70, flex: 0.8, flexDirection: 'row'}}>
                                <Button transparent vertical style={{ width: 80, borderWidth: 0 }}>

                                    <Image
                                        style={{ height: 30, width: 30, }}
                                        source={require('../images/icon_group.png')}
                                    />
                                    <View style={{ backgroundColor: 'red', borderRadius: 10, zIndex: 2, top: -8, left:10 }}>
                                        <Text style={{ fontSize: 10, color: 'white', marginHorizontal: 5,}}>99+</Text>
                                    </View>
                                    <Text uppercase={false} style={{
                                        fontSize: 8,
                                        color: '#9601a1',
                                        top: -8
                                    }} >Groups</Text>
                                </Button>
                                <Button transparent vertical style={{  width: 80 }}>

                                    <Image
                                        style={{ height: 30, width: 30, }}
                                        source={require('../images/icon_chat.png')}
                                    />
                                    <View style={{ backgroundColor: 'red', borderRadius: 10, zIndex: 2, top: -8, left: 10 }}>
                                        <Text style={{ fontSize: 10, color: 'white', marginHorizontal: 5, }}>99+</Text>
                                    </View>
                                    <Text uppercase={false} style={{
                                        fontSize: 8,
                                        top:-8,
                                        color: '#9601a1',
                                    }} >Messages</Text>
                                </Button>

                                <Button transparent vertical style={{ width: 80 }}>
                                    <Image
                                        style={{ height: 30, width: 30, }}
                                        source={require('../images/icon_notification.png')}
                                    />
                                    <View style={{ backgroundColor: 'red', borderRadius: 10, zIndex: 2, top: -8, left: 10 }}>
                                        <Text style={{ fontSize: 10, color: 'white', marginHorizontal: 5, }}>99+</Text>
                                    </View>
                                    <Text uppercase={false} style={{ top:-8,fontSize: 8, color: '#9601a1' }} >Notification</Text>
                                </Button>

                            </View>

                            <View style={{flex:0.2}}>
                                <Button transparent vertical style={{ width: 80 }} onPress={()=>this.openSidebar()}>
                                    <Image
                                        style={{ height: 30, width: 30, }}
                                        source={require('../images/settings.png')}
                                    />
                                </Button>
                            </View>
                        </View>


                    </Header>
                    <ScrollView
                        behaviour="height"
                        keyboardVerticalOffset={64}
                        style={{ marginTop: '1%', flex: 1 }}
                    >
                        <View style={{ backgroundColor: '#56478C' }}>
                            <Content>

                                <View>
                                    <View style={{flex:1,flexDirection:'row'}} >

                                        <View style={{ height: 95, width: 95, borderRadius: 45, borderWidth: 3, borderColor: '#9601a1', marginTop: 20, marginLeft: 8,  }}>
                                            <TouchableOpacity onPress={()=> this.props.navigation.navigate({routeName: "Profile"})}>
                                                <Image
                                                    style={{ height: 90, width: 90, borderRadius: 45 }}
                                                    resizeMode='cover'
                                                    source={require('../images/Soldier.png')}
                                                    blurRadius={0}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity style={{
                                            flexDirection: 'row',
                                            marginTop: 95,
                                            marginLeft: 80,
                                            position: 'absolute'
                                        }}>


                                            <Image
                                                style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: '#FFF' }}
                                                resizeMode='cover'
                                                source={require('../images/plus.png')}

                                            />
                                        </TouchableOpacity>
                                        <View style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            borderRadius: 10,
                                            backgroundColor: '#9600a1', padding: 0, marginHorizontal:20, marginVertical:10
                                        }}>

                                            <View style={{flexDirection:'row', marginHorizontal:10, marginTop:10}}>

                                                <View>
                                                    <Text style={{ fontWeight: '500', color: 'white', fontSize: 15 }}>Introduction Blockchain</Text>

                                                </View>

                                                <Right style={{justifyContent:'flex-start'}}>
                                                    <Image
                                                        style={{ height: 20, width: 20, }}
                                                        resizeMode='cover'
                                                        source={require('../images/logout_fill.png')}
                                                        blurRadius={0}
                                                    />
                                                </Right>
                                            </View>

                                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 7 }}>

                                                <View>
                                                    <Text style={{ fontWeight: '400', color: 'white', fontSize: 15 }}>Braindump</Text>
                                                </View>
                                            </View>

                                            <ListItem noBorder>
                                                <Left >
                                                    <Image
                                                        style={{ height: 20, width: 20, }}
                                                        resizeMode='cover'
                                                        source={require('../images/user-silhouette.png')}
                                                        blurRadius={0}
                                                    />
                                                    <Text style={{ fontStyle: 'normal', color: 'white', fontSize: 15, marginLeft: 5 }}>5</Text>
                                                </Left>
                                                <Body style={{ width: 150}}>
                                                <TouchableOpacity style={{  height:30,
                                                    backgroundColor: "#20beb8",
                                                    justifyContent:'center',
                                                    alignItems:'center',
                                                    borderRadius:15 }}>
                                                    <Text uppercase={false} style={{ fontSize: 14,color:'white' }}>Start Task</Text>
                                                </TouchableOpacity>
                                                </Body>
                                            </ListItem>

                                        </View>
                                    </View>

                                </View>
                            </Content>

                            <ScrollView
                                style={{ maxHeight: 175 }}
                                horizontal={true}>
                                <Content style={{ marginHorizontal: 10, marginBottom: 10, height: 120 }}>
                                    <Image
                                        style={{ height: 120, width: 75, borderRadius: 7 }}
                                        resizeMode='cover'
                                        source={require('../images/Soldier.png')}

                                    />
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'flex-end',
                                        marginTop: 35,
                                        justifyContent: 'flex-start',
                                        marginLeft: 8,
                                        // flex: 1,
                                        position: 'absolute',
                                    }}>
                                        <Image
                                            style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 3, borderColor: '#9601a1' }}
                                            resizeMode='cover'
                                            source={require('../images/Soldier.png')}

                                        />
                                    </View>
                                </Content>

                                <Content style={{ marginHorizontal: 10, marginBottom: 10, height: 120 }}>
                                    <Image
                                        style={{ height: 120, width: 75, borderRadius: 7 }}
                                        resizeMode='cover'
                                        source={require('../images/Soldier.png')}

                                    />
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'flex-end',
                                        marginTop: 35,
                                        justifyContent: 'flex-start',
                                        marginLeft: 8,
                                        position: 'absolute',
                                    }}>
                                        <Image
                                            style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 3, borderColor: '#9601a1' }}
                                            resizeMode='cover'
                                            source={require('../images/Soldier.png')}
                                            blurRadius={0}
                                        />
                                    </View>
                                </Content>


                                <Content style={{ marginHorizontal: 10, marginBottom: 10,  height: 120 }}>
                                    <Image
                                        style={{ height: 120, width: 75, borderRadius: 7 }}
                                        resizeMode='cover'
                                        source={require('../images/Soldier.png')}

                                    />
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'flex-end',
                                        marginTop: 35,
                                        justifyContent: 'flex-start',
                                        marginLeft: 8,
                                        //   flex: 1,
                                        position: 'absolute',
                                    }}>
                                        <Image
                                            style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 3, borderColor: '#9601a1' }}
                                            resizeMode='cover'
                                            source={require('../images/Soldier.png')}
                                            blurRadius={0}
                                        />
                                    </View>
                                </Content>

                                <Content style={{ marginHorizontal: 10, marginBottom: 10,  height: 120 }}>
                                    <Image
                                        style={{ height: 120, width: 75, borderRadius: 7 }}
                                        resizeMode='cover'
                                        source={require('../images/Soldier.png')}

                                    />
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'flex-end',
                                        marginTop: 35,
                                        justifyContent: 'flex-start',
                                        marginLeft: 8,
                                        //  flex: 1,
                                        position: 'absolute',
                                    }}>
                                        <Image
                                            style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 3, borderColor: '#9601a1' }}
                                            resizeMode='cover'
                                            source={require('../images/Soldier.png')}
                                            blurRadius={0}
                                        />
                                    </View>
                                </Content>


                                <Content style={{ marginHorizontal: 10, marginBottom: 10,  height: 120 }}>
                                    <Image
                                        style={{ height: 120, width: 75, borderRadius: 7 }}
                                        resizeMode='cover'
                                        source={require('../images/Soldier.png')}
                                    />
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'flex-end',
                                        marginTop: 35,
                                        justifyContent: 'flex-start',
                                        marginLeft: 8,
                                        //  flex: 1,
                                        position: 'absolute',
                                    }}>
                                        <Image
                                            style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 3, borderColor: '#9601a1' }}
                                            resizeMode='cover'
                                            source={require('../images/Soldier.png')}
                                            blurRadius={0}
                                        />
                                    </View>
                                </Content>
                            </ScrollView>

                            <Tabs locked tabBarUnderlineStyle={{ height: 5, backgroundColor: 'white' }} >
                                <Tab heading="MyFeed" tabStyle={{ backgroundColor: '#9601a1', borderBottomWidth: 5, borderBottomColor: '#ce93d2' }} textStyle={{ color: '#fff' }} activeTabStyle={{ backgroundColor: '#9601a1', }} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
                                    <ScrollView>

                                        <Content style={{ padding: 15 }}>
                                            <Card style={{ flex: 0, borderRadius: 5 }}>
                                                <CardItem style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                                                    <Body>
                                                    <Text style={{ fontSize: 13 }}>
                                                        This is a great question.I didn't think that artificial intelligence can be used in so many interesting ways.I'm personally quite excited and keen in the mind use cases.What do you guys think?
                                                    </Text>
                                                    </Body>
                                                </CardItem>

                                                <CardItem style={{ backgroundColor: '#E6E6FA' }}>
                                                    <Left>
                                                        <Thumbnail style={{ minHeight: 70, minWidth: 70, borderRadius: 7 }} source={require('../images/Soldier.png')} />
                                                        <Body style={{ marginBottom: 5 }}>
                                                        <Text style={{ fontSize: 10, color: '#000000', fontWeight: "bold" }}>What are common cyber security attacks in blockchain?</Text>
                                                        <Text note style={{ fontSize: 10, color: '#000000' }}>This is a great question.I didn't think that artificial intelligence can be used in so many....
                                                            <Text note style={{ fontSize: 10, color: '#000000' }} button onPress={() => alert("This is Card Body")}> more</Text></Text>
                                                        </Body>
                                                    </Left>
                                                </CardItem>
                                                <CardItem style={{ height: 50, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                                                    <Left>
                                                        <Thumbnail style={styles.favouriteIconStyle} source={require('../images/heartIcon.png')} />
                                                        <Text style={{ minWidth: 35, marginBottom: 5, color: '#d599d9', fontWeight: "bold" }}>7</Text>
                                                        <Thumbnail style={styles.favouriteIconStyle} source={require('../images/bubbleIcon.png')} />
                                                        <Text style={{ marginBottom: 5, color: '#d599d9', fontWeight: "bold" }}>3</Text>
                                                    </Left>

                                                    <Right>
                                                        <Button small rounded style={{ backgroundColor: '#D3D3D3' }}>
                                                            <Text>+ Tip</Text>
                                                        </Button>
                                                    </Right>
                                                </CardItem>
                                            </Card>

                                        </Content>

                                        <Content style={{ padding: 15 }}>
                                            <Card style={{ flex: 0, borderRadius: 5 }}>
                                                <CardItem style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                                                    <Body>
                                                    <Text style={{ fontSize: 13 }}>
                                                        This is a great question.I didn't think that artificial intelligence can be used in so many interesting ways.I'm personally quite excited and keen in the mind use cases.What do you guys think?
                                                    </Text>
                                                    </Body>
                                                </CardItem>

                                                <CardItem style={{ backgroundColor: '#E6E6FA' }}>
                                                    <Left>
                                                        <Thumbnail style={{ minHeight: 70, minWidth: 70, borderRadius: 7 }} source={require('../images/Soldier.png')} />
                                                        <Body style={{ marginBottom: 5 }}>
                                                        <Text style={{ fontSize: 10, color: '#000000', fontWeight: "bold" }}>What are common cyber security attacks in blockchain?</Text>
                                                        <Text note style={{ fontSize: 10, color: '#000000' }}>This is a great question.I didn't think that artificial intelligence can be used in so many....
                                                            <Text note style={{ fontSize: 10, color: '#000000' }} button onPress={() => alert("This is Card Body")}> more</Text></Text>
                                                        </Body>
                                                    </Left>
                                                </CardItem>
                                                <CardItem style={{ height: 50, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                                                    <Left>
                                                        <Thumbnail style={styles.favouriteIconStyle} source={require('../images/heartIcon.png')} />
                                                        <Text style={{ minWidth: 35, marginBottom: 5, color: '#d599d9', fontWeight: "bold" }}>7</Text>
                                                        <Thumbnail style={styles.favouriteIconStyle} source={require('../images/bubbleIcon.png')} />
                                                        <Text style={{ marginBottom: 5, color: '#d599d9', fontWeight: "bold" }}>3</Text>
                                                    </Left>

                                                    <Right>
                                                        <Button small rounded style={{ backgroundColor: '#D3D3D3' }}>
                                                            <Text>+ Tip</Text>
                                                        </Button>
                                                    </Right>
                                                </CardItem>
                                            </Card>

                                        </Content>

                                    </ScrollView>




                                </Tab>
                                <Tab heading="Soggle" tabStyle={styles.tabStyle} textStyle={styles.tabTextStyle} activeTabStyle={styles.tabActiveTabStyle} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
                                </Tab>
                                <Tab heading="Projects" tabStyle={styles.tabStyle} textStyle={styles.tabTextStyle} activeTabStyle={styles.tabActiveTabStyle} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
                                </Tab>
                                <Tab heading="Blockchain" tabStyle={styles.tabStyle} textStyle={styles.tabTextStyle} activeTabStyle={styles.tabActiveTabStyle} activeTextStyle={{ color: '#fff', fontWeight: 'normal' }}>
                                </Tab>
                            </Tabs>

                        </View>
                    </ScrollView>

                </SideMenu>
            </Container>

        );


    }
}

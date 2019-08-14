import React from 'react';
import {Container, Text, List, ListItem,Content, Separator, Left, Body} from 'native-base';
import {TouchableOpacity, Image} from 'react-native'


import styles from './../stylesheets/SideBarMenuStyles';

const SidebarMenu = ({goUserListView , logout})=>{

    return (
        <Container style={styles.container}>
            <Content>
                <List>
                    <ListItem>

                        <Body>
                            <Text style={styles.item}>Settings</Text>
                        </Body>
                    </ListItem>
                    <Separator/>
                    <ListItem>
                        <Left>
                            <Image
                                style={{ height: 20, width: 20, }}
                                source={require('../images/Export.png')}
                            />
                        </Left>
                        <Body>
                            <Text style={styles.item}>Export</Text>
                        </Body>
                    </ListItem>
                    <ListItem>
                        <Left>
                            <Image
                                style={{ height: 20, width: 20, }}
                                source={require('../images/Feedback.png')}
                            />

                        </Left>
                        <Body>
                            <Text style={styles.item}>Send Feedback</Text>
                        </Body>
                    </ListItem>
                    <ListItem >
                        <Left>
                            <Image
                                style={{ height: 20, width: 20, }}
                                source={require('../images/question-mark.png')}
                            />

                        </Left>
                        <Body>
                        <Text style={styles.item}>FAQ</Text>
                        </Body>
                    </ListItem>
                    <ListItem button onPress={()=>goUserListView()}>
                        <Left>
                            <Image
                                style={{ height: 20, width: 20, }}
                                source={require('../images/Block.png')}
                            />

                        </Left>
                        <Body>
                            <Text style={styles.item}>Blocked</Text>
                        </Body>
                    </ListItem>
                    <ListItem button onPress={()=>logout()}>
                        <Left>
                            <Image
                                style={{ height: 20, width: 20, }}
                                source={require('../images/LogoutPurple.png')}
                            />
                        </Left>
                        <Body>
                            <Text style={styles.item}>Logout</Text>
                        </Body>
                    </ListItem>

                </List>
            </Content>
        </Container>
    )

}


export default SidebarMenu

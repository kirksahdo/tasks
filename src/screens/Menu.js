import React from 'react'
import {ScrollView, StyleSheet, Text, View, StatusBar, TouchableOpacity} from 'react-native'
import {DrawerItems} from 'react-navigation-drawer'

import {Gravatar} from 'react-native-gravatar'
import commonStyles from '../commonStyles'
import api from '../services/api'
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome'

export default props => {

    const logout = () => {
        delete api.defaults.headers.common['Authorization']
        AsyncStorage.removeItem('userData')
        props.navigation.navigate('AuthOrApp')
    }

    return (
        <ScrollView>
            <View style={styles.header}>
                <Text style={styles.title}>Tasks</Text>
                <Gravatar style={styles.avatar}
                    options={{
                        email: props.navigation.getParam('email'),
                        secure: true
                    }} />
                <View style = {styles.userInfo}>
                    <Text style={styles.name}>{props.navigation.getParam('name')}</Text>
                    <Text style={styles.email}>{props.navigation.getParam('email')}</Text>
                </View>
                <TouchableOpacity onPress={logout}>
                    <View style={styles.logoutIcon}>
                        <Icon name='sign-out' size={30} color='#800' /> 
                    </View>
                </TouchableOpacity>
            </View>
            <DrawerItems {...props} />
        </ScrollView>
    )
}



const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderColor: '#DDD',
        marginTop: StatusBar.currentHeight
    },
    title: {
        color: '#000',
        fontFamily: commonStyles.fontFamily,
        fontSize: 30,
        paddingTop: 30,
        padding: 10
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 30,
        margin: 5
    },
    userInfo: {
        padding: 10
    },
    name: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 20,
        color: commonStyles.colors.Text,
        marginTop: 10
    },
    email: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 15,
        color: commonStyles.colors.subText
    },
    logoutIcon: {
        marginLeft: 10
    }

})
import React, {Component} from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import StatusBarTask from '../components/StatusBarTask'

import api from '../services/api'
import AsyncStorage from '@react-native-community/async-storage'

export default class AuthOrApp extends Component{

    async componentDidMount() {
        const userDataJSON = await AsyncStorage.getItem('userData')
        let userData = null
        try{
            userData = JSON.parse(userDataJSON)
        }catch(e){
            //userData inválido
        }
        if(userData && userData.token){
            api.defaults.headers.common['Authorization'] = `bearer ${userData.token}`
            this.props.navigation.navigate('Home', userData)
        }else{
            this.props.navigation.navigate('Auth')
        }
            
    }

    render(){
        return (
            <View style={styles.container}>
                <StatusBarTask backgroundColor='#000'
                    barStyle="light-content"/>
                <ActivityIndicator size='large' />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black'
    }
})
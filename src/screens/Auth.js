import React, {Component} from 'react'
import { ImageBackground, Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native'

import backgroundImage from '../../assets/imgs/login.jpg'
import commonStyles from '../commonStyles'
import { showError, showSuccess } from '../utils'
import api from '../services/api'
import AsyncStorage from '@react-native-community/async-storage'
import AuthInput from '../components/AuthInput'


const initialState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    stageNew: false
}


export default class Auth extends Component{

    state = {...initialState}

    signinOrSignup = () => {
        if(this.state.stageNew){
            this.signUp()
        }else{
            this.signIn()
        }
    }

    signUp = async() => {
        if(!this.validateSignUpFields()) return
        try{
            await api.post('signup', {
                email: this.state.email,
                password: this.state.password,
                name: this.state.name
            })
            showSuccess("Usuário cadastrado com sucesso!")
            this.setState(initialState)
        }
        catch(err){
            showError(err)
        }
    }

    signIn = async () => {
        if(!this.validateSignInFields()) return
        try{
            const response = await api.post('signin', {
                email: this.state.email,
                password: this.state.password
            })
            AsyncStorage.setItem('userData', JSON.stringify(response.data))
            api.defaults.headers.common['Authorization'] = `bearer ${response.data.token}`
            this.props.navigation.navigate('Home', response.data)
            this.props.navigation.goBack(null)
        }
        catch(err){
            showError('e-mail ou senha inválidos!')
        }
    }

    validateSignUpFields = () => {
        if(!this.state.email.trim() || !this.state.password.trim() || !this.state.confirmPassword.trim() || !this.state.name.trim()){
            showError('você deve preencher todos os campos!')
            return false
        }
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(String(this.state.email).toLowerCase())){
            showError('email inválido!')
            return false
        }
        if(this.state.password != this.state.confirmPassword){
            showError('as senhas precisam ser idênticas!')
            return false
        }
        if(this.state.password.length < 6){
            showError('a senha deve conter no mínimo 6 caracteres!')
            return false
        }
        return true
    }

    validateSignInFields = () => {
        if(!this.state.email.trim() || !this.state.password.trim()){
            showError('você deve preencher todos os campos!')
            return false
        }
        return true
    }
    
    render(){
        

        return(
            <ImageBackground source={backgroundImage}
                style = {styles.background}>
                <Text style={styles.title}>Tasks</Text>
                <View style={styles.formContainer}>
                    <Text style={styles.subtitle}>
                        {this.state.stageNew ? 'Crie a sua conta' : 'Informe seus dados'}
                    </Text>
                    {this.state.stageNew &&
                        <AuthInput icon='user' placeholder='Nome' value={this.state.name}
                            style={styles.input} onChangeText={name => this.setState({name})}/>
                    }
                    <AuthInput icon='at' placeholder='E-mail' value={this.state.email}
                        style={styles.input} onChangeText={email => this.setState({email})}/>
                    <AuthInput icon='lock' placeholder='Senha' value={this.state.password} secureTextEntry={true}
                        style={styles.input} onChangeText={password => this.setState({password})}/>
                    {this.state.stageNew &&
                        <AuthInput icon='asterisk' placeholder='Confirmação de Senha' value={this.state.confirmPassword} secureTextEntry={true}
                            style={styles.input} onChangeText={confirmPassword => this.setState({confirmPassword})}/>
                    }
                    <TouchableOpacity onPress={this.signinOrSignup}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>{this.state.stageNew ? 'Cadastrar' : 'Entrar'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ padding: 10 }} onPress={() => this.setState({stageNew:!this.state.stageNew})}>
                        <Text style={styles.buttonText}> {this.state.stageNew ? 'Já possui conta?' : 'Ainda não possui conta?'} </Text>
                </TouchableOpacity>
            </ImageBackground>
        )
    }

}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },  
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 70,
        marginBottom: 10
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: '#FFF',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10
    },  
    formContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        width: '90%'
    },  
    input: {
        backgroundColor: '#FFF',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#080',
        marginTop: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 7
    },
    buttonText: {
        fontFamily: commonStyles.fontFamily,
        color: '#FFF',
        fontSize: 20
    }
})
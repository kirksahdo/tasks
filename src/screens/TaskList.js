import React, {Component} from 'react';
import { Alert,  View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from '@react-native-community/async-storage'

import moment from 'moment'
import 'moment/locale/pt-br'


import commonStyles from '../commonStyles'
import todayImage from '../../assets/imgs/today.jpg'
import Task from '../components/Task'
import AddTask from './AddTask';
import api from '../services/api'
import { showError } from '../utils';

const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks: []
}

export default class TaskList extends Component {

    state = {...initialState}


    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('tasksState')
        const state = JSON.parse(stateString) || initialState
        this.setState({
            showDoneTasks: state.showDoneTasks
        }, this.filterTasks)

        this.loadTasks()
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.loadTasks)
    }

    loadTasks = async() => {
        try {
            const maxDate = moment().format('YYYY-MM-DD 23:59:59')
            const response = await api.get(`tasks?date=${maxDate}`)
            this.setState({tasks: response.data}, this.filterTasks)
        }catch(err){
            showError(err)
        }
    }

    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks){
            visibleTasks = [...this.state.tasks]
        }else{
            const pending = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pending)
        }

        this.setState({visibleTasks})
        AsyncStorage.setItem('tasksState', JSON.stringify({
            showDoneTasks: this.state.showDoneTasks
        }))
    }

    toggleTask = async taskId => {
        try{
            await api.put(`tasks/${taskId}/toggle`)
            this.loadTasks()
        }catch(err){
            showError(err)
        }
    }

    addTask = async newTask => {
        if(!newTask.desc || !newTask.desc.trim()){
            Alert.alert('Dados inválidos', 'Descrição não informada!')
            return
        }
        
        try{
            await api.post('tasks', {
                desc: newTask.desc,
                estimateAt: newTask.date
            })
            this.setState({showAddTask: false}, this.loadTasks)
        }catch(err){
            showError(err)
        }
    }

    deleteTask = async id => {
        try{
            await api.delete(`/tasks/${id}`)
            this.loadTasks()
        }catch(err){
            showError(err)
        }
    }

    render(){
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <AddTask isVisible = {this.state.showAddTask}
                    onCancel={() => this.setState({showAddTask: false})}
                    onSave={this.addTask} />
                <ImageBackground source={todayImage}
                    style={styles.background}>
                    <View style ={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'}
                                size={20} color={commonStyles.colors.secondary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList data={this.state.visibleTasks} 
                        keyExtractor={item => `${item.id}`}
                        renderItem={({item}) => <Task {...item} toggleTask={this.toggleTask} onDelete={this.deleteTask} /> }/>
                </View>
                <TouchableOpacity style={styles.addButton} 
                    activeOpacity={0.7}
                    onPress={() => this.setState({showAddTask: true}) }>
                    <Icon name='plus' size={20} color={commonStyles.colors.secondary}/>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 3,
    },
    taskList: {
        flex: 7,
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 50,
        color: commonStyles.colors.secondary,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: Platform.OS === 'ios' ? 40 : 10,
        justifyContent: 'flex-end'
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        alignItems: 'center',
        justifyContent: 'center'
    }
})


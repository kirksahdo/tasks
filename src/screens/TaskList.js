import React, {Component} from 'react';
import { Alert,  View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from '@react-native-community/async-storage'

import moment from 'moment'
import 'moment/locale/pt-br'


import commonStyles from '../commonStyles'
import todayImage from '../../assets/imgs/today.jpg'
import tomorrowImage from '../../assets/imgs/tomorrow.jpg'
import weekImage from '../../assets/imgs/week.jpg'
import monthImage from '../../assets/imgs/month.jpg'
import Task from '../components/Task'
import AddTask from './AddTask';
import StatusBarTask from '../components/StatusBarTask'
import api from '../services/api'
import { showError } from '../utils';

const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks: [],
    isFetching: false
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
            const maxDate = moment().add({days: this.props.daysAhead}).format('YYYY-MM-DD 23:59:59')
            const response = await api.get(`tasks?date=${maxDate}`)
            this.setState({tasks: response.data}, () => {
                this.filterTasks()
                this.setState({isFetching: false})
            } )
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

        visibleTasks.sort((a,b) => {
            if( a.doneAt && b.doneAt) {
                return (a.doneAt>b.doneAt)?1:-1
            }
            if( a.doneAt && !b.doneAt) return 1
            if( !a.doneAt && b.doneAt) return -1
        })

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


    onRefresh = () => {
        this.setState({isFetching: true}, () => this.loadTasks())
    }

    getImage = () => {
        switch(this.props.daysAhead){
            case 0: return todayImage
            case 1: return tomorrowImage
            case 7: return weekImage
            case 30: return monthImage
        }
    }

    getColor = () => {
        switch(this.props.daysAhead){
            case 0: return commonStyles.colors.today
            case 1: return commonStyles.colors.tomorrow
            case 7: return commonStyles.colors.week
            case 30: return commonStyles.colors.month
        }
    }

    render(){
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <StatusBarTask backgroundColor={this.getColor()}
                    barStyle="light-content"/>
                <AddTask isVisible = {this.state.showAddTask}
                    onCancel={() => this.setState({showAddTask: false})}
                    onSave={this.addTask} />
                <ImageBackground source={this.getImage()}
                    style={styles.background}>
                    <View style ={styles.iconBar}>
                        <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name='bars'
                                size={20} color={commonStyles.colors.secondary}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'}
                                size={20} color={commonStyles.colors.secondary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList data={this.state.visibleTasks}
                        scrollToOverflowEnabled={true}
                        onRefresh={() => this.onRefresh()}
                        refreshing={this.state.isFetching}
                        keyExtractor={item => `${item.id}`}
                        renderItem={({item}) => <Task {...item} toggleTask={this.toggleTask} onDelete={this.deleteTask} /> }/>
                </View>
                <TouchableOpacity style={[styles.addButton, {backgroundColor: this.getColor()}]} 
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
        justifyContent: 'space-between'
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    }
})


import {Alert} from 'react-native'

const showError = err => {
    Alert.alert('Ops, ocorreu um problema!', `Mensagem: ${err}`)
}

const showSuccess = message => {
    Alert.alert('Sucesso!', message)
}

export { showError, showSuccess }
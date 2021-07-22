import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';


const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const StatusBarTask = ({ backgroundColor, ...props }) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>)

const styles = StyleSheet.create({
    statusBar: {
        height: STATUSBAR_HEIGHT
    }
});

export default StatusBarTask;
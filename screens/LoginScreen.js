import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from 'react-native-paper';

export default function LoginScreen(props) {
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {/* <Button
          mode="contained"
          onPress={() => props.navigation.push('Call')}
          style={styles.btn}
          contentStyle={styles.btnContent}>
          Create a room
        </Button> */}
      </View>
      <View style={{...styles.content, marginTop: 10}}>
        <Button
          mode="contained"
          onPress={() => props.navigation.push('Join')}
          style={styles.btn}
          contentStyle={styles.btnContent}>
          Join a room
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    flex: 1,

    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    height: 60,
    marginBottom: 10,
  },
  btn: {
    height: 60,
    alignItems: 'stretch',
    justifyContent: 'center',
    fontSize: 18,
  },
  btnContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
});

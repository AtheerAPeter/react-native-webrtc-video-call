import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Text} from 'react-native-paper';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextInput} from 'react-native-paper';
import {io} from 'socket.io-client';
import {useFocusEffect} from '@react-navigation/native';
import Peer from 'react-native-peerjs';
import InCallManager from 'react-native-incall-manager';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';

export default function CallScreen2({navigation, ...props}) {
  const localPeer = new Peer();

  const [userId, setUserId] = useState('');
  const [socketActive, setSocketActive] = useState(false);
  const [calling, setCalling] = useState(false);
  // Video Scrs
  const [localStream, setLocalStream] = useState({toURL: () => null});
  const [remoteStream, setRemoteStream] = useState({toURL: () => null});
  const [roomId, setRoomId] = useState('');
  const [myPeer, setMyPeer] = useState('');

  const [callToUsername, setCallToUsername] = useState(null);

  const socket = io('https://webrtczoomwannabe.herokuapp.com', {
    transports: ['websocket'],
    jsonp: false,
  });

  useEffect(() => {
    /**
     *
     * Sockets Signalling
     */
    //connect socket io
    localPeer.on('error', (error) => console.log('peer error', error));
    localPeer.on('open', (localPeerId) => {
      setMyPeer(localPeerId);

      fetch('https://webrtczoomwannabe.herokuapp.com', {
        method: 'GET',
        redirect: 'follow',
      })
        .then((response) => response.json())
        .then((room_id) => {
          socket.emit('join-room', room_id, localPeerId);

          setRoomId(room_id);
        })
        .catch((error) => console.log('error', error));
    });

    socket.connect();
    socket.on('connect', () => {
      setSocketActive(true);
    });

    //camera stuff
    let isFront = true;
    mediaDevices.enumerateDevices().then((sourceInfos) => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind == 'videoinput' &&
          sourceInfo.facing == (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        })
        .then((stream) => {
          // Got stream!
          setLocalStream(stream);
        })
        .catch((error) => {
          // Log error
        });
    });
  }, []);

  socket.on('user-connected', (IncomingId) => {
    console.log('====', IncomingId);
    joinStream(IncomingId, localStream);
  });

  const joinStream = (id, stream) => {
    const call = localPeer.call(id, stream);

    call.on('stream', (theirVideoStream) => {
      setRemoteStream(theirVideoStream);
    });
    call.on('close', () => {
      setRemoteStream({toURL: () => null});
      alert('call has ended');
    });
  };

  localPeer.on('call', (call) => {
    console.log(
      'my Stream =============================================',
      localStream,
    );
    call.answer(localStream);

    call.on('stream', (userVideoStream) => {
      setRemoteStream(userVideoStream);
    });
    call.on('close', () => {
      setRemoteStream({toURL: () => null});
    });
  });

  useEffect(() => {
    navigation.setOptions({
      title: 'Video call',
    });
  }, [userId]);

  /**
   * Calling Stuff
   */

  const onCall = () => {
    setCalling(true);

    socket.emit('join-room', callToUsername, myPeer);
  };

  const hangUp = () => {
    handleLeave();
  };

  const handleLeave = () => {
    connectedUser = null;
    setRemoteStream({toURL: () => null});
  };

  const onLogout = () => {
    // hangUp();

    AsyncStorage.removeItem('userId').then((res) => {
      navigation.push('Login');
    });
  };

  /**
   * Calling Stuff Ends
   */

  return (
    <View style={styles.root}>
      <View style={styles.inputField}>
        <Text>Room ID</Text>
        <TextInput
          mode="outlined"
          style={{marginBottom: 0, height: 30, padding: 0}}
          value={roomId}
        />
      </View>

      <View style={styles.videoContainer}>
        <View style={[styles.videos, styles.localVideos]}>
          <Text>You</Text>
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
        </View>
        <View style={[styles.videos, styles.remoteVideos]}>
          <Text>Your buddy</Text>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
          />
        </View>
      </View>
      {/* <Button onPress={() => setFrontCamera(!frontCamera)}>flip camera</Button> */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  inputField: {
    marginBottom: 10,
    flexDirection: 'column',
  },
  videoContainer: {
    flex: 1,
    minHeight: 450,
  },
  videos: {
    width: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',

    borderRadius: 6,
  },
  localVideos: {
    height: 100,
    marginBottom: 10,
  },
  remoteVideos: {
    height: 400,
  },
  localVideo: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  remoteVideo: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
});

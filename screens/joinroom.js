import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, Alert, Vide} from 'react-native';
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
  const [myPeer, setMyPeer] = useState('');

  const [callToUsername, setCallToUsername] = useState(null);

  const socket = io('https://webrtczoomwannabe.herokuapp.com', {
    transports: ['websocket'],
    jsonp: false,
  });
  /// new coming
  socket.on('user-connected', (IncomingId) => {
    console.log('====', IncomingId);

    const call = localPeer.call(IncomingId, localStream);

    call.on('stream', (theirVideoStream) => {
      console.log('stream i got recieved+++++++++++++', theirVideoStream);

      setRemoteStream(theirVideoStream);
    });

    call.on('close', () => {
      setRemoteStream({toURL: () => null});
    });
  });

  localPeer.on('call', (newCall) => {
    console.log(
      'my Stream =============================================',
      localStream,
    );

    mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 300,
            minFrameRate: 30,
          },
          facingMode: 'user',
          // optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
        },
      })
      .then((stream) => {
        // Got stream!
        newCall.answer(stream);
        setLocalStream(stream);
        console.log('stream has been set', localStream);
      });

    console.log('got newCall');

    newCall.on('stream', (userVideoStream) => {
      setRemoteStream(userVideoStream);
    });
  });

  socket.on('user-disconnected', () => {
    setRemoteStream({toURL: () => null});
  });

  useEffect(() => {
    /**
     *
     * Sockets Signalling
     */
    //connect socket io
    socket.connect();
    socket.on('connect', () => {
      setSocketActive(true);
    });

    localPeer.on('error', (error) => console.log('peer error', error));
    localPeer.on('open', (localPeerId) => {
      setMyPeer(localPeerId);
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
            facingMode: 'user',
            // optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        })
        .then((stream) => {
          // Got stream!
          setLocalStream(stream);
          console.log('stream has been set', localStream);
        })
        .catch((error) => {
          // Log error
        });
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: 'Video call',
      headerRight: () => (
        <Button mode="text" onPress={onLogout} style={{paddingRight: 10}}>
          Logout
        </Button>
      ),
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
    setRemoteStream({toURL: () => null});
    localPeer.destroy();
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
        <TextInput
          label="Enter Friends Id"
          mode="outlined"
          style={{marginBottom: 7}}
          onChangeText={(text) => setCallToUsername(text)}
        />
        <Button
          mode="contained"
          onPress={onCall}
          loading={calling}
          //   style={styles.btn}
          contentStyle={styles.btnContent}
          disabled={!socketActive}>
          Call
        </Button>
      </View>

      <View style={styles.videoContainer}>
        <View style={[styles.videos, styles.localVideos]}>
          <Text>Your Video</Text>
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
        </View>
        <View style={[styles.videos, styles.remoteVideos]}>
          <Text>Friends Video</Text>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
          />
        </View>
      </View>
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
    backgroundColor: '#f2f2f2',
    height: '100%',
    width: '100%',
  },
  remoteVideo: {
    backgroundColor: '#f2f2f2',
    height: '100%',
    width: '100%',
  },
});

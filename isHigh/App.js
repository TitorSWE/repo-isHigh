import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
//import { supabase } from './lib/supabase'

import {AudioManager, AudioEncoderAndroidType, AudioSourceAndroidType} from 'react-native-audio-recorder-player'

import {database} from 'firebase/database';

// Simun
import {
  getStorage,
  ref,
  uploadBytes
} from "firebase/storage";
import { app } from "./firebaseConfig";

export const storage = getStorage(app);
export const audioRef = ref(storage, "audio/");


// Me
export default function App() {

  const recordingSettings = {
    android: {
      extension: ".mp4",
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".wav",
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };
  
  const [isRecording, setIsRecording] = React.useState(false);
  const [recording, setRecording] = React.useState(null);

  const startRecording = async () => {

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
    });

    const _recording = new Audio.Recording();
    try {
      await _recording.prepareToRecordAsync(recordingSettings);
      setRecording(_recording);
      await _recording.startAsync();
      console.log("recording");
      setIsRecording(true);
    } catch (error) {
      console.log("error while recording: ", error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    setIsRecording(false);
    
    const uri = recording.getURI();
    const uriParts = uri.split(/\.|\//);
    //console.log("uriParts:", uriParts);
    const recordingName = uriParts[uriParts.length - 2];
    const fileType = uriParts[uriParts.length - 1];
    const blob = await uriToBlob(uri);
    handleUpload(blob,recordingName,fileType);
  };

  // Convert uri to blob
  const uriToBlob = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        //console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    return blob;
  };


    // Upload blob to firebase
    const handleUpload = async (blob,name,type) => {
      console.log("handleUpload");
      const newAudioRef = ref(storage, "audio/" + name + "." + type);
      console.log("try to upload : ");
      uploadBytes(newAudioRef, blob).then((snapshot) => {
        console.log("Uploaded a blob!");
      });

      //uploadInTable(name,false);
      //getAnswer(name);
    };

    const answer = null;
    const getAnswer = async (name) => {
      console.log("getAnswer");
      database()
        .ref(name)
        .once('value')
        .then(snapshot => {
          console.log('Answer ', snapshot.val());
          answer = snapshot.val();
        });
      
      uploadInTable(name,answer);
    }

    const uploadInTable = async (name,answer) => {
      console.log("uploadInTable");
      database()
        .ref(name)
        .set({
          value: answer,
        })
        .then(() => console.log('Data set.'));
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suis-je en colère ?</Text>
      <Text style={styles.title}> Je te parie que non !</Text>
      <Text style={styles.proof}>Prouvons-le par un "bonjour" :</Text>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        backgroundColor='#ce5400'
        color='#000000'
      />
      {answer ?
        <Text style={styles.answer}>Réponse : {answer}</Text>
      : null}
      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffc878',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#ce5400',
  },
  proof: {
    fontSize: 18,
    color: '#ce5400',
    fontStyle: 'italic',
    marginTop: 25,
  },
  answer: {
    fontSize: 18,
    color: '#ce5400',
    marginTop: 25,
  }
});
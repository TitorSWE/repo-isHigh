import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
//import { supabase } from './lib/supabase'

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


  // Simun  
  
    // Methods
    const handleUpload = async (blob,name,type) => {
      console.log("handleUpload");
      const newAudioRef = ref(storage, "audio/" + name + "." + type);
      console.log("try to upload : ");
      uploadBytes(newAudioRef, blob).then((snapshot) => {
        console.log("Uploaded a blob!");
      });

      //uploadInTable(name);
      //getAnswer(name);
    };
    
    const uploadInTable = async (name) => {
      console.log("uploadInTable");
      database()
        .ref(name)
        .set({
          value: false,
        })
        .then(() => console.log('Data set.'));
    }

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
    }

    /*
    return (
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1 className="">Welcome {user.email} </h1>
        <div id="button0"></div>
        <audio id="firstAudioId"></audio>
        <div name="upload" className="btn btn-outline-secondary">
          <div className="btn btn-success">Upload a song</div>
          <form
            onSubmit={handleUpload}
            style={{
              textAlign: "center",
            }}
          >
            <input type="file" id="file" />
            <button
              type="submit"
              className="btn btn-outline-dark"
              style={{ marginLeft: 10 }}
            >
              Upload
            </button>
          </form>
        </div>
        <button onClick={handleList}>List all audio</button>
  
        <div name="separator" id="separator" style={{ padding: 15 }}>
          {!hasRun
            ? "Loading ..."
            : songs
                .sort()
                .filter((song, ndx) => {
                  return ndx % 2;
                })
                .map((song, ind) => (
                  <SongButton key={ind} title={song.name}></SongButton>
                ))}
        </div>
        <SongButton title={"hello"}></SongButton>
      </div>
    );
  };
  */

  // Me
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



  /*
  const uploadAudio = async () => {
    const uri = recording.getURI();
    console.log('Recording stored at', uri);
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          try {
            resolve(xhr.response);
          } catch (error) {
            console.log("error:", error);
          }
        };
        xhr.onerror = (e) => {
          console.log(JSON.stringify(e));
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      if (blob != null) {
        //console.log("blob:", blob);
        const uriParts = uri.split(/\.|\//);
        //console.log("uriParts:", uriParts);
        const recordingName = uriParts[uriParts.length - 2];
        const fileType = uriParts[uriParts.length - 1];

        try {
          const { data, error } = await supabase
            .storage
            .from('audios')
            .upload(`${recordingName}.${fileType}`, blob, {
              cacheControl: '3600',
              contentType: `audio/${fileType}`,
              upsert: true
            })
        } catch (error) {
          if (error instanceof Error) {
            console.log(error.message)
          }
        }

        blob.close();
      } else {
        console.log("error with blob");
      }
    } catch (error) {
      console.log("error:", error);
    }
  };
  */
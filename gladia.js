
// Initiating the variables for the functions

let gladiaKey = '15e08358-6295-491d-95b8-62a69d637cc8'
let startbtn = document.getElementById("startButton")
let stopbtn = document.getElementById("stopButton")
let connect = document.getElementById("connectButton")

let mediaRecorder
let audioStream
let recorder
let socket

let SAMPLE_RATE = 48000;


const options = {
    method: 'POST',
    headers: {
      'x-gladia-key': gladiaKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        // encoding: 'wav/pcm',
        // sample_rate: 16000,
        // bit_depth: 16,
        // channels: 1,
        sample_rate: SAMPLE_RATE,
      }),
  };


//A function to connect to the Gladia Live session web socket with the API call

async function connectToWs() {
    try {
        await fetch ("https://api.gladia.io/v2/live", options)
            .then((response)=> response.json())
            .then((response)=> {
                let {id, url} = response;
                console.log(id, url);
                socket = new WebSocket(url)
                console.log(socket)     
            })
            
    } catch (error) {
        console.log(error)    
    }  
}


// A function to start recording

async function startR () {
    // Connect to the microphone in the browser/await the authorisation form the user
    audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
    })
    .then ((audioStream) => { //Once the stream is returned, create a recorder using https://recordrtc.org/
        recorder = RecordRTC(audioStream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 1000,
            sampleRate: SAMPLE_RATE,
            desiredSampRate: SAMPLE_RATE,
            numberOfAudioChannels: 1,
            ondataavailable:  function(blob) {
                socket.send(blob); //Sending audio data to the socket upon receiving it
            }
        });
        recorder.startRecording();
        socket.addEventListener("message", function(event) { //Listening to the WS and loggin the transcript in the console
            // All the messages we are sending are in JSON format
            const message = JSON.parse(event.data.toString());
            if (message.type === 'transcript' && message.data.is_final) {
              console.log(`${message.data.id}: ${message.data.utterance.text}`)
            }
          });
        

    })
}


// A function to stop the recording

function stopR () {
    recorder.stopRecording(function() {
        console.log("recording stopped")
    });

    socket.close(1000);
    socket.send(JSON.stringify({
        type: "stop_recording",
    }));

}


//Adding the functions to event listeners in the doc

startbtn.addEventListener('click', startR);
stopbtn.addEventListener('click', stopR);
connect.addEventListener('click', connectToWs)


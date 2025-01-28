let socket
// let mediaRecorder

let gladiaKey = '15e08358-6295-491d-95b8-62a69d637cc8'
let startR = document.getElementById("startButton")
let stopR = document.getElementById("stopButton")
let connect = document.getElementById("connectButton")

let mediaRecorder
let audioStream
let recorder
let SAMPLE_RATE = 48000;


//Connecting to the Gladia Live session with the API
const options = {
    method: 'POST',
    headers: {
      'x-gladia-key': gladiaKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        encoding: 'wav/pcm',
        sample_rate: 16000,
        bit_depth: 16,
        channels: 1,
      }),
  };

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




"wss://api.gladia.io/v2/live?token=e22ddc3f-e3aa-4fac-9f04-32a6edb5cd1d"


// async function startRecording () { 

//     audioStream = await navigator.mediaDevices.getUserMedia({audio:true})
//     .then((audioStream) => {
//         recorder = new RecordRTC(audioStream, {
//             type : 'audio',
//             mimeType: 'audio/wav',
//             recorderType: RecordRTC.StereoAudioRecorder,
//             timeSlice: 1000,
//             async ondataavailable(blob) {
//                 const buffer = await blob.arrayBuffer();
//                 // Remove WAV header
//                 const modifiedBuffer = buffer.slice(44);
//                 socket?.send(modifiedBuffer);
//             },
//             sampleRate: SAMPLE_RATE,
//             desiredSampRate: SAMPLE_RATE,
//             numberOfAudioChannels: 1
//         });
//     }
    
//     )

//     socket.onopen = (event) => {console.log("WS event on open")}
//     socket.onclose = (event) => {console.log("WS event; socket closed")}


//     socket.addEventListener("message", function(event) {
//         // All the messages we are sending are in JSON format
//         const message = JSON.parse(event.data.toString());
//         console.log(message);
//       });

//     console.log('hahaha', socket)     
// //     try { 
// //     //     await navigator.mediaDevices.getUserMedia({audio: true})
// //     //     .then ( stream => {
// //     //         mediaRecorder = new MediaRecorder(stream);
// //     //         mediaRecorder.start();

// //     //         const audioChunks = [];
// //     //         mediaRecorder.addEventListener("dataavailable", event => audioChunks.push(event.data));
// //     //         socket.addEventListener("open", function() {
// //     //             // Connection is opened. You can start sending audio chunks.
// //     //             socket.send(JSON.stringify({
// //     //                 type: 'audio_chunk',
// //     //                 data: {
// //     //                   chunk: audioChunks.toString("base64"),
// //     //                 },
// //     //               }));
// //     //         });
// //             // socket.addEventListener("message", function(event) {
// //             //     // All the messages we are sending are in JSON format
// //             //     const message = JSON.parse(event.data.toString());
// //             //     console.log(message);
// //             //   });
              
           
// //     // })


// // } catch (error){
// //     console.log(error)

// // }
// }

// function stopRecording() {

//     recorder.stop();
//     recorder.addEventListener("stop", () => {
//         // const audioBlob = new Blob(audioChunks);
//         // const audioUrl = URL.createObjectURL(audioBlob);
//         // const audio = new Audio(audioUrl);
//         // audio.play();
//         console.log("stop")

// })
//     console.log("stop")
//     socket.close(1000);
//     socket.send(JSON.stringify({
//         type: "stop_recording",
//       }));
// };

// startR.addEventListener('click', startRecording);
// stopR.addEventListener('click', stopRecording);
// connect.addEventListener('click', connectToWs)

async function start () {
    audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
    })
    .then ((audioStream) => {
        recorder = RecordRTC(audioStream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 1000,
            sampleRate: SAMPLE_RATE,
            desiredSampRate: SAMPLE_RATE,
            numberOfAudioChannels: 1,
            ondataavailable:  function(blob) {
                socket.send(blob);
            }
        });
        recorder.startRecording();

    })
}

function stop () {
    recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        console.log("recording stopped")
    });

    socket.close(1000);
    socket.send(JSON.stringify({
        type: "stop_recording",
    }));

}


startR.addEventListener('click', start);
stopR.addEventListener('click', stop);
connect.addEventListener('click', connectToWs)


// navigator.mediaDevices.getUserMedia({
//     audio: true
// }).then(async function(stream) {
//     let recorder = RecordRTC(stream, {
//         type: 'audio'
//     });
//     recorder.startRecording();

//     const sleep = m => new Promise(r => setTimeout(r, m));
//     await sleep(10000);

//     recorder.stopRecording(function() {
//         let blob = recorder.getBlob();
//         invokeSaveAsDialog(blob);
//     });
// });
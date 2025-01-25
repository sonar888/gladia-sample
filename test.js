const stop = document.getElementById("stop");
const record = document.getElementById("record")


async function getMicrophoneStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioElement = new Audio();
    audioElement.srcObject = stream;
    connectWS(audioElement);
    
    // const mediaRecorder = new MediaRecorder(stream);
    // return mediaRecorder;
  } catch (error) {
    console.log('Error accessing microphone:', error);
  }
}

// Example usage:

// record.addEventListener('click', getMicrophoneStream()
//   .then(mediaRecorder => {

//     mediaRecorder.addEventListener('dataavailable', event => {
//       if (event.data.size > 0) {
//         console.log('event.data')

//       }
//     })
//     // console.log(mediaRecorder)

//     // mediaRecorder.start();
//     // let chunks = [];
//     // mediaRecorder.ondataavailable = (e) => {
//     // // chunks.push(e.data);
//     // console.log(e.data)
//   }

//     // Do something with the audio stream, e.g., play it:
//     // const audioElement = new Audio();
//     // audioElement.srcObject = stream;
//     // audioElement.play();
// ));

record.addEventListener('click', getMicrophoneStream())











/* global Peer */

/**
 * Gets the local audio stream of the current caller
 * @param callbacks - an object to set the success/error behavior
 * @returns {void}
 */


  
  


  function deleteAllLiveSessions() {

    listAllSessions()

    // const options = {method: 'DELETE', headers: {'x-gladia-key': '15e08358-6295-491d-95b8-62a69d637cc8'}};

    // fetch('https://api.gladia.io/v2/live/{id}', options)
    //   .then(response => response.json())
    //   .then(response => console.log(response))
    //   .catch(err => console.error(err));
    
  }

  //Un bouton qui commence et coupe l'enregistrement
  //Se connecter au WS
  // Envoyer le stream au WS

  // Afficher le transcript


 
  async function connectWS () {
    const response = await fetch('https://api.gladia.io/v2/live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gladia-Key': '15e08358-6295-491d-95b8-62a69d637cc8',
      },
      body: JSON.stringify({
        "encoding": "wav/pcm",
        "bit_depth": 16,
        "sample_rate": 16000,
        channels: 1,
      }),
    });
    if (!response.ok) {
      // Look at the error message
      // It might be a configuration issue
      console.log(`${response.status}: ${(await response.text()) || response.statusText}`);
      // process.exit(response.status);
    }
  
    const {url} = await response.json();
    console.log(url)
    
  
  }

  // connectWS()





// const options = {method: 'DELETE', headers: {'x-gladia-key': '15e08358-6295-491d-95b8-62a69d637cc8'}};

// fetch('https://api.gladia.io/v2/live/G-70673944', options)
//   .then(response => response.json())
//   .then(response => console.log(response))
//   .catch(err => console.error(err));





  // Ensure you have a server-side WebSocket implementation to handle the audio data
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
//  connectWS()

let mediaRecorder;
let webSocket;

async function startRecording() {
  try {
    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Initialize the WebSocket connection
    webSocket = new WebSocket('wss://api.gladia.io/v2/live?token=c27236b9-d81f-417a-9021-623fcdf55fc6');

    // Handle WebSocket connection open
    webSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Create MediaRecorder instance
    mediaRecorder = new MediaRecorder(stream);

    // Listen for dataavailable events to send audio chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(event.data);
      }
    };

    // Start recording in small chunks
    mediaRecorder.start(1000); // Send audio data every second

    console.log('Recording started');
  } catch (error) {
    console.error('Error accessing microphone:', error);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    console.log('Recording stopped');
  }

  if (webSocket && webSocket.readyState === WebSocket.OPEN) {
    webSocket.close();
    console.log('WebSocket connection closed');
  }
}

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);




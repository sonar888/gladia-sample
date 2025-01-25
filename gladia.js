// import WebSocket from 'ws';









// import WebSocket from "ws";

// const socket = new WebSocket(url);



// socket.addEventListener("error", function(error) {
//   // An error occurred during the connection.
//   // Check the error to understand why
// });

// socket.addEventListener("close", function({code, reason}) {
//   // The connection has been closed
//   // If the "code" is equal to 1000, it means we closed intentionally the connection (after the end of the session for example).
//   // Otherwise, you can reconnect to the same url.
// });

// socket.addEventListener("message", function(event) {
//   // All the messages we are sending are in JSON format
//   const message = JSON.parse(event.data.toString());
//   console.log(message);

//   if (message.type === 'transcript' && message.data.is_final) {
//     console.log(`${message.data.id}: ${message.data.utterance.text}`)
//   }
// });



// Ensure you have a server-side WebSocket implementation to handle the audio data
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let mediaRecorder;
let socket;

async function startRecording() {
  try {

    // Init session to Gladia WS

    const response = await fetch('https://api.gladia.io/v2/live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gladia-Key': '15e08358-6295-491d-95b8-62a69d637cc8',
      },
      body: JSON.stringify({
        encoding: 'wav/pcm',
        sample_rate: 16000,
        bit_depth: 16,
        channels: 1,
      }),
    });
    if (!response.ok) {
      // Look at the error message
      // It might be a configuration issue
      console.error(`${response.status}: ${(await response.text()) || response.statusText}`);
      process.exit(response.status);
    }
    
    const {id, url} = await response.json();



    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Initialize the WebSocket connection
    socket = new WebSocket(url);

    // Handle WebSocket connection open
    socket.addEventListener("open", function() {
      // Connection is opened. You can start sending audio chunks.
    
      console.log("Websocket open")
    
    });

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Create MediaRecorder instance
    mediaRecorder = new MediaRecorder(stream);

    // Listen for dataavailable events to send audio chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        let stream = event.data
        socket.send(JSON.stringify({
          type: 'audio_chunk',
          data: {
            chunk: stream.toString("base64"),
          },
        }));
      }
    };

    // Start recording in small chunks
    mediaRecorder.start(1000); // Send audio data every second


    socket.addEventListener("message", function(event) {
      // All the messages we are sending are in JSON format
      const message = JSON.parse(event.data.toString());
      if (message.type === 'transcript' && message.data.is_final) {
        console.log(`${message.data.id}: ${message.data.utterance.text}`)
      }
    });





    console.log('Recording started');
  } catch (error) {
    console.error('Error accessing microphone:', error);
  }
}


function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    
    mediaRecorder.stop();
    socket.send(JSON.stringify({
      type: "stop_recording",
    }));
    console.log('Recording stopped');
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    console.log('WebSocket connection closed');
  }
}








startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);



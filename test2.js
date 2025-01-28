


// Ensure you have a server-side WebSocket implementation to handle the audio data
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const deleteButton = document.getElementById('deleteButton')
const listAll = document.getElementById("listAll")
const key = "1d03bed3-b01a-4326-ba84-774d5c5873eb"

let mediaRecorder;
let socket;

async function startRecording() {
  try {

    // Init session to Gladia WS

    const response = await fetch('https://api.gladia.io/v2/live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gladia-Key': key,
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
        socket.send({
          type: 'audio_chunk',
          data: {
            chunk: stream.toString("base64"),
          },
        });
      }
    };

    // Start recording in small chunks
    mediaRecorder.start(); // Send audio data every second


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
    console.log("Socket closed")
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    console.log('WebSocket connection closed');
  }
}





async function deleteTranscript() {
  try {
    const options = {method: 'DELETE', headers: {'x-gladia-key': key}};
    const response = await fetch('https://api.gladia.io/v2/live/1ac3e269-7dc9-4414-8c68-514a208c2b1d', options)
    const display = await response.json()
    console.log(display)

  } catch (error) {

  }

}

async function listAllTranscriptions() {
  try {
    const options = {method: 'GET', headers: {'x-gladia-key': key}};
    const response = await fetch('https://api.gladia.io/v2/live', options)
    const display = await response.json()
    console.log(display)


  } catch (error) {

  }

}




listAll.addEventListener('click', listAllTranscriptions)
deleteButton.addEventListener('click', deleteTranscript)
startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);



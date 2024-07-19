'use strict';

const DID_API = {
    "url": "https://api.d-id.com",
    "service": "talks"
}

let RTCPeerConnection

let peerConnection;
let pcDataChannel;
let streamId;
let sessionId;
let sessionClientAnswer;

let statsIntervalId;
let lastBytesReceived;
let videoIsPlaying = false;

// Set this variable to true to request stream warmup upon connection to mitigate potential jittering issues
const stream_warmup = true;
let isStreamReady = !stream_warmup;

let streamVideoElement;
export const setRTCPeerConnection = () =>{
  RTCPeerConnection = (
    window.RTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection
  ).bind(window);
  streamVideoElement = document.getElementById('stream-video-element');
  streamVideoElement.setAttribute('playsinline', '');
}

export const connectTalkStream = async () => {
  if (peerConnection && peerConnection.connectionState === 'connected') {
    return;
  }
  stopAllStreams();
  closePC();
  /**
   * Set 'stream_warmup' to 'true' in the payload to initiate idle streaming at the beginning of the connection, addressing jittering issues.
   * The idle streaming process is transparent to the user and is concealed by triggering a 'stream/ready' event on the data channel,
   * indicating that idle streaming has concluded and the stream channel is ready for use.
   */
  const sessionResponse = await fetchWithRetries(`${DID_API.url}/${DID_API.service}/streams`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        source_url: 'https://fsi-avatars.s3.amazonaws.com/Avatar.png',
        output_resolution: 1030, 
        stream_warmup 
      }),
  });

  const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
  streamId = newStreamId;
  sessionId = newSessionId;

  try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
  } catch (e) {
    console.log('error during streaming setup', e);
    stopAllStreams();
    closePC();
    return;
  }

  const sdpResponse = await fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}/sdp`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answer: sessionClientAnswer,
      session_id: sessionId,
    }),
  });

  return {sessionResponse, sessionClientAnswer, sdpResponse }
};

export const startTalkStream = async (inputText = 'hello world') => {
  // connectionState not supported in firefox
  if (
    (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') &&
    isStreamReady
  ) {
    const playResponse = await fetchWithRetries(`${DID_API.url}/${DID_API.service}/streams/${streamId}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          subtitles: false,
          provider: {
            type: 'microsoft',
            voice_id: 'en-AU-AnnetteNeural'
            },
          ssml: false,
          input: inputText
        },
        //result_url: 'https://path.to.directory/movie.mp4',
        driver_url: 'bank://lively/',
        config: {
          fluent: false,
          pad_audio: 0.0
        },
        session_id: sessionId,
      }),
    });
    console.log('playResponse', playResponse)
    return playResponse
  }
};

export const destroyStream = async () => {
  await fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId }),
  });
  stopAllStreams();
  closePC();
};

function onIceGatheringStateChange() {
  //console.log(`iceGatheringStatusLabel ${peerConnection.iceGatheringState}`)
}
function onIceCandidate(event) {
  //console.log('onIceCandidate', event);
  if (event.candidate) {
    const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

    fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}/ice`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate,
        sdpMid,
        sdpMLineIndex,
        session_id: sessionId,
      }),
    });
  } else {
    // For the initial 2 sec idle stream at the beginning of the connection, we utilize a null ice candidate.
    fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}/ice`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.NEXT_PUBLIC_D_ID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });
  }
}
function onIceConnectionStateChange() {
  //console.log(`iceStatusLabel ${peerConnection.iceConnectionState}`)
  if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
    stopAllStreams();
    closePC();
  }
}
function onConnectionStateChange() {
  // not supported in firefox
  console.log(`peerStatusLabel ${peerConnection.connectionState}`)
  if (peerConnection.connectionState === 'connected') {
    //playIdleVideo();
    /**
     * A fallback mechanism: if the 'stream/ready' event isn't received within 5 seconds after asking for stream warmup,
     * it updates the UI to indicate that the system is ready to start streaming data.
     */
    setTimeout(() => {
      if (!isStreamReady) {
        console.log('forcing stream/ready');
        isStreamReady = true;
        console.log(`streamEventLabel ready`)
      }
    }, 5000);
  }
}
function onSignalingStateChange() {
  console.log(`signalingStatusLabel ${peerConnection.signalingState}`)
}

function onVideoStatusChange(videoIsPlaying, stream) {
  let status;

  if (videoIsPlaying) {
    status = 'streaming';
    setStreamVideoElement(stream);
  } else {
    status = 'empty';
    //playIdleVideo()
  }

  console.log(`streamingStatusLabel ${status}`)
}

function onTrack(event) {
  /**
   * The following code is designed to provide information about wether currently there is data
   * that's being streamed - It does so by periodically looking for changes in total stream data size
   *
   * This information in our case is used in order to show idle video while no video is streaming.
   * To create this idle video use the POST https://api.d-id.com/talks (or clips) endpoint with a silent audio file or a text script with only ssml breaks
   * https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#break-tag
   * for seamless results use `config.fluent: true` and provide the same configuration as the streaming video
   */

  if (!event.track) return;

  statsIntervalId = setInterval(async () => {
    const stats = await peerConnection?.getStats(event.track);
    stats?.forEach((report) => {
     if (report.type === 'inbound-rtp' && report.kind === 'video') {
        const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;

        if (videoStatusChanged) {
          videoIsPlaying = report.bytesReceived > lastBytesReceived;
          onVideoStatusChange(videoIsPlaying, event.streams[0]);
        }
        lastBytesReceived = report.bytesReceived;
      }
    });
  }, 500);
}
let statusGlobal = ''
function onStreamEvent(message) {
  /**
   * This function handles stream events received on the data channel.
   * The 'stream/ready' event received on the data channel signals the end of the 2sec idle streaming.
   * Upon receiving the 'ready' event, we can display the streamed video if one is available on the stream channel.
   * Until the 'ready' event is received, we hide any streamed video.
   * Additionally, this function processes events for stream start, completion, and errors. Other data events are disregarded.
   */

  if (pcDataChannel.readyState === 'open') {
    let status;
    const [event, _] = message.data.split(':');

    switch (event) {
      case 'stream/started':
        status = 'started';
        break;
      case 'stream/done':
        status = 'done';
        break;
      case 'stream/ready':
        status = 'ready';
        break;
      case 'stream/error':
        status = 'error';
        break;
      default:
        status = 'dont-care';
        break;
    }
    statusGlobal = status

    // Set stream ready after a short delay, adjusting for potential timing differences between data and stream channels
    if (status === 'ready') {
      setTimeout(() => {
        console.log('stream/ready');
        isStreamReady = true;
        console.log(`streamEventLabel ready`)
      }, 1000);
    } else {
      console.log(event);
      console.log(`streamEventLabel ${ status === 'dont-care' ? event : status}`)
      playIdleVideo()
    }
  }
}

async function createPeerConnection(offer, iceServers) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection({ iceServers });
    pcDataChannel = peerConnection.createDataChannel('JanusDataChannel');
    peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    peerConnection.addEventListener('icecandidate', onIceCandidate, true);
    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
    peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
    peerConnection.addEventListener('track', onTrack, true);
    pcDataChannel.addEventListener('message', onStreamEvent, true);
  }

  await peerConnection.setRemoteDescription(offer);
  console.log('set remote sdp OK');

  const sessionClientAnswer = await peerConnection.createAnswer();
  console.log('create local sdp OK');

  await peerConnection.setLocalDescription(sessionClientAnswer);
  console.log('set local sdp OK');

  return sessionClientAnswer;
}

function setStreamVideoElement(stream) {
  if (!stream) return;
  console.log('STREAM AQUI', `\n`, 
    'stream: ', stream, `\n`, 
    'statusGlobal: ', statusGlobal, `\n`, 
    'streamId: ', streamId,  `\n`,
    'peerConnection: ', peerConnection
  )
  if(statusGlobal !== ''){
    streamVideoElement.srcObject = stream;
    streamVideoElement.muted = false;
    streamVideoElement.loop = false
  }

  // safari hotfix
  if (streamVideoElement.paused) {
    streamVideoElement
      .play()
      .then((_) => {})
      .catch((e) => {});
  }
}

export function playIdleVideo() {
  console.log('STREAM AQUI Avatar_idle ', streamVideoElement.play)
  streamVideoElement.srcObject = undefined;
  streamVideoElement.src = 'Avatar_idle2.mp4';
  streamVideoElement.loop = true
  if (streamVideoElement.paused) {
    streamVideoElement
      .play()
      .then((_) => {})
      .catch((e) => {});
  }
}

function stopAllStreams() {
  if (streamVideoElement.srcObject) {
    console.log('stopping video streams');
    console.log('STREAM AQUI', null)
    streamVideoElement.srcObject.getTracks().forEach((track) => track.stop());
    streamVideoElement.srcObject = null;
    if (streamVideoElement.paused) {
      streamVideoElement
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }
}

function closePC(pc = peerConnection) {
  if (!pc) return;
  console.log('stopping peer connection');
  pc.close();
  pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
  pc.removeEventListener('icecandidate', onIceCandidate, true);
  pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
  pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
  pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
  pc.removeEventListener('track', onTrack, true);
  pc.removeEventListener('onmessage', onStreamEvent, true);

  clearInterval(statsIntervalId);
  isStreamReady = !stream_warmup;
  console.log('stopped peer connection');
  if (pc === peerConnection) {
    peerConnection = null;
  }
}

const maxRetryCount = 3;
const maxDelaySec = 4;

async function fetchWithRetries(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= maxRetryCount) {
      const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
      return fetchWithRetries(url, options, retries + 1);
    } else {
      throw new Error(`Max retries exceeded. error: ${err}`);
    }
  }
}

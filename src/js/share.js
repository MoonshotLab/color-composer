const config = require('./../../config');

const RecordRTC = require('recordrtc');

const ui = require('./ui');
const sound = require('./sound');

const drawCanvas = document.getElementById(config.canvasId);
const canvasRecorder = RecordRTC(drawCanvas, {
  type: 'canvas',
});

export function record() {
  startRecording();

  const now = new Date().getTime();

  sound.asyncPlayCompositionOnce().then(() => {
    stopRecording();
    // return sound.asyncPlayCompositionOnce().then(() => {
    //   stopRecording();
    // });
  }).error((e) => {
    stopRecording();
  });
}
//
// let audioRecorder;
// let chunks = [];
// let buffer;
// let offlineCtx;
// let source;
// let chunks = [];
// let dest;
// let audioRecorder;
let context = new AudioContext();
// let offlineCtx;
// let sourceNode;

function startRecording() {
  Howler.masterGain.connect(context.destination);
  // dest = context.createMediaStreamDestination();
  // Howler.ctx.connect(dest);
  // audioRecorder = new MediaRecorder(dest.stream);
  // audioRecorder.ondataavailable = function(e) {
  //   // push each chunk (blobs) in an array
  //   chunks.push(e.data);
  // };
  //
  // audioRecorder.start();
  // console.log('start recording');
  // offlineCtx = new OfflineAudioContext(2, Howler.ctx.sampleRate * 40, Howler.ctx.sampleRate);
  // sourceNode = offlineCtx.createMediaStreamSource
  // source = offlineCtx.createBufferSource();
  // console.log(offlineCtx);
  // let processor = Howler.ctx.createScriptProcessor();
  // console.log(processor);
  // let otherNode = AudioNode.connect(node);
  // console.log(otherNode);
  // audioRecorder = new Recorder(processor);
  // audioRecorder.record();
  // navigator.getUserMedia({ audio: true }, function(audioStream) {
  // audioRecorder = RecordRTC(processor);
  // audioRecorder.startRecording();
  //   // audioRecorder = new MediaRecorder(stream);
  //   // console.log(audioRecorder.state);
  //   // audioRecorder.ondataavailable = function(e) {
  //   //   console.log('hi');
  //   //   chunks.push(e.data);
  //   // }
  //   // audioRecorder.start();
  //   // console.log(audioRecorder.state);
  //   // audioRecorder = new Recorder(stream);
  //   // audioRecorder.record();
  //
  //   // recordAudio.startRecording();
  //   // mediaRecorder = new MediaStreamRecorder(stream);
  //   // mediaRecorder.mimeType = 'video/webm';
  //   // mediaRecorder.ondataavailable = function (blob) {
  //   //   console.log('hi');
  //   //     // POST/PUT "Blob" using FormData/XHR2
  //   //     // let blobURL = URL.createObjectURL(blob);
  //   //     // document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
  //   //     // download(blob, 'foo.webm');
  //   // };
  //   // mediaRecorder.start();
  //
  // }, function(error) { console.log( JSON.stringify ( error ) ); });
  // canvasRecorder.startRecording();
}

function stopRecording() {
  console.log('stop recording');
  audioRecorder.stop();
  console.log(chunks);
  // audioRecorder.exportWAV(function(blob) {
  //   // Recorder.forceDownload(blob);
  //   console.log(blob);
  //   download(blob);
  // });
  // audioRecorder.stopRecording(function(audioURL) {
  //   // audio.src = audioURL;
  //
  //   var recordedBlob = audioRecorder.getBlob();
  //   download(recordedBlob);
  //   // audioRecorder.getDataURL(function(dataURL) { });
  // });
  // audioRecorder.stop();
  // console.log(chunks);
  // var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
  // // download(blob, 'foo.ogg');
  // chunks = [];
  // mediaRecorder.stop();
  // mediaRecorder.save();
  // audioRecorder.stop();
  // audioRecorder.exportWAV(function(blob) {
  //   download(blob, 'test.wav');
  // });
  // canvasRecorder.stopRecording(function() {
  //   console.log('stopping recording');
  //   const blob = canvasRecorder.getBlob();
  //   download(blob, 'blob.webm');
  // });
}

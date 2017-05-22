const videoSelect = document.querySelector('select#videoSource');
const videoElement = document.querySelector('video');

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.

  for (let i = 0; i !== deviceInfos.length; ++i) {
    let deviceInfo = deviceInfos[i];
    let option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);

      console.log(videoSelect.contains(option.value));

      if (!videoSelect.contains(option.value)) {
        videoSelect.appendChild(option);
      }
    }
  }
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
   videoSource = '782d0935ea4d7e9d38d6caddd532a3524f35c75d0a6885fe3ea7e6ac3d9091ea';
  console.log('selecting source ', videoSource)
  var constraints = {
    video: {
      deviceId: videoSource ? {exact: videoSource} : undefined,
      width: {exact: 640},    //new syntax
      height: {exact: 480}   //new syntax
    }
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

videoSelect.onchange = start;

start();

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

HTMLSelectElement.prototype.contains = function (value) {

  for (var i = 0, l = this.options.length; i < l; i++) {

    if (this.options[i].value == value) {

      return true;

    }

  }

  return false;

}

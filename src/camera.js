const tracking = global.tracking;
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3333');

import './index.scss';

import './lib/videoSource';

let LEFTBAT_Y, RIGHTBAT_Y;

let drawZones = (canvas, context) => {
  context.strokeStyle = '#00ff00';
  context.strokeRect(0, 0, (canvas.width / 5), canvas.height);
  context.font = '11px Helvetica';
  context.fillStyle = '#ffffff';
  context.fillText('LEFT ZONE', 5, 22);

  context.strokeRect(canvas.width, 0, -(canvas.width / 5  ), canvas.height);
  context.fillText('RIGHT ZONE', canvas.width - 73, 22);
};

let map_range = (value, max, minrange, maxrange) => {
  return Math.round(((max - value) / (max)) * (maxrange - minrange)) + minrange;
}

window.onload = function () {

  const video = document.getElementById('tracking-video');
  const canvas = document.getElementById('tracking-canvas');
  const context = canvas.getContext('2d');

  const videoCanvas = document.createElement('canvas');
  const videoContext = videoCanvas.getContext('2d');

  var requestAnimationFrame_ = () => {
    window.requestAnimationFrame(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          // Firefox v~30.0 gets confused with the video readyState firing an
          // erroneous HAVE_ENOUGH_DATA just before HAVE_CURRENT_DATA state,
          // hence keep trying to read it until resolved.
          videoContext.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (err) {
        }
      }
      requestAnimationFrame_();
    });
  };

  requestAnimationFrame_();

  const LaserTracker = function () {
    LaserTracker.base(this, 'constructor');
  };

  tracking.Fast.THRESHOLD = 30;
  LaserTracker.prototype.threshold = tracking.Fast.THRESHOLD;

  tracking.inherits(LaserTracker, tracking.Tracker);

  tracking.ColorTracker.registerColor('red', (r, g, b) => {
    if (r > 120 && g < 180 && b < 220) {
      return true;
    }
    return false;
  });

  LaserTracker.prototype.track = function (pixels, width, height) {

    // const leftImagePart = videoContext.getImageData(0, 0, width / 4, height);
    //
    // const gray = tracking.Image.grayscale(leftImagePart.data, width / 4, height * 2);
    // console.log('leftpartHeight', leftImagePart.height);
    //
    // const corners = tracking.Fast.findCorners(gray, width / 4, height);
    // console.log('cornerHEigth', leftImagePart.height);
    //
    // context.strokeStyle = '#5b73f3';
    // context.strokeRect(0, 0, (width / 4), height);

    const gray = tracking.Image.grayscale(pixels, width, height);
    const corners = tracking.Fast.findCorners(gray, width, height);

    this.emit('track', {
      // data: _.sortedUniq(corners)
      data: corners
    });
  };

  // const tracker = new tracking.ColorTracker(['red']);
  const tracker = new LaserTracker();

  tracking.track('#tracking-video', tracker, {camera: true});

  tracker.on('track', event => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawZones(canvas, context);

    // const leftImagePart = videoContext.getImageData(0, 0, canvas.width / 4, canvas.height);
    // const corners = tracking.Fast.findCorners(leftImagePart, leftImagePart.width, leftImagePart.height);

    const corners = event.data;
    const leftCornersY = [];
    const rightCornersY = [];

    for (let i = 0; i < corners.length; i += 2) {
      const cornerX = corners[i];
      const cornerY = corners[i + 1];

      if (cornerX < canvas.width / 5) {
        // LEFT BAT ZONE
        leftCornersY.push(cornerY);

        context.strokeStyle = '#0cff51';
        context.strokeRect(cornerX, cornerY, 2, 2);
        context.font = '11px Helvetica';
        context.fillStyle = '#ffffff';
        context.fillText('x: ' + cornerX + 'px', cornerX + 2, cornerY + 11);
        context.fillText('y: ' + cornerY + 'px', cornerX + 2, cornerY + 22);
      } else if (cornerX > (canvas.width / 5) * 4) {
        // RIGH BAT ZONE
        rightCornersY.push(cornerY);

        context.strokeStyle = '#faff11';
        context.strokeRect(cornerX, cornerY, 2, 2);
        context.font = '11px Helvetica';
        context.fillStyle = '#ffffff';
        context.fillText('x: ' + cornerX + 'px', cornerX + 2, cornerY + 11);
        context.fillText('y: ' + cornerY + 'px', cornerX + 2, cornerY + 22);
      }
    }

    LEFTBAT_Y = map_range((leftCornersY.reduce((sum, a) => {
      return sum + a;
    }, 0) / (leftCornersY.length || 1)), 330, window.innerHeight, 0);

    RIGHTBAT_Y = map_range((rightCornersY.reduce((sum, a) => {
      return sum + a;
    }, 0) / (rightCornersY.length || 1)), 330, window.innerHeight, 0);

    socket.emit('laser', {
      'LEFTBAT_Y': LEFTBAT_Y,
      'RIGHTBAT_Y': RIGHTBAT_Y
    });
  });

};


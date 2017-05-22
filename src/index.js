import Game from './app/Game';
const tracking = global.tracking;
global.cache = {
  corners: []
};

import './index.scss';

import './lib/videoSource';

window.onload = function () {
  const game = new Game();
  // game.canvas.id = 'game';
  game.init();
  //
  // $('body').on('mousemove', e => {
  //   global.MOUSE_X = e.pageX;
  //   gobal.MOUSE_Y = e.pageY;
  // });

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
  //
  tracking.ColorTracker.registerColor('red', (r, g, b) => {
    if (r > 120 && g < 180 && b < 220) {
      return true;
    }
    return false;
  });
  //
  // LaserTracker.prototype.track = function (pixels, width, height) {
  //   const gray = tracking.Image.grayscale(pixels, width, height);
  //   const corners = tracking.Fast.findCorners(gray, width, height);
  //
  //   this.emit('track', {
  //     data: corners
  //   });
  // };

  const tracker = new tracking.ColorTracker(['red']);
  // const tracker = new LaserTracker();

  tracking.track('#tracking-video', tracker, {camera: true});

  tracker.on('track', event => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#00ff00';
    context.strokeRect(0, 0, (canvas.width / 4), canvas.height);
    context.font = '11px Helvetica';
    context.fillStyle = '#ffffff';
    context.fillText('LEFT ZONE', 5, 22);

    context.strokeRect(canvas.width, 0, -(canvas.width / 4), canvas.height);
    context.fillText('RIGHT ZONE', canvas.width - 73, 22);
    const cornersArray = [];

    if (event.data.length === 0) {
      console.log('No colors were detected in this frame.');
    } else {
      event.data.forEach(rect => {
        context.strokeStyle = rect.color;
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.font = '11px Helvetica';
        context.fillStyle = '#ffffff';
        context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);

        // const grayImageData = tracking.Image.grayscale(videoContext.getImageData(rect.x, rect.y, rect.width, rect.height), rect.width, rect.height);
        // context.putImageData(videoContext.getImageData(rect.x, rect.y, rect.width, rect.height), rect.x, rect.y);

        // const gray = tracking.Image.grayscale(videoContext.getImageData(rect.x, rect.y, rect.width, rect.height), rect.width, rect.height);

        const detectedImagePart = videoContext.getImageData(rect.x, rect.y, rect.width, rect.height);
        // context.putImageData(detectedImagePart, 0, 0);

        const corners = tracking.Fast.findCorners(detectedImagePart, rect.width, rect.height);

        console.log(corners);
        context.strokeStyle = '#0f0';
        for (let i = 0; i < corners.length; i += 2) {
          const cornerX = corners[i];
          const cornerY = corners[i + 1];

          // if (cornerX < canvas.width / 4 || cornerX > (canvas.width / 4) * 3) {
            context.strokeRect(cornerX, cornerY, 2, 2);
            context.font = '11px Helvetica';
            context.fillStyle = '#ffffff';
            context.fillText('x: ' + cornerX + 'px', cornerX + 2, cornerY + 11);
            context.fillText('y: ' + cornerY + 'px', cornerX + 2, cornerY + 22);
          // }
        }
        // cornersArray.push(corners);
      });

      // const corners = event.data;
      //
      //
    }
  });
};

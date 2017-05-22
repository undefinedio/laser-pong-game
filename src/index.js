import Game from './app/Game';
import io from 'socket.io-client';

import './index.scss';

const socket = io.connect('http://localhost:3333');
global.RIGHTBAT_Y = 0;
global.LEFTBAT_Y = 0;

window.onload = function () {
  const game = new Game();
  game.init();

  socket.on('laser', data => {
    global.LEFTBAT_Y = data.LEFTBAT_Y;
    global.RIGHTBAT_Y = data.RIGHTBAT_Y;
  });
};

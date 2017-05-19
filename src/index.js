import Game from './app/Game';
import $ from 'jquery';

import './index.scss';

$(document).ready(() => {
  const game = new Game();
  //
  game.init();
  //
  // $('body').on('mousemove', e => {
  //   global.MOUSE_X = e.pageX;
  //   gobal.MOUSE_Y = e.pageY;
  // });
});

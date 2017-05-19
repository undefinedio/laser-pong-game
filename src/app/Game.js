import Pong from './states/Pong';
const Phaser = global.Phaser;

class Game extends Phaser.Game {
  constructor() {
    super(document.getElementById('root').clientWidth * 2, document.getElementById('root').clientHeight * 2, Phaser.CANVAS, 'game', null, true);

    this.state.add('Pong', Pong, false);
  }

  init() {
    this.state.start('Pong', true, false);
  }
}

export default Game;

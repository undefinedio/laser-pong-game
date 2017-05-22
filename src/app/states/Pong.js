const $ = require('jquery');
const Phaser = global.Phaser;

class Pong extends Phaser.State {
  init() {
    this.input.maxPointers = 1;
    this.$line = $('.js-line');
    this.stage.disableVisibilityChange = false;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.refresh();

    this.gameProperties = {
      debug: false,
      demo: false,
      intro: true,

      ballVelocity: 1000,
      ballVelocityIncrease: 100,
      ballStartDelay: 1,
      ballSize: 0.4,

      dashSize: 30,

      ballRandomStartingAngleLeft: [-120, 120],
      ballRandomStartingAngleRight: [-60, 60],

      paddleLeftX: 50,
      paddleRightX: 590,
      paddleVelocity: 1000,
      paddlePadding: 50,
      paddleTopGap: 22,
      paddleSegmentsMax: 5,
      paddleSegmentHeight: 265 / 10,
      paddleSegmentAngle: 15
    };

    this.graphicAssets = {
      ballURL: 'app/images/ball.png',
      ballName: 'ball',

      paddleURL: 'app/images/paddle.png',
      paddleName: 'paddle'
    };

    this.fontAssets = {
      scoreLeft_x: this.game.world.width * 0.25,
      scoreRight_x: this.game.world.width * 0.75,
      scoreTop_y: 10,

      scoreFontStyle: {font: '80px Arial', fill: '#FFFFFF', align: 'center'},
    };

    this.soundAssets = {
      ballBounceURL: 'app/sounds/ballBounce',
      ballBounceName: 'ballBounce',

      ballHitURL: 'app/sounds/ballHit',
      ballHitName: 'ballHit',

      ballMissedURL: 'app/sounds/ballMissed',
      ballMissedName: 'ballMissed',

      mp4URL: '.m4a',
      oggURL: '.ogg'
    };
  }

  render() {
    if (this.gameProperties.debug) {
      this.game.debug.spriteInfo(this.ballSprite, 32, 32);
    }
  }

  update() {
    this.moveLeftPaddle();
    this.moveRightPaddle();

    this.game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);

    if (this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down || this.ballSprite.body.blocked.left || this.ballSprite.body.blocked.right) {
      // this.sndBallBounce.play();
      this.reverseBall();
    }
  }

  create() {
    this.gameProperties.ballVelocityStart = this.gameProperties.ballVelocity;

    this.$line.removeClass('show');

    this.initGraphics();
    this.initSounds();
    this.initPhysics();
    this.initKeyboard();
    this.enableElements(false);

    this.startWithoutAnimation();
  }

  startWithoutAnimation() {
    this.ballSprite.scale.setTo(this.gameProperties.ballSize);
    // this.ballSprite.animations.play('run', 20, true);
    // this.$info.addClass('show');

    this.startGame();
  }

  preload() {
    this.game.canvas.id = 'game';

    this.game.load.image(this.graphicAssets.ballName, this.graphicAssets.ballURL);
    this.game.load.image(this.graphicAssets.paddleName, this.graphicAssets.paddleURL);

    this.game.load.audio(this.soundAssets.ballBounceName, [this.soundAssets.ballBounceURL + this.soundAssets.mp4URL, this.soundAssets.ballBounceURL + this.soundAssets.oggURL]);
    this.game.load.audio(this.soundAssets.ballHitName, [this.soundAssets.ballHitURL + this.soundAssets.mp4URL, this.soundAssets.ballHitURL + this.soundAssets.oggURL]);
    this.game.load.audio(this.soundAssets.ballMissedName, [this.soundAssets.ballMissedURL + this.soundAssets.mp4URL, this.soundAssets.ballMissedURL + this.soundAssets.oggURL]);
  }

  initSounds() {
    this.sndBallHit = this.game.add.audio(this.soundAssets.ballHitName);
    this.sndBallBounce = this.game.add.audio(this.soundAssets.ballBounceName);
    this.sndBallMissed = this.game.add.audio(this.soundAssets.ballMissedName);
  }

  initGraphics() {
    this.paddleLeftSprite = this.game.add.sprite(this.gameProperties.paddlePadding, this.game.world.centerY, this.graphicAssets.paddleName);
    this.paddleLeftSprite.anchor.set(0.5, 0.5);
    this.paddleLeftSprite.scale.setTo(1.5);

    this.paddleRightSprite = this.game.add.sprite((this.game.world.width - this.gameProperties.paddlePadding), this.game.world.centerY, this.graphicAssets.paddleName);
    this.paddleRightSprite.anchor.set(0.5, 0.5);
    this.paddleRightSprite.scale.setTo(1.5);

    this.ballSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, this.graphicAssets.ballName);
    this.ballSprite.anchor.set(0.5, 0.5);
    // this.ballSprite.animations.add('run');

    this.tf_scoreLeft = this.game.add.text(this.fontAssets.scoreLeft_x, this.fontAssets.scoreTop_y, "0", this.fontAssets.scoreFontStyle);
    this.tf_scoreLeft.anchor.set(0.5, 0);

    this.tf_scoreRight = this.game.add.text(this.fontAssets.scoreRight_x, this.fontAssets.scoreTop_y, "0", this.fontAssets.scoreFontStyle);
    this.tf_scoreRight.anchor.set(0.5, 0);
  }

  initPhysics() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.enable(this.ballSprite);

    this.ballSprite.checkWorldBounds = true;
    this.ballSprite.body.collideWorldBounds = true;
    this.ballSprite.body.immovable = true;
    this.ballSprite.body.bounce.set(1);

    this.paddleGroup = this.game.add.group();
    this.paddleGroup.enableBody = true;
    this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;

    this.paddleGroup.add(this.paddleLeftSprite);
    this.paddleGroup.add(this.paddleRightSprite);

    this.paddleGroup.setAll('checkWorldBounds', true);
    this.paddleGroup.setAll('body.collideWorldBounds', true);
    this.paddleGroup.setAll('body.immovable', true);

    this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);
  }

  startBall() {
    this.ballSprite.visible = true;

    let randomAngle = this.game.rnd.pick(this.gameProperties.ballRandomStartingAngleRight.concat(this.gameProperties.ballRandomStartingAngleLeft));

    if (this.missedSide === 'right') {
      randomAngle = this.game.rnd.pick(this.gameProperties.ballRandomStartingAngleRight);
    } else if (this.missedSide === 'left') {
      randomAngle = this.game.rnd.pick(this.gameProperties.ballRandomStartingAngleLeft);
    }

    this.game.physics.arcade.velocityFromAngle(randomAngle, this.gameProperties.ballVelocity, this.ballSprite.body.velocity);
  }

  startGame() {
    // this.$info.addClass('bottom');
    this.$line.addClass('show');
    this.enableElements(true);
    this.enableBoundaries(false);
    this.resetScores();
    this.startBall();
  }

  resetBall() {
    this.ballSprite.reset(this.game.world.centerX, this.game.rnd.between(0, this.game.world.height));

    this.ballSprite.visible = false;
    this.game.time.events.add(Phaser.Timer.SECOND * this.gameProperties.ballStartDelay, this.startBall, this);

    // if (this.scoreLeft + this.scoreRight >= 1) {
    //   this.game.state.start('Pong', true, false);
    // }
  }

  enableElements(enabled) {
    this.paddleGroup.setAll('visible', enabled);
    this.paddleGroup.setAll('body.enable', enabled);

    this.paddleLeftUp.enabled = enabled;
    this.paddleLeftDown.enabled = enabled;

    this.paddleLeftSprite.y = this.game.world.centerY;
    this.paddleRightSprite.y = this.game.world.centerY;
  }

  initKeyboard() {
    this.paddleLeftUp = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.paddleLeftDown = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  }

  moveRightPaddle() {
    let value = global.RIGHTBAT_Y << 2;

    if (value === 0) {
      this.paddleRightSprite.body.velocity.y = 0;

    } else if ((this.paddleRightSprite.body.position.y > value) && value !== 0) {
      this.paddleRightSprite.body.velocity.y = -this.gameProperties.paddleVelocity;

    } else if (((this.paddleRightSprite.body.position.y + this.paddleRightSprite.body.height) < value) && value !== 0) {
      this.paddleRightSprite.body.velocity.y = this.gameProperties.paddleVelocity;

    } else {
      this.paddleRightSprite.body.velocity.y = 0;
    }

    if (this.paddleRightSprite.body.y < this.gameProperties.paddleTopGap) {
      this.paddleRightSprite.body.y = this.gameProperties.paddleTopGap;
      this.paddleRightSprite.body.y = this.gameProperties.paddleTopGap;
    }
  }

  moveLeftPaddle() {
    const value = global.LEFTBAT_Y << 2;

    console.log(value);

    if (value === 0) {
      this.paddleLeftSprite.body.velocity.y = 0;

    } else if ((this.paddleLeftSprite.body.position.y > value) && value !== 0) {
      this.paddleLeftSprite.body.velocity.y = -this.gameProperties.paddleVelocity;

    } else if (((this.paddleLeftSprite.body.position.y + this.paddleLeftSprite.body.height) < value) && value !== 0) {
      this.paddleLeftSprite.body.velocity.y = this.gameProperties.paddleVelocity;

    } else {
      this.paddleLeftSprite.body.velocity.y = 0;
    }

    if (this.paddleLeftSprite.body.y < this.gameProperties.paddleTopGap) {
      this.paddleLeftSprite.body.y = this.gameProperties.paddleTopGap;
      this.paddleLeftSprite.body.y = this.gameProperties.paddleTopGap;
    }
  }

  collideWithPaddle(ball, paddle) {
    this.gameProperties.ballVelocity += this.gameProperties.ballVelocityIncrease;
    // this.sndBallHit.play();

    let returnAngle;
    let segmentHit = Math.floor((ball.y - paddle.y) / this.gameProperties.paddleSegmentHeight);

    if (segmentHit >= this.gameProperties.paddleSegmentsMax) {
      segmentHit = this.gameProperties.paddleSegmentsMax - 1;
    } else if (segmentHit <= -this.gameProperties.paddleSegmentsMax) {
      segmentHit = -(this.gameProperties.paddleSegmentsMax - 1);
    }

    if (paddle.x < this.game.world.width * 0.5) {
      returnAngle = segmentHit * this.gameProperties.paddleSegmentAngle;
      this.game.physics.arcade.velocityFromAngle(returnAngle, this.gameProperties.ballVelocity, this.ballSprite.body.velocity);
    } else {
      returnAngle = 180 - (segmentHit * this.gameProperties.paddleSegmentAngle);
      if (returnAngle > 180) {
        returnAngle -= 360;
      }

      this.game.physics.arcade.velocityFromAngle(returnAngle, this.gameProperties.ballVelocity, this.ballSprite.body.velocity);
    }
  }

  enableBoundaries(enabled) {
    this.game.physics.arcade.checkCollision.left = enabled;
    this.game.physics.arcade.checkCollision.right = enabled;
  }

  ballOutOfBounds() {
    // this.sndBallMissed.play();
    this.gameProperties.ballVelocity = this.gameProperties.ballVelocityStart;

    if (this.ballSprite.x < 0) {
      this.missedSide = 'left';
      this.scoreRight++;
    } else if (this.ballSprite.x > this.game.world.width) {
      this.missedSide = 'right';
      this.scoreLeft++;
    }

    this.resetBall();
  }

  resetScores() {
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.updateScoreTextFields();
  }

  updateScoreTextFields() {
    this.tf_scoreLeft.text = this.scoreLeft;
    this.tf_scoreRight.text = this.scoreRight;
  }

  reverseBall() {
    // this.ballSprite.animations.currentAnim.speed = this.game.rnd.integerInRange(20, 40);
    // this.game.add.tween(this.ballSprite).to({angle: this.game.rnd.integerInRange(-360, 360)}, 1000, Phaser.Easing.Linear.none, true);
  }
}

export default Pong;

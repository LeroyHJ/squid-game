class SpaceShooter {
  constructor() {
    // keys
    this.KEY_UP = 87;
    this.KEY_DOWN = 83;
    this.KEY_RIGHT = 68;
    this.KEY_LEFT = 65;
    this.KEY_SPACE = 32;

    // size
    this.GAME_WIDTH = 720;
    this.GAME_HEIGHT = 360;

    // state
    this.STATE = {
      x_pos: 0,
      y_pos: 0,
      move_right: false,
      move_left: false,
      shoot: false,
      lasers: [],
      enemyLasers: [],
      enemies: [],
      spaceship_width: 50,
      enemy_width: 50,
      cooldown: 0,
      number_of_enemies: 14,
      enemy_cooldown: 0,
      gameOver: false,
    };

    // container
    this.$container = document.querySelector(".main");
  }

  run() {
    // display container
    this.createPlayer(this.$container);
    this.createEnemies(this.$container);
    window.addEventListener("keydown", this.KeyPress);
    window.addEventListener("keyup", this.KeyRelease);
    this.update();
  }

  end() {
    // hide container
    window.removeEventListener("keydown", this.KeyPress);
    window.removeEventListener("keyup", this.KeyRelease);
  }

  update() {
    this.updatePlayer();
    this.updateEnemies(this.$container);
    this.updateLaser(this.$container);
    this.updateEnemyLaser(this.$container);

    window.requestAnimationFrame(update);

    if (this.STATE.gameOver) {
      document.querySelector(".lose").style.display = "block";
    }
    if (this.STATE.enemies.length == 0) {
      document.querySelector(".win").style.display = "block";
    }
  }

  createEnemies($container) {
    for (var i = 0; i <= this.STATE.number_of_enemies / 2; i++) {
      this.createEnemy(this.$container, i * 80, 60);
    }
    // } for(var i = 0; i <= this.STATE.number_of_enemies/2; i++){
    //   this.createEnemy(this.$container, i*80, 180);
    // }
  }

  setPosition($element, x, y) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
  }

  setSize($element, width) {
    $element.style.width = `${width}px`;
    $element.style.height = "auto";
  }

  bound(x) {
    if (x >= this.GAME_WIDTH - this.STATE.spaceship_width) {
      this.STATE.x_pos = this.GAME_WIDTH - this.STATE.spaceship_width;
      return this.GAME_WIDTH - this.STATE.spaceship_width;
    }
    if (x <= 0) {
      this.STATE.x_pos = 0;
      return 0;
    } else {
      return x;
    }
  }

  collideRect(rect1, rect2) {
    return !(
      rect2.left > rect1.right ||
      rect2.right < rect1.left ||
      rect2.top > rect1.bottom ||
      rect2.bottom < rect1.top
    );
  }

  createEnemy($container, x, y) {
    const $enemy = document.createElement("img");
    $enemy.src = "img/ufo.png";
    $enemy.className = "enemy";
    this.$container.appendChild($enemy);
    const enemy_cooldown = Math.floor(Math.random() * 100);
    const enemy = { x, y, $enemy, enemy_cooldown };
    this.STATE.enemies.push(enemy);
    this.setSize($enemy, this.STATE.enemy_width);
    this.setPosition($enemy, x, y);
  }

  updateEnemies($container) {
    const dx = Math.sin(Date.now() / 1000) * 40;
    const dy = Math.cos(Date.now() / 1000) * 30;
    const enemies = this.STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      var a = enemy.x + dx;
      var b = enemy.y + dy;
      this.setPosition(enemy.$enemy, a, b);
      enemy.cooldown = Math.random(0, 100);
      if (enemy.enemy_cooldown == 0) {
        this.createEnemyLaser(this.$container, a, b);
        enemy.enemy_cooldown = Math.floor(Math.random() * 50) + 100;
      }
      enemy.enemy_cooldown -= 0.5;
    }
  }

  createPlayer($container) {
    this.STATE.x_pos = this.GAME_WIDTH / 2;
    this.STATE.y_pos = this.GAME_HEIGHT - 50;
    const $player = document.createElement("img");
    $player.src = "img/spaceship.png";
    $player.className = "player";
    this.$container.appendChild($player);
    this.setPosition($player, this.STATE.x_pos, this.STATE.y_pos);
    this.setSize($player, this.STATE.spaceship_width);
  }

  updatePlayer() {
    if (this.STATE.move_left) {
      this.STATE.x_pos -= 3;
    }
    if (this.STATE.move_right) {
      this.STATE.x_pos += 3;
    }
    if (this.STATE.shoot && this.STATE.cooldown == 0) {
      this.createLaser(
        this.$container,
        this.STATE.x_pos - this.STATE.spaceship_width / 2,
        this.STATE.y_pos
      );
      this.STATE.cooldown = 30;
    }
    const $player = document.querySelector(".player");
    this.setPosition(
      $player,
      this.bound(this.STATE.x_pos),
      this.STATE.y_pos - 10
    );
    if (this.STATE.cooldown > 0) {
      this.STATE.cooldown -= 0.5;
    }
  }

  createLaser($container, x, y) {
    const $laser = document.createElement("img");
    $laser.src = "img/laser.png";
    $laser.className = "laser";
    this.$container.appendChild($laser);
    const laser = { x, y, $laser };
    this.STATE.lasers.push(laser);
    this.setPosition($laser, x, y);
  }

  updateLaser($container) {
    const lasers = this.STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
      const laser = lasers[i];
      laser.y -= 2;
      if (laser.y < 0) {
        this.deleteLaser(lasers, laser, laser.$laser);
      }
      this.setPosition(laser.$laser, laser.x, laser.y);
      const laser_rectangle = laser.$laser.getthis.BoundingClientRect();
      const enemies = this.STATE.enemies;
      for (let j = 0; j < enemies.length; j++) {
        const enemy = enemies[j];
        const enemy_rectangle = enemy.$enemy.getthis.BoundingClientRect();
        if (this.collideRect(enemy_rectangle, laser_rectangle)) {
          this.deleteLaser(lasers, laser, laser.$laser);
          const index = enemies.indexOf(enemy);
          enemies.splice(index, 1);
          this.$container.removeChild(enemy.$enemy);
        }
      }
    }
  }

  createEnemyLaser($container, x, y) {
    const $enemyLaser = document.createElement("img");
    $enemyLaser.src = "img/enemyLaser.png";
    $enemyLaser.className = "enemyLaser";
    this.$container.appendChild($enemyLaser);
    const enemyLaser = { x, y, $enemyLaser };
    this.STATE.enemyLasers.push(enemyLaser);
    this.setPosition($enemyLaser, x, y);
  }

  updateEnemyLaser($container) {
    const enemyLasers = this.STATE.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
      const enemyLaser = enemyLasers[i];
      enemyLaser.y += 2;
      if (enemyLaser.y > this.GAME_HEIGHT - 30) {
        this.deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
      }
      const enemyLaser_rectangle =
        enemyLaser.$enemyLaser.getthis.BoundingClientRect();
      const spaceship_rectangle = document
        .querySelector(".player")
        .getthis.BoundingClientRect();
      if (this.collideRect(spaceship_rectangle, enemyLaser_rectangle)) {
        this.STATE.gameOver = true;
      }
      this.setPosition(
        enemyLaser.$enemyLaser,
        enemyLaser.x + this.STATE.enemy_width / 2,
        enemyLaser.y + 15
      );
    }
  }

  deleteLaser(lasers, laser, $laser) {
    const index = lasers.indexOf(laser);
    lasers.splice(index, 1);
    this.$container.removeChild($laser);
  }

  KeyPress(event) {
    if (event.keyCode === this.KEY_RIGHT) {
      this.STATE.move_right = true;
    } else if (event.keyCode === this.KEY_LEFT) {
      this.STATE.move_left = true;
    } else if (event.keyCode === this.KEY_SPACE) {
      this.STATE.shoot = true;
    }
  }

  KeyRelease(event) {
    if (event.keyCode === this.KEY_RIGHT) {
      this.STATE.move_right = false;
    } else if (event.keyCode === this.KEY_LEFT) {
      this.STATE.move_left = false;
    } else if (event.keyCode === this.KEY_SPACE) {
      this.STATE.shoot = false;
    }
  }
}

module.exports = SpaceShooter;

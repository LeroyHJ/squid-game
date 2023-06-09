var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// lib/vector.js
var require_vector = __commonJS({
  "lib/vector.js"(exports, module2) {
    var Vec = class {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
      plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
      }
      times(factor) {
        return new Vec(this.x * factor, this.y * factor);
      }
    };
    module2.exports = Vec;
  }
});

// lib/player.js
var require_player = __commonJS({
  "lib/player.js"(exports, module2) {
    var Vec = require_vector();
    var Player = class {
      constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
        this.xySpeed = 6;
      }
      get type() {
        return "player";
      }
      static create(pos) {
        return new Player(pos, new Vec(0, 0));
      }
      update(time, state, keys) {
        let xSpeed = 0;
        if (keys.ArrowLeft)
          xSpeed -= this.xySpeed;
        if (keys.ArrowRight)
          xSpeed += this.xySpeed;
        let ySpeed = 0;
        if (keys.ArrowUp)
          ySpeed -= this.xySpeed;
        if (keys.ArrowDown)
          ySpeed += this.xySpeed;
        let pos = this.pos;
        let movedX = pos.plus(new Vec(xSpeed * time, 0));
        if (!state.level.touchesElement(movedX, this.size, "wall")) {
          pos = movedX;
        }
        let movedY = pos.plus(new Vec(0, ySpeed * time));
        if (!state.level.touchesElement(movedY, this.size, "wall")) {
          pos = movedY;
        }
        return new Player(pos, new Vec(xSpeed, ySpeed));
      }
    };
    Player.prototype.size = new Vec(1, 1);
    module2.exports = Player;
  }
});

// lib/blockJumpGame.js
var require_blockJumpGame = __commonJS({
  "lib/blockJumpGame.js"(exports, module2) {
    var BlockJumpGame = class {
      constructor(cookieJarId) {
        this.character = document.getElementById("character");
        this.block = document.getElementById("block");
        this.jumpButton = document.getElementById("jump-button");
        this.startButton = document.getElementById("start-button");
        this.startButton.addEventListener("click", this.start);
        this.jumpButton.addEventListener("click", this.jump);
        this.jumpCounter = 0;
        this.callback;
        this.cookieJarId = cookieJarId;
      }
      run = (callback) => {
        this.checkIfDead();
        this.displayMessage("Jump over the meteorites!");
        this.callback = callback;
        document.getElementById("block_jump_game_container").style.display = "inline";
      };
      start = () => {
        this.block.style.animation = "block 1s infinite linear";
      };
      displayMessage = (message) => {
        document.getElementById("text").textContent = message;
      };
      end = () => {
        document.getElementById("block_jump_game_container").style.display = "none";
        this.jumpCounter = 0;
        clearInterval(this.setInterval);
        this.startButton.removeEventListener("click", this.start);
        this.jumpButton.removeEventListener("click", this.jump);
        this.block.style.animation = "none";
      };
      checkIfDead = () => {
        this.setInterval = setInterval(() => {
          var characterTop = parseInt(
            window.getComputedStyle(this.character).getPropertyValue("top")
          );
          var blockLeft = parseInt(
            window.getComputedStyle(this.block).getPropertyValue("left")
          );
          if (blockLeft < 20 && blockLeft > 0 && characterTop >= 290) {
            this.end();
            this.displayMessage("You lost!");
            this.callback("Lost");
          }
        }, 10);
      };
      jump = () => {
        if (this.character.classList != "animate") {
          this.character.classList.add("animate");
          this.jumpCounter += 1;
          if (this.jumpCounter > 4) {
            setTimeout(() => {
              this.end();
              this.displayMessage("You won!");
              this.callback("Won");
            }, 500);
          }
        }
        setTimeout(function() {
          this.character.classList.remove("animate");
        }, 500);
      };
    };
    module2.exports = BlockJumpGame;
  }
});

// lib/state.js
var require_state = __commonJS({
  "lib/state.js"(exports, module2) {
    var State = class {
      constructor(level2, actors, status, miniGameStatus = null) {
        this.level = level2;
        this.actors = actors;
        this.status = status;
        this.miniGameStatus = miniGameStatus;
      }
      static start(level2) {
        return new State(level2, level2.startActors, "playing");
      }
      get player() {
        return this.actors.find((a) => a.type == "player");
      }
      update = function(time, keys) {
        let actors = this.actors.map((actor) => actor.update(time, this, keys));
        let newState = new State(
          this.level,
          actors,
          this.status,
          this.miniGameStatus
        );
        if (newState.status != "playing")
          return newState;
        let player = newState.player;
        for (let actor of actors) {
          if (actor != player && this.overlap(actor, player)) {
            newState = actor.collide(newState);
          }
        }
        const cookieJar1 = this.actors.find((actor) => actor.type == "cookieJar1");
        const cookieJar2 = this.actors.find((actor) => actor.type == "cookieJar2");
        if (!this.overlap(cookieJar1, player) && !this.overlap(cookieJar2, player) && (newState.miniGameStatus == "Won" || newState.miniGameStatus == "Lost")) {
          newState.miniGameStatus = null;
        }
        return newState;
      };
      overlap = function(actor1, actor2) {
        return actor1.pos.x + actor1.size.x > actor2.pos.x && actor1.pos.x < actor2.pos.x + actor2.size.x && actor1.pos.y + actor1.size.y > actor2.pos.y && actor1.pos.y < actor2.pos.y + actor2.size.y;
      };
    };
    module2.exports = State;
  }
});

// lib/cookieJar1.js
var require_cookieJar1 = __commonJS({
  "lib/cookieJar1.js"(exports, module2) {
    var Vec = require_vector();
    var BlockJumpGame = require_blockJumpGame();
    var State = require_state();
    var CookieJar1 = class {
      constructor(pos, speed, updatedState = null, miniGame = BlockJumpGame) {
        this.pos = pos;
        this.speed = speed;
        this.updatedState = updatedState;
        this.miniGame = miniGame;
      }
      get type() {
        return "cookieJar1";
      }
      static create(pos) {
        return new CookieJar1(pos, new Vec(0, 0));
      }
      update(time, state, keys) {
        return new CookieJar1(
          this.pos,
          this.speed,
          this.updatedState,
          this.miniGame
        );
      }
      collide(state) {
        if (state.miniGameStatus == null) {
          this.updatedState = new State(
            state.level,
            state.actors,
            state.status,
            "playing"
          );
          const miniGame = new this.miniGame();
          const callbackFunction = (result) => {
            if (result === "Lost") {
              let newState = new State(
                state.level,
                state.actors,
                state.status,
                "Lost"
              );
              this.updatedState = newState;
            } else if (result === "Won") {
              let newState = new State(
                state.level,
                state.actors,
                state.status,
                "Won"
              );
              this.updatedState = newState;
            }
          };
          miniGame.run(callbackFunction, this);
        }
        return this.updatedState;
      }
    };
    CookieJar1.prototype.size = new Vec(1, 1);
    module2.exports = CookieJar1;
  }
});

// lib/spaceShooterGame.js
var require_spaceShooterGame = __commonJS({
  "lib/spaceShooterGame.js"(exports, module2) {
    var SpaceShooterGame = class {
      constructor() {
        this.KEY_UP = 87;
        this.KEY_DOWN = 83;
        this.KEY_RIGHT = 68;
        this.KEY_LEFT = 65;
        this.KEY_SPACE = 32;
        this.GAME_WIDTH = 720;
        this.GAME_HEIGHT = 360;
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
          number_of_enemies: 12,
          enemy_cooldown: 0,
          gameOver: false
        };
        this.$container = document.querySelector(".space-shooter-game");
      }
      run = (callback) => {
        this.callback = callback;
        document.getElementById("space-shooter-game").style.display = "inline";
        this.createPlayer(this.$container);
        this.createEnemies(this.$container);
        window.addEventListener("keydown", this.KeyPress);
        window.addEventListener("keyup", this.KeyRelease);
        this.update();
      };
      end = () => {
        document.getElementById("space-shooter-game").style.display = "none";
        window.removeEventListener("keydown", this.KeyPress);
        window.removeEventListener("keyup", this.KeyRelease);
      };
      update = () => {
        this.updatePlayer();
        this.updateEnemies(this.$container);
        this.updateLaser(this.$container);
        this.updateEnemyLaser(this.$container);
        if (this.STATE.gameOver) {
          console.log("You lost!");
          this.end();
          this.callback("Lost");
        } else if (this.STATE.enemies.length == 0) {
          console.log("You won!");
          this.end();
          this.callback("Won!");
        } else {
          window.requestAnimationFrame(this.update);
        }
      };
      createEnemies = ($container) => {
        for (var i = 0; i <= this.STATE.number_of_enemies / 2; i++) {
          this.createEnemy(this.$container, i * 95, 23);
        }
      };
      setPosition = ($element, x, y) => {
        $element.style.transform = `translate(${x}px, ${y}px)`;
      };
      setSize = ($element, width) => {
        $element.style.width = `${width}px`;
        $element.style.height = "auto";
      };
      bound = (x) => {
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
      };
      collideRect = (rect1, rect2) => {
        return !(rect2.left > rect1.right || rect2.right < rect1.left || rect2.top > rect1.bottom || rect2.bottom < rect1.top);
      };
      createEnemy = ($container, x, y) => {
        const $enemy = document.createElement("img");
        $enemy.src = "img/ufo.png";
        $enemy.className = "enemy";
        this.$container.appendChild($enemy);
        const enemy_cooldown = Math.floor(Math.random() * 100);
        const enemy = { x, y, $enemy, enemy_cooldown };
        this.STATE.enemies.push(enemy);
        this.setSize($enemy, this.STATE.enemy_width);
        this.setPosition($enemy, x, y);
      };
      updateEnemies = ($container) => {
        const dx = Math.sin(Date.now() / 1e3) * 40;
        const dy = Math.cos(Date.now() / 1e3) * 30;
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
      };
      createPlayer = ($container) => {
        this.STATE.x_pos = this.GAME_WIDTH / 2;
        this.STATE.y_pos = this.GAME_HEIGHT - 50;
        const $player = document.createElement("img");
        $player.src = "img/spaceship.png";
        $player.className = "player";
        this.$container.appendChild($player);
        this.setPosition($player, this.STATE.x_pos, this.STATE.y_pos);
        this.setSize($player, this.STATE.spaceship_width);
      };
      updatePlayer = () => {
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
          this.STATE.y_pos
        );
        if (this.STATE.cooldown > 0) {
          this.STATE.cooldown -= 0.5;
        }
      };
      createLaser = ($container, x, y) => {
        const $laser = document.createElement("img");
        $laser.src = "img/laser.png";
        $laser.className = "laser";
        this.$container.appendChild($laser);
        const laser = { x, y, $laser };
        this.STATE.lasers.push(laser);
        this.setPosition($laser, x, y);
      };
      updateLaser = ($container) => {
        const lasers = this.STATE.lasers;
        for (let i = 0; i < lasers.length; i++) {
          const laser = lasers[i];
          laser.y -= 2;
          if (laser.y < 0) {
            this.deleteLaser(lasers, laser, laser.$laser);
          }
          this.setPosition(laser.$laser, laser.x, laser.y);
          const laser_rectangle = laser.$laser.getBoundingClientRect();
          const enemies = this.STATE.enemies;
          for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            if (this.collideRect(enemy_rectangle, laser_rectangle)) {
              this.deleteLaser(lasers, laser, laser.$laser);
              const index = enemies.indexOf(enemy);
              enemies.splice(index, 1);
              this.$container.removeChild(enemy.$enemy);
            }
          }
        }
      };
      createEnemyLaser = ($container, x, y) => {
        const $enemyLaser = document.createElement("img");
        $enemyLaser.src = "img/enemyLaser.png";
        $enemyLaser.className = "enemyLaser";
        this.$container.appendChild($enemyLaser);
        const enemyLaser = { x, y, $enemyLaser };
        this.STATE.enemyLasers.push(enemyLaser);
        this.setPosition($enemyLaser, x, y);
      };
      updateEnemyLaser = ($container) => {
        const enemyLasers = this.STATE.enemyLasers;
        for (let i = 0; i < enemyLasers.length; i++) {
          const enemyLaser = enemyLasers[i];
          enemyLaser.y += 2;
          if (enemyLaser.y > this.GAME_HEIGHT - 30) {
            this.deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
          }
          const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
          const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
          if (this.collideRect(spaceship_rectangle, enemyLaser_rectangle)) {
            this.STATE.gameOver = true;
          }
          this.setPosition(
            enemyLaser.$enemyLaser,
            enemyLaser.x + this.STATE.enemy_width / 2,
            enemyLaser.y + 15
          );
        }
      };
      deleteLaser = (lasers, laser, $laser) => {
        const index = lasers.indexOf(laser);
        lasers.splice(index, 1);
        this.$container.removeChild($laser);
      };
      KeyPress = (event) => {
        if (event.keyCode === this.KEY_RIGHT) {
          this.STATE.move_right = true;
        } else if (event.keyCode === this.KEY_LEFT) {
          this.STATE.move_left = true;
        } else if (event.keyCode === this.KEY_SPACE) {
          this.STATE.shoot = true;
        }
      };
      KeyRelease = (event) => {
        if (event.keyCode === this.KEY_RIGHT) {
          this.STATE.move_right = false;
        } else if (event.keyCode === this.KEY_LEFT) {
          this.STATE.move_left = false;
        } else if (event.keyCode === this.KEY_SPACE) {
          this.STATE.shoot = false;
        }
      };
    };
    module2.exports = SpaceShooterGame;
  }
});

// lib/cookieJar2.js
var require_cookieJar2 = __commonJS({
  "lib/cookieJar2.js"(exports, module2) {
    var Vec = require_vector();
    var SpaceShooterGame = require_spaceShooterGame();
    var State = require_state();
    var CookieJar2 = class {
      constructor(pos, speed, updatedState = null, miniGame = SpaceShooterGame) {
        this.pos = pos;
        this.speed = speed;
        this.updatedState = updatedState;
        this.miniGame = miniGame;
      }
      get type() {
        return "cookieJar2";
      }
      static create(pos) {
        return new CookieJar2(pos, new Vec(0, 0));
      }
      update(time, state, keys) {
        return new CookieJar2(
          this.pos,
          this.speed,
          this.updatedState,
          this.miniGame
        );
      }
      collide(state) {
        if (state.miniGameStatus == null) {
          this.updatedState = new State(
            state.level,
            state.actors,
            state.status,
            "playing"
          );
          const miniGame = new this.miniGame();
          const callbackFunction = (result) => {
            if (result === "Lost") {
              let newState = new State(
                state.level,
                state.actors,
                state.status,
                "Lost"
              );
              this.updatedState = newState;
            } else if (result === "Won") {
              let newState = new State(
                state.level,
                state.actors,
                state.status,
                "Won"
              );
              this.updatedState = newState;
            }
          };
          miniGame.run(callbackFunction, this);
        }
        console.log(this.updatedState.miniGameStatus);
        return this.updatedState;
      }
    };
    CookieJar2.prototype.size = new Vec(1, 1);
    module2.exports = CookieJar2;
  }
});

// lib/levelCharTypes.js
var require_levelCharTypes = __commonJS({
  "lib/levelCharTypes.js"(exports, module2) {
    var Player = require_player();
    var CookieJar1 = require_cookieJar1();
    var CookieJar2 = require_cookieJar2();
    var levelCharTypes = {
      ".": "empty",
      "#": "wall",
      "M": "CM",
      "@": Player,
      "!": CookieJar1,
      "1": CookieJar1,
      "2": CookieJar2
    };
    module2.exports = levelCharTypes;
  }
});

// lib/level.js
var require_level = __commonJS({
  "lib/level.js"(exports, module2) {
    var Vec = require_vector();
    var levelCharTypes = require_levelCharTypes();
    var Level2 = class {
      constructor(plan) {
        let rows = plan.trim().split("\n").map((l) => [...l]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        this.rows = rows.map((row, y) => {
          return row.map((ch, x) => {
            let type = levelCharTypes[ch];
            if (typeof type == "string")
              return type;
            this.startActors.push(type.create(new Vec(x, y)));
            return "empty";
          });
        });
      }
      touchesElement = function(pos, size, type) {
        let xStart = Math.floor(pos.x);
        let xEnd = Math.ceil(pos.x + size.x);
        let yStart = Math.floor(pos.y);
        let yEnd = Math.ceil(pos.y + size.y);
        for (let y = yStart; y < yEnd; y++) {
          for (let x = xStart; x < xEnd; x++) {
            let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
            let here = isOutside ? "wall" : this.rows[y][x];
            if (here == type)
              return true;
          }
        }
        return false;
      };
    };
    module2.exports = Level2;
  }
});

// lib/levelPlans.js
var require_levelPlans = __commonJS({
  "lib/levelPlans.js"(exports, module2) {
    var mvpLevelPlan = `
..................
.................2
..............####
..########....#...
..#......#....#...
..#......#........
..#...#..#....M..
..#...#...........
.@#..1#.......#...`;
    module2.exports = [mvpLevelPlan];
  }
});

// lib/canvasDisplay.js
var require_canvasDisplay = __commonJS({
  "lib/canvasDisplay.js"(exports, module2) {
    var CanvasDisplay2 = class {
      constructor(parent, level2) {
        this.scale = 40;
        this.parent = parent;
        this.addCanvas(level2);
        this.cookieJarSprite = document.createElement("img");
        this.cookieJarSprite.src = "../img/cookieJar.png";
        this.playerSprites = document.createElement("img");
        this.playerSprites.src = "../img/player.png";
        this.wallSprite = document.createElement("img");
        this.wallSprite.src = "img/wall.png";
        this.cookieMonsterSprite = document.createElement("img");
        this.cookieMonsterSprite.src = "img/cookieMonster2.png";
        this.backgroundSprite = document.createElement("img");
        this.backgroundSprite.src = "img/background-tile.jpeg";
        this.drawBackground(level2);
      }
      addCanvas(level2) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "main-game";
        this.canvas.width = level2.width * this.scale;
        this.canvas.height = level2.height * this.scale;
        this.parent.appendChild(this.canvas);
        this.cx = this.canvas.getContext("2d");
      }
      clear() {
        this.canvas.remove();
      }
      syncState(state) {
        if (state.miniGameStatus == "playing") {
          this.canvas.style.display = "none";
        } else {
          this.canvas.style.display = "inline";
          this.clearDisplay(state.status);
          this.drawBackground(state.level);
          this.drawActors(state.actors);
        }
      }
      clearDisplay = function(status) {
        this.cx.fillStyle = "rgb(119, 255, 61)";
        const pattern = this.cx.createPattern(this.backgroundSprite, "repeat");
        this.cx.fillStyle = pattern;
        this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      };
      drawBackground = function(level2) {
        for (let y = 0; y < level2.height; y++) {
          for (let x = 0; x < level2.width; x++) {
            let tile = level2.rows[y][x];
            if (tile == "empty") {
              continue;
            } else if (tile == "wall") {
              this.cx.drawImage(
                this.wallSprite,
                x * this.scale,
                y * this.scale,
                this.scale,
                this.scale
              );
            } else if (tile == "CM") {
              this.cx.drawImage(
                this.cookieMonsterSprite,
                x * this.scale,
                y * this.scale,
                this.scale,
                this.scale
              );
            }
          }
        }
      };
      drawActors = function(actors) {
        for (let actor of actors) {
          let width = actor.size.x * this.scale;
          let height = actor.size.y * this.scale;
          let x = actor.pos.x * this.scale;
          let y = actor.pos.y * this.scale;
          if (actor.type == "player") {
            this.drawPlayer(actor, x, y, width, height);
          } else if (actor.type == "cookieJar1") {
            this.cx.drawImage(this.cookieJarSprite, x, y, this.scale, this.scale);
          } else if (actor.type == "cookieJar2") {
            this.cx.drawImage(this.cookieJarSprite, x, y, this.scale, this.scale);
          }
        }
      };
      drawPlayer = function(player, x, y, width, height) {
        this.cx.drawImage(this.playerSprites, x, y, width, height);
      };
    };
    module2.exports = CanvasDisplay2;
  }
});

// lib/game.js
var require_game = __commonJS({
  "lib/game.js"(exports, module2) {
    var State = require_state();
    var Game2 = class {
      constructor(level2, Display) {
        this.level = level2;
        this.display = new Display(document.body, level2);
        this.state = State.start(level2);
        this.arrowKeysTracker = this.#trackKeys([
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ]);
      }
      run() {
        this.#runAnimation(this.#updateFrame);
      }
      #updateFrame = (time) => {
        this.state = this.state.update(time, this.arrowKeysTracker);
        this.display.syncState(this.state);
        if (this.state.status == "playing") {
          return true;
        } else {
          this.display.clear();
          return false;
        }
      };
      #runAnimation(updateFrame) {
        let lastTime = null;
        function frame(time) {
          if (lastTime != null) {
            let timeStep = Math.min(time - lastTime, 100) / 1e3;
            if (updateFrame(timeStep) === false)
              return;
          }
          lastTime = time;
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      #trackKeys(keys) {
        let down = /* @__PURE__ */ Object.create(null);
        function track(event) {
          if (keys.includes(event.key)) {
            down[event.key] = event.type == "keydown";
            event.preventDefault();
          }
        }
        window.addEventListener("keydown", track);
        window.addEventListener("keyup", track);
        return down;
      }
    };
    module2.exports = Game2;
  }
});

// index.js
var Level = require_level();
var levelPlans = require_levelPlans();
var CanvasDisplay = require_canvasDisplay();
var Game = require_game();
var level = new Level(levelPlans[0]);
var game = new Game(level, CanvasDisplay);
game.run();

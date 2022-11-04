const Vec = require("./vector");
const BlockJumpGame = require("./blockJumpGame");
const State = require("./state");

class CookieJar {
  constructor(pos, speed, updatedState = null) {
    this.pos = pos;
    this.speed = speed;
    this.updatedState = updatedState;
  }

  get type() {
    return "cookieJar";
  }

  static create(pos) {
    return new CookieJar(pos, new Vec(0, 0));
  }

  update(time, state, keys) {
    return new CookieJar(this.pos, this.speed, this.updatedState);
  }

  collide(state) {
    if (state.miniGameStatus == null) {
      this.updatedState = new State(
        state.level,
        state.actors,
        state.status,
        "playing"
      );
      const blockJumpGame = new BlockJumpGame();
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
      blockJumpGame.run(callbackFunction);
    }
    return this.updatedState;
  }
}

CookieJar.prototype.size = new Vec(1, 1);

module.exports = CookieJar;
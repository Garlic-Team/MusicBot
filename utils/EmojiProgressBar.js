class ProgressBar {
  constructor (num, cap) {
    this.bits = [];
    this.cap = cap;
    this.num = num;

    let add = 1 / cap;
    for (let i = 0; i < cap; i++) {
      if (num >= add * (i + 1)) this.bits.push(1);
      else if (num >= (add * (i + 1)) - add / 2) this.bits.push(0.5);
      else this.bits.push(0);
    }

    return this;
  }

  _make(map, t) {
    let f = [];
    for (let i = 0; i < this.cap; i++) {
      let axd = map[this.bits[i]];
      f.push(axd);
    }
    return f.join(t === "dc" ? "" : "");
  }

  toBits() {
    return this.bits;
  }

  toUnicode() {
    return this._make({
      0: "□",
    0.5: "◩",
      1: "■"
    });
  }

  toEmoji() {
    return this._make({
      0: ":black_medium_square:",
    0.5: ":blue_square:",
      1: ":blue_square:"
    }, "dc");
  }
}

module.exports = ProgressBar;
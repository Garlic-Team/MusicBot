class FormatTime {
  constructor(secs) {
    this.data = {};

    this.hours = Math.floor(secs / 3600);
    this.mins = Math.floor(secs / 60) - (this.hours * 60);
    this.secs = secs - this.hours * 3600 - this.mins * 60;

    return this;
  }

  toString() {
    let final = [];

    let conv = (n) => ("0".repeat(2) + n).slice(-2);

    if (this.hours > 0) {
      final.push(this.hours);
      final.push(conv(this.mins));
    } else {
      final.push(this.mins);
    }

    final.push(conv(this.secs));
    
    return final.join(":");
  }

  toJson() {
    return {
      hours: this.hours,
      mins: this.mins,
      secs: this.secs
    };
  }
}

module.exports = FormatTime;
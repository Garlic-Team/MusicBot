module.exports = (object) => {
  if (Array.isArray(object)) return [...object];
  else if (typeof object === "object") {
    let final = {};
    for (let i = 0; i < Object.keys(object).length; i++) {
      let k = Object.keys(object)[i];
      final[k] = object[k];
    }
    // this is only a shallow copy but whatever lol ^^
    return final;
  }

  return null;
}
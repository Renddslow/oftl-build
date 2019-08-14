function hashCode(str) {
  return Array(str.length)
    .fill()
    .reduce((acc, _, i) => {
    acc = str.charCodeAt(i) + ((acc << 5) - acc);
  return acc;
}, 0);
}

function intToRGB(i) {
  const c = (i & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
}

module.exports = (str) => intToRGB(hashCode(str));

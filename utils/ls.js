const fs = require('fs');

const ls = (dir) => new Promise((resolve) => fs.readdir(dir, (err, data) => resolve(data)));

module.exports = ls;

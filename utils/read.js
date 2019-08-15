const fs = require('fs');

const read = (pathname) => new Promise((resolve, reject) => fs.readFile(pathname, (err, data) => err ? reject(err) : resolve(data.toString())));

module.exports = read;
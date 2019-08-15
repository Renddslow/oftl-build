const fs = require('fs');

const write = (pathname, data) => new Promise((resolve, reject) => {
  fs.writeFile(pathname, data, (err) => err ? reject(err) : resolve());
});

module.exports = write;

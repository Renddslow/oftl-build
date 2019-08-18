const path = require('path');

const read = require('./utils/read');
const write = require('./utils/write');

module.exports = async (destDir) => {
  if (!destDir) {
    throw new Error('Destination directory path is required');
  }

  const destDirPath = path.resolve(process.cwd(), destDir);

  const sw = await read(path.join(__dirname, './templates/sw.js'));
  await write(path.join(destDirPath, 'sw.js'), sw);
};

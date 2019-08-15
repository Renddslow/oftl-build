const path = require('path');
const uglifycss = require('uglifycss');

const read = require('./utils/read');
const write = require('./utils/write');

module.exports = async (destDir) => {
  if (!destDir) {
    throw new Error('Destination directory path is required');
  }

  const stylesList = await read(path.join(__dirname, './css/styles.json'));
  const styleFiles = [
    path.join(__dirname, './public/styles.css'),
    ...JSON.parse(stylesList).map((s) => path.join(__dirname, './css', s)),
  ];
  const style = await Promise.all(styleFiles.map((pathname) => read(pathname)));
  await write(
    path.join(process.cwd(), destDir, 'style.css'),
    uglifycss.processString(style.join('\n')),
  );
};

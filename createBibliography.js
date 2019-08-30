const pretty = require('pretty');
const sort = require('sort-on');
const path = require('path');

const read = require('./utils/read');
const write = require('./utils/write');
const generateTemplate = require('./generateTemplate');

module.exports = async (srcPath, destDir) => {
  if (!srcPath) {
    throw new Error('Source directory path is required');
  }

  if (!destDir) {
    throw new Error('Destination directory path is required');
  }

  const srcPathFull = path.resolve(process.cwd(), srcPath);
  const destDirPath = path.resolve(process.cwd(), destDir);

  const booksRaw = await read(srcPathFull);
  const books = sort(JSON.parse(booksRaw), 'author');

  const bibliographyTemplate = await read(path.join(__dirname, './templates/bibliography.ejs'));

  const document = await generateTemplate(
    { books },
    bibliographyTemplate,
    {
      title: 'Books I\'ve Read with Commentary',
    },
  );

  await write(path.join(destDirPath, `bibliography.html`), pretty(document));
};

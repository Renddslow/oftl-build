const marked = require('marked');
const fm = require('front-matter');
const path = require('path');
const slugify = require('slugify');
const pretty = require('pretty');

const read = require('./utils/read');
const write = require('./utils/write');
const ls = require('./utils/ls');
const generateTemplate = require('./generateTemplate');

marked.options({
  gfm: true,
  smartLists: true,
  smartypants: true,
});

module.exports = async (srcDir, destDir) => {
  const srcDirPath = path.resolve(process.cwd(), srcDir);
  const destDirPath = path.resolve(process.cwd(), destDir);

  if (!srcDir) {
    throw new Error('Source directory path is required');
  }

  if (!destDir) {
    throw new Error('Destination directory path is required');
  }

  const files = await ls(srcDirPath);
  const pageTemplate = await read(path.join(__dirname, './templates/page.ejs'));

  Promise.all(files.map(async (file) => {
    const doc = await read(path.join(srcDirPath, file));
    const { body, attributes } = fm(doc);

    const pageData = {
      permalink: slugify(attributes.title, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
      }),
      title: attributes.title,
      image: attributes.image,
      imageAlt: attributes.imageAlt,
      body: marked(body),
    };

    const document = await generateTemplate(
      { page: pageData },
      pageTemplate,
      {
        title: pageData.title,
      },
    );

    await write(path.join(destDirPath, `${pageData.permalink}.html`), pretty(document));
  }));
};
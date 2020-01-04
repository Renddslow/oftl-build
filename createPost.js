const marked = require('marked');
const fm = require('front-matter');
const path = require('path');
const slugify = require('slugify');
const { hex } = require('wcag-contrast');
const pretty = require('pretty');
const sort = require('sort-on');

const stringToHexColor = require('./utils/stringToHexColor');
const getAuthorSlug = require('./utils/getAuthorSlug');
const read = require('./utils/read');
const write = require('./utils/write');
const ls = require('./utils/ls');
const generateTemplate = require('./generateTemplate');

marked.options({
  gfm: true,
  smartLists: true,
  smartypants: true,
});

const fmt = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

module.exports = async (srcDir, destDir, archiveDir) => {
  if (!srcDir) {
    throw new Error('Source directory path is required');
  }

  if (!destDir) {
    throw new Error('Destination directory path is required');
  }

  if (!archiveDir) {
    throw new Error('Archive destination directory path is required');
  }

  const srcDirPath = path.resolve(process.cwd(), srcDir);
  const destDirPath = path.resolve(process.cwd(), destDir);
  const archiveDirPath = path.resolve(process.cwd(), archiveDir);

  const files = await ls(srcDirPath);
  const postTemplate = await read(path.join(__dirname, './templates/post.ejs'));

  const posts = await Promise.all(files.map(async (file) => {
    const doc = await read(path.join(srcDirPath, file));
    const { body, attributes } = fm(doc);

    if (attributes.draft) return;

    const categorySlug = slugify(attributes.category, {
      replacement: '-',
      lower: true,
    });

    const postData = {
      category: {
        label: attributes.category,
        link: `/archive?c=${categorySlug}`,
      },
      tags: attributes.tags ? attributes.tags.split(',').map((t) => {
        const label = t.trim();
        const bg = `#${stringToHexColor(label)}`;
        return {
          label,
          bg,
          color: hex('#fff', bg) > 3 ? '#fff' : '#000',
          link: `/tags/${slugify(label, {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true,
          })}`,
        };
      }) : [],
      author: {
        name: attributes.author,
        link: `/authors/${getAuthorSlug(attributes.author)}`,
      },
      date: fmt.format(new Date(attributes.date)),
      isoDate: new Date(attributes.date).toISOString(),
      title: attributes.title,
      permalink: slugify(attributes.title, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
      }),
      body: marked(body),
      social: {},
    };

    const document = await generateTemplate(
      { post: postData },
      postTemplate,
      {
        title: postData.title,
      },
    );

    await write(path.join(destDirPath, `${postData.permalink}.html`), pretty(document));
    return postData;
  }));

  const postsSorted = sort(posts.filter((p) => p), '-isoDate');


  await write(
    path.join(destDirPath, `posts.json`),
    JSON.stringify(postsSorted, null, 2),
  );

  const archiveTemplate = await read(path.join(__dirname, './templates/archive.ejs'));
  const archiveDocument = await generateTemplate(
    { posts: postsSorted },
    archiveTemplate,
    { title: 'Archives' },
  );

  const homeTemplate = await read(path.join(__dirname, './templates/home.ejs'));
  const homeDocument = await generateTemplate(
    { posts: postsSorted.slice(0, 2) },
    homeTemplate,
    { title: '@home' },
  );

  await Promise.all([
    write(path.join(archiveDirPath, 'archive.html'), archiveDocument),
    write(path.join(archiveDirPath, 'index.html'), homeDocument),
  ]);
};

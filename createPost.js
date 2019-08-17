const marked = require('marked');
const fm = require('front-matter');
const path = require('path');
const slugify = require('slugify');
const { hex } = require('wcag-contrast');
const pretty = require('pretty');

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
  const postTemplate = await read(path.join(__dirname, './templates/post.ejs'));

  const posts = await Promise.all(files.map(async (file) => {
    const doc = await read(path.join(srcDirPath, file));
    const { body, attributes } = fm(doc);

    const categorySlug = slugify(attributes.category, {
      replacement: '-',
      lower: true,
    });

    const postData = {
      category: {
        label: attributes.category,
        link: `/${categorySlug}`,
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
      image: attributes.image,
      imageAlt: attributes.imageAlt,
      body: marked(body),
      social: {},
      readLength: '',
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

  await write(path.join(destDirPath, `posts.json`), JSON.stringify(posts, null, 2));
};

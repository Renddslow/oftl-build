const path = require('path');
const ejs = require('ejs');

const read = require('./utils/read');

module.exports = async (data, template, meta) => {
  const header = await read(path.join(__dirname, './templates/header.ejs'));

  const footerRaw = await read(path.join(__dirname, './templates/footer.ejs'));
  const footer = ejs.render(footerRaw, { copyrightYear: new Date().getFullYear() });

  const base = await read(path.join(__dirname, './templates/base.ejs'));

  const page = ejs.render(template, data);
  return ejs.render(base, { page, meta, header, footer });
};

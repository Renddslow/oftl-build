const router = require('lieutenant');

const createPost = require('./createPost');
const compileCSS = require('./compileCSS');

router({
  post: createPost,
  css: compileCSS,
});
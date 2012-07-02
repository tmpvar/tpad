var hook = require('hook.io').createHook({
  name : 'tpad',
  ignoreSTDIN : true,
  debug : false,
  silent : true
});

hook.start();

module.exports = hook;
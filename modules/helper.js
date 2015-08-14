var config = require('../config').getConfig();
var pjson = require('../package.json');
var log = null;

module.exports = {
  getVersion: function () {
    return pjson.version;
  },
  setLogger: function (logger) {
    log = logger;
  },
  checkConfig: function () {
    // Validate that the user has set custom authentication details
    if (config.user === 'myuser' || config.pw === 'mypw') {
      log.error('Authentication details are still on their default values! Please set a custom username and password in config.js!');
      process.exit(42);
    }
  },
  printStartupHeader: function () {
    console.log('\n=========================================================');
    console.log('Starting "IFTTN - If This Then Node" Version ' + pjson.version);
    console.log('=========================================================');
    console.log('http://sebauer.github.io/if-this-then-node/');
    console.log('---------------------------------------------------------\n');
  }
};

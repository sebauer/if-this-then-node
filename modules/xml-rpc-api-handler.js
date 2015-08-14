var responseGenerator = require('./response-generator');
var config = require('../config').getConfig();
var pluginManager = null;
var log = null;

module.exports = {
  setPluginManager: function (pm) {
    pluginManager = pm;
  },
  setLogger: function (logger) {
    log = logger;
  },
  handleRequest: function (req, res) {
    var params = req.body;

    // Validate user credenials
    if (params.user !== config.user || params.pw !== config.pw) {
      log.error('Authentication failed!');
      responseGenerator.failure(401, res, log);
      return;
    }

    // See if we know this plugin and then execute it with the given parameters
    if (pluginManager.pluginExists(params.action)) {
      pluginManager.execute(params, function (result) {
        if (result.success === true) {
          log.info('Plugin succeeded with output %s', result.output);
          responseGenerator.success('<string>200</string>', res, log);
        } else {
          log.info('Plugin failed with output %s', result.output);
          responseGenerator.failure(1337, res, log);
        }
      });
    } else {
      log.error('No plugin found for action %s', params.action);
      res.send(404, 'No plugin found for action ' + params.action);
    }
  }
};

var responseGenerator = require('./response-generator');
var parameterExtractor = require('./parameter-extractor').extractParameters;
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
  handleMethod: function (methodName, req, res) {

    switch (methodName) {
      case 'mt.supportedMethods':
        mtSupportedMethods(res);
        break;
      case 'metaWeblog.getRecentPosts':
        metaWeblogGetRecentPosts(res);
        break;
      case 'metaWeblog.newPost':
        metaWeblogNewPost(req, res);
        break;
      case 'metaWeblog.getCategories':
        log.info('Ignoring getCategories request');
        res.send(200, '');
        break;
      default:
        log.warn('Unknown request');
        res.send(403, 'Unknown reqest');
        break;
    }
  }
};

function mtSupportedMethods (res) {
  responseGenerator.success('metaWeblog.getRecentPosts', res, log);
}

function metaWeblogGetRecentPosts (res) {
  // send a blank blog response
  // this also makes sure that the channel is never triggered
  responseGenerator.success('<array><data></data></array>', res, log);
}

function metaWeblogNewPost (req, res) {
  var params = req.body.methodcall.params;
  params = parameterExtractor(params[0]);

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

var fs = require('fs');

module.exports = {
  pluginList: [],
  log: {},
  setLogger: function (logger) {
    this.log = logger;
  },
  loadPlugins: function () {
    var regexPattern = /\.js$/i;

    this.log.info('Searching for plugins...');
    var fileList = fs.readdirSync('./plugins/');

    for (var i in fileList) {
      if (fileList[i].match(regexPattern)) {
        // Get the clear plugin name
        var pluginName = fileList[i].replace(regexPattern, '');

        // Now load the plugin
        this.log.info('Loading %s', pluginName);
        this.pluginList[pluginName] = require('../plugins/' + pluginName);

        // Call the sample method to verify the plugin is working
        this.log.info('  >> %s', this.pluginList[pluginName].info());
      }
    }
  },
  execute: function (params, callback) {
    // Finally run our plugin with the parameters
    this.log.info('Executing plugin %s with params:', params.action);
    this.log.info(params.actionParams);
    this.pluginList[params.action].run(params.actionParams, this.log, callback);
  },
  pluginExists: function (pluginName) {
    return typeof this.pluginList[pluginName] !== 'undefined';
  }
};

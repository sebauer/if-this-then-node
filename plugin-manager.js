var fs = require('fs');

module.exports = {
	pluginList : [],
  loadPlugins: function () {
		var regexPattern = /\.js$/i;
		
		console.log('Searching for plugins...');
		var fileList = fs.readdirSync('./plugins/');
		
		for(var i in fileList) {
			if(fileList[i].match(regexPattern)) {
				// Get the clear plugin name
				var pluginName = fileList[i].replace(regexPattern, '');
				
				// Now load the plugin
				console.log('  Loading '+pluginName);
				this.pluginList[pluginName] = require('./plugins/'+pluginName);
				
				// Call the sample method to verify the plugin is working
				console.log('    >> '+this.pluginList[pluginName].info());
			}
		}
  },
	execute: function(params, callback) {
		
		// Finally run our plugin with the parameters
		console.log('\nExecuting plugin '+params.action+' with params:');
		console.log(params.actionParams);
		console.log('\n');
		this.pluginList[params.action].run(params.actionParams, callback);
	},
	pluginExists: function(pluginName) {
		return typeof this.pluginList[pluginName] !== 'undefined';
	}
};

// This private
var anyHelperFunction = function () {
}
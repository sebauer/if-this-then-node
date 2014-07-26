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
	execute: function(pluginName, params) {
		var finalParams = [];
		
		// Iterate through parameters
		for(var i in params) {
			
			// Extract parameters to key/value pairs
			var extractedParams = params[i].match(/^([^\=]+)\=([^\=]+)$/);
			if(extractedParams.length == 0) {
				throw "Parameters not valid!";
			}
			
			// Save extracted parameters
			finalParams[i] = [];
			finalParams[i][extractedParams[1]] = extractedParams[2];
		}
		
		// Finally run our plugin with the parameters
		console.log('\nExecuting plugin '+pluginName+' with params:');
		console.log(finalParams);
		console.log('\n');
		this.pluginList[pluginName].run(finalParams);
	},
	pluginExists: function(pluginName) {
		return typeof this.pluginList[pluginName] !== 'undefined';
	}
};

// This private
var anyHelperFunction = function () {
}
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
		console.log('Executing plugin '+pluginName);
		console.log(params);
		this.pluginList[pluginName].run(params);
	},
	pluginExists: function(pluginName) {
		return typeof this.pluginList[pluginName] !== 'undefined';
	}
};

// This private
var anyHelperFunction = function () {
}
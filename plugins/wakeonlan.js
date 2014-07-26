var exec = require('child_process').exec;

module.exports = {
  run: function (params, callbackFunction) {
		var command = 'wakeonlan -i '+params.broadcast+' '+params.mac;
		console.log(command);
		exec(command, function (error, stdout, stderr){
    	callbackFunction({
				'success': true,
				'output': stdout
			});
		});
  },
	info: function() {
		return 'IFTTN Wake-On-LAN Plugin V0.1';
	}
};

// This private
var anyHelperFunction = function () {
}
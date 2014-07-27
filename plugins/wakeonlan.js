var exec = require('child_process').exec;

module.exports = {
  run: function (params, callbackFunction) {
		var command = 'wakeonlan -i '+params.broadcast+' '+params.mac;
		console.log(command);
		exec(command, function (error, stdout, stderr){
			if(error != null) {
				callbackFunction({
					'success': false,
					'output': error
				});
			} else {
		  	callbackFunction({
					'success': true,
					'output': stdout
				});
			}
		});
  },
	info: function() {
		return 'IFTTN Wake-On-LAN Plugin V0.1';
	}
};

// This private
var anyHelperFunction = function () {
}
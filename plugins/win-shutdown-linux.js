var exec = require('child_process').exec;

module.exports = {
  run: function (params, callbackFunction) {
		var command = 'net rpc -I '+params.ip+' -U '+params.user+'%'+params.pw;
		console.log(command);
		exec(command, function (error, stdout, stderr){
			if(error != null) {
				callbackFunction({
					'success': false,
					'output': stderr
				});
			} else {
		  	callbackFunction({
					'success': true,
					'output': error+stdout+stderr
				});
			}
		});
  },
	info: function() {
		return 'IFTTN Shutdown Windows from Linux';
	}
};

// This private
var anyHelperFunction = function () {
}
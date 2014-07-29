var exec = require('child_process').exec;

module.exports = {
  run: function (params, log, callbackFunction) {
		var command = 'net rpc shutdown -I '+params.ip+' -U '+params.user+'%'+params.pw;
		log.info(command);
		exec(command, function (error, stdout, stderr){
			if(error != null) {
				callbackFunction({
					'success': false,
					'output': stderr
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
		return 'IFTTN Shutdown Windows from Linux';
	}
};

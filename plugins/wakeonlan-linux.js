var exec = require('child_process').exec;

module.exports = {
  run: function (params, log, callbackFunction) {
		var command = 'wakeonlan -i '+params.broadcast+' '+params.mac;
		log.info(command);
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
		return 'IFTTN Wake-On-LAN Plugin (Linux) V0.1';
	}
};

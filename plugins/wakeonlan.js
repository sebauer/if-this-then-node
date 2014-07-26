var exec = require('child_process').exec;

module.exports = {
  run: function (params) {
		var command = 'wakeonlan -i '+params.broadcast+' '+params.mac;
		console.log(command);
		exec(command, function callback(error, stdout, stderr){
    	console.log(stdout);
		});
  },
	info: function() {
		return 'IFTTN Wake-On-LAN Plugin V0.1';
	}
};

// This private
var anyHelperFunction = function () {
}
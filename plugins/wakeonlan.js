var exec = require('child_process').exec;

module.exports = {
  run: function (params) {
    console.log(params);
  },
	info: function() {
		return 'IFTTN Wake-On-LAN Module V0.1';
	}
};

// This private
var anyHelperFunction = function () {
}
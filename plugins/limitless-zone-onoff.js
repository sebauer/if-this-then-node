var led = require('limitless-gem');

module.exports = {
  run: function (params, log, callback) {

	var connection = led.createSocket({
	        host: params.host,
			port: params.port
		},
		'udp',
		function () {
			log.info('Connected to LimitlessLED %s:%d', params.host, params.port);
		}
	);
	var cmd = '';
	switch(params.onoff.toUpperCase()) {
		case('ON'):
			cmd = led.RGBW['ZONE_'+params.zone+'_ON'];
			break;
		case('OFF'):
			cmd = led.RGBW['ZONE_'+params.zone+'_OFF'];
			break;
		default:
			log.warn('Error with command, input %s invalid', params.onoff);
			break;
	}
	connection.send(cmd);
    // do whatever you want in this plugin
	callback({
		'success' : true,
		'output'  : 'all good!'
	});
  },
	info: function() {
		return 'IFTTN Sample Plugin Version 1.0';
	}
};

// This private
var anyHelperFunction = function () {
}

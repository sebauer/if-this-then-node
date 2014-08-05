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
    switchLED(connection, params.onoff);
	callback({
		'success' : true,
		'output'  : 'all good!'
	});
  },
	info: function() {
		return 'IFTTN LimitlessLED Plugin - Zone x On/Off';
	}
};

var switchLED = function(connection, onoff) {
    var cmd = '';
    switch(onoff.toUpperCase()) {
        case('ON'):
            cmd = led.RGBW['ZONE_'+onoff+'_ON'];
            break;
        case('OFF'):
            cmd = led.RGBW['ZONE_'+onoff+'_OFF'];
            break;
        default:
            log.warn('Error with command, input %s invalid', params.onoff);
            break;
    }
    connection.send(cmd);

}

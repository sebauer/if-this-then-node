var led = require('limitless-gem');
var redis = require('redis');
var client = redis.createClient();
var format = require('util').format;

module.exports = {
  run: function (params, log, callback) {

	var connection = led.createSocket({
	        host: params.host,
			port: params.port
		},
		'udp',
        function () {
            log.info('Connected to LimitlessLED %s:%d', params.host, params.port);
    });

    if(params.geofence.toLowerCase() == 'entered' || params.geofence.toLowerCase() == 'connected to') {
        log.info('Client %s is coming home', params.clientname);

        log.info('Registered %s as being home', params.clientname);
        client.set('loa-'+params.clientname, true);

    } else if(params.geofence.toLowerCase() == 'exited' || params.geofence.toLowerCase() == 'disconnected from') {
        log.info('"%s" has left the building', params.clientname);

        // Fire & forget: remove client from store
        client.del('loa-'+params.clientname);

        // Now check if there are some clients left
        client.keys('loa-*', function(err, replies) {
            if(replies.length == 0) {
                log.info('All clients left, turning off ALL lights');
                connection.send(led.RGBW.ALL_OFF);
            }
        });
    }
    // do whatever you want in this plugin
	callback({
		'success' : true,
		'output'  : 'all good!'
	});
  },
	info: function() {
		return 'IFTTN LimitlessLED Plugin - onLeave: auto-off';
	}
};

// This private
var anyHelperFunction = function () {
}

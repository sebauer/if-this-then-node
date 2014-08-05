var led = require('limitless-gem');
var redis = require('redis');
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

    if(params.enterexit.toLowerCase() == 'entered' || params.enterexit.toLowerCase() == 'connected to') {
        log.info('Client %s is coming home', params.clientname);
        registerClient(params.clientname);
    } else if(params.enterexit.toLowerCase() == 'exited' || params.enterexit.toLowerCase() == 'disconnected from') {
        log.info('"%s" has left the building', params.clientname);
        deregisterClient(params.clientname, function(){
            log.info('All clients left, turning off ALL lights');
            connection.send(led.RGBW.ALL_OFF);
        })
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

var registerClient = function(clientname) {
    var client = redis.createClient();
    log.info('Registered %s as being home', clientname);
    client.sadd('ifttn-limitless-clients', clientname);
}

var deregisterClient = function(clientname, callback) {
    var client = redis.createClient();
    // Remove client from store
    client.srem('ifttn-limitless-clients', clientname, function(err, reply) {
        // Now check if there are some clients left
        log.info('Checking for remaining clients..');
        client.smembers('ifttn-limitless-clients', function(err, replies) {
            // If no clients are left, execute the callback function
            if(replies.length == 0) {
                callback();
            }
        });
    });
}

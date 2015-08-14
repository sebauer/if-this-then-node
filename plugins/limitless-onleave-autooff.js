var led = require('limitless-gem');
var redis = require('redis');
var format = require('util').format;
var setName = 'ifttn-limitless-clients';
var client = null;

module.exports = {
  setClient: function (redisClient) {
    client = redisClient;
  },
  changeSetName: function (newName) {
    setName = newName;
  },
  run: function (params, log, callback) {

    if (client === null) {
      redis.createClient();
    }

    // Connect to our MiLight WIFI Gateway
    // TODO move to seperate module
    var connection = led.createSocket({
      host: params.host,
      port: params.port
    },
    'udp',
    function () {
      log.info('Connected to LimitlessLED %s:%d', params.host, params.port);
    });

    // If a client enters the geofence, register him within the redis keystore
    if (params.enterexit.toLowerCase() === 'entered' || params.enterexit.toLowerCase() === 'connected to') {
      log.info('Client %s is coming home', params.clientname);
      registerClient(params.clientname, function () {
        callback({
          'success': true,
          'output': 'Client registered at home'
        });
      }, log);
      // If a client leaves the geofence, remove him from the redis keystore and additionally check whether other
      // clients are still left. If yes, we're fine, if not, we have to switch off the lights
    } else if (params.enterexit.toLowerCase() === 'exited' || params.enterexit.toLowerCase() === 'disconnected from') {
      log.info('"%s" has left the building', params.clientname);
      deregisterClient(params.clientname, function (remainingClients) {
        var output = '';
        if (remainingClients === 0) {
          output = 'All clients left, ALL lights turned OFF';
          log.info(output);
          connection.send(led.RGBW.ALL_OFF);
        } else {
          output = 'Client deregistered, still clients at home, lights will stay on';
          log.info('%d clients still at home, not switching off lights', remainingClients);
        }
        callback({
          'success': true,
          'output': output
        });
      }, log);
    }
  },
  info: function () {
    return 'IFTTN LimitlessLED Plugin - onLeave: auto-off';
  }
};

var registerClient = function (clientname, callback, log) {

  if (client === null) {
    redis.createClient();
  }

  // Add client to redis store
  log.info('Registered %s as being home', clientname);
  client.sadd(setName, clientname, function () {
    callback();
  });
};

var deregisterClient = function (clientname, callback, log) {

  if (client === null) {
    redis.createClient();
  }

  // Remove client from store
  client.srem(setName, clientname, function (err, reply) {
    // Now check if there are some clients left
    log.info('Checking for remaining clients..');
    client.smembers(setName, function (err, replies) {
      // Execute callback with the number of remaining clients
      callback(replies.length);
    });
  });
}

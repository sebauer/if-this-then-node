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
        var cmd = switchLED(connection, params.zone, params.onoff);
        callback({
            'success' : true,
            'output'  : 'Sent command '+cmd
        });
    },
    info: function() {
        return 'IFTTN LimitlessLED Plugin - Zone x On/Off';
    }
};

var switchLED = function(connection, zone, onoff) {
    var cmd = '';
    switch(onoff.toUpperCase()) {
        case('ON'):
            cmd = led.RGBW['ZONE_'+zone+'_ON'];
            break;
        case('OFF'):
            cmd = led.RGBW['ZONE_'+zone+'_OFF'];
            break;
        default:
            log.warn('Error with command, input %s invalid', params.onoff);
            break;
    }
    connection.send(cmd);
    return cmd;
}

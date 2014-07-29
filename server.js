/**
 * IFTTT to NodeJS
 *
 * Use this little Node app to have a node server running which can be accessed
 * by IFTTT's WordPress action. I needed this to have an easy way of using IFTTT
 * to communicate with my Raspberry PI.
 *
 * Credits for the idea of faking the Wordpress XML RPC API as customizable
 * IFTTT backend go to https://github.com/captn3m0/ifttt-webhook
 *
 */
console.log('\n============================================');
console.log('Starting "IFTTN - IF This Then Node"...');
console.log('============================================');
console.log('http://sebauer.github.io/if-this-then-node/')
console.log('--------------------------------------------\n');

var express = require('express');
var xmlparser = require('express-xml-bodyparser');
var bunyan = require('bunyan');

var pluginManager = require('./plugin-manager');
var parameterExtractor = require('./parameter-extractor').extractParameters;

var config = require('./config.js').getConfig();

var log = bunyan.createLogger({name: 'IFTTN'});

// Validate that the user has set custom authentication details
if(config.user == 'myuser' || config.pw == 'mypw') {
	log.error('Authentication details are still on their default values! Please set a custom username and password in config.js!');
	return;
}

var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

pluginManager.setLogger(log);
pluginManager.loadPlugins();

var failure = function(status, res) {

	log.info('Sending failure response with status code %d', status);
	// TODO create xml by using xml2js
	var xml = '<?xml version="1.0"?>\n<methodResponse><fault><value><struct><member><name>faultCode</name><value><int>'+status+'</int></value></member><member><name>faultString</name><value><string>Request was not successful.</string></value></member></struct></value></fault></methodResponse>';

	res.set({
		'Content-Type': 'text/xml'
	});

	res.send(200, xml);
}

var success = function(innerXML, res) {

	log.info('Sending success response %d', innerXML);
	// TODO create xml by using xml2js
	var xml = "<?xml version=\"1.0\"?>\n";
	xml += "<methodResponse><params><param><value>"+innerXML+"</value></param></params></methodResponse>";

	res.set({
		'Content-Type': 'text/xml'
	});

	res.send(200, xml);
}

app.post('/xmlrpc.php', function(req, res, next){
	log.info('XMLRPC API request received');
	log.info(req.rawBody);
	log.info(req.body);

	var methodName = req.body.methodcall.methodname[0];

	log.info('Method Name: %s', methodName);

	switch(methodName) {
		case 'mt.supportedMethods':
			success('metaWeblog.getRecentPosts', res);
			break;
		//first authentication request from ifttt
		case 'metaWeblog.getRecentPosts':
			//send a blank blog response
			//this also makes sure that the channel is never triggered
			success('<array><data></data></array>', res);
			break;
		case 'metaWeblog.newPost':
			var params = req.body.methodcall.params;
			params = parameterExtractor(params[0]);

			// Validate user credenials
			if(params.user != config.user || params.pw != config.pw) {
				log.error('Authentication failed!');
				failure(401, res);
				break;
			}

			// See if we know this plugin and then execute it with the given parameters
			if(pluginManager.pluginExists(params.action)){
				pluginManager.execute(params, function(result){
					if(result.success == true){
						log.info('Plugin succeeded with output %s', result.output);
						success('<string>200</string>', res);
					} else {
						log.info('Plugin failed with output %s', result.output);
						failure(1337, res);
					}
				});
			} else {
				log.error('No plugin found for action %s', action);
				res.send(404, 'No plugin found for action '+action);
			}

			break;
		default:
			log.warn('Unknown request');
			res.send(403,'Unknown reqest');
			break;
	}

});

var server = app.listen(1337, function() {
  log.info('Listening on port %d', server.address().port);
});

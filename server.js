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
var pjson = require('./package.json');
console.log('\n=========================================================');
console.log('Starting "IFTTN - If This Then Node" Version '+pjson.version);
console.log('=========================================================');
console.log('http://sebauer.github.io/if-this-then-node/')
console.log('---------------------------------------------------------\n');

var express = require('express');
var xmlparser = require('express-xml-bodyparser');
var bunyan = require('bunyan');

var pluginManager = require('./modules/plugin-manager');
var parameterExtractor = require('./modules/parameter-extractor').extractParameters;
var responseGenerator = require('./modules/response-generator');

var config = require('./config.js').getConfig();

var log = bunyan.createLogger({name: 'IFTTN'});
var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

checkForDefaultCredentials();

pluginManager.setLogger(log);
pluginManager.loadPlugins();

function checkForDefaultCredentials() {
	// Validate that the user has set custom authentication details
	if(config.user == 'myuser' || config.pw == 'mypw') {
		log.error('Authentication details are still on their default values! Please set a custom username and password in config.js!');
		process.exit(42);
	}
}

app.post('/xmlrpc.php', function(req, res, next){
	log.info('XMLRPC API request received');
	log.info(req.rawBody);

	var methodName = req.body.methodcall.methodname[0];

	log.info('Method Name: %s', methodName);

	switch(methodName) {
		case 'mt.supportedMethods':
			responseGenerator.success('metaWeblog.getRecentPosts', res);
			break;
		//first authentication request from ifttt
		case 'metaWeblog.getRecentPosts':
			//send a blank blog response
			//this also makes sure that the channel is never triggered
			responseGenerator.success('<array><data></data></array>', res);
			break;
		case 'metaWeblog.newPost':
			var params = req.body.methodcall.params;
			params = parameterExtractor(params[0]);

			// Validate user credenials
			if(params.user != config.user || params.pw != config.pw) {
				log.error('Authentication failed!');
				responseGenerator.failure(401, res);
				break;
			}

			// See if we know this plugin and then execute it with the given parameters
			if(pluginManager.pluginExists(params.action)){
				pluginManager.execute(params, function(result){
					if(result.success == true){
						log.info('Plugin succeeded with output %s', result.output);
						responseGenerator.success('<string>200</string>', res);
					} else {
						log.info('Plugin failed with output %s', result.output);
						responseGenerator.failure(1337, res);
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

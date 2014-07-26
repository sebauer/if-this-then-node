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

console.log('\nStarting "IFTTN - IF This Then Node"...');
console.log('============================================');
console.log('Credits for idea go to:\nhttps://github.com/captn3m0/ifttt-webhook\n\n');

var express = require('express');
var xmlparser = require('express-xml-bodyparser');
var pluginManager = require('./plugin-manager');
var parameterExtractor = require('./parameter-extractor').extractParameters;
var app = express();

pluginManager.loadPlugins();

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

var failure = function(status, res) {
	
	console.log('\nSending failure response:');
	console.log('  >> Status Code: '+status
	);
	// TODO create xml by using xml2js
	var xml = '<?xml version="1.0"?>\n<methodResponse><fault><value><struct><member><name>faultCode</name><value><int>'+status+'</int></value></member><member><name>faultString</name><value><string>Request was not successful.</string></value></member></struct></value></fault></methodResponse>';
	
	res.set({
		'Content-Type': 'text/xml'
	});
	
	res.send(200, xml);
}

var success = function(innerXML, res) {
	
	console.log('\nSending success response:');
	console.dir(innerXML);
	// TODO create xml by using xml2js
	var xml = "<?xml version=\"1.0\"?>\n";
	xml += "<methodResponse><params><param><value>"+innerXML+"</value></param></params></methodResponse>";
	
	res.set({
		'Content-Type': 'text/xml'
	});
	
	res.send(200, xml);
}

app.post('/xmlrpc.php', function(req, res, next){
	console.log('\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - \nPOST request received');
	console.log(req.rawBody);
	console.dir(req.body);
	
	var methodName = req.body.methodcall.methodname[0];
	
	console.log('\nMethod Name: '+methodName);

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
			
			// See if we know this plugin and then execute it with the given parameters
			if(pluginManager.pluginExists(params.action)){
				pluginManager.execute(params, function(result){
					if(result.success == true){
						console.log('Plugin succeeded with output: '+result.output);
						success('<string>200</string>', res);
					} else {
						console.error('Plugin failed with output: '+result.output);
						failure(1337, res);
					}
				});
			} else {
				console.error('No plugin found for action '+action);
				res.send(403, 'No plugin found for action '+action);
			}
			
			break;
		default:
			console.log('Unknown request');
			res.send(403,'Unknown reqest');
			break;
	}

});

var server = app.listen(1337, function() {
  console.log('\nListening on port %d', server.address().port);
});
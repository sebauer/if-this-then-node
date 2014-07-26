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
var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(xmlparser());

console.log('Searching for actions..\n');
// TODO load actions

var success = function(innerXML, res) {
	
	console.log('Sending response:');
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
	console.log('POST request received');
	console.log(req.rawBody);
	console.dir(req.body);
	
	var xmlContent = req.body;

	switch(req.body.methodcall.methodname) {
		case 'mt.supportedMethods':
			success('metaWeblog.getRecentPosts', res);
			break;
		//first authentication request from ifttt
		case 'metaWeblog.getRecentPosts':
			//send a blank blog response
			//this also makes sure that the channel is never triggered
			success('<array><data></data></array>');
			break;
		case 'metaWeblog.newPost':
			break;
	}

});

var server = app.listen(1337, function() {
  console.log('Listening on port %d', server.address().port);
});
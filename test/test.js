var assert = require('assert');
var parseString = require('xml2js').parseString;
var redis = require('redis');
var parameterExtractor = require('../parameter-extractor.js');
var pluginManager = require('../plugin-manager.js');
var limitlessOnleaveAutooff = require('../plugins/limitless-onleave-autooff');

// Lets fake a logger
var logMock = {
	'info' : function(){},
	'debug': function(){},
	'warn' : function(){},
	'error': function(){}
};

describe('Limitless LED Plugins', function(){
	describe('limitless-onleave-autooff', function(){

		var redisSetName = 'unittest-runner';
		var client = redis.createClient();
		limitlessOnleaveAutooff.changeSetName(redisSetName);

		afterEach(function(done){
			client.del(redisSetName, function(){
				done();
			});
		});

		describe('on exiting', function(){
			before(function(done){
				client.sadd(redisSetName, ['foo', 'bar'], function(){
					done();
				});
			});

			it('should correctly remove the client from redis', function(done){
				limitlessOnleaveAutooff.run({
					'clientname': 'foo',
					'enterexit': 'exited'
				}, logMock, function(){
					client.smembers(redisSetName, function(err, replies) {
						assert.equal(1, replies.length);
						assert.equal('bar', replies[0]);
						done();
					});
				});
			});
		});

		describe('on entering', function(){
			it('Should correctly add clients to redis', function(done){
				var clientName = 'unittest';

				limitlessOnleaveAutooff.run({
					'clientname': clientName,
					'enterexit': 'entered'
				}, logMock, function(){
					client.sismember(redisSetName, clientName, function(err, reply) {
						assert.equal(1, reply);
						done();
					});
				});
			});
		});
	});
});

describe('Plugin Manager', function(){
	describe('Plugin Loader', function(){
		it('Should find all plugins', function(done){
			pluginManager.setLogger(logMock);
			pluginManager.loadPlugins();
			assert.equal(5, Object.keys(pluginManager.pluginList).length);
			done();
		});
	});
});

describe('XML Parsing', function(){
	var xmlString = '<?xml version="1.0" ?><methodCall><methodName>metaWeblog.newPost</methodName><params><param><value><string></string></value></param><param><value><string>meinuser</string></value></param><param><value><string>meinpw</string></value></param><param><value><struct><member><name>title</name><value><string>Title</string></value></member><member><name>description</name><value><string>wakeonlan</string></value></member><member><name>categories</name><value><array><data><value><string>broadcast=192.168.178.255</string></value><value><string>mac=00:25:22:A2:84:8D</string></value></data></array></value></member><member><name>mt_keywords</name><value><array><data><value><string>tag1</string></value></data></array></value></member><member><name>post_status</name><value><string>publish</string></value></member></struct></value></param><param><value><boolean>1</boolean></value></param></params></methodCall>';
	var xmlStringBadParams = '<?xml version="1.0" ?><methodCall><methodName>metaWeblog.newPost</methodName><params><param><value><string></string></value></param><param><value><string>meinuser</string></value></param><param><value><string>meinpw</string></value></param><param><value><struct><member><name>title</name><value><string>Title</string></value></member><member><name>description</name><value><string>wakeonlan</string></value></member><member><name>categories</name><value><array><data><value><string>broadcast=192.=168.178.255</string></value><value><string>mac=00:25:22:A2:84:8D</string></value></data></array></value></member><member><name>mt_keywords</name><value><array><data><value><string>tag1</string></value></data></array></value></member><member><name>post_status</name><value><string>publish</string></value></member></struct></value></param><param><value><boolean>1</boolean></value></param></params></methodCall>';

	describe('Parameter Extractor', function(){
		it('Should extract all parameters correctly', function(done){
			parseString(xmlString, {
        explicitArray: true,
        normalize: true,
        normalizeTags: true,
        trim: true
			},
			function (err, result) {
			  var params = parameterExtractor.extractParameters(result.methodcall.params[0]);
				assert.equal('meinuser', params.user);
				assert.equal('meinpw', params.pw);
				assert.equal('wakeonlan', params.action);
				assert.deepEqual({
					'broadcast': '192.168.178.255',
					'mac':'00:25:22:A2:84:8D'
				}, params.actionParams);
				done();
			});
		});
		it('Should throw an exception when the parameters are incorrectly set', function(done){
			parseString(xmlStringBadParams, {
	      explicitArray: true,
	      normalize: true,
	      normalizeTags: true,
	      trim: true
			},
			function (err, result) {
			  assert.throws(function(){
					parameterExtractor.extractParameters(result.methodcall.params[0]);
				}, Error, 'Parameters not valid!');
				done();
			});
		});
	});
});

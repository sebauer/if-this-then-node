var assert = require('assert');
var parseString = require('xml2js').parseString;
var parameterExtractor = require('../parameter-extractor.js');
var pluginManager = require('../plugin-manager.js');

var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'IFTTN-testrunner'});

describe('Plugin Manager', function(){
	describe('Plugin Loader', function(){
		it('Should find all plugins', function(done){
			pluginManager.setLogger(log);
			pluginManager.loadPlugins();
			assert.equal(3, Object.keys(pluginManager.pluginList).length);
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

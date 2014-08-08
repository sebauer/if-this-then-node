module.exports = {
  failure: function(status, res, log) {

    log.info('Sending failure response with status code %d', status);
    // TODO create xml by using xml2js
    var xml = '<?xml version="1.0"?>\n<methodResponse><fault><value><struct><member><name>faultCode</name><value><int>'+status+'</int></value></member><member><name>faultString</name><value><string>Request was not successful.</string></value></member></struct></value></fault></methodResponse>';

    res.set({
      'Content-Type': 'text/xml'
    });

    res.send(200, xml);
  },
  success: function(status, res, log) {
    log.info('Sending success response "%s"', status);
    // TODO create xml by using xml2js
    var xml = "<?xml version=\"1.0\"?>\n";
    xml += "<methodResponse><params><param><value>"+status+"</value></param></params></methodResponse>";

    res.set({
      'Content-Type': 'text/xml'
    });

    res.send(200, xml);
  }
}

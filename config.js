var config = {
  'user': 'seb',
  'pw': 'mypw',
  'host': 'insert-light-gateway-ip',
  'port': 'insert-light-gateway-port (default 8899)'
};

module.exports = {
  getConfig: function () {
    var returnObj = {
      'user': config.user,
      'pw': config.pw
    };
    return returnObj;
  }
};

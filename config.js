var config = {
  'user': 'seb',
  'pw': 'mypw',
  'host': '', // Put host name or ip address of light gateway
  'port': '8899' // If necessary change the port of the light gateway. Default is 8899 
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

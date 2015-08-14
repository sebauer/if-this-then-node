var config = {
  'user': 'myuser',
  'pw': 'mypw'
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

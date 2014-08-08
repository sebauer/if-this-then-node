module.exports = {
  run: function (params, log, callback) {
    // do whatever you want in this plugin
    callback({
      'success' : true,
      'output'  : 'all good!'
    });
  },
  info: function() {
    return 'IFTTN Sample Plugin Version 1.0';
  }
};

// This private
var anyHelperFunction = function () {
}

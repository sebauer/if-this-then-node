var config = {
	'user': 'myuser',
	'pw'	: 'mypw'
}

module.exports = {
	getConfig: function() {
		returnObj = {
			'user': config.user,
			'pw': config.pw
		}
		return returnObj;
	}
};

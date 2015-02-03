var config = {
	'user': 'hans',
	'pw'	: 'wurst'
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

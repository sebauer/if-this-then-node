module.exports = {
	extractParameters: function(params) {
		var returnObj = {};
		
		var user = params.param[1].value[0].string[0];
		var pw = params.param[2].value[0].string[0];
		var content = params.param[3].value[0].struct[0].member;
		
		// Now extract the required information from the POST content
		var action = content[1].value[0].string[0];
		var categories = content[2].value[0].array[0].data[0].value;
		var actionParams = [];
		
		// Extract the parameters, faked as categories
		for(var i in categories) {
			var paramString = categories[i].string[0];
			
			// Extract parameters to key/value pairs
			var extractedParams = paramString.match(/^([^\=]+)\=([^\=]+)$/);

			if(extractedParams === null) {
				throw new Error('Parameters not valid!');
			}
			// Save extracted parameters
			actionParams[extractedParams[1]] = extractedParams[2];
		}
		
		returnObj = {
			'user': user,
			'pw': pw,
			'action': action,
			'actionParams': actionParams
		}
		return returnObj;
	}
};
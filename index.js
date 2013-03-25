var JSON5 = require("json5");
exports.parseQuery = function parseQuery(query) {
	if(!query) return {};
	if(typeof query !== "string")
		throw new Error("parseQuery should get a string as first argument");
	if(query.substr(0, 1) !== "?")
		throw new Error("a vaild query string passed to parseQuery should begin with '?'");
	query = query.substr(1);
	var queryLength = query.length;
	if(query.substr(0, 1) === "{" && query.substr(-1) === "}") {
		return JSON5.parse(query);
	}
	var queryArgs = query.split(/[,\&]/g);
	var result = {};
	queryArgs.forEach(function(arg) {
		var idx = arg.indexOf("=");
		if(idx >= 0) {
			var name = arg.substr(0, idx);
			var value = decodeURIComponent(arg.substr(idx+1));
			if(name.substr(-2) === "[]") {
				name = decodeURIComponent(name.substr(0, name.length-2));
				if(!Array.isArray(result[name]))
					result[name] = [];
				result[name].push(value);
			} else {
				result[name] = value;
			}
		} else {
			if(arg.substr(0, 1) === "-") {
				result[arg.substr(1)] = false;
			} else if(arg.substr(0, 1) === "+") {
				result[arg.substr(1)] = true;
			} else {
				result[arg] = true;
			}
		}
	});
	return result;
};

function dotRequest(obj) {
	return obj.request;
}

exports.getRemainingRequest = function(loaderContext) {
	var request = loaderContext.loaders.slice(loaderContext.loaderIndex+1).map(dotRequest).concat([loaderContext.resource]);
	return request.join("!");
};

exports.getCurrentRequest = function(loaderContext) {
	var request = loaderContext.loaders.slice(loaderContext.loaderIndex).map(dotRequest).concat([loaderContext.resource]);
	return request.join("!");
};
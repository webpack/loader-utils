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

exports.isUrlRequest = function(url, root) {
	// An URL is not an request if
	// 1. it's a Data Url
	// 2. it's an absolute url or and protocol-relative
	// 3. it's some kind of url for a template
	if(/^data:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return false;
	// 4. It's also not an request if root isn't set and it's a root-relative url
	if((root === undefined || root === false) && /^\//.test(url)) return false;
	return true;
};

exports.urlToRequest = function(url, root) {
	if(/^[^?]*~/.test(url)) {
		// A `~` makes the url an module
		return url.replace(/^[^?]*~/, "");
	} else if(root !== undefined && root !== false && /^\//.test(url)) {
		// if root is set and the url is root-relative
		switch(typeof root) {
		// 1. root is a string: root is prefixed to the url
		case "string": return root + url;
		// 2. root is `true`: absolute paths are allowed
		//    *nix only, windows-style absolute paths are always allowed as they doesn't start with a `/`
		case "boolean": return url;
		}
	} else if(/^\.\.?\//.test(url)) {
		// A relative url stays
		return url;
	} else {
		// every other url is threaded like a relative url
		return "./"+url;
	}
	throw new Error("Unexpected parameters to loader-utils 'urlToRequest': url = " + url + ", root = " + root + ".");
};
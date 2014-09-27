var JSON5 = require("json5");
var path = require("path");

var baseEncodeTables = {
	26: "abcdefghijklmnopqrstuvwxyz",
	32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
	36: "0123456789abcdefghijklmnopqrstuvwxyz",
	49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
	52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
	62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
};

function encodeBufferToBase(buffer, base, length) {
	var encodeTable = baseEncodeTables[base];
	if (!encodeTable) throw new Error("Enknown encoding base" + base);

	var readLength = buffer.length;

	var Big = require('big.js');
	Big.RM = Big.DP = 0;
	var b = new Big(0);
	for (var i = readLength - 1; i >= 0; i--) {
		b = b.times(256).plus(buffer[i]);
	}

	var output = "";
	while (b.gt(0)) {
		output = encodeTable[b.mod(base)] + output;
		b = b.div(base);
	}

	return output;
}

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
	var moduleRequestRegex = /^[^?]*~/;
	var request;

	if(root !== undefined && root !== false && /^\//.test(url)) {
		// if root is set and the url is root-relative
		switch(typeof root) {
			// 1. root is a string: root is prefixed to the url
			case "string":
				// special case: `~` roots convert to module request
				if (moduleRequestRegex.test(root)) {
					request = root.replace(/([^~\/])$/, "$1/") + url.slice(1);
				} else {
					request = root + url;
				}
				break;
			// 2. root is `true`: absolute paths are allowed
			//    *nix only, windows-style absolute paths are always allowed as they doesn't start with a `/`
			case "boolean":
				request = url;
				break;
			default:
				throw new Error("Unexpected parameters to loader-utils 'urlToRequest': url = " + url + ", root = " + root + ".");
		}
	} else if(/^\.\.?\//.test(url)) {
		// A relative url stays
		request = url;
	} else {
		// every other url is threaded like a relative url
		request = "./" + url;
	}

	// A `~` makes the url an module
	if (moduleRequestRegex.test(request)) {
		request = request.replace(moduleRequestRegex, "");
	}

	return request;
};

exports.parseString = function parseString(str) {
	if(str[0] === '"') return JSON.parse(str);
	if(str[0] === "'") {
		return parseString(str.replace(/\\.|"/g, function(x) {
			if(x === '"') return '\\"';
			return x;
		}).replace(/^'|'$/g, '"'));
	}
	return JSON.parse('"' + str + '"');
};

exports.interpolateName = function interpolateName(loaderContext, content) {
	var query = exports.parseQuery(loaderContext.query);
	var filename = query.name || "[hash].[ext]";
	var context = query.context || loaderContext.options.context;
	var ext = "bin";
	var basename = "file";
	var directory = "";
	if(loaderContext.resourcePath) {
		var resourcePath = loaderContext.resourcePath;
		var idx = resourcePath.lastIndexOf(".");
		var i = resourcePath.lastIndexOf("\\");
		var j = resourcePath.lastIndexOf("/");
		var p = i < 0 ? j : j < 0 ? i : i < j ? i : j;
		if(idx >= 0) {
			ext = resourcePath.substr(idx+1);
			resourcePath = resourcePath.substr(0, idx);
		}
		if(p >= 0) {
			basename = resourcePath.substr(p+1);
			resourcePath = resourcePath.substr(0, p+1);
		}
		directory = path.relative(context, resourcePath + "_").replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
		directory = directory.substr(0, directory.length-1);
		if(directory.length === 1) directory = "";
	}
	var url = filename;
	if(content) {
		url = url.replace(/\[hash\]/ig, function() {
			var digest = query.hash || "md5";
			var digestSize = query.size || 9999;
			hash = new (require("crypto").Hash)(digest);
			hash.update(content);
			if (query.digest === "base26" || query.digest === "base32" || query.digest === "base36" ||
			    query.digest === "base49" || query.digest === "base52" || query.digest === "base58" ||
			    query.digest === "base62" || query.digest === "base64") {
				return encodeBufferToBase(hash.digest(), query.digest.substr(4), digestSize).substr(0, digestSize);
			} else {
				return hash.digest(query.digest || "hex").substr(0, digestSize);
			}
		})		
	}
	url = url.replace(/\[ext\]/ig, function() {
		return ext;
	}).replace(/\[name\]/ig, function() {
		return basename;
	}).replace(/\[path\]/ig, function() {
		return directory;
	});
	if(query.regExp && loaderContext.resourcePath) {
		var re = new RegExp(query.regExp);
		var match = loaderContext.resourcePath.match(query.regExp);
		if(match) {
			for (var i = 1; i < match.length; i++) {
				var re = new RegExp("\\[" + i + "\\]", "ig");
				url = url.replace(re, match[i]);
			}			
		}
	}
	return url;
}

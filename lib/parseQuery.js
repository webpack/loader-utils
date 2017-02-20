"use strict";

const JSON5 = require("json5");
const util = require("util");
const os = require("os");

const parseQueryDeprecationWarning = util.deprecate(() => {},
	"loaderUtils.parseQuery() received a non-string value which can be problematic, " +
	"see https://github.com/webpack/loader-utils/issues/56" + os.EOL +
	"parseQuery() will be replaced with getOptions() in the next major version of loader-utils."
);
const specialValues = {
	"null": null,
	"true": true,
	"false": false
};

function parseQuery(query) {
	if(!query) return {};
	if(typeof query !== "string") {
		parseQueryDeprecationWarning();
		return query;
	}
	if(query.substr(0, 1) !== "?")
		throw new Error("a valid query string passed to parseQuery should begin with '?'");
	query = query.substr(1);
	if(query.substr(0, 1) === "{" && query.substr(-1) === "}") {
		return JSON5.parse(query);
	}
	const queryArgs = query.split(/[,\&]/g);
	const result = {};
	queryArgs.forEach(arg => {
		const idx = arg.indexOf("=");
		if(idx >= 0) {
			let name = arg.substr(0, idx);
			let value = decodeURIComponent(arg.substr(idx + 1));
			if(specialValues.hasOwnProperty(value)) {
				value = specialValues[value];
			}
			if(name.substr(-2) === "[]") {
				name = decodeURIComponent(name.substr(0, name.length - 2));
				if(!Array.isArray(result[name]))
					result[name] = [];
				result[name].push(value);
			} else {
				name = decodeURIComponent(name);
				result[name] = value;
			}
		} else {
			if(arg.substr(0, 1) === "-") {
				result[decodeURIComponent(arg.substr(1))] = false;
			} else if(arg.substr(0, 1) === "+") {
				result[decodeURIComponent(arg.substr(1))] = true;
			} else {
				result[decodeURIComponent(arg)] = true;
			}
		}
	});
	return result;
}

module.exports = parseQuery;

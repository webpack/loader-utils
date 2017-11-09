"use strict";

const path = require("path");
const getHashDigest = require("./getHashDigest");

const baseEmoji = "emoji";

function interpolateName(loaderContext, name, options) {
	let filename;
	if(typeof name === "function") {
		filename = name(loaderContext.resourcePath);
	} else {
		filename = name || "[hash].[ext]";
	}
	const context = options.context;
	const content = options.content;
	const regExp = options.regExp;
	let ext = "bin";
	let basename = "file";
	let directory = "";
	let folder = "";
	if(loaderContext.resourcePath) {
		const parsed = path.parse(loaderContext.resourcePath);
		let resourcePath = loaderContext.resourcePath;

		if(parsed.ext) {
			ext = parsed.ext.substr(1);
		}
		if(parsed.dir) {
			basename = parsed.name;
			resourcePath = parsed.dir + path.sep;
		}
		if(typeof context !== "undefined") {
			directory = path.relative(context, resourcePath + "_").replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
			directory = directory.substr(0, directory.length - 1);
		} else {
			directory = resourcePath.replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
		}
		if(directory.length === 1) {
			directory = "";
		} else if(directory.length > 1) {
			folder = path.basename(directory);
		}
	}
	let url = filename;
	if(content) {
		// Match hash template
		url = url
			.replace(
				/\[(?:([^:]+):)?hash(?::([a-z]+\d*))?(?::(\d+))?\]/ig,
				(all, hashType, digestType, maxLength) => getHashDigest(content, hashType, digestType, parseInt(maxLength, 10))
			)
			.replace(
				/\[emoji(?::(\d+))?\]/ig,
				(all, length) => getHashDigest(content, undefined, baseEmoji, parseInt(length, 10))
			);
	}
	url = url
		.replace(/\[ext\]/ig, () => ext)
		.replace(/\[name\]/ig, () => basename)
		.replace(/\[path\]/ig, () => directory)
		.replace(/\[folder\]/ig, () => folder);
	if(regExp && loaderContext.resourcePath) {
		const match = loaderContext.resourcePath.match(new RegExp(regExp));
		match && match.forEach((matched, i) => {
			url = url.replace(
				new RegExp("\\[" + i + "\\]", "ig"),
				matched
			);
		});
	}
	if(typeof loaderContext.options === "object" && typeof loaderContext.options.customInterpolateName === "function") {
		url = loaderContext.options.customInterpolateName.call(loaderContext, url, name, options);
	}
	return url;
}

module.exports = interpolateName;

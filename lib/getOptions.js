"use strict";

const parseQuery = require("./parseQuery");

function getOptions(loaderContext) {
	const query = loaderContext.query;
	if(typeof query === "string") {
		return parseQuery(loaderContext.query);
	}
	return query;
}

module.exports = getOptions;

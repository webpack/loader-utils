"use strict";

const parseQuery = require("./parseQuery");

function getLoaderConfig(loaderContext, defaultConfigKey) {
	const query = parseQuery(loaderContext.query);
	const configKey = query.config || defaultConfigKey;
	if(configKey) {
		const config = loaderContext.options[configKey] || {};
		delete query.config;
		return Object.assign({}, config, query);
	}

	return query;
}

module.exports = getLoaderConfig;

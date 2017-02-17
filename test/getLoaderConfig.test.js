"use strict";

const assert = require("assert");
const loaderUtils = require("../");

describe("getLoaderConfig()", () => {
	it("should merge loaderContext.query and loaderContext.options.testLoader", () => {
		const config = loaderUtils.getLoaderConfig({ query: "?name=cheesecake",options: { testLoader: { slices: 8 } } }, "testLoader");
		assert.deepEqual(config, { name: "cheesecake",slices: 8 });
	});
	it("should allow to specify a config property name via loaderContext.query.config", () => {
		const config = loaderUtils.getLoaderConfig({ query: "?name=cheesecake&config=otherConfig",options: { otherConfig: { slices: 8 } } }, "testLoader");
		assert.deepEqual(config, { name: "cheesecake",slices: 8 });
	});
	it("should prefer loaderContext.query.slices over loaderContext.options.slices", () => {
		const config = loaderUtils.getLoaderConfig({ query: "?slices=8",options: { testLoader: { slices: 4 } } }, "testLoader");
		assert.deepEqual(config, { slices: 8 });
	});
	it("should allow no default key", () => {
		const config = loaderUtils.getLoaderConfig({ query: "?slices=8",options: {} });
		assert.deepEqual(config, { slices: 8 });
	});
});

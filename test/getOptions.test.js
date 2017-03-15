"use strict";

const assert = require("assert");
const loaderUtils = require("../lib");

describe("getOptions()", () => {
	describe("when loaderContext.query is a string with length > 0", () => {
		it("should call parseQuery() and return its result", () => {
			assert.deepEqual(
				loaderUtils.getOptions({
					query: "?something=getOptions_cannot_parse"
				}),
				{ something: "getOptions_cannot_parse" }
			);
		});
	});
	describe("when loaderContext.query is an empty string", () => {
		it("should return null", () => {
			assert.strictEqual(
				loaderUtils.getOptions({
					query: ""
				}),
				null
			);
		});
	});
	describe("when loaderContext.query is an object", () => {
		it("should just return it", () => {
			const query = {};
			assert.strictEqual(
				loaderUtils.getOptions({
					query
				}),
				query
			);
		});
	});
	describe("when loaderContext.query is an array", () => {
		it("should just return it", () => {
			const query = [];
			assert.strictEqual(
				loaderUtils.getOptions({
					query
				}),
				query
			);
		});
	});
	describe("when loaderContext.query is anything else", () => {
		it("should return null", () => {
			assert.strictEqual(
				loaderUtils.getOptions({
					query: undefined
				}),
				null
			);
			assert.strictEqual(
				loaderUtils.getOptions({
					query: null
				}),
				null
			);
			assert.strictEqual(
				loaderUtils.getOptions({
					query: 1
				}),
				null
			);
			assert.strictEqual(
				loaderUtils.getOptions({
					query: 0
				}),
				null
			);
		});
	});
});

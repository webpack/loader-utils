"use strict";

const assert = require("assert");
const loaderUtils = require("../lib");

describe("getOptions()", () => {
	describe("when loaderContext.query is a query string starting with ?", () => {
		[{
			it: "should return an empty object by default",
			query: "?",
			expected: {}
		},
		{
			it: "should parse query params",
			query: "?name=cheesecake&slices=8&delicious&warm=false",
			expected: {
				delicious: true,
				name: "cheesecake",
				slices: "8",	// numbers are still strings with query params
				warm: false
			}
		},
		{
			it: "should parse query params with arrays",
			query: "?ingredients[]=flour&ingredients[]=sugar",
			expected: {
				ingredients: ["flour", "sugar"]
			}
		},
		{
			it: "should parse query params in JSON format",
			query: "?" + JSON.stringify({
				delicious: true,
				name: "cheesecake",
				slices: 8,
				warm: false
			}),
			expected: {
				delicious: true,
				name: "cheesecake",
				slices: 8,
				warm: false
			}
		},
		{
			it: "should use decodeURIComponent",
			query: "?%3d",
			expected: { "=": true }
		},
		{
			it: "should recognize params starting with + as boolean params with the value true",
			query: "?+%3d",
			expected: { "=": true }
		},
		{
			it: "should recognize params starting with - as boolean params with the value false",
			query: "?-%3d",
			expected: { "=": false }
		},
		{
			it: "should not confuse regular equal signs and encoded equal signs",
			query: "?%3d=%3D",
			expected: { "=": "=" }
		}].forEach(test => {
			it(test.it, () => {
				assert.deepEqual(
					loaderUtils.getOptions({
						query: test.query
					}),
					test.expected
				);
			});
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
	describe("when loaderContext.query is any other string not starting with ?", () => {
		it("should throw an error", () => {
			assert.throws(
				() => loaderUtils.getOptions({ query: "a" }),
				"A valid query string passed to parseQuery should begin with '?'"
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

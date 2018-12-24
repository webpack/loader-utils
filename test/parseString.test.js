"use strict";

const assert = require("assert");
const loaderUtils = require("../");

describe("parseString()", () => {
	[
		["test string", "test string"],
		[JSON.stringify("!\"§$%&/()=?'*#+,.-;öäü:_test"), "!\"§$%&/()=?'*#+,.-;öäü:_test"],
		["'escaped with single \"'", "escaped with single \""],
		["invalid \"' string", "invalid \"' string"],
		["'inconsistent start and end\"", "'inconsistent start and end\""]
	].forEach(test => {
		it("should parse " + test[0], () => {
			const parsed = loaderUtils.parseString(test[0]);
			assert.equal(parsed, test[1]);
		});
	});
});

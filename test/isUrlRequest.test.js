"use strict";

const assert = require("assert");
const loaderUtils = require("../");

describe("isUrlRequest()", () => {
	[
		["test url", "about:blank", undefined, false],
	].forEach(test => {
		it("should isUrlRequest " + test[0] + " " + test[1] + " " + test[2], () => {
			const urlRequest = loaderUtils.isUrlRequest(test[1], test[2]);
			assert.equal(urlRequest, test[3]);
		});
	});
});

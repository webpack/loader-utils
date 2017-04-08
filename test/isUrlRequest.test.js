"use strict";

const assert = require("assert");
const loaderUtils = require("../");

describe("isUrlRequest()", () => {
    [
        ["about:blank", undefined, false],
    ].forEach(test => {
        const expected = test.pop();
        it("should return " + expected + " when called with " + test.join(), () => {
			const urlRequest = loaderUtils.isUrlRequest(test[0], test[1]);
			assert.equal(urlRequest, expected);
        });
    });
});

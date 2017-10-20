"use strict";

const assert = require("assert");
const loaderUtils = require("../");

function ExpectedError(regex) {
	this.regex = regex;
}
ExpectedError.prototype.matches = function(err) {
	return this.regex.test(err.message);
};

describe("isUrlRequest()", () => {
	[
		// without root
		[["//google.com"], false, "should be negative for scheme-agnostic urls"],
		[["http://google.com"], false, "should be negative for http urls"],
		[["https://google.com"], false, "should be negative for https urls"],
		[["chrome-extension://"], false, "should be negative for https urls"],
		[["moz-extension://"], false, "should be negative for https urls"],
		[["ms-browser-extension://"], false, "should be negative for https urls"],
		[["path/to/thing"], true, "should be positive for implicit relative urls"],
		[["./path/to/thing"], true, "should be positive for explicit relative urls"],
		[["~path/to/thing"], true, "should be positive for module urls (with ~)"],
		[["some/other/stuff/and/then~path/to/thing"], true, "should be positive for module urls with path prefix"],
		[["./some/other/stuff/and/then~path/to/thing"], true, "should be positive for module urls with relative path prefix"],
		// with root (normal path)
		[["path/to/thing", "root/dir"], true, "should be positive with root if implicit relative url"],
		[["./path/to/thing", "root/dir"], true, "should be positive with root if explicit relative url"],
		[["/path/to/thing", "root/dir"], true, "should be positive with root if root-relative url"],
		// with root (boolean)
		[["/path/to/thing", true], true, "should be positive for root-relative if root = `true`"],
		// with root (boolean) on Windows
		[["C:\\path\\to\\thing"], true, "should be positive for Windows absolute paths with drive letter"],
		[["\\\\?\\UNC\\ComputerName\\path\\to\\thing"], true, "should be positive for Windows absolute UNC paths"],
		// with root (module)
		[["/path/to/thing", "~"], true, "should be positive for module url if root = ~"],
		// with root (module path)
		[["/path/to/thing", "~module"], true, "should be positive for module prefixes when root starts with ~"],
		[["/path/to/thing", "~module/"], true, "should be positive for module prefixes (with trailing slash) when root starts with ~"],
		// error cases
		[["/path/to/thing", 1], new ExpectedError(/unexpected parameters/i), "should throw an error on invalid root"],

		// empty url
		[[""], true, "should be positive if url is empty"]
	].forEach((test) => {
		it(test[2], () => {
			const expected = test[1];
			try {
				const request = loaderUtils.isUrlRequest.apply(loaderUtils, test[0]);
				assert.equal(request, expected);
			} catch(e) {
				if(expected instanceof ExpectedError) {
					assert.ok(expected.matches(e));
				} else {
					assert.ok(false, "should not have thrown an error: " + e.message);
				}
			}
		});
	});
});

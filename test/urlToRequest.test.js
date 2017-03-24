"use strict";

const assert = require("assert");
const loaderUtils = require("../");

function ExpectedError(regex) {
	this.regex = regex;
}
ExpectedError.prototype.matches = function(err) {
	return this.regex.test(err.message);
};

describe("urlToRequest()", () => {
	[
		// without root
		[["path/to/thing"], "./path/to/thing", "should handle implicit relative urls"],
		[["./path/to/thing"], "./path/to/thing", "should handle explicit relative urls"],
		[["~path/to/thing"], "path/to/thing", "should handle module urls (with ~)"],
		[["some/other/stuff/and/then~path/to/thing"], "path/to/thing", "should handle module urls with path prefix"],
		[["./some/other/stuff/and/then~path/to/thing"], "path/to/thing", "should handle module urls with relative path prefix"],
		// with root (normal path)
		[["path/to/thing", "root/dir"], "./path/to/thing", "should do nothing with root if implicit relative url"],
		[["./path/to/thing", "root/dir"], "./path/to/thing", "should do nothing with root if explicit relative url"],
		[["/path/to/thing", "root/dir"], "root/dir/path/to/thing", "should include root if root-relative url"],
		// with root (boolean)
		[["/path/to/thing", true], "/path/to/thing", "should allow root-relative to exist as-is if root = `true`"],
		// with root (boolean) on Windows
		[["C:\\path\\to\\thing"], "C:\\path\\to\\thing", "should handle Windows absolute paths with drive letter"],
		[["\\\\?\\UNC\\ComputerName\\path\\to\\thing"], "\\\\?\\UNC\\ComputerName\\path\\to\\thing", "should handle Windows absolute UNC paths"],
		// with root (module)
		[["/path/to/thing", "~"], "path/to/thing", "should convert to module url if root = ~"],
		// with root (module path)
		[["/path/to/thing", "~module"], "module/path/to/thing", "should allow module prefixes when root starts with ~"],
		[["/path/to/thing", "~module/"], "module/path/to/thing", "should allow module prefixes (with trailing slash) when root starts with ~"],
		// error cases
		[["/path/to/thing", 1], new ExpectedError(/unexpected parameters/i), "should throw an error on invalid root"],
		// difficult cases
		[["a:b-not-\\window-path"], "./a:b-not-\\window-path", "should not incorrectly detect windows paths"],
		// empty url
		[[""], "", "should do nothing if url is empty"]
	].forEach((test) => {
		it(test[2], () => {
			const expected = test[1];
			try {
				const request = loaderUtils.urlToRequest.apply(loaderUtils, test[0]);
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

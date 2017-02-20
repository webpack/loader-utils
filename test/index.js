var assert = require("assert"),
	path = require("path"),
	loaderUtils = require("../");

var s = JSON.stringify;

function ExpectedError(regex) {
	this.regex = regex;
}
ExpectedError.prototype.matches = function(err) {
	return this.regex.test(err.message);
};

describe("loader-utils", function() {

	describe("#urlToRequest()", function() {
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
			[["a:b-not-\\window-path"], "./a:b-not-\\window-path", "should not incorrectly detect windows paths"]
		].forEach(function(test) {
			it(test[2], function() {
				var expected = test[1];
				try {
					var request = loaderUtils.urlToRequest.apply(loaderUtils, test[0]);
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

	describe("#interpolateName", function() {
		[
			["/app/js/javascript.js", "js/[hash].script.[ext]", "test content", "js/9473fdd0d880a43c21b7778d34872157.script.js"],
			["/app/page.html", "html-[hash:6].html", "test content", "html-9473fd.html"],
			["/app/flash.txt", "[hash]", "test content", "9473fdd0d880a43c21b7778d34872157"],
			["/app/img/image.png", "[sha512:hash:base64:7].[ext]", "test content", "2BKDTjl.png"],
			["/app/dir/file.png", "[path][name].[ext]?[hash]", "test content", "/app/dir/file.png?9473fdd0d880a43c21b7778d34872157"],
			["/vendor/test/images/loading.gif", function(path) {
				return path.replace(/\/?vendor\/?/, "");
			}, "test content", "test/images/loading.gif"]
		].forEach(function(test) {
			it("should interpolate " + test[0] + " " + test[1], function() {
				var interpolatedName = loaderUtils.interpolateName({ resourcePath: test[0] }, test[1], { content: test[2] });
				assert.equal(interpolatedName, test[3]);
			});
		});
	});

	describe("#parseString", function() {
		[
			["test string", "test string"],
			[s("!\"§$%&/()=?'*#+,.-;öäü:_test"), "!\"§$%&/()=?'*#+,.-;öäü:_test"],
			["'escaped with single \"'", "escaped with single \""],
			["invalid \"' string", "invalid \"' string"],
			["\'inconsistent start and end\"", "\'inconsistent start and end\""]
		].forEach(function(test) {
			it("should parse " + test[0], function() {
				var parsed = loaderUtils.parseString(test[0]);
				assert.equal(parsed, test[1]);
			});
		});
	});

	describe("#parseQuery", function() {
		[
			[
				"?sweet=true&name=cheesecake&slices=8&delicious&warm=false",
				{ "sweet": true,"name": "cheesecake","slices": "8","delicious": true,"warm": false }
			],
			[
				"?%3d",
				{ "=": true }
			],
			[
				"?+%3d",
				{ "=": true }
			],
			[
				"?-%3d",
				{ "=": false }
			],
			[
				"?%3d=%3D",
				{ "=": "=" }
			],
			[
				{ obj: "test" },
				{ obj: "test" }
			]
		].forEach(function(test) {
			it("should parse " + test[0], function() {
				var parsed = loaderUtils.parseQuery(test[0]);
				assert.deepEqual(parsed, test[1]);
			});
		});
	});

	describe("#getLoaderConfig", function() {
		it("should merge loaderContext.query and loaderContext.options.testLoader", function() {
			var config = loaderUtils.getLoaderConfig({ query: "?name=cheesecake",options: { testLoader: { slices: 8 } } }, "testLoader");
			assert.deepEqual(config, { name: "cheesecake",slices: 8 });
		});
		it("should allow to specify a config property name via loaderContext.query.config", function() {
			var config = loaderUtils.getLoaderConfig({ query: "?name=cheesecake&config=otherConfig",options: { otherConfig: { slices: 8 } } }, "testLoader");
			assert.deepEqual(config, { name: "cheesecake",slices: 8 });
		});
		it("should prefer loaderContext.query.slices over loaderContext.options.slices", function() {
			var config = loaderUtils.getLoaderConfig({ query: "?slices=8",options: { testLoader: { slices: 4 } } }, "testLoader");
			assert.deepEqual(config, { slices: 8 });
		});
		it("should allow no default key", function() {
			var config = loaderUtils.getLoaderConfig({ query: "?slices=8",options: {} });
			assert.deepEqual(config, { slices: 8 });
		});
	});

	describe("#getHashDigest", function() {
		[
			["test string", "md5", "hex", undefined, "6f8db599de986fab7a21625b7916589c"],
			["test string", "md5", "hex", 4, "6f8d"],
			["test string", "md5", "base64", undefined, "2sm1pVmS8xuGJLCdWpJoRL"],
			["test string", "md5", "base52", undefined, "dJnldHSAutqUacjgfBQGLQx"],
			["test string", "md5", "base26", 6, "bhtsgu"],
			["test string", "sha512", "base64", undefined, "2IS-kbfIPnVflXb9CzgoNESGCkvkb0urMmucPD9z8q6HuYz8RShY1-tzSUpm5-Ivx_u4H1MEzPgAhyhaZ7RKog"],
			["test_string", "md5", "hex", undefined, "3474851a3410906697ec77337df7aae4"]
		].forEach(function(test) {
			it("should getHashDigest " + test[0] + " " + test[1] + " " + test[2] + " " + test[3], function() {
				var hashDigest = loaderUtils.getHashDigest(test[0], test[1], test[2], test[3]);
				assert.equal(hashDigest, test[4]);
			});
		});
	});

	describe("#interpolateName", function() {
		function run(tests) {
			tests.forEach(function(test) {
				var args = test[0];
				var expected = test[1];
				var message = test[2];
				it(message, function() {
					var result = loaderUtils.interpolateName.apply(loaderUtils, args);
					if(typeof expected === "function") {
						expected(result);
					} else {
						assert.equal(result, expected);
					}
				});
			});
		}

		run([
			[[{}, "", { content: "test string" }], "6f8db599de986fab7a21625b7916589c.bin", "should interpolate default tokens"],
			[[{}, "[hash:base64]", { content: "test string" }], "2sm1pVmS8xuGJLCdWpJoRL", "should interpolate [hash] token with options"],
			[[{}, "[unrecognized]", { content: "test string" }], "[unrecognized]", "should not interpolate unrecognized token"],
		]);

		var emojiRegex = /[\uD800-\uDFFF]./;
		run([
			[
				[{}, "[emoji]", { content: "test" }],
				function(result) {
					assert.ok(emojiRegex.test(result), result);
				},
				"should interpolate [emoji]"
			],
			[
				[{}, "[emoji:3]", { content: "string" }],
				function(result) {
					assert.ok(emojiRegex.test(result), result);
					assert.ok(result.length, 6);
				},
				"should interpolate [emoji:3]"
			],
		]);
		it("should return the same emoji for the same string", function() {
			var args = [{}, "[emoji:5]", { content: "same_emoji" }];
			var result1 = loaderUtils.interpolateName.apply(loaderUtils, args);
			var result2 = loaderUtils.interpolateName.apply(loaderUtils, args);
			assert.equal(result1, result2);
		});

		context("no loader context", function() {
			var loaderContext = {};
			run([
				[[loaderContext, "[ext]", {}], "bin", "should interpolate [ext] token"],
				[[loaderContext, "[name]", {}], "file", "should interpolate [name] token"],
				[[loaderContext, "[path]", {}], "", "should interpolate [path] token"],
				[[loaderContext, "[folder]", {}], "", "should interpolate [folder] token"]
			]);
		});

		context("with loader context", function() {
			var loaderContext = { resourcePath: "/path/to/file.exe" };
			run([
				[[loaderContext, "[ext]", {}], "exe", "should interpolate [ext] token"],
				[[loaderContext, "[name]", {}], "file", "should interpolate [name] token"],
				[[loaderContext, "[path]", {}], "/path/to/", "should interpolate [path] token"],
				[[loaderContext, "[folder]", {}], "to", "should interpolate [folder] token"]
			]);
		});

		run([
			[[{
				resourcePath: "/xyz",
				options: {
					customInterpolateName: function(str, name, options) {
						return str + "-" + name + "-" + options.special;
					}
				}
			}, "[name]", {
				special: "special"
			}], "xyz-[name]-special", "should provide a custom interpolateName function in options"],
		]);
	});

	describe("#stringifyRequest", function() {
		// We know that query strings that contain paths and question marks can be problematic.
		// We must ensure that stringifyRequest is not messing with them
		var paramQueryString = "?questionMark?posix=path/to/thing&win=path\\to\\thing";
		var jsonQueryString = "?" + s({
			questionMark: "?",
			posix: "path/to/thing",
			win: "path\\to\\file"
		});
		var win = path.sep === "\\";
		var posix = path.sep === "/";
		[
			{ request: "./a.js", expected: s("./a.js") },
			{ request: ".\\a.js", expected: s("./a.js") },
			{ request: "./a/b.js", expected: s("./a/b.js") },
			{ request: ".\\a\\b.js", expected: s("./a/b.js") },
			{ request: "module", expected: s("module") }, // without ./ is a request into the modules directory
			{ request: "module/a.js", expected: s("module/a.js") },
			{ request: "module\\a.js", expected: s("module/a.js") },
			{ request: "./a.js" + paramQueryString, expected: s("./a.js" + paramQueryString) },
			{ request: "./a.js" + jsonQueryString, expected: s("./a.js" + jsonQueryString) },
			{ request: "module" + paramQueryString, expected: s("module" + paramQueryString) },
			{ request: "module" + jsonQueryString, expected: s("module" + jsonQueryString) },
			posix && { context: "/path/to", request: "/path/to/module/a.js", expected: s("./module/a.js") },
			win && { context: "C:\\path\\to\\", request: "C:\\path\\to\\module\\a.js", expected: s("./module/a.js") },
			posix && { context: "/path/to/thing", request: "/path/to/module/a.js", expected: s("../module/a.js") },
			win && { context: "C:\\path\\to\\thing", request: "C:\\path\\to\\module\\a.js", expected: s("../module/a.js") },
			win && { context: "\\\\A\\path\\to\\thing", request: "\\\\A\\path\\to\\module\\a.js", expected: s("../module/a.js") },
			// If context and request are on different drives, the path should not be relative
			// @see https://github.com/webpack/loader-utils/pull/14
			win && { context: "D:\\path\\to\\thing", request: "C:\\path\\to\\module\\a.js", expected: s("C:\\path\\to\\module\\a.js") },
			win && { context: "\\\\A\\path\\to\\thing", request: "\\\\B\\path\\to\\module\\a.js", expected: s("\\\\B\\path\\to\\module\\a.js") },
			posix && {
				context: "/path/to",
				request: "/path/to/module/a.js" + paramQueryString,
				expected: s("./module/a.js" + paramQueryString)
			},
			win && {
				context: "C:\\path\\to\\",
				request: "C:\\path\\to\\module\\a.js" + paramQueryString,
				expected: s("./module/a.js" + paramQueryString)
			},
			{
				request:
					["./a.js", "./b.js", "./c.js"].join("!"),
				expected: s(
					["./a.js", "./b.js", "./c.js"].join("!")
				)
			},
			{
				request:
					["a/b.js", "c/d.js", "e/f.js", "g"].join("!"),
				expected: s(
					["a/b.js", "c/d.js", "e/f.js", "g"].join("!")
				)
			},
			{
				request:
					["a/b.js" + paramQueryString, "c/d.js" + jsonQueryString, "e/f.js"].join("!"),
				expected: s(
					["a/b.js" + paramQueryString, "c/d.js" + jsonQueryString, "e/f.js"].join("!")
				)
			},
			posix && {
				context: "/path/to",
				request:
					["/a/b.js" + paramQueryString, "c/d.js" + jsonQueryString, "/path/to/e/f.js"].join("!"),
				expected: s(
					["../../a/b.js" + paramQueryString, "c/d.js" + jsonQueryString, "./e/f.js"].join("!")
				)
			},
			win && {
				context: "C:\\path\\to\\",
				request:
					["C:\\a\\b.js" + paramQueryString, "c\\d.js" + jsonQueryString, "C:\\path\\to\\e\\f.js"].join("!"),
				expected: s(
					["../../a/b.js" + paramQueryString, "c/d.js" + jsonQueryString, "./e/f.js"].join("!")
				)
			}
		].forEach(function(testCase, i) {
			if(!testCase) {
				// If testCase is not defined, this test case should not be executed on this OS.
				// This is because node's path module is OS agnostic which means that path.relative won't produce
				// a relative path with absolute windows paths on posix systems.
				return;
			}
			it("should stringify request " + testCase.request + " to " + testCase.expected + " inside context " + testCase.context, function() {
				var actual = loaderUtils.stringifyRequest({ context: testCase.context }, testCase.request);
				assert.equal(actual, testCase.expected);
			});
		});
	});
});

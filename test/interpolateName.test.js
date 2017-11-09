"use strict";

const assert = require("assert");
const loaderUtils = require("../");

const emojiRegex = /[\uD800-\uDFFF]./;

describe("interpolateName()", () => {
	function run(tests) {
		tests.forEach((test) => {
			const args = test[0];
			const expected = test[1];
			const message = test[2];
			it(message, () => {
				const result = loaderUtils.interpolateName.apply(loaderUtils, args);
				if(typeof expected === "function") {
					expected(result);
				} else {
					assert.equal(result, expected);
				}
			});
		});
	}

	[
		["/app/js/javascript.js", "js/[hash].script.[ext]", "test content", "js/9473fdd0d880a43c21b7778d34872157.script.js"],
		["/app/page.html", "html-[hash:6].html", "test content", "html-9473fd.html"],
		["/app/flash.txt", "[hash]", "test content", "9473fdd0d880a43c21b7778d34872157"],
		["/app/img/image.png", "[sha512:hash:base64:7].[ext]", "test content", "2BKDTjl.png"],
		["/app/dir/file.png", "[path][name].[ext]?[hash]", "test content", "/app/dir/file.png?9473fdd0d880a43c21b7778d34872157"],
		["/vendor/test/images/loading.gif", path => path.replace(/\/?vendor\/?/, ""), "test content", "test/images/loading.gif"],
		["/pathWith.period/filename.js", "js/[name].[ext]", "test content", "js/filename.js"],
		["/pathWith.period/filenameWithoutExt", "js/[name].[ext]", "test content", "js/filenameWithoutExt.bin"]
	].forEach(test => {
		it("should interpolate " + test[0] + " " + test[1], () => {
			const interpolatedName = loaderUtils.interpolateName({ resourcePath: test[0] }, test[1], { content: test[2] });
			assert.equal(interpolatedName, test[3]);
		});
	});

	[ "sha1fakename",
		"9dxfakename",
		"RSA-SHA256-fakename",
		"ecdsa-with-SHA1-fakename",
		"tls1.1-sha512-fakename",
	].forEach(hashName => {
		it("should pick hash algorithm by name " + hashName, () => {
			assert.throws(
				() => {
					const interpolatedName = loaderUtils.interpolateName(
						{}, "[" + hashName + ":hash:base64:10]", { content: "a" }
					);
					// if for any reason the system we're running on has a hash
					// algorithm matching any of our bogus names, at least make sure
					// the output is not the unmodified name:
					assert(interpolatedName[0] !== "[");
				},
				/digest method not supported/i
			);
		});
	});


	run([
		[[{}, "", { content: "test string" }], "6f8db599de986fab7a21625b7916589c.bin", "should interpolate default tokens"],
		[[{}, "[hash:base64]", { content: "test string" }], "2sm1pVmS8xuGJLCdWpJoRL", "should interpolate [hash] token with options"],
		[[{}, "[unrecognized]", { content: "test string" }], "[unrecognized]", "should not interpolate unrecognized token"],
		[
			[{}, "[emoji]", { content: "test" }],
			result => {
				assert.ok(emojiRegex.test(result), result);
			},
			"should interpolate [emoji]"
		],
		[
			[{}, "[emoji:3]", { content: "string" }],
			result => {
				assert.ok(emojiRegex.test(result), result);
				assert.ok(result.length, 6);
			},
			"should interpolate [emoji:3]"
		],
	]);

	it("should return the same emoji for the same string", () => {
		const args = [{}, "[emoji:5]", { content: "same_emoji" }];
		const result1 = loaderUtils.interpolateName.apply(loaderUtils, args);
		const result2 = loaderUtils.interpolateName.apply(loaderUtils, args);
		assert.equal(result1, result2);
	});

	context("no loader context", () => {
		const loaderContext = {};
		run([
			[[loaderContext, "[ext]", {}], "bin", "should interpolate [ext] token"],
			[[loaderContext, "[name]", {}], "file", "should interpolate [name] token"],
			[[loaderContext, "[path]", {}], "", "should interpolate [path] token"],
			[[loaderContext, "[folder]", {}], "", "should interpolate [folder] token"]
		]);
	});

	context("with loader context", () => {
		const loaderContext = { resourcePath: "/path/to/file.exe" };
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
				customInterpolateName(str, name, options) {
					return str + "-" + name + "-" + options.special;
				}
			}
		}, "[name]", {
			special: "special"
		}], "xyz-[name]-special", "should provide a custom interpolateName function in options"],
	]);
});

"use strict";

const assert = require("assert");
const loaderUtils = require("../");

describe("getHashDigest()", () => {
	[
		["test string", "md5", "hex", undefined, "6f8db599de986fab7a21625b7916589c"],
		["test string", "md5", "hex", 4, "6f8d"],
		["test string", "md5", "base26", 6, "bhtsgu"],
		["test string", "md5", "base32", undefined, "5wc1c8kqv356xbqvwsvudvc4cg"],
		["test string", "md5", "base36", undefined, "997pjihdecvikbbokopxdvujz"],
		["test string", "md5", "base49", undefined, "oEgJVoBEipRvFtEXuDUbZQY"],
		["test string", "md5", "base52", undefined, "dJnldHSAutqUacjgfBQGLQx"],
		["test string", "md5", "base58", undefined, "kiKv8gGHgGhA8kV3s8V6K6"],
		["test string", "md5", "base62", undefined, "4L13FJ3yYOQy6HP57cyUkD"],
		["test string", "md5", "base64", undefined, "2sm1pVmS8xuGJLCdWpJoRL"],
		["test string", "sha512", "base64", undefined, "2IS-kbfIPnVflXb9CzgoNESGCkvkb0urMmucPD9z8q6HuYz8RShY1-tzSUpm5-Ivx_u4H1MEzPgAhyhaZ7RKog"],
		["test string", "md5", "hex", undefined, "6f8db599de986fab7a21625b7916589c"],
		["test string", "md5", "emoji", undefined, "🇦🇿🙋🏻‍♀️👨🏼‍💼🚐👨‍🎤🌛🚴🏽🇧🇼⛹️‍♀️😓💇🏽‍♀️🚴🏽‍♀️🔹"],
		["test string", "md5", "emoji", 4, "🇦🇿🙋🏻‍♀️👨🏼‍💼🚐"]
	].forEach(test => {
		it("should getHashDigest " + test[0] + " " + test[1] + " " + test[2] + " " + test[3], () => {
			const hashDigest = loaderUtils.getHashDigest(test[0], test[1], test[2], test[3]);
			assert.equal(hashDigest, test[4]);
		});
	});
});

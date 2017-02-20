"use strict";

const assert = require("assert");
const loaderUtils = require("../");

describe("parseQuery()", () => {
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
	].forEach(test => {
		it("should parse " + test[0], () => {
			const parsed = loaderUtils.parseQuery(test[0]);
			assert.deepEqual(parsed, test[1]);
		});
	});
});

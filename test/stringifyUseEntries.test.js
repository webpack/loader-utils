"use strict";

const loaderUtils = require("../");

function ExpectedError(regex) {
  this.regex = regex;
}

ExpectedError.prototype.matches = function (err) {
  return this.regex.test(err.message);
};

describe("stringifyUseEntries()", () => {
  [
    [
      [
        [
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      ],
      "css-loader?{'modules':'true'}",
      "should serialize one loader",
    ],
    [
      [
        [
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          {
            loader: "svgo-loader",
            options: {
              plugins: [
                {
                  cleanupIDs: { prefix: "prefix" },
                },
              ],
            },
          },
        ],
      ],
      "css-loader?{'modules':'true'}!svgo-loader?{'plugins':[{'cleanupIDs':{'prefix':'prefix'}}]}",
      "should serialize multiple loaders",
    ],
  ].forEach((test) => {
    it(test[2], () => {
      const expected = test[1];
      try {
        const request = loaderUtils.stringifyUseEntries.apply(
          loaderUtils,
          test[0]
        );

        expect(request).toBe(expected);
      } catch (e) {
        if (expected instanceof ExpectedError) {
          expect(expected.matches(e)).toBe(true);
        } else {
          throw new Error("should not have thrown an error: " + e.message);
        }
      }
    });
  });
});

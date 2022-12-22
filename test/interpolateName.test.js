"use strict";

const loaderUtils = require("../dist");

describe("interpolateName()", () => {
  function run(tests) {
    tests.forEach((test) => {
      const args = test[0];
      const expected = test[1];
      const message = test[2];
      it(message, () => {
        const result = loaderUtils.interpolateName.apply(loaderUtils, args);
        if (typeof expected === "function") {
          expected(result);
        } else {
          expect(result).toBe(expected);
        }
      });
    });
  }

  [
    [
      "/app/js/javascript.js",
      "js/[hash].script.[ext]",
      "test content",
      "js/0e6882304e9adbd5.script.js",
    ],
    [
      "/app/js/javascript.js",
      "js/[contenthash].script.[ext]",
      "test content",
      "js/0e6882304e9adbd5.script.js",
    ],
    [
      "/app/page.html",
      "html-[hash:6].html",
      "test content",
      "html-0e6882.html",
    ],
    [
      "/app/page.html",
      "html-[contenthash:6].html",
      "test content",
      "html-0e6882.html",
    ],
    ["/app/flash.txt", "[hash]", "test content", "0e6882304e9adbd5"],
    ["/app/flash.txt", "[contenthash]", "test content", "0e6882304e9adbd5"],
    [
      "/app/img/image.png",
      "[sha512:hash:base64:7].[ext]",
      "test content",
      "DL9MrvO.png",
    ],
    [
      "/app/img/image.png",
      "[sha512:contenthash:base64:7].[ext]",
      "test content",
      "DL9MrvO.png",
    ],
    [
      "/app/dir/file.png",
      "[path][name].[ext]?[hash]",
      "test content",
      "/app/dir/file.png?0e6882304e9adbd5",
    ],
    [
      "/app/dir/file.png",
      "[path][name].[ext]?[contenthash]",
      "test content",
      "/app/dir/file.png?0e6882304e9adbd5",
    ],
    [
      "/vendor/test/images/loading.gif",
      (path) => path.replace(/\/?vendor\/?/, ""),
      "test content",
      "test/images/loading.gif",
    ],
    [
      "/pathWith.period/filename.js",
      "js/[name].[ext]",
      "test content",
      "js/filename.js",
    ],
    [
      "/pathWith.period/filenameWithoutExt",
      "js/[name].[ext]",
      "test content",
      "js/filenameWithoutExt.bin",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name]__modalTitle___[sha1:hash:hex:4]",
      "test content",
      "modal__modalTitle___1eeb",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name]__modalTitle___[sha1:contenthash:hex:4]",
      "test content",
      "modal__modalTitle___1eeb",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name].[md4:hash:base64:20].[ext]",
      "test content",
      "modal.ppiZgUkxKA4vUnIZrWrH.css",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name].[md5:hash:base64:20].[ext]",
      "test content",
      "modal.lHP90NiApDwht3eNNIch.css",
    ],
    [
      "/lib/components/modal/modal.css",
      "[name].[md5:contenthash:base64:20].[ext]",
      "test content",
      "modal.lHP90NiApDwht3eNNIch.css",
    ],
    // Should not interpret without `hash` or `contenthash`
    [
      "/lib/components/modal/modal.css",
      "[name].[md5::base64:20].[ext]",
      "test content",
      "modal.[md5::base64:20].css",
    ],
    [
      "/app/js/javascript.js?foo=bar",
      "js/[hash].script.[ext][query]",
      "test content",
      "js/0e6882304e9adbd5.script.js?foo=bar",
    ],
    [
      "/app/js/javascript.js?foo=bar&bar=baz",
      "js/[hash].script.[ext][query]",
      "test content",
      "js/0e6882304e9adbd5.script.js?foo=bar&bar=baz",
    ],
    [
      "/app/js/javascript.js?foo",
      "js/[hash].script.[ext][query]",
      "test content",
      "js/0e6882304e9adbd5.script.js?foo",
    ],
    [
      "/app/js/javascript.js?",
      "js/[hash].script.[ext][query]",
      "test content",
      "js/0e6882304e9adbd5.script.js",
    ],
    [
      "/app/js/javascript.js?a",
      "js/[hash].script.[ext][query]",
      "test content",
      "js/0e6882304e9adbd5.script.js?a",
    ],
    [
      "/app/js/javascript.js?foo=bar#hash",
      "js/[hash].script.[ext][query]",
      "test content",
      "js/0e6882304e9adbd5.script.js?foo=bar",
    ],
    [
      "/app/js/javascript.js?foo=bar#hash",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).toBeDefined();

        return "js/[hash].script.[ext][query]";
      },
      "test content",
      "js/0e6882304e9adbd5.script.js?foo=bar",
    ],
    [
      "/app/js/javascript.js?a",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).toBeDefined();

        return "js/[hash].script.[ext][query]";
      },
      "test content",
      "js/0e6882304e9adbd5.script.js?a",
    ],
    [
      "/app/js/javascript.js",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).not.toBeDefined();

        return "js/[hash].script.[ext][query]";
      },
      "test content",
      "js/0e6882304e9adbd5.script.js",
    ],
    [
      "/app/js/javascript.js?",
      (resourcePath, resourceQuery) => {
        expect(resourcePath).toBeDefined();
        expect(resourceQuery).not.toBeDefined();

        return "js/[hash].script.[ext][query]";
      },
      "test content",
      "js/0e6882304e9adbd5.script.js",
    ],
  ].forEach((test) => {
    it("should interpolate " + test[0] + " " + test[1], () => {
      let resourcePath = "";
      let resourceQuery = "";

      const queryIdx = test[0].indexOf("?");

      if (queryIdx >= 0) {
        resourcePath = test[0].substr(0, queryIdx);
        resourceQuery = test[0].substr(queryIdx);
      } else {
        resourcePath = test[0];
      }

      const interpolatedName = loaderUtils.interpolateName(
        { resourcePath, resourceQuery },
        test[1],
        { content: test[2] }
      );

      expect(interpolatedName).toBe(test[3]);
    });
  });

  [
    "sha1fakename",
    "9dxfakename",
    "RSA-SHA256-fakename",
    "ecdsa-with-SHA1-fakename",
    "tls1.1-sha512-fakename",
  ].forEach((hashName) => {
    it("should pick hash algorithm by name " + hashName, () => {
      expect(() => {
        const interpolatedName = loaderUtils.interpolateName(
          {},
          "[" + hashName + ":hash:base64:10]",
          { content: "a" }
        );
        // if for any reason the system we're running on has a hash
        // algorithm matching any of our bogus names, at least make sure
        // the output is not the unmodified name:
        expect(interpolatedName[0]).not.toBe("[");
      }).toThrow(/digest method not supported/i);
    });
  });

  run([
    [
      [{}, "", { content: "test string" }],
      "e9e2c351e3c6b198.bin",
      "should interpolate default tokens",
    ],
    [
      [{}, "[hash:base64]", { content: "test string" }],
      "6eLDUePGsZg=",
      "should interpolate [hash] token with options",
    ],
    [
      [{}, "[unrecognized]", { content: "test string" }],
      "[unrecognized]",
      "should not interpolate unrecognized token",
    ],
  ]);

  it("should work without options", () => {
    const args = [{}, "foo/bar/[hash]"];
    const result = loaderUtils.interpolateName.apply(loaderUtils, args);

    expect(result).toBe("foo/bar/[hash]");
  });

  describe("no loader context", () => {
    const loaderContext = {};
    run([
      [[loaderContext, "[ext]", {}], "bin", "should interpolate [ext] token"],
      [
        [loaderContext, "[name]", {}],
        "file",
        "should interpolate [name] token",
      ],
      [[loaderContext, "[path]", {}], "", "should interpolate [path] token"],
      [
        [loaderContext, "[folder]", {}],
        "",
        "should interpolate [folder] token",
      ],
    ]);
  });

  describe("with loader context", () => {
    const loaderContext = { resourcePath: "/path/to/file.exe" };
    run([
      [[loaderContext, "[ext]", {}], "exe", "should interpolate [ext] token"],
      [
        [loaderContext, "[name]", {}],
        "file",
        "should interpolate [name] token",
      ],
      [
        [loaderContext, "[path]", {}],
        "/path/to/",
        "should interpolate [path] token",
      ],
      [
        [loaderContext, "[folder]", {}],
        "to",
        "should interpolate [folder] token",
      ],
    ]);
  });

  run([
    [
      [
        {
          resourcePath: "/xyz",
          options: {
            customInterpolateName(str, name, options) {
              return str + "-" + name + "-" + options.special;
            },
          },
        },
        "[name]",
        {
          special: "special",
        },
      ],
      "xyz-[name]-special",
      "should provide a custom interpolateName function in options",
    ],
    [
      [
        {
          resourcePath: "/foo/xyz.png",
        },
        "[1]-[name].[ext]",
        {
          regExp: /\/([a-z0-9]+)\/[a-z0-9]+\.png$/,
        },
      ],
      "foo-xyz.png",
      "should support regExp in options",
    ],
  ]);
});

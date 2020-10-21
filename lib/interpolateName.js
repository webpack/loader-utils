"use strict";

const path = require("path");
const getHashDigest = require("./getHashDigest");

function replacer(value, allowEmpty) {
  const fn = (match, arg, input) => {
    if (typeof value === "function") {
      value = value();
    }
    if (value === null || value === undefined) {
      if (!allowEmpty) {
        throw new Error(
          `Path variable ${match} not implemented in this context: ${input}`
        );
      }

      return "";
    } else {
      return `${value}`;
    }
  };

  return fn;
}

function interpolateName(loaderContext, futureFilename, options) {
  let filename;

  const hasQuery =
    loaderContext.resourceQuery && loaderContext.resourceQuery.length > 1;

  if (typeof futureFilename === "function") {
    filename = futureFilename(
      loaderContext.resourcePath,
      hasQuery ? loaderContext.resourceQuery : undefined
    );
  } else {
    filename = futureFilename || "[contenthash][ext]";
  }

  let ext = "";
  let basename = "file";
  let directory = "";
  let folder = "";
  let query = "";

  if (loaderContext.resourcePath) {
    const parsed = path.parse(loaderContext.resourcePath);
    let resourcePath = loaderContext.resourcePath;

    if (parsed.ext) {
      ext = parsed.ext;
    }

    if (parsed.dir) {
      basename = parsed.name;
      resourcePath = parsed.dir + path.sep;
    }

    if (typeof options.context !== "undefined") {
      directory = path
        .relative(options.context, resourcePath + "_")
        .replace(/\\/g, "/")
        .replace(/\.\.(\/)?/g, "_$1");
      directory = directory.substr(0, directory.length - 1);
    } else {
      directory = resourcePath.replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
    }

    if (directory.length === 1) {
      directory = "";
    } else if (directory.length > 1) {
      folder = path.basename(directory);
    }
  }

  if (loaderContext.resourceQuery && loaderContext.resourceQuery.length > 1) {
    query = loaderContext.resourceQuery;

    const hashIdx = query.indexOf("#");

    if (hashIdx >= 0) {
      query = query.substr(0, hashIdx);
    }
  }

  let url = filename;

  if (options.content) {
    // Match hash template
    url = url
      // `hash` and `contenthash` are same in `loader-utils` context
      // let's keep `hash` for backward compatibility
      .replace(
        /\[(?:([^:\]]+):)?(?:contenthash)(?::([a-z]+\d*))?(?::(\d+))?]/gi,
        (all, foundHashFunction, foundHashDigest, foundHashDigestLength) => {
          const hashFunction = foundHashFunction || options.hashFunction;
          const hashDigest = foundHashDigest || options.hashDigest;
          const hashDigestLength =
            parseInt(foundHashDigestLength, 10) ||
            options.hashDigestLength ||
            20;
          const hashSalt = options.hashSalt;

          return getHashDigest(
            options.content,
            hashFunction,
            hashDigest,
            hashDigestLength,
            hashSalt
          );
        }
      );
  }

  url = url
    .replace(/\[folder]/gi, () => folder)
    .replace(/\[query]/gi, () => query)
    // TODO Fragment
    .replace(/\[path]/gi, () => directory)
    // TODO Base
    .replace(/\[name]/gi, () => basename)
    .replace(/\[ext]/gi, replacer(ext, true));

  if (options.regExp && loaderContext.resourcePath) {
    const match = loaderContext.resourcePath.match(new RegExp(options.regExp));

    match &&
      match.forEach((matched, i) => {
        url = url.replace(new RegExp("\\[" + i + "\\]", "ig"), matched);
      });
  }

  if (
    typeof loaderContext.options === "object" &&
    typeof loaderContext.options.customInterpolateName === "function"
  ) {
    url = loaderContext.options.customInterpolateName.call(
      loaderContext,
      url,
      futureFilename,
      options
    );
  }

  return url;
}

module.exports = interpolateName;

import type { LoaderContext } from "webpack";
import path from "path";
import getHashDigest from "./getHashDigest";

/**
 * @public
 */
export interface IInterpolateNameOptions {
  content?: Buffer;
  context?: string;
  regExp?: string;
}

/**
 * Interpolates a filename template using multiple placeholders and/or regular expressions.
 * The template and regular expression are set as query params called `name` and `regExp` on the current loader's context.
 *
 * @param loaderContext - The loader context from webpack which is provided via `this` inside of a loader.
 * @param name - The name of the string to transform/interpolate on. This can be a string or a function (providing the loader contexts resourcePath and resourceQuery) that returns a string.
 * @param options - An object containing the following properties: `context`, `content`, `regExp`.
 * @public
 */
export default function interpolateName(
  loaderContext: LoaderContext<object>,
  name: string | ((resourcePath: string, resourceQuery?: string) => string),
  options: IInterpolateNameOptions = {}
) {
  let filename;

  const hasQuery: boolean = (loaderContext.resourceQuery &&
    loaderContext.resourceQuery.length > 1) as boolean;

  if (typeof name === "function") {
    filename = name(
      loaderContext.resourcePath,
      hasQuery ? loaderContext.resourceQuery : undefined
    );
  } else {
    filename = name || "[hash].[ext]";
  }

  const context = options.context;
  const content = options.content;
  const regExp = options.regExp;

  let ext = "bin";
  let basename = "file";
  let directory = "";
  let folder = "";
  let query = "";

  if (loaderContext.resourcePath) {
    const parsed = path.parse(loaderContext.resourcePath);
    let resourcePath = loaderContext.resourcePath;

    if (parsed.ext) {
      ext = parsed.ext.substr(1);
    }

    if (parsed.dir) {
      basename = parsed.name;
      resourcePath = parsed.dir + path.sep;
    }

    if (typeof context !== "undefined") {
      directory = path
        .relative(context, resourcePath + "_")
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

  if (content) {
    // Match hash template
    url = url
      // `hash` and `contenthash` are same in `loader-utils` context
      // let's keep `hash` for backward compatibility
      .replace(
        /\[(?:([^[:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi,
        (all, hashType, digestType, maxLength) =>
          getHashDigest(content, hashType, digestType, parseInt(maxLength, 10))
      );
  }

  url = url
    .replace(/\[ext\]/gi, () => ext)
    .replace(/\[name\]/gi, () => basename)
    .replace(/\[path\]/gi, () => directory)
    .replace(/\[folder\]/gi, () => folder)
    .replace(/\[query\]/gi, () => query);

  if (regExp && loaderContext.resourcePath) {
    const match = loaderContext.resourcePath.match(new RegExp(regExp));

    match &&
      match.forEach((matched, i) => {
        url = url.replace(new RegExp("\\[" + i + "\\]", "ig"), matched);
      });
  }

  interface ILoaderContextOptions {
    customInterpolateName(
      this: LoaderContext<object>,
      url: string,
      name: string | ((resourcePath: string, resourceQuery?: string) => string),
      options?: IInterpolateNameOptions
    ): string;
  }
  type LegacyLoaderContext = LoaderContext<object> & {
    options?: ILoaderContextOptions;
  };
  const loaderContextOptions: ILoaderContextOptions | undefined = (
    loaderContext as LegacyLoaderContext
  ).options;
  if (
    typeof loaderContextOptions === "object" &&
    typeof loaderContextOptions.customInterpolateName === "function"
  ) {
    url = loaderContextOptions.customInterpolateName.call(
      loaderContext,
      url,
      name,
      options
    );
  }

  return url;
}

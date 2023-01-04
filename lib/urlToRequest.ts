// we can't use path.win32.isAbsolute because it also matches paths starting with a forward slash
const NATIVE_WIN_32_PATH_REGEXP = /^[A-Z]:[/\\]|^\\\\/i;
const MODULE_REQUEST_REGEXP = /^[^?]*~/;
const ROOT_RELATIVE_URL_REGEXP = /^\//;
const TILDE_ROOTS_MODULE_REQUEST_REGEXP = /([^~/])$/;

/**
 * Converts some resource URL into a webpack module request
 *
 * @example
 * A simple example:
 * ```js
 * const url = "path/to/module.js"
 * const request = loaderUtils.urlToRequest(url);
 * // request === "./path/to/module.js"
 * ```
 *
 * @remarks
 * ### Module URLs
 *
 * @example
 * Any URL containing a `~` will be interpreted as a module request. Anything after the `~` will be considered the request path:
 * ```js
 * const url = "~/path/to/module.js"
 * const request = loaderUtils.urlToRequest(url);
 * // request === "path/to/module.js"
 * ```
 *
 * @remarks
 * ### Root-relative URLs
 *
 * @example
 * URLs that are root-relative (start with `/`) can be resolved relative to some arbitrary path by using the root parameter:
 * ```js
 * const url = "/path/to/module.js"
 * const request = loaderUtils.urlToRequest(url, "./root");
 * // request === "./root/path/to/module.js"
 * ```
 *
 * @example
 * To convert a root-relative URL into a module URL, specify a root value that starts with `~`:
 * ```js
 * const url = "/path/to/module.js"
 * const request = loaderUtils.urlToRequest(url, "~");
 * // request === "path/to/module.js"
 * ```
 *
 * @public
 */
export default function urlToRequest(
  url: string,
  root?: string | boolean
): string {
  // Do not rewrite an empty url
  if (url === "") {
    return "";
  }

  let request: string;

  if (NATIVE_WIN_32_PATH_REGEXP.test(url)) {
    // absolute windows path, keep it
    request = url;
  } else if (
    root !== undefined &&
    root !== false &&
    ROOT_RELATIVE_URL_REGEXP.test(url)
  ) {
    // if root is set and the url is root-relative
    switch (typeof root) {
      // 1. root is a string: root is prefixed to the url
      case "string":
        // special case: `~` roots convert to module request
        if (MODULE_REQUEST_REGEXP.test(root)) {
          request =
            root.replace(TILDE_ROOTS_MODULE_REQUEST_REGEXP, "$1/") +
            url.slice(1);
        } else {
          request = root + url;
        }
        break;
      // 2. root is `true`: absolute paths are allowed
      //    *nix only, windows-style absolute paths are always allowed as they doesn't start with a `/`
      case "boolean":
        request = url;
        break;
      default:
        throw new Error(
          "Unexpected parameters to loader-utils 'urlToRequest': url = " +
            url +
            ", root = " +
            root +
            "."
        );
    }
  } else if (/^\.\.?\//.test(url)) {
    // A relative url stays
    request = url;
  } else {
    // every other url is threaded like a relative url
    request = "./" + url;
  }

  // A `~` makes the url an module
  if (MODULE_REQUEST_REGEXP.test(request)) {
    request = request.replace(MODULE_REQUEST_REGEXP, "");
  }

  return request;
}

import path from "path";

const DATA_URI_REGEXP = /^data:/i;
const ABOSLUTE_URL_NON_WINDOWS_PATHLIKE_REGEXP = /^[a-z][a-z0-9+.-]*:/i;
const POROTCOL_RELATIVE_REGEXP = /^\/\//i;
const URL_FOR_TEMPLATE_REGEXP = /^#/i;

/**
 * Utility method for ensuring if a string is a requestable URL
 * @remarks
 * You typically want to call `isUrlRequest()` before using the `urlToRequest()` function
 * @example
 * ```js
 * const url = "path/to/module.js"
 * if (loaderUtils.isUrlRequest(url)) {
 * // Logic for requestable url
 * const request = loaderUtils.urlToRequest(url);
 * } else {
 * // Logic for non-requestable url
 * }
 * ```
 *
 * @param url - The url to check
 * @public
 */
export default function isUrlRequest(url: string): boolean {
  // An URL is not an request if

  // 1. Allow `data URI`
  if (DATA_URI_REGEXP.test(url)) {
    return true;
  }

  // 2. It's an absolute url and it is not `windows` path like `C:\dir\file`
  if (
    ABOSLUTE_URL_NON_WINDOWS_PATHLIKE_REGEXP.test(url) &&
    !path.win32.isAbsolute(url)
  ) {
    return false;
  }

  // 3. It's a protocol-relative
  if (POROTCOL_RELATIVE_REGEXP.test(url)) {
    return false;
  }

  // 4. It's some kind of url for a template
  if (URL_FOR_TEMPLATE_REGEXP.test(url)) {
    return false;
  }

  return true;
}

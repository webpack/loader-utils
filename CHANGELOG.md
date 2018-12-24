# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.2.0"></a>
# [1.2.0](https://github.com/webpack/loader-utils/compare/v1.1.0...v1.2.0) (2018-12-24)


### Features

* **interpolateName:** support `[contenthash]`

### Fixes

* **urlToRequest:** empty urls are not rewritten to relative requests
* **urlToRequest:** don't rewrite absolute urls
* **isUrlRequest:** ignore all url with `extension` (like `moz-extension:`, `ms-browser-extension:` and etc)
* **isUrlRequest:** ignore `about:blank`
* **interpolateName:** failing explicitly when ran out of emoji
* **interpolateName:** `[hash]` token regex in interpolate string to capture any hash algorithm name
* **interpolateName:** parse string for emoji count before use



<a name="1.1.0"></a>
# [1.1.0](https://github.com/webpack/loader-utils/compare/v1.0.4...v1.1.0) (2017-03-16)


### Features

* **automatic-release:** Generation of automatic release ([7484d13](https://github.com/webpack/loader-utils/commit/7484d13))
* **parseQuery:** export parseQuery ([ddf64e4](https://github.com/webpack/loader-utils/commit/ddf64e4))

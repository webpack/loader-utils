# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.3.1](https://github.com/webpack/loader-utils/compare/v3.3.0...v3.3.1) (2024-06-05)


### Bug Fixes

* base64safe regex ([3b2d3b1](https://github.com/webpack/loader-utils/commit/3b2d3b1379b644aeefbbe859c0baeadd0b732710))

## [3.3.0](https://github.com/webpack/loader-utils/compare/v3.2.2...v3.3.0) (2024-06-04)


### Features

* add digestType 'base64safe' ([#259](https://github.com/webpack/loader-utils/issues/259)) ([af15793](https://github.com/webpack/loader-utils/commit/af157934abb1ee172cffd015acbabb065f0e1dbf))

### [3.2.2](https://github.com/webpack/loader-utils/compare/v3.2.1...v3.2.2) (2024-05-29)


### Bug Fixes

* unreachable code for directories ([128f945](https://github.com/webpack/loader-utils/commit/128f945e8f66d0ad7d69cdf568a8aa8bce40633a))

### [3.2.1](https://github.com/webpack/loader-utils/compare/v3.2.0...v3.2.1) (2022-11-11)


### Bug Fixes

* ReDoS problem ([#224](https://github.com/webpack/loader-utils/issues/224)) ([d2d752d](https://github.com/webpack/loader-utils/commit/d2d752d59629daee38f34b24307221349c490eb1))

## [3.2.0](https://github.com/webpack/loader-utils/compare/v3.1.3...v3.2.0) (2021-11-11)


### Features

* hash uniformity for base digests ([451858b](https://github.com/webpack/loader-utils/commit/451858b0bb33911d52d2f03a6470fd2b86493b84))

### [3.1.3](https://github.com/webpack/loader-utils/compare/v3.1.2...v3.1.3) (2021-11-04)


### Bug Fixes

* crash with md4 hash ([#198](https://github.com/webpack/loader-utils/issues/198)) ([ef084d4](https://github.com/webpack/loader-utils/commit/ef084d43ba29ebf3c3c0ea0939a5c58adad0bba2))

### [3.1.2](https://github.com/webpack/loader-utils/compare/v3.1.1...v3.1.2) (2021-11-04)


### Bug Fixes

* bug with unicode characters ([#196](https://github.com/webpack/loader-utils/issues/196)) ([0426405](https://github.com/webpack/loader-utils/commit/04264056f951514955af7302510631f942276eec))

### [3.1.1](https://github.com/webpack/loader-utils/compare/v3.1.0...v3.1.1) (2021-11-04)


### Bug Fixes

* base64 and unicode characters ([02b1f3f](https://github.com/webpack/loader-utils/commit/02b1f3fe6d718870b5ee7abc64519a1b2b5b8531))

## [3.1.0](https://github.com/webpack/loader-utils/compare/v3.0.0...v3.1.0) (2021-10-29)


### Features

* added `md4` (wasm version) and `md4-native` (`crypto` module version) algorithms ([cbf9d1d](https://github.com/webpack/loader-utils/commit/cbf9d1dac866be50971d294c3baacda45527fb8e))

## [3.0.0](https://github.com/webpack/loader-utils/compare/v2.0.0...v3.0.0) (2021-10-20)


### ⚠ BREAKING CHANGES

* minimum supported Node.js version is `12.13.0` ([93a87ce](https://github.com/webpack/loader-utils/commit/93a87cefd41cc69de0bc1f9099f7d753ed8cd557))
* use `xxhash64` by default for `[hash]`/`[contenthash]` and `getHashDigest` API
* `[emoji]` was removed without replacements, please use custom function if you need this
* removed `getOptions` in favor `loaderContext.getOptions` (`loaderContext` is `this` inside loader function), note - special query parameters like `?something=true` is not supported anymore, if you need this please do it on `loader` side, but we strongly recommend avoid it, as alternative you can use `?something=1` and handle `1` as `true`
* removed `getRemainingRequest` in favor `loaderContext.remainingRequest` (`loaderContext` is `this` inside loader function)
* removed `getCurrentRequest` in favor `loaderContext.currentRequest` (`loaderContext` is `this` inside loader function)
* removed `parseString` in favor `JSON.parse`
* removed `parseQuery` in favor `new URLSearchParams(loaderContext.resourceQuery.slice(1))` where `loaderContext` is `this` in loader function
* removed `stringifyRequest` in favor `JSON.stringify(loaderContext.utils.contextify(loaderContext.context || loaderContext.rootContext, request))` (`loaderContext` is `this` inside loader function), also it will be cachable and faster
* `isUrlRequest` ignores only absolute URLs and `#hash` requests, `data URI` and root relative request are handled as requestable due webpack v5 support them

### Bug Fixes

* allowed the `interpolateName` API works without options ([862ea7d](https://github.com/webpack/loader-utils/commit/862ea7d1d0226558f2750bec36da02492d1e516d))

## [2.0.0](https://github.com/webpack/loader-utils/compare/v1.4.0...v2.0.0) (2020-03-17)


### ⚠ BREAKING CHANGES

* minimum required `Node.js` version is `8.9.0` ([#166](https://github.com/webpack/loader-utils/issues/166)) ([c937e8c](https://github.com/webpack/loader-utils/commit/c937e8c77231b42018be616b784a6b45eac86f8a))
* the `getOptions` method returns empty object on empty query ([#167](https://github.com/webpack/loader-utils/issues/167)) ([b595cfb](https://github.com/webpack/loader-utils/commit/b595cfba022d3f04f3d310dd570b0253e461605b))
* Use `md4` by default

<a name="1.4.0"></a>
# [1.4.0](https://github.com/webpack/loader-utils/compare/v1.3.0...v1.4.0) (2020-02-19)


### Features

* the `resourceQuery` is passed to the `interpolateName` method ([#163](https://github.com/webpack/loader-utils/issues/163)) ([cd0e428](https://github.com/webpack/loader-utils/commit/cd0e428))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/webpack/loader-utils/compare/v1.2.3...v1.3.0) (2020-02-19)


### Features

* support the `[query]` template for the `interpolatedName` method ([#162](https://github.com/webpack/loader-utils/issues/162)) ([469eeba](https://github.com/webpack/loader-utils/commit/469eeba))



<a name="1.2.3"></a>
## [1.2.3](https://github.com/webpack/loader-utils/compare/v1.2.2...v1.2.3) (2018-12-27)


### Bug Fixes

* **interpolateName:** don't interpolated `hashType` without `hash` or `contenthash`  ([#140](https://github.com/webpack/loader-utils/issues/140)) ([3528fd9](https://github.com/webpack/loader-utils/commit/3528fd9))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/webpack/loader-utils/compare/v1.2.1...v1.2.2) (2018-12-27)


### Bug Fixes

* fixed a hash type extracting in interpolateName ([#137](https://github.com/webpack/loader-utils/issues/137)) ([f8a71f4](https://github.com/webpack/loader-utils/commit/f8a71f4))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/webpack/loader-utils/compare/v1.2.0...v1.2.1) (2018-12-25)


### Bug Fixes

* **isUrlRequest:** better handle absolute urls and non standards ([#134](https://github.com/webpack/loader-utils/issues/134)) ([aca43da](https://github.com/webpack/loader-utils/commit/aca43da))


### Reverts

* PR [#79](https://github.com/webpack/loader-utils/issues/79) ([#135](https://github.com/webpack/loader-utils/issues/135)) ([73d350a](https://github.com/webpack/loader-utils/commit/73d350a))



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

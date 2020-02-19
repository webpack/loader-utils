'use strict';

const path = require('path');
const loaderUtils = require('../');

const s = JSON.stringify;

describe('stringifyRequest()', () => {
  // We know that query strings that contain paths and question marks can be problematic.
  // We must ensure that stringifyRequest is not messing with them
  const paramQueryString =
    '?questionMark?posix=path/to/thing&win=path\\to\\thing';
  const jsonQueryString =
    '?' +
    s({
      questionMark: '?',
      posix: 'path/to/thing',
      win: 'path\\to\\file',
    });
  [
    { test: 1, request: './a.js', expected: s('./a.js') },
    { test: 2, request: '.\\a.js', expected: s('./a.js') },
    { test: 3, request: './a/b.js', expected: s('./a/b.js') },
    { test: 4, request: '.\\a\\b.js', expected: s('./a/b.js') },
    { test: 5, request: 'module', expected: s('module') }, // without ./ is a request into the modules directory
    { test: 6, request: 'module/a.js', expected: s('module/a.js') },
    { test: 7, request: 'module\\a.js', expected: s('module/a.js') },
    {
      test: 8,
      request: './a.js' + paramQueryString,
      expected: s('./a.js' + paramQueryString),
    },
    {
      test: 9,
      request: './a.js' + jsonQueryString,
      expected: s('./a.js' + jsonQueryString),
    },
    {
      test: 10,
      request: 'module' + paramQueryString,
      expected: s('module' + paramQueryString),
    },
    {
      test: 11,
      request: 'module' + jsonQueryString,
      expected: s('module' + jsonQueryString),
    },
    {
      test: 12,
      os: 'posix',
      context: '/path/to',
      request: '/path/to/module/a.js',
      expected: s('./module/a.js'),
    },
    {
      test: 13,
      os: 'win32',
      context: 'C:\\path\\to\\',
      request: 'C:\\path\\to\\module\\a.js',
      expected: s('./module/a.js'),
    },
    {
      test: 14,
      os: 'posix',
      context: '/path/to/thing',
      request: '/path/to/module/a.js',
      expected: s('../module/a.js'),
    },
    {
      test: 15,
      os: 'win32',
      context: 'C:\\path\\to\\thing',
      request: 'C:\\path\\to\\module\\a.js',
      expected: s('../module/a.js'),
    },
    {
      test: 16,
      os: 'win32',
      context: '\\\\A\\path\\to\\thing',
      request: '\\\\A\\path\\to\\module\\a.js',
      expected: s('../module/a.js'),
    },
    // If context and request are on different drives, the path should not be relative
    // @see https://github.com/webpack/loader-utils/pull/14
    {
      test: 17,
      os: 'win32',
      context: 'D:\\path\\to\\thing',
      request: 'C:\\path\\to\\module\\a.js',
      expected: s('C:\\path\\to\\module\\a.js'),
    },
    {
      test: 18,
      os: 'win32',
      context: '\\\\A\\path\\to\\thing',
      request: '\\\\B\\path\\to\\module\\a.js',
      expected: s('\\\\B\\path\\to\\module\\a.js'),
    },
    {
      test: 19,
      os: 'posix',
      context: '/path/to',
      request: '/path/to/module/a.js' + paramQueryString,
      expected: s('./module/a.js' + paramQueryString),
    },
    {
      test: 20,
      os: 'win32',
      context: 'C:\\path\\to\\',
      request: 'C:\\path\\to\\module\\a.js' + paramQueryString,
      expected: s('./module/a.js' + paramQueryString),
    },
    {
      test: 21,
      request: ['./a.js', './b.js', './c.js'].join('!'),
      expected: s(['./a.js', './b.js', './c.js'].join('!')),
    },
    {
      test: 22,
      request: ['a/b.js', 'c/d.js', 'e/f.js', 'g'].join('!'),
      expected: s(['a/b.js', 'c/d.js', 'e/f.js', 'g'].join('!')),
    },
    {
      test: 23,
      request: [
        'a/b.js' + paramQueryString,
        'c/d.js' + jsonQueryString,
        'e/f.js',
      ].join('!'),
      expected: s(
        [
          'a/b.js' + paramQueryString,
          'c/d.js' + jsonQueryString,
          'e/f.js',
        ].join('!')
      ),
    },
    {
      test: 24,
      os: 'posix',
      context: '/path/to',
      request: [
        '/a/b.js' + paramQueryString,
        'c/d.js' + jsonQueryString,
        '/path/to/e/f.js',
      ].join('!'),
      expected: s(
        [
          '../../a/b.js' + paramQueryString,
          'c/d.js' + jsonQueryString,
          './e/f.js',
        ].join('!')
      ),
    },
    {
      test: 25,
      os: 'win32',
      context: 'C:\\path\\to\\',
      request: [
        'C:\\a\\b.js' + paramQueryString,
        'c\\d.js' + jsonQueryString,
        'C:\\path\\to\\e\\f.js',
      ].join('!'),
      expected: s(
        [
          '../../a/b.js' + paramQueryString,
          'c/d.js' + jsonQueryString,
          './e/f.js',
        ].join('!')
      ),
    },
  ].forEach((testCase) => {
    it(`${testCase.test}. should stringify request ${testCase.request} to ${testCase.expected} inside context ${testCase.context}`, () => {
      const relative = path.relative;

      if (testCase.os) {
        // monkey patch path.relative in order to make this test work in every OS
        path.relative = path[testCase.os].relative;
      }

      const actual = loaderUtils.stringifyRequest(
        { context: testCase.context },
        testCase.request
      );

      expect(actual).toBe(testCase.expected);

      path.relative = relative;
    });
  });
});

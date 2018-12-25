'use strict';

const loaderUtils = require('../');

function ExpectedError(regex) {
  this.regex = regex;
}
ExpectedError.prototype.matches = function(err) {
  return this.regex.test(err.message);
};

describe('isUrlRequest()', () => {
  [
    // without root
    [['//google.com'], false, 'should be negative for scheme-agnostic urls'],
    [['http://google.com'], false, 'should be negative for http urls'],
    [['HTTP://google.com'], false, 'should be negative for http urls'],
    [['https://google.com'], false, 'should be negative for https urls'],
    [['HTTPS://google.com'], false, 'should be negative for https urls'],

    [['chrome-extension://'], false, 'should be negative for nonstandard urls'],
    [['moz-extension://'], false, 'should be negative for nonstandard urls'],
    [
      ['ms-browser-extension://'],
      false,
      'should be negative for nonstandard urls',
    ],
    [['custom-extension://'], false, 'should be negative for nonstandard urls'],

    [['path/to/thing'], true, 'should be positive for implicit relative urls'],
    [['./img.png'], true, 'should be positive for implicit relative urls'],
    [['../img.png'], true, 'should be positive for implicit relative urls'],
    [
      ['./img.png?foo=bar#hash'],
      true,
      'should be positive for implicit relative urls',
    ],
    [
      ['./path/to/thing'],
      true,
      'should be positive for explicit relative urls',
    ],
    [['~path/to/thing'], true, 'should be positive for module urls (with ~)'],
    [
      ['some/other/stuff/and/then~path/to/thing'],
      true,
      'should be positive for module urls with path prefix',
    ],
    [
      ['./some/other/stuff/and/then~path/to/thing'],
      true,
      'should be positive for module urls with relative path prefix',
    ],
    [['C:/thing'], true, 'should be positive for linux path with driver'],
    [['C:\\thing'], true, 'should be positive for windows path with driver'],
    [
      ['directory/things'],
      true,
      'should be positive for relative path (linux)',
    ],
    [
      ['directory\\things'],
      true,
      'should be positive for relative path (windows)',
    ],

    // with root (normal path)
    [
      ['path/to/thing', 'root/dir'],
      true,
      'should be positive with root if implicit relative url',
    ],
    [
      ['./path/to/thing', 'root/dir'],
      true,
      'should be positive with root if explicit relative url',
    ],
    [
      ['/path/to/thing', 'root/dir'],
      true,
      'should be positive with root if root-relative url',
    ],

    // with root (boolean)
    [
      ['/path/to/thing', true],
      true,
      'should be positive for root-relative if root = `true`',
    ],

    // with root (boolean) on Windows
    [
      ['C:\\path\\to\\thing'],
      true,
      'should be positive for Windows absolute paths with drive letter',
    ],
    [
      ['\\\\?\\UNC\\ComputerName\\path\\to\\thing'],
      true,
      'should be positive for Windows absolute UNC paths',
    ],

    // with root (module)
    [
      ['/path/to/thing', '~'],
      true,
      'should be positive for module url if root = ~',
    ],

    // with root (module path)
    [
      ['/path/to/thing', '~module'],
      true,
      'should be positive for module prefixes when root starts with ~',
    ],
    [
      ['/path/to/thing', '~module/'],
      true,
      'should be positive for module prefixes (with trailing slash) when root starts with ~',
    ],

    // error cases
    [
      ['/path/to/thing', 1],
      new ExpectedError(/unexpected parameters/i),
      'should throw an error on invalid root',
    ],

    // empty url
    [[''], true, 'should be positive if url is empty'],

    // about url
    [['about:blank'], false, 'should be negative for about:blank'],

    // hash
    [['#gradient'], false, 'should be negative for hash url'],

    // url
    [['//sindresorhus.com'], false, 'should ignore noscheme url'],
    [
      ['//at.alicdn.com/t/font_515771_emcns5054x3whfr.eot'],
      false,
      'should ignore noscheme url with path',
    ],
    [
      ['https://example.com/././foo'],
      false,
      'should ignore absolute url with relative',
    ],

    // non standard protocols
    [
      ['file://sindresorhus.com'],
      false,
      'should ignore non standard protocols (file)',
    ],
    [
      ['mailto:someone@example.com'],
      false,
      'should ignore non standard protocols (mailto)',
    ],
    [
      ['data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'],
      false,
      'should ignore non standard protocols (data)',
    ],
    [
      ['DATA:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'],
      false,
      'should ignore non standard protocols (data)',
    ],

    // root-relative url
    [['/'], false, 'ignore root-relative url'],
    [['//'], false, 'ignore root-relative url 1'],
  ].forEach((test) => {
    it(test[2], () => {
      const expected = test[1];

      try {
        const request = loaderUtils.isUrlRequest.apply(loaderUtils, test[0]);

        expect(request).toBe(expected);
      } catch (e) {
        if (expected instanceof ExpectedError) {
          expect(expected.matches(e)).toBe(true);
        } else {
          throw new Error('should not have thrown an error: ' + e.message);
        }
      }
    });
  });
});

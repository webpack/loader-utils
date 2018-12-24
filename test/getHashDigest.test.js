'use strict';

const assert = require('assert');
const loaderUtils = require('../');

describe('getHashDigest()', () => {
  [
    [
      'test string',
      'md5',
      'hex',
      undefined,
      '6f8db599de986fab7a21625b7916589c',
    ],
    ['test string', 'md5', 'hex', 4, '6f8d'],
    ['test string', 'md5', 'base64', undefined, '2sm1pVmS8xuGJLCdWpJoRL'],
    ['test string', 'md5', 'base52', undefined, 'dJnldHSAutqUacjgfBQGLQx'],
    ['test string', 'md5', 'base26', 6, 'bhtsgu'],
    [
      'test string',
      'sha512',
      'base64',
      undefined,
      '2IS-kbfIPnVflXb9CzgoNESGCkvkb0urMmucPD9z8q6HuYz8RShY1-tzSUpm5-Ivx_u4H1MEzPgAhyhaZ7RKog',
    ],
    [
      'test string',
      'md5',
      'hex',
      undefined,
      '6f8db599de986fab7a21625b7916589c',
    ],
  ].forEach((test) => {
    it(
      'should getHashDigest ' +
        test[0] +
        ' ' +
        test[1] +
        ' ' +
        test[2] +
        ' ' +
        test[3],
      () => {
        const hashDigest = loaderUtils.getHashDigest(
          test[0],
          test[1],
          test[2],
          test[3]
        );
        assert.equal(hashDigest, test[4]);
      }
    );
  });
});

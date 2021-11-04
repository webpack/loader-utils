'use strict';

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
    ['test string', 'md5', 'base64', undefined, 'b421md6Yb6t6IWJbeRZYnA=='],
    ['test string', 'md5', 'base52', undefined, 'dJnldHSAutqUacjgfBQGLQx'],
    ['test string', 'md5', 'base26', 6, 'bhtsgu'],
    [
      'test string',
      'sha512',
      'base64',
      undefined,
      'EObWR69EYkRC84jCwUp4f/ixfmFluD12fsBHdo2MvLcaGjIm58x4Frx5wEJ9lKnaaIxBo5kse/Xk18w+C+XbrA==',
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

        expect(hashDigest).toBe(test[4]);
      }
    );
  });
});

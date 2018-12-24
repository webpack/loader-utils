'use strict';

const loaderUtils = require('../');

describe('getRemainingRequest()', () => {
  it('when currentRequest is present', () => {
    expect(
      loaderUtils.getRemainingRequest({
        remainingRequest:
          '/foo/bar/my-loader/index.js??ref--4-0!/foo/bar/url/url.css',
      })
    ).toBe('/foo/bar/my-loader/index.js??ref--4-0!/foo/bar/url/url.css');
  });

  it('when currentRequest is present', () => {
    expect(
      loaderUtils.getRemainingRequest({
        resource: 'foo.css',
        loaders: [
          {
            loaderIndex: 0,
            request: '/foo/bar/first-loader/index.js??ref--4-0',
          },
          {
            loaderIndex: 1,
            request: '/foo/bar/second-loader/index.js??ref--4-1',
          },
        ],
      })
    ).toBe(
      '/foo/bar/first-loader/index.js??ref--4-0!/foo/bar/second-loader/index.js??ref--4-1!foo.css'
    );
  });
});

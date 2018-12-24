'use strict';

const loaderUtils = require('../');

describe('getCurrentRequest()', () => {
  it('when currentRequest is present', () => {
    expect(
      loaderUtils.getCurrentRequest({
        currentRequest:
          '/foo/bar/my-loader/index.js??ref--4-0!/foo/bar/url/url.css',
      })
    ).toBe('/foo/bar/my-loader/index.js??ref--4-0!/foo/bar/url/url.css');
  });

  it('when currentRequest is present', () => {
    expect(
      loaderUtils.getCurrentRequest({
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

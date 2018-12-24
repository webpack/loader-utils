'use strict';

const loaderUtils = require('../lib');

describe('getOptions()', () => {
  describe('when loaderContext.query is a string with length > 0', () => {
    it('should call parseQuery() and return its result', () => {
      expect(
        loaderUtils.getOptions({
          query: '?something=getOptions_cannot_parse',
        })
      ).toEqual({ something: 'getOptions_cannot_parse' });
    });
  });
  describe('when loaderContext.query is an empty string', () => {
    it('should return null', () => {
      expect(
        loaderUtils.getOptions({
          query: '',
        })
      ).toEqual(null);
    });
  });
  describe('when loaderContext.query is an object', () => {
    it('should just return it', () => {
      const query = {};
      expect(
        loaderUtils.getOptions({
          query,
        })
      ).toEqual(query);
    });
  });
  describe('when loaderContext.query is an array', () => {
    it('should just return it', () => {
      const query = [];
      expect(loaderUtils.getOptions({ query })).toEqual(query);
    });
  });
  describe('when loaderContext.query is anything else', () => {
    it('should return null', () => {
      expect(
        loaderUtils.getOptions({
          query: undefined,
        })
      ).toEqual(null);
      expect(
        loaderUtils.getOptions({
          query: null,
        })
      ).toEqual(null);
      expect(
        loaderUtils.getOptions({
          query: 1,
        })
      ).toEqual(null);
      expect(
        loaderUtils.getOptions({
          query: 0,
        })
      ).toEqual(null);
    });
  });
});

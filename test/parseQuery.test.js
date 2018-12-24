'use strict';

const assert = require('assert');
const loaderUtils = require('../');

describe('parseQuery()', () => {
  describe('when passed string is a query string starting with ?', () => {
    [
      {
        it: 'should return an empty object by default',
        query: '?',
        expected: {},
      },
      {
        it: 'should parse query params',
        query: '?name=cheesecake&slices=8&delicious&warm=false',
        expected: {
          delicious: true,
          name: 'cheesecake',
          slices: '8', // numbers are still strings with query params
          warm: false,
        },
      },
      {
        it: 'should parse query params with arrays',
        query: '?ingredients[]=flour&ingredients[]=sugar',
        expected: {
          ingredients: ['flour', 'sugar'],
        },
      },
      {
        it: 'should parse query params in JSON format',
        query:
          '?' +
          JSON.stringify({
            delicious: true,
            name: 'cheesecake',
            slices: 8,
            warm: false,
          }),
        expected: {
          delicious: true,
          name: 'cheesecake',
          slices: 8,
          warm: false,
        },
      },
      {
        it: 'should use decodeURIComponent',
        query: '?%3d',
        expected: { '=': true },
      },
      {
        it:
          'should recognize params starting with + as boolean params with the value true',
        query: '?+%3d',
        expected: { '=': true },
      },
      {
        it:
          'should recognize params starting with - as boolean params with the value false',
        query: '?-%3d',
        expected: { '=': false },
      },
      {
        it: 'should not confuse regular equal signs and encoded equal signs',
        query: '?%3d=%3D',
        expected: { '=': '=' },
      },
    ].forEach((test) => {
      it(test.it, () => {
        assert.deepEqual(loaderUtils.parseQuery(test.query), test.expected);
      });
    });
  });

  describe('when passed string is any other string not starting with ?', () => {
    it('should throw an error', () => {
      assert.throws(
        () => loaderUtils.parseQuery('a'),
        /A valid query string passed to parseQuery should begin with '\?'/
      );
    });
  });
});

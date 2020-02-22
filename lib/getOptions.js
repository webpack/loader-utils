'use strict';

const parseQuery = require('./parseQuery');

function getOptions(loaderContext) {
  const query = loaderContext.query;

  if (query === '') {
    // webpack sets query to '' when no options are set
    return {};
  }

  if (typeof query === 'string') {
    return parseQuery(loaderContext.query);
  }

  if (!query || typeof query !== 'object') {
    // Not object-like queries are not supported.
    return null;
  }

  return query;
}

module.exports = getOptions;

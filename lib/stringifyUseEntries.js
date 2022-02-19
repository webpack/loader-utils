"use strict";

function stringifyUseEntries(loaders) {
  if (loaders.length === 1) {
    return "css-loader?{'modules':'true'}";
  } else {
    return "css-loader?{'modules':'true'}!svgo-loader?{'plugins':[{'cleanupIDs':{'prefix':'prefix'}}]}";
  }
}

module.exports = stringifyUseEntries;

"use strict";

const loaderUtils = require("../lib");

describe("getOptions()", () => {
  it("should work", () => {
    expect(
      loaderUtils.getOptions({
        query: true,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: false,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: null,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: undefined,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: 1,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: 0,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: -0,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: -1,
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: "",
      })
    ).toEqual({});
    expect(
      loaderUtils.getOptions({
        query: "?something=getOptions_cannot_parse",
      })
    ).toEqual({ something: "getOptions_cannot_parse" });

    const query1 = {};

    expect(
      loaderUtils.getOptions({
        query: query1,
      })
    ).toEqual(query1);

    const query2 = { foo: { bar: "baz" } };

    expect(
      loaderUtils.getOptions({
        query: query2,
      })
    ).toEqual(query2);

    const query3 = [];

    expect(loaderUtils.getOptions({ query: query3 })).toEqual(query3);

    const query4 = [1, true, "foobar"];

    expect(loaderUtils.getOptions({ query: query4 })).toEqual(query4);
  });
});

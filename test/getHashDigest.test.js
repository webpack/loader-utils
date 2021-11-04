"use strict";

const loaderUtils = require("../");

describe("getHashDigest()", () => {
  [
    ["test string", "xxhash64", "hex", undefined, "e9e2c351e3c6b198"],
    ["test string", "xxhash64", "base64", undefined, "6eLDUePGsZg="],
    ["test string", "xxhash64", "base52", undefined, "byfYGDmnmyUr"],
    ["abc\\0♥", "xxhash64", "hex", undefined, "4b9a34297dc03d20"],
    ["abc\\0💩", "xxhash64", "hex", undefined, "86733ec125b93904"],
    ["abc\\0💩", "xxhash64", "base64", undefined, "hnM+wSW5OQQ="],
    ["abc\\0♥", "xxhash64", "base64", undefined, "S5o0KX3APSA="],
    ["abc\\0💩", "xxhash64", "base52", undefined, "cfByjQcJZIU"],
    ["abc\\0♥", "xxhash64", "base52", undefined, "qdLyAQjLlod"],

    ["test string", "md4", "hex", 4, "2e06"],
    ["test string", "md4", "base64", undefined, "Lgbt1PFiMmjFpRcw2KCyrw=="],
    ["test string", "md4", "base52", undefined, "egWqIKxsDHdZTteemJqXfuo"],
    ["abc\\0♥", "md4", "hex", undefined, "46b9627fecf49b80eaf01c01d86ae9fd"],
    ["abc\\0💩", "md4", "hex", undefined, "45aa5b332f8e562aaf0106ad6fc1d78f"],
    ["abc\\0💩", "md4", "base64", undefined, "RapbMy+OViqvAQatb8HXjw=="],
    ["abc\\0♥", "md4", "base64", undefined, "Rrlif+z0m4Dq8BwB2Grp/Q=="],
    ["abc\\0💩", "md4", "base52", undefined, "dtXZENFEkYHXGxOkJbevPoD"],
    ["abc\\0♥", "md4", "base52", undefined, "fYFFcfXRGsVweukHKlPayHs"],

    ["test string", "md5", "hex", 4, "6f8d"],
    [
      "test string",
      "md5",
      "hex",
      undefined,
      "6f8db599de986fab7a21625b7916589c",
    ],
    ["test string", "md5", "base52", undefined, "dJnldHSAutqUacjgfBQGLQx"],
    ["test string", "md5", "base64", undefined, "b421md6Yb6t6IWJbeRZYnA=="],
    ["test string", "md5", "base26", 6, "bhtsgu"],
    ["abc\\0♥", "md5", "hex", undefined, "2e897b64f8050e66aff98d38f7a012c5"],
    ["abc\\0💩", "md5", "hex", undefined, "63ad5b3d675c5890e0c01ed339ba0187"],
    ["abc\\0💩", "md5", "base64", undefined, "Y61bPWdcWJDgwB7TOboBhw=="],
    ["abc\\0♥", "md5", "base64", undefined, "Lol7ZPgFDmav+Y0496ASxQ=="],
    ["abc\\0💩", "md5", "base52", undefined, "djhVWGHaUKUxqxEhcTnOfBx"],
    ["abc\\0♥", "md5", "base52", undefined, "eHeasSeRyOnorzxUJpayzJc"],

    [
      "test string",
      "sha512",
      "base64",
      undefined,
      "EObWR69EYkRC84jCwUp4f/ixfmFluD12fsBHdo2MvLcaGjIm58x4Frx5wEJ9lKnaaIxBo5kse/Xk18w+C+XbrA==",
    ],
    [
      "test string",
      "sha512",
      "hex",
      undefined,
      "10e6d647af44624442f388c2c14a787ff8b17e6165b83d767ec047768d8cbcb71a1a3226e7cc7816bc79c0427d94a9da688c41a3992c7bf5e4d7cc3e0be5dbac",
    ],
  ].forEach((test) => {
    it(
      "should getHashDigest " +
        test[0] +
        " " +
        test[1] +
        " " +
        test[2] +
        " " +
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

"use strict";

const baseEncodeTables = {
  26: "abcdefghijklmnopqrstuvwxyz",
  32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
  36: "0123456789abcdefghijklmnopqrstuvwxyz",
  49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
  52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
  62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_",
};

function encodeBufferToBase(buffer, base) {
  const encodeTable = baseEncodeTables[base];
  if (!encodeTable) {
    throw new Error("Unknown encoding base" + base);
  }

  const readLength = buffer.length;
  const Big = require("big.js");

  Big.RM = Big.DP = 0;
  let b = new Big(0);

  for (let i = readLength - 1; i >= 0; i--) {
    b = b.times(256).plus(buffer[i]);
  }

  let output = "";
  while (b.gt(0)) {
    output = encodeTable[b.mod(base)] + output;
    b = b.div(base);
  }

  Big.DP = 20;
  Big.RM = 1;

  return output;
}

function getHashDigest(
  buffer,
  hashFunction,
  hashDigest,
  hashDigestLength,
  hashSalt
) {
  hashFunction = hashFunction || "md4";
  hashDigest = hashDigest || "hex";
  hashDigestLength = hashDigestLength || 9999;

  const hash = require("crypto").createHash(hashFunction);

  hash.update(buffer);

  if (hashSalt) {
    hash.update(hashSalt);
  }

  if (
    hashDigest === "base26" ||
    hashDigest === "base32" ||
    hashDigest === "base36" ||
    hashDigest === "base49" ||
    hashDigest === "base52" ||
    hashDigest === "base58" ||
    hashDigest === "base62" ||
    hashDigest === "base64"
  ) {
    return encodeBufferToBase(hash.digest(), hashDigest.substr(4)).substr(
      0,
      hashDigestLength
    );
  } else {
    return hash.digest(hashDigest).substr(0, hashDigestLength);
  }
}

module.exports = getHashDigest;

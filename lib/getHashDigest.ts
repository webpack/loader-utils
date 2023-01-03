import type { BinaryToTextEncoding } from "crypto";

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

type BaseEncoding = keyof typeof baseEncodeTables;
type DigestType = `base${BaseEncoding}`;

/**
 * @param {Uint32Array} uint32Array Treated as a long base-0x100000000 number, little endian
 * @param {number} divisor The divisor
 * @return {number} Modulo (remainder) of the division
 */
function divmod32(uint32Array: Uint32Array, divisor: number): number {
  let carry = 0;
  for (let i = uint32Array.length - 1; i >= 0; i--) {
    const value = carry * 0x100000000 + uint32Array[i];
    carry = value % divisor;
    uint32Array[i] = Math.floor(value / divisor);
  }
  return carry;
}

function encodeBufferToBase(
  buffer: Buffer,
  base: BaseEncoding,
  length: number
) {
  const encodeTable = baseEncodeTables[base];

  if (!encodeTable) {
    throw new Error("Unknown encoding base" + base);
  }

  // Input bits are only enough to generate this many characters
  const limit = Math.ceil((buffer.length * 8) / Math.log2(base));
  length = Math.min(length, limit);

  // Most of the crypto digests (if not all) has length a multiple of 4 bytes.
  // Fewer numbers in the array means faster math.
  const uint32Array = new Uint32Array(Math.ceil(buffer.length / 4));

  // Make sure the input buffer data is copied and is not mutated by reference.
  // divmod32() would corrupt the BulkUpdateDecorator cache otherwise.
  buffer.copy(Buffer.from(uint32Array.buffer));

  let output = "";

  for (let i = 0; i < length; i++) {
    output = encodeTable[divmod32(uint32Array, base)] + output;
  }

  return output;
}

let crypto: typeof import("crypto");
let createXXHash64: typeof import("./hash/xxhash64").create;
let createMd4: typeof import("./hash/md4").create;
let BatchedHash: typeof import("./hash/BatchedHash").BatchedHash;
let BulkUpdateDecorator: typeof import("./hash/BulkUpdateDecorator").BulkUpdateDecorator;

/**
 * @public
 *
 * @param buffer - This represents the content that should be hashed
 * @param hashType - The algorithm to use to hash the content. Can be one of `xxhash64`, `md4`, `native-md4` or any other hash algorithm supported by node.js `crypto` module.
 * @param digestType - The encoding to use for the hash. Can be one of `base26`, `base32`, `base36`, `base49`, `base52`, `base58`, `base62` or `base64`.
 * @param maxLength - The maximum length of the resulting hash. Defaults to `9999`.
 */
export default function getHashDigest(
  buffer: Buffer,
  algorithm: string | "xxhash64" | "md4" | "native-md4",
  digestType: DigestType | string,
  maxLength: number
) {
  algorithm = algorithm || "xxhash64";
  maxLength = maxLength || 9999;

  let hash;

  if (algorithm === "xxhash64") {
    if (createXXHash64 === undefined) {
      createXXHash64 = require("./hash/xxhash64").create;

      if (BatchedHash === undefined) {
        BatchedHash = require("./hash/BatchedHash").BatchedHash;
      }
    }

    hash = new BatchedHash(createXXHash64());
  } else if (algorithm === "md4") {
    if (createMd4 === undefined) {
      createMd4 = require("./hash/md4").create;

      if (BatchedHash === undefined) {
        BatchedHash = require("./hash/BatchedHash").BatchedHash;
      }
    }

    hash = new BatchedHash(createMd4());
  } else if (algorithm === "native-md4") {
    if (typeof crypto === "undefined") {
      crypto = require("crypto");

      if (BulkUpdateDecorator === undefined) {
        BulkUpdateDecorator =
          require("./hash/BulkUpdateDecorator").BulkUpdateDecorator;
      }
    }

    hash = new BulkUpdateDecorator(() => crypto.createHash("md4"), "md4");
  } else {
    if (typeof crypto === "undefined") {
      crypto = require("crypto");

      if (BulkUpdateDecorator === undefined) {
        BulkUpdateDecorator =
          require("./hash/BulkUpdateDecorator").BulkUpdateDecorator;
      }
    }

    hash = new BulkUpdateDecorator(
      () => crypto.createHash(algorithm),
      algorithm
    );
  }

  hash.update(buffer);

  if (
    digestType === "base26" ||
    digestType === "base32" ||
    digestType === "base36" ||
    digestType === "base49" ||
    digestType === "base52" ||
    digestType === "base58" ||
    digestType === "base62"
  ) {
    const digestTypeToDigest = Number(digestType.substr(4));

    return encodeBufferToBase(
      hash.digest() as Buffer,
      digestTypeToDigest as BaseEncoding,
      maxLength
    );
  } else {
    return (
      hash.digest((digestType as BinaryToTextEncoding) || "hex") as string
    ).substr(0, maxLength);
  }
}

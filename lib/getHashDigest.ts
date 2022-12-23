import { Hash } from "crypto";

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

type DigestTypes =
  | "base26"
  | "base32"
  | "base36"
  | "base49"
  | "base52"
  | "base58"
  | "base62"
  | "base64";
type BaseEncodings = 26 | 32 | 36 | 49 | 52 | 58 | 62 | 64;

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
  base: BaseEncodings | number,
  length: number
) {
  const encodeTable = baseEncodeTables[base as keyof typeof baseEncodeTables];

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
let createXXHash64: typeof import("./hash/xxhash64").default;
let createMd4: typeof import("./hash/md4").default;
let BatchedHash: typeof import("./hash/BatchedHash").default;
let BulkUpdateDecorator: typeof import("./hash/BulkUpdateDecorator").default;

export default function getHashDigest(
  buffer: Buffer,
  algorithm: string | "xxhash64" | "md4" | "native-md4",
  digestType: DigestTypes | string,
  maxLength: number
) {
  algorithm = algorithm || "xxhash64";
  maxLength = maxLength || 9999;

  let hash;

  if (algorithm === "xxhash64") {
    if (createXXHash64 === undefined) {
      createXXHash64 = require("./hash/xxhash64").default;

      if (BatchedHash === undefined) {
        BatchedHash = require("./hash/BatchedHash").default;
      }
    }

    hash = new BatchedHash(createXXHash64() as unknown as Hash);
  } else if (algorithm === "md4") {
    if (createMd4 === undefined) {
      createMd4 = require("./hash/md4").default;

      if (BatchedHash === undefined) {
        BatchedHash = require("./hash/BatchedHash").default;
      }
    }

    hash = new BatchedHash(createMd4() as unknown as Hash);
  } else if (algorithm === "native-md4") {
    if (typeof crypto === "undefined") {
      crypto = require("crypto");

      if (BulkUpdateDecorator === undefined) {
        BulkUpdateDecorator = require("./hash/BulkUpdateDecorator").default;
      }
    }

    hash = new BulkUpdateDecorator(() => crypto.createHash("md4"), "md4");
  } else {
    if (typeof crypto === "undefined") {
      crypto = require("crypto");

      if (BulkUpdateDecorator === undefined) {
        BulkUpdateDecorator = require("./hash/BulkUpdateDecorator").default;
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
    const digestTypeToDigest: number = digestType.substr(
      4
    ) as unknown as number;

    return encodeBufferToBase(
      hash.digest() as Buffer,
      digestTypeToDigest,
      maxLength
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return hash.digest(digestType || "hex").substr(0, maxLength);
  }
}

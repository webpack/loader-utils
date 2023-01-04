import type { Hash, Encoding, BinaryToTextEncoding } from "crypto";
type HashOrFactory = Hash | (() => Hash);

const BULK_SIZE = 2000;

// We are using an object instead of a Map as this will stay static during the runtime
// so access to it can be optimized by v8
const digestCaches: Record<string, any> = {};

export class BulkUpdateDecorator {
  hash?: Hash;
  hashFactory?: () => Hash;
  hashKey: string;
  buffer: string;

  constructor(hashOrFactory: HashOrFactory, hashKey: string) {
    this.hashKey = hashKey;

    if (typeof hashOrFactory === "function") {
      this.hashFactory = hashOrFactory;
      this.hash = undefined;
    } else {
      this.hashFactory = undefined;
      this.hash = hashOrFactory;
    }

    this.buffer = "";
  }

  // Updates the hash https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding
  update(data: string | Buffer, inputEncoding?: Encoding): this {
    if (
      inputEncoding !== undefined ||
      typeof data !== "string" ||
      data.length > BULK_SIZE
    ) {
      if (this.hash === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.hash = this.hashFactory!();
      }

      if (this.buffer.length > 0) {
        this.hash.update(this.buffer);
        this.buffer = "";
      }

      if (inputEncoding === undefined) {
        this.hash.update(data);
      } else {
        this.hash.update(data as string, inputEncoding);
      }
    } else {
      this.buffer += data;

      if (this.buffer.length > BULK_SIZE) {
        if (this.hash === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.hash = this.hashFactory!();
        }

        this.hash.update(this.buffer);
        this.buffer = "";
      }
    }

    return this;
  }

  // Calculates the digest https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding
  digest(encoding?: BinaryToTextEncoding): string | Buffer {
    let digestCache;
    let digestResult: string | Buffer;

    const buffer = this.buffer;

    if (this.hash === undefined) {
      // short data for hash, we can use caching
      const cacheKey = `${this.hashKey}-${encoding}`;

      digestCache = digestCaches[cacheKey];

      if (digestCache === undefined) {
        digestCache = digestCaches[cacheKey] = new Map();
      }

      const cacheEntry = digestCache.get(buffer);

      if (cacheEntry !== undefined) {
        return cacheEntry;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.hash = this.hashFactory!();
    }

    if (buffer.length > 0) {
      this.hash.update(buffer);
    }

    if (encoding !== undefined) {
      digestResult = this.hash.digest(encoding);
    } else {
      digestResult = this.hash.digest();
    }

    if (digestCache !== undefined) {
      digestCache.set(buffer, digestResult);
    }

    return digestResult;
  }
}

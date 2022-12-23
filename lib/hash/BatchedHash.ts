import type { Hash, Encoding, BinaryToTextEncoding } from "crypto";
import { MAX_SHORT_STRING } from "./wasm-hash";

export default class BatchedHash {
  public string?: string;
  public encoding?: Encoding;
  public readonly hash: Hash;

  constructor(hash: Hash) {
    this.string = undefined;
    this.encoding = undefined;
    this.hash = hash;
  }

  /**
   * Update hash {@link https://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   * @param {string|Buffer} data data
   * @param {string=} inputEncoding data encoding
   * @returns {this} updated hash
   */
  update(data: string | Buffer, inputEncoding?: Encoding): this {
    if (this.string !== undefined) {
      if (
        typeof data === "string" &&
        inputEncoding === this.encoding &&
        this.string.length + data.length < MAX_SHORT_STRING
      ) {
        this.string += data;

        return this;
      }

      if (this.encoding !== undefined) {
        this.hash.update(this.string, this.encoding);
      } else {
        this.hash.update(this.string);
      }

      this.string = undefined;
    }

    if (typeof data === "string") {
      if (
        data.length < MAX_SHORT_STRING &&
        // base64 encoding is not valid since it may contain padding chars
        (!inputEncoding || !inputEncoding.startsWith("ba"))
      ) {
        this.string = data;
        this.encoding = inputEncoding;
      } else {
        if (inputEncoding !== undefined) {
          this.hash.update(data, inputEncoding);
        } else {
          this.hash.update(data);
        }
      }
    } else {
      this.hash.update(data);
    }

    return this;
  }

  /**
   * Calculates the digest {@link https://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
   * @param {string=} encoding encoding of the return value
   * @returns {string|Buffer} digest
   */
  digest(encoding?: BinaryToTextEncoding): string | Buffer {
    if (this.string !== undefined) {
      if (this.encoding !== undefined) {
        this.hash.update(this.string, this.encoding);
      } else {
        this.hash.update(this.string);
      }
    }
    if (encoding !== undefined) {
      return this.hash.digest(encoding);
    } else {
      return this.hash.digest();
    }
  }
}
import { BinaryToTextEncoding } from "crypto";

import type { IHashLike } from "./BatchedHash";

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

// 65536 is the size of a wasm memory page
// 64 is the maximum chunk size for every possible wasm hash implementation
// 4 is the maximum number of bytes per char for string encoding (max is utf-8)
// ~3 makes sure that it's always a block of 4 chars, so avoid partially encoded bytes for base64
export const MAX_SHORT_STRING: number = Math.floor((65536 - 64) / 4) & ~3;

export class WasmHash implements IHashLike {
  /**
   * @param {WebAssembly.Instance} instance wasm instance
   * @param {WebAssembly.Instance[]} instancesPool pool of instances
   * @param {number} chunkSize size of data chunks passed to wasm
   * @param {number} digestSize size of digest returned by wasm
   */
  exports: any;
  mem: Buffer;
  buffered: number;
  instancesPool: WebAssembly.Instance[];
  chunkSize: number;
  digestSize: number;

  constructor(
    instance: WebAssembly.Instance,
    instancesPool: WebAssembly.Instance[],
    chunkSize: number,
    digestSize: number
  ) {
    const exports = instance.exports as any;

    exports.init();

    this.exports = exports;
    this.mem = Buffer.from(exports.memory.buffer, 0, 65536);
    this.buffered = 0;
    this.instancesPool = instancesPool;
    this.chunkSize = chunkSize;
    this.digestSize = digestSize;
  }

  reset(): void {
    this.buffered = 0;
    this.exports.init();
  }

  /**
   * @param {Buffer | string} data data
   * @param {BufferEncoding=} encoding encoding
   * @returns {this} itself
   */
  update(data: Buffer | string, encoding: BufferEncoding): this {
    if (typeof data === "string") {
      while (data.length > MAX_SHORT_STRING) {
        this._updateWithShortString(data.slice(0, MAX_SHORT_STRING), encoding);
        data = data.slice(MAX_SHORT_STRING);
      }

      this._updateWithShortString(data, encoding);

      return this;
    }

    this._updateWithBuffer(data);

    return this;
  }

  _updateWithShortString(data: string, encoding: BufferEncoding): void {
    const { exports, buffered, mem, chunkSize } = this;

    let endPos: number;

    if (data.length < 70) {
      if (!encoding || encoding === "utf-8" || encoding === "utf8") {
        endPos = buffered;
        for (let i = 0; i < data.length; i++) {
          const cc = data.charCodeAt(i);

          if (cc < 0x80) {
            mem[endPos++] = cc;
          } else if (cc < 0x800) {
            mem[endPos] = (cc >> 6) | 0xc0;
            mem[endPos + 1] = (cc & 0x3f) | 0x80;
            endPos += 2;
          } else {
            // bail-out for weird chars
            endPos += mem.write(data.slice(i), endPos, encoding);
            break;
          }
        }
      } else if (encoding === "latin1") {
        endPos = buffered;

        for (let i = 0; i < data.length; i++) {
          const cc = data.charCodeAt(i);

          mem[endPos++] = cc;
        }
      } else {
        endPos = buffered + mem.write(data, buffered, encoding);
      }
    } else {
      endPos = buffered + mem.write(data, buffered, encoding);
    }

    if (endPos < chunkSize) {
      this.buffered = endPos;
    } else {
      const l = endPos & ~(this.chunkSize - 1);

      exports.update(l);

      const newBuffered = endPos - l;

      this.buffered = newBuffered;

      if (newBuffered > 0) {
        mem.copyWithin(0, l, endPos);
      }
    }
  }

  /**
   * @param {Buffer} data data
   * @returns {void}
   */
  _updateWithBuffer(data: Buffer): void {
    const { exports, buffered, mem } = this;
    const length = data.length;

    if (buffered + length < this.chunkSize) {
      data.copy(mem, buffered, 0, length);

      this.buffered += length;
    } else {
      const l = (buffered + length) & ~(this.chunkSize - 1);

      if (l > 65536) {
        let i = 65536 - buffered;

        data.copy(mem, buffered, 0, i);
        exports.update(65536);

        const stop = l - buffered - 65536;

        while (i < stop) {
          data.copy(mem, 0, i, i + 65536);
          exports.update(65536);
          i += 65536;
        }

        data.copy(mem, 0, i, l - buffered);

        exports.update(l - buffered - i);
      } else {
        data.copy(mem, buffered, 0, l - buffered);

        exports.update(l);
      }

      const newBuffered = length + buffered - l;

      this.buffered = newBuffered;

      if (newBuffered > 0) {
        data.copy(mem, 0, length - newBuffered, length);
      }
    }
  }

  digest(encoding: BinaryToTextEncoding): string | Buffer {
    const { exports, buffered, mem, digestSize } = this;

    exports.final(buffered);

    this.instancesPool.push(this);

    const hex = mem.toString("latin1", 0, digestSize);

    if (encoding === "hex") {
      return hex;
    }

    if (encoding === "binary" || !encoding) {
      return Buffer.from(hex, "hex");
    }

    return Buffer.from(hex, "hex").toString(encoding);
  }
}

export const create = (
  wasmModule: WebAssembly.Module,
  instancesPool: WasmHash[],
  chunkSize: number,
  digestSize: number
) => {
  let result: WasmHash | undefined;
  if (instancesPool.length > 0) {
    result = instancesPool.pop();

    // result is possibly undefined
    // protect reset call here
    result?.reset();
  }

  if (result === undefined) {
    return new WasmHash(
      new WebAssembly.Instance(wasmModule),
      instancesPool,
      chunkSize,
      digestSize
    );
  }

  return result;
};

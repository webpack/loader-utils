"use strict";

const emojisList = require("emojis-list");
const emojiRegex = require("emoji-regex")();

const baseEmoji = "emoji";
const emojiList = emojisList.filter(emoji => emojiRegex.test(emoji));

const DIGEST_TYPES = ["base26", "base32", "base36", "base49", "base52", "base58", "base62", "base64", "emoji"];
const baseEncodeTables = {
	26: "abcdefghijklmnopqrstuvwxyz",
	32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
	36: "0123456789abcdefghijklmnopqrstuvwxyz",
	49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
	52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
	62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
};

function encodeBufferToBase(buffer, encodeTable) {
	if(!encodeTable) throw new Error("Unknown encoding base" + encodeTable);

	const readLength = buffer.length;

	const Big = require("big.js");
	Big.RM = Big.DP = 0;
	let b = new Big(0);
	for(let i = readLength - 1; i >= 0; i--) {
		b = b.times(256).plus(buffer[i]);
	}

	const output = [];
	while(b.gt(0)) {
		output.unshift(encodeTable[b.mod(encodeTable.length)]);
		b = b.div(encodeTable.length);
	}

	Big.DP = 20;
	Big.RM = 1;

	return output;
}

function encodeBufferToDigestType(digest, digestType) {
	let encodeTable;
	if(digestType === baseEmoji) {
		encodeTable = emojiList;
	} else {
		encodeTable = baseEncodeTables[digestType.substr(4)];
	}
	return encodeBufferToBase(digest, encodeTable);
}

function getHashDigest(buffer, hashType, digestType, maxLength) {
	hashType = hashType || "md5";
	maxLength = maxLength || 9999;
	const hash = require("crypto").createHash(hashType);
	hash.update(buffer);
	if(digestType && DIGEST_TYPES.indexOf(digestType) >= 0) {
		const output = encodeBufferToDigestType(hash.digest(), digestType);
		return output.slice(0, maxLength).join("");
	} else {
		return hash.digest(digestType || "hex").substr(0, maxLength);
	}
}

module.exports = getHashDigest;

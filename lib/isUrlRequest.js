"use strict";

function isUrlRequest(url, root) {
	// An URL is not an request if
	// 1. it's a Data Url
	// 2. it's an absolute url or and protocol-relative
	// 3. it's some kind of url for a template
	// 4. it's to solve some problem in low version of ie.
	if(/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]|^about:blank/.test(url)) return false;
	// 5. It's also not an request if root isn't set and it's a root-relative url
	if((root === undefined || root === false) && /^\//.test(url)) return false;
	return true;
}

module.exports = isUrlRequest;

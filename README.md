# loader-utils

## Methods

### `parseQuery`

``` javascript
var query = loaderUtils.parseQuery(this.query);
assert(typeof query == "object");
if(query.flag)
	// ...
```

``` text
null                   -> {}
?                      -> {}
?flag                  -> { flag: true }
?+flag                 -> { flag: true }
?-flag                 -> { flag: false }
?xyz=test              -> { xyz: "test" }
?xyz[]=a               -> { xyz: ["a"] }
?flag1&flag2           -> { flag1: true, flag2: true }
?+flag1,-flag2         -> { flag1: true, flag2: false }
?xyz[]=a,xyz[]=b       -> { xyz: ["a", "b"] }
?a%2C%26b=c%2C%26d     -> { "a,&b": "c,&d" }
?{json:5,data:{a:1}}   -> { json: 5, data: { a: 1 } }
```

### `urlToRequest`
Converts some resource URL to a webpack module request.

```javascript
var url = "path/to/module.js";
var request = loaderUtils.urlToRequest(url); // "./path/to/module.js"
```

#### Module URLs
Any URL containing a `~` will be interpreted as a module request. Anything after the `~` will be considered the request path.

```javascript
var url = "~path/to/module.js";
var request = loaderUtils.urlToRequest(url); // "path/to/module.js"
```

#### Root-relative URLs
URLs that are root-relative (start with `/`) can be resolved relative to some arbitrary path by using the `root` parameter:

```javascript
var url = "/path/to/module.js";
var root = "./root";
var request = loaderUtils.urlToRequest(url, root); // "./root/path/to/module.js"
```

To convert a root-relative URL into a module URL, specify a `root` value that starts with `~`:

```javascript
var url = "/path/to/module.js";
var root = "~";
var request = loaderUtils.urlToRequest(url, root); // "path/to/module.js"
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

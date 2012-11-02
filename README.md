# loader-utils

## Methods

### parseQuery

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

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
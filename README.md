# json-query-string
 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/dw/localeval.svg)]()

Converts JSON objects to/from a minimal query string format.

## Advantages over regular query strings
- Can take arbitrary JSONable objects
- Preserves "null", "undefined" values
- Preserves type of values: numbers vs strings vs boolean

## Usage 
Basic use:
```javascript
    var queryString = jsonQueryStringify({foo:"bar", baz: 3}); //{foo=%22bar%22&baz=3}, displays in browser as {foo="bar"&baz=3}
    var url = "http://mysite.org?" + queryString;
    //Later...
    jsonQueryParse(queryString); //Original object
    //Non-alphanumeric properties will be quoted:
    jsonQueryStringify({'"&={}':34.5}); //{%22%5C%22%26%3D%7B%7D%22=34.5}, displays in browser as {"%5C"%26%3D%7B%7D"=34.5} - ugly but workable
```
For an even leaner query string, assuming your query is an object:
```javascript
    var queryString = jsonQueryStringifyObjectBare({foo:"bar", baz: 3}); //foo=%22bar%22&baz=3, displays in browser as foo="bar"&baz=3
    jsonQueryParseObjectBare(queryString);
```
For use in React router:
```javascript
export const routerHistory = useRouterHistory(...)({ parseQueryString: jsonQueryParseObjectBare, stringifyQuery: jsonQueryStringifyObjectBare});
```

## Format
`JSON.parse(JSON.stringify(value))` should always equal `jsonQueryParse(jsonQueryStringify(value))`, with one exception:
If an object has undefined values, `jsonQueryStringify()` preserves their presence. 
For example, JSON stringify translates {foo:undefined} to {}, while jsonQueryStringify translates to {foo:undefined}.  
 
# npm-whoami 

Finds the npm username of the logged in npm user.

[![Build Status](https://travis-ci.org/jamestalmage/npm-whoami.svg?branch=master)](https://travis-ci.org/jamestalmage/npm-whoami)
[![Coverage Status](https://coveralls.io/repos/jamestalmage/npm-whoami/badge.svg?branch=master&service=github)](https://coveralls.io/github/jamestalmage/npm-whoami?branch=master)
[![Code Climate](https://codeclimate.com/github/jamestalmage/npm-whoami/badges/gpa.svg)](https://codeclimate.com/github/jamestalmage/npm-whoami)
[![Dependency Status](https://david-dm.org/jamestalmage/npm-whoami.svg)](https://david-dm.org/jamestalmage/npm-whoami)
[![devDependency Status](https://david-dm.org/jamestalmage/npm-whoami/dev-status.svg)](https://david-dm.org/jamestalmage/npm-whoami#info=devDependencies)

[![NPM](https://nodei.co/npm/npm-whoami.png)](https://nodei.co/npm/npm-whoami/)

## Usage

```js
var npmWhoami = require('npm-whoami');

npmWhoami(function(err, username) {
  console.log(username);
  // james.talmage
});
```
## API

### npmWhoami([options, ] callback)

#### callback (err, username)

*Required*  
Type: `function (err, username)`

Called with the npm username, or an error if it can not be found.

#### options

*Optional*  
Type: `object | string | number`

If a `string`, it will be treated as the registry url.
If a `number`, it will be used as the timeout value.
You can pass an object hash if you need both values.

##### options.registry

*Optional*  
Type: `string`  

Will use the `--registry` flag to set an alternate registry url.
       
##### options.timeout

*Optional*  
Type: `number`  

Sets a maximum time to wait for a response from the server (in ms).
Default is 10,000 ms.

```javascript
npmWhoami({
  registry: 'http://localhost:55550',
  timeout: 4000
}, cb);
```


### npmWhoami.sync([options])

Same available `options` as the async version.
Returns a string username, or throws if the user is not logged in.
This synchronous function is not available on `v0.10.x` or earlier.

## License

MIT © [James Talmage](http://github.com/jamestalmage)

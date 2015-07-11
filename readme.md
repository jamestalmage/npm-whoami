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

##### registry

*Optional*
Type: `string`  

Will use the `--registry` flag to set an alternate registry url.

```javascript
npmWhoami({registry: 'http://localhost:55550'}, cb);
```

## License

MIT © [James Talmage](http://github.com/jamestalmage)

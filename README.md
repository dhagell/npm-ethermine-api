Node Ethermine
===========

NodeJS Client Library for the Ethermine (Ethermine.org) API

This is an asynchronous node js client for the Ethermine.org API. It exposes all the API methods found here: http://api.ethermine.org/docs through the ```api``` method:

Example Usage:

```javascript
const key          = '...'; // API Key
const secret       = '...'; // API Private Key
const wallet       = '...'; // API Wallet Key
const EthermineClient = require('Ethermine-api');
const Ethermine       = new EthermineClient(key, secret);

(async () => {
	// Display user's balance
	console.log(await Ethpool.api('Balance'));

	// Get Ticker Info
	console.log(await Ethpool.api('Ticker', { pair : 'XXBTZUSD' }));
})();
```

**Updates:**

As of version 1.0.0:
- All methods return a promise.
- The second argument (parameters) can be omitted.
- The third argument to the constructor can be an object (configuration) or a string (OTP), for backwards compatibility.

As of version 0.1.0, the callback passed to the ```api``` function conforms to the Node.js standard of

```javascript
function(error, data) {
	// ...
}
```



Credit:

I used the example nodejs Kraken implementation at https://github.com/nothingisdead/npm-kraken-api


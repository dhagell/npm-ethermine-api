const got    = require('got');
const crypto = require('crypto');
const qs     = require('qs');

// Public/Private method names
const methods = {
	pool  : [ 'poolStats', 'credits', 'blocks/history', 'networkStats', 'servers/history' ],
	miner  : [ 'miner/:miner/blocks', 'miner/:miner/history', 'miner/:miner/payouts', 'miner/:miner/rounds', 'miner/:miner/settings', 'miner/:miner/currentStats' ],
	worker  : [ 'miner/:miner/workers', 'miner/:miner/worker/:worker/history', 'miner/:miner/worker/:worker/currentStats', 'miner/:miner/workers/monitor' ],
	public  : [ ],
	private : [ ],
};

// Default options
const defaults = {
	url     : 'https://api.ethermine.org',
	version : 0,
	timeout : 5000,
};

// Create a signature for a request
const getMessageSignature = (path, request, secret, nonce) => {
	const message       = qs.stringify(request);
	const secret_buffer = new Buffer(secret, 'base64');
	const hash          = new crypto.createHash('sha256');
	const hmac          = new crypto.createHmac('sha512', secret_buffer);
	const hash_digest   = hash.update(nonce + message).digest('binary');
	const hmac_digest   = hmac.update(path + hash_digest, 'binary').digest('base64');

	return hmac_digest;
};

// Send an API request
const rawRequest = async (url, headers, data, timeout) => {
	// Set custom User-Agent string
	headers['User-Agent'] = 'Ethpool Javascript API Client';
	
	const options = { headers, timeout };

	Object.assign(options, {
		method : 'POST',
		body   : qs.stringify(data),
	});

	const { body } = await got(url, options);
	const response = JSON.parse(body);

	if(response.error && response.error.length) {
		const error = response.error
			.filter((e) => e.startsWith('E'))
			.map((e) => e.substr(1));

		if(!error.length) {
			throw new Error("Ethpool API returned an unknown error");
		}

		throw new Error(error.join(', '));
	}

	return response;
};

// Send an API request
const rawGetRequest = async (url, headers, data, timeout) => {
	// Set custom User-Agent string
	headers['User-Agent'] = 'Ethpool Javascript API Client';
	
	const options = { headers, timeout };

	Object.assign(options, {
		method : 'GET',
		body   : qs.stringify(data),
	});

	const { body } = await got(url, options);
	const response = JSON.parse(body);

	if(response.error && response.error.length) {
		const error = response.error
			.filter((e) => e.startsWith('E'))
			.map((e) => e.substr(1));

		if(!error.length) {
			throw new Error("Ethpool API returned an unknown error");
		}

		throw new Error(error.join(', '));
	}

	return response;
};

/**
 * EthpoolClient connects to the Ethpool.org API
 * @param {String}        wallet            API Key
 * @param {String|Object} [options={}]      Additional options. If a string is passed, will default to just setting `options.otp`.
 * @param {String}        [options.otp]     Two-factor password (optional) (also, doesn't work)
 * @param {Number}        [options.timeout] Maximum timeout (in milliseconds) for all API-calls (passed to `request`)
 */
class EthermineClient {
	constructor(wallet, options) {
		// Allow passing the OTP as the third argument for backwards compatibility
		if(typeof options === 'string') {
			options = { otp : options };
		}

		this.config = Object.assign({ wallet }, defaults, options);
	}

	/**
	 * This method makes a public or private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */

	api(method, params, callback) {
		// Default params to empty object
		if(typeof params === 'function') {
			callback = params;
			params   = {};
		}

		if(methods.public.includes(method)) {
			return this.publicMethod(method, params, callback);
		}
		else if(methods.private.includes(method)) {
			return this.privateMethod(method, params, callback);}
		else if(methods.pool.includes(method)) {
			return this.poolMethod(method, params, callback);}
		else if(methods.miner.includes(method)) {
			return this.minerMethod(method, params, callback);}
		else if(methods.worker.includes(method)) {
			return this.workerMethod(method, params, callback);
		}
		else {
			throw new Error(method + ' is not a valid API method.');
		}

	}

	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object key
	 */
	poolMethod(method, params, callback) {
		params = params || {};

		// Default params to empty object
		if(typeof params === 'function') {
			callback = params;
			params   = {};
		}

		//const path     = '/' + this.config.version + '/public/' + method;
		const path     = '/' +  method;
		const url      = this.config.url + path  ;
		const response = rawGetRequest(url, {}, params, this.config.timeout);
		console.log(url);
		if(typeof callback === 'function') {
			response
				.then( result => { callback(null, result); })
				.catch( error => { callback(error, null); });
		}

		return response;
	}
	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object key
	 */
	minerMethod(method, params, callback) {
		params = params || {};

		// Default params to empty object
		if(typeof params === 'function') {
			callback = params;
			params   = {};
		}

		//const path     = '/' + this.config.version + '/public/' + method;
		const path     = '/' +  method.replace(/:miner/i, params);
		const url      = this.config.url + path  ;
		const response = rawGetRequest(url, {}, params, this.config.timeout);
		console.log(url);
		if(typeof callback === 'function') {
			response
				.then( result => { callback(null, result); })
				.catch( error => { callback(error, null); });
		}

		return response;
	}
	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object key
	 */
	workerMethod(method, params, callback) {
		params = params || {};

		// Default params to empty object
		if(typeof params === 'function') {
			callback = params;
			params   = {};
		}

		//const path     = '/' + this.config.version + '/public/' + method;
		const path     = '/' +  method.replace(/:miner/i, params).replace(/:worker/i,params);
		const url      = this.config.url + path  ;
		const response = rawGetRequest(url, {}, params, this.config.timeout);
		console.log(url);
		if(typeof callback === 'function') {
			response
				.then( result => { callback(null, result); })
				.catch( error => { callback(error, null); });
		}

		return response;
	}
	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object key
	 */
	publicMethod(method, params, callback) {
		params = params || {};

		// Default params to empty object
		if(typeof params === 'function') {
			callback = params;
			params   = {};
		}

		const path     = '/' + this.config.version + '/public/' + method;
		const url      = this.config.url + path  ;
		const response = rawGetRequest(url, {}, params, this.config.timeout);
		console.log(url);
		if(typeof callback === 'function') {
			response
				.then( result => { callback(null, result); })
				.catch( error => { callback(error, null); });
		}

		return response;
	}

	
	/**
	 * This method makes a private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	privateMethod(method, params, callback) {
		params = params || {};

		// Default params to empty object
		if(typeof params === 'function') {
			callback = params;
			params   = {};
		}

		//const path = '/' + this.config.version + '/private/' + method;
		const path = '/' + method;
		const url  = this.config.url + path;

		if(!params.nonce) {
			params.nonce = new Date() * 1000; // spoof microsecond
		}

		if(this.config.otp !== undefined) {
			params.otp = this.config.otp;
		}

		const signature = getMessageSignature(
			path,
			params,
			this.config.wallet,
			params.nonce
		);

		const headers = {
			'API-Key'  : this.config.wallet,
			'API-Sign' : signature,
		};

		const response = rawRequest(url, headers, params, this.config.timeout);

		if(typeof callback === 'function') {
			response
				.then((result) => callback(null, result))
				.catch((error) => callback(error, null));
		}

		return response;
	}
}

module.exports = EthpoolClient;

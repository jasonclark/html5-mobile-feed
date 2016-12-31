/*

	This is a shim that matches the Google Feed API into Superfeedr's feed API.
	See blog.superfeedr.com/google-feed-api-alternative/ for details.

*/

window.google = {
	feeds: {
		Feed: {
			JSON_FORMAT: 'json',
			XML_FORMAT: 'atom',
			MIXED_FORMAT: 'json'
		}
	}
}

window.superfeedr = {

	// Compute Basc64 for auth
  Base64: {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=superfeedr.Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=superfeedr.Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}},

  // Set Auth
	auth: function auth(login, token) {
		this.login = login;
		this.token = token;
	},

	// Compatibility
	setOnLoadCallback: function setOnLoadCallback(callback) {
		return callback();
	},

	// Compatibility, but not implemented.
	findFeeds: function findFeeds(query, callback) {
		return callback({
			error: {
				code: -1,
				message: "Not impemented"
			}
		});
	},

	// Feed object
	Feed: function Feed(url) {
		this.loadedEntries = 4;
		this.feedFormat = 'json';


		function respond(text, format, callback) {
			if(format == 'json')
				return callback({
					feed: transform(text)
				});

			var div = document.createElement('div');
			div.innerHTML = text;

			return callback({
				xmlDocument: div.firstChild
			});
		}

		// Transform the Text response from Superfeedr into Google Feed API format
		function transform(text) {
			var json = JSON.parse(text);
			var googleFeedObject = {};
			googleFeedObject.entries = [];
			json.items.forEach(function(i) {
				googleFeedObject.entries.push({
					title: i.title ,
					link: i.permalinkUrl,
					contentSnippet: i.content,
					url: json.status.feed
				});
			});
			console.log(googleFeedObject);
			return googleFeedObject;
		}

		// Compatibility: sets the number of entries to be loaded.
		this.setNumEntries= function setNumEntries(x) {
			this.loadedEntries = parseInt(x);
		}

		// Compatibility: returns feed entries stored by Google that are no longer in the feed XML. Always true.
		this.includeHistoricalEntries = function includeHistoricalEntries() {
			return true;
		}

		// Compatibility: sets the format. Defaults to JSON
		this.setResultFormat = function setResultFormat(format) {
			if(format == google.feeds.Feed.JSON_FORMAT)
				this.feedFormat = google.feeds.Feed.JSON_FORMAT;
			if(format == google.feeds.Feed.XML_FORMAT)
				this.feedFormat = google.feeds.Feed.XML_FORMAT;
			if(format == google.feeds.Feed.MIXED_FORMAT)
				this.feedFormat = google.feeds.Feed.MIXED_FORMAT;
		}

		// Compatibility: loads the feed content from Superfeedr
		this.load = function(callback) {
			var that = this;
			var xmlHttp = new XMLHttpRequest();
			var auth = superfeedr.Base64.encode([superfeedr.login, superfeedr.token].join(':'));

			var endpoint = "https://push.superfeedr.com/?authorization=" + auth +  "&count=" + this.loadedEntries + "&hub.mode=retrieve&format=" + this.feedFormat + "&hub.topic=" + encodeURIComponent(url);

			xmlHttp.open("GET", endpoint, true);
			xmlHttp.send( null );
			xmlHttp.addEventListener("load", function() {
				if(xmlHttp.status == 200)
					return respond(xmlHttp.responseText, that.feedFormat, callback);

				return callback({
					error: {
						code: xmlHttp.status,
						message: xmlHttp.responseText
					}
				});
			});

			xmlHttp.addEventListener("error", function(e) {
				return callback({
					error: {
						code: 0,
						message: e.toString(),
						error: e
					}
				});
			});
		}
	}
}
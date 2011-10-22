// Based on fantastic jQuery useragent parser plugin 
// https://gist.github.com/373298

exports.uaParse = function(uaStr) {
	var agent = {
	    platform: {},
	    browser: {},
	    engine: {},
	};

	var ua = uaStr,
	    p = agent.platform,
	    b = agent.browser,
	    e = agent.engine;

	// detect platform
	if (/iPhone|iPod/.test(ua)) {
	    p.name = 'iphone';
	    p.iphone = true;
	} else if (/iPad/.test(ua)) {
	    p.name = 'ipad';
	    p.ipad = true;
	} else if (/Android/.test(ua)) {
	    p.name = 'android';
	    p.android = true;
	} else if (/Windows/.test(ua)) {
	    p.name = 'win';
	    p.win = true;
	} else if (/Mac/.test(ua)) {
	    p.name = 'mac';
	    p.mac = true;
	} else if (/Linux/.test(ua)) {
	    p.name = 'linux';
	    p.linux = true;
	} else if (/Blackberry/.test(ua)) {
	    p.name = 'blackberry';
	    p.blackberry = true;
	} else {
	    p.name = 'other';
	    p.unknown = true;
	}

	// ref sencha-touch 1.1
	// http://docs.sencha.com/touch/1-1/source/Support.html#Ext-is
	
	p.is = {};
	/**
	 * @property androidVersion Returns Android OS version information.
	 * @type {Boolean}
	 */
	var i = p.android &&(/Android\s(\d+\.\d+)/.exec(ua));
	if (i) {
	    p.AndroidVersion = i[1];
	    p.AndroidMajorVersion = parseInt(i[1], 10);
	}
	/**
	 * @property Desktop True if the browser is running on a desktop machine
	 * @type {Boolean}
	 */
	p.is.Desktop = p.mac || p.windows || (p.linux && !p.android);

	/**
	 * @property Tablet True if the browser is running on a tablet (iPad)
	 */
	p.is.Tablet = p.ipad || (p.android && p.AndroidMajorVersion === 3);

	/**
	 * @property Phone True if the browser is running on a phone.
	 * @type {Boolean}
	 */
	p.is.Phone = !p.is.Desktop && !p.is.Tablet;

	/**
	 * @property iOS True if the browser is running on iOS
	 * @type {Boolean}
	 */
	p.is.iOS = p.iphone || p.ipad || p.ipod;

	/**
	 * @property MultiTouch Returns multitouch availability.
	 * @type {Boolean}
	 */
	p.is.MultiTouch = !p.blackberry && !p.is.Desktop && !(p.android && p.AndroidVersion < 3);
	
	// Deprecated
	agent.mobile = p.is.Phone;

	// detect browser
	if (/MSIE/.test(ua)) {
	    b.name = 'msie';
	    b.msie = true;
	} else if (/Firefox/.test(ua)) {
	    b.name = 'firefox';
	    b.firefox = true;
	} else if (/Chrome/.test(ua)) { // must be tested before Safari
	    b.name = 'chrome';
	    b.chrome = true;
	} else if (/Safari/.test(ua)) {
	    b.name = 'safari';
	    b.safari = true;
	} else if (/Opera/.test(ua)) {
	    b.name = 'opera';
	    b.opera = true;
	} else {
	    b.name = 'other';
	    b.unknown = true;
	}

	// detect browser version
	if (b.msie) {
	    b.version = /MSIE (\d+(\.\d+)*)/.exec(ua)[1];
	} else if (b.firefox) {
	    b.version = /Firefox\/(\d+(\.\d+)*)/.exec(ua)[1];
	} else if (b.chrome) {
	    b.version = /Chrome\/(\d+(\.\d+)*)/.exec(ua)[1];
	} else if (b.safari) {
	    b.version = /Version\/(\d+(\.\d+)*)/.exec(ua)[1];
	} else if (b.opera) {
	    b.version = /Version\/(\d+(\.\d+)*)/.exec(ua)[1];
	} else {
	    b.version = 0;
	}

	// detect engine
	if (/Trident/.test(ua) || b.msie) {
	    e.name = 'trident';
	    e.trident = true;
	} else if (/WebKit/.test(ua)) { // must be tested before Gecko
	    e.name = 'webkit';
	    e.webkit = true;
	} else if (/Gecko/.test(ua)) {
	    e.name = 'gecko';
	    e.gecko = true;
	} else if (/Presto/.test(ua)) {
	    e.name = 'presto';
	    e.presto = true;
	} else {
	    e.name = 'other';
	    e.unknown = true;
	}

	// detect engine version
	if (e.trident) {
	    e.version = /Trident/.test(ua)? /Trident\/(\d+(\.\d+)*)/.exec(ua)[1]: 0;
	} else if (e.gecko) {
	    e.version = /rv:(\d+(\.\d+)*)/.exec(ua)[1];
	} else if (e.webkit) {
	    e.version = /WebKit\/(\d+(\.\d+)*)/.exec(ua)[1];
	} else if (e.presto) {
	    e.version = /Presto\/(\d+(\.\d+)*)/.exec(ua)[1];
	} else {
	    e.version = 0;
	}

	return agent;
};
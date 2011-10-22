// Based on fantastic jQuery useragent parser plugin 
// https://gist.github.com/373298

exports.uaParse = function(uaStr) {
  var agent = {
      platform: {},
      browser: {},
      engine: {},
	  mobile:false
  };

  var ua = uaStr,
      p = agent.platform,
      b = agent.browser,
      e = agent.engine;

  // detect Mobile or not
  if (/Mobile/.test(ua)) {
	agent.mobile = true
  }

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
  } else {
      p.name = 'other';
      p.unknown = true;
  }

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
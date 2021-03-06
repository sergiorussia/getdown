/**
 * Extracted from Mozilla Firefox 3.0.4, \mozilla\netwerk\base\src\nsProxyAutoConfig.js
 */
function dnsDomainIs (host, domain) {
  return (host.length >= domain.length &&
          host.substring(host.length - domain.length) == domain);
}

function dnsDomainLevels (host) {
  return host.split('.').length-1;
}

function convert_addr (ipchars) {
  var bytes = ipchars.split('.');
  var result = (((bytes[0] & 0xff) << 24) |
                ((bytes[1] & 0xff) << 16) |
                ((bytes[2] & 0xff) <<  8) |
                ( bytes[3] & 0xff       ));
  return result;
}

function dnsResolve (host) {
  return resolver.dnsResolve(host)
}

function isInNet (addrOrHost, pattern, maskstr) {
  var testRE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  var test = testRE.exec(addrOrHost);
  if (test == null) {
    addrOrHost = dnsResolve(addrOrHost);
    if (addrOrHost == null) {
      return false;
    }
  } else if (test[1] > 255 || test[2] > 255 || test[3] > 255 || test[4] > 255) {
    return false; // not an IP address
  }
  var host = convert_addr(addrOrHost);
  var pat  = convert_addr(pattern);
  var mask = convert_addr(maskstr);
  return ((host & mask) == (pat & mask));
}

function isPlainHostName (host) {
  return (host.search('\\.') == -1);
}

function isResolvable (host) {
  var ip = dnsResolve(host);
  return (ip != null);
}

function localHostOrDomainIs (host, hostdom) {
  return (host == hostdom) || (hostdom.lastIndexOf(host + '.', 0) == 0);
}

function shExpMatch (url, pattern) {
  pattern = pattern.replace(/\./g, '\\.');
  pattern = pattern.replace(/\*/g, '.*');
  pattern = pattern.replace(/\?/g, '.');
  var newRe = new RegExp('^'+pattern+'$');
  return newRe.test(url);
}

var wdays = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
};

var months = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
};

function weekdayRange () {
  function getDay (weekday) {
    if (weekday in wdays) {
      return wdays[weekday];
    }
    return -1;
  }
  var date = new Date();
  var argc = arguments.length;
  var wday;
  if (argc < 1) {
    return false;
  }
  if (arguments[argc - 1] == 'GMT') {
    argc--;
    wday = date.getUTCDay();
  } else {
    wday = date.getDay();
  }
  var wd1 = getDay(arguments[0]);
  var wd2 = (argc == 2) ? getDay(arguments[1]) : wd1;
  return (wd1 == -1 || wd2 == -1) ? false : (wd1 <= wday && wday <= wd2);
}

function dateRange () {
  function getMonth (name) {
    if (name in months) {
      return months[name];
    }
    return -1;
  }
  var date = new Date();
  var argc = arguments.length;
  if (argc < 1) {
    return false;
  }
  var isGMT = (arguments[argc - 1] == 'GMT');
  if (isGMT) {
    argc--;
  }

  // function will work even without explict handling of this case
  if (argc == 1) {
    var tmp = parseInt(arguments[0]);
    if (isNaN(tmp)) {
      return ((isGMT ? date.getUTCMonth() : date.getMonth()) == getMonth(arguments[0]));
    } else if (tmp < 32) {
      return ((isGMT ? date.getUTCDate() : date.getDate()) == tmp);
    } else {
      return ((isGMT ? date.getUTCFullYear() : date.getFullYear()) == tmp);
    }
  }

  var year = date.getFullYear();
  var date1, date2;
  date1 = new Date(year,  0,  1,  0,  0,  0);
  date2 = new Date(year, 11, 31, 23, 59, 59);
  var adjustMonth = false;
  for (var i = 0; i < (argc >> 1); i++) {
    var tmp = parseInt(arguments[i]);
    if (isNaN(tmp)) {
      var mon = getMonth(arguments[i]);
      date1.setMonth(mon);
    } else if (tmp < 32) {
      adjustMonth = (argc <= 2);
      date1.setDate(tmp);
    } else {
      date1.setFullYear(tmp);
    }
  }
  for (var i = (argc >> 1); i < argc; i++) {
    var tmp = parseInt(arguments[i]);
    if (isNaN(tmp)) {
      var mon = getMonth(arguments[i]);
      date2.setMonth(mon);
    } else if(tmp < 32) {
      date2.setDate(tmp);
    } else {
      date2.setFullYear(tmp);
    }
  }
  if (adjustMonth) {
    date1.setMonth(date.getMonth());
    date2.setMonth(date.getMonth());
  }
  if (isGMT) {
    var tmp = date;
    tmp.setFullYear(date.getUTCFullYear());
    tmp.setMonth(date.getUTCMonth());
    tmp.setDate(date.getUTCDate());
    tmp.setHours(date.getUTCHours());
    tmp.setMinutes(date.getUTCMinutes());
    tmp.setSeconds(date.getUTCSeconds());
    date = tmp;
  }
  return ((date1 <= date) && (date <= date2));
}

var jsonp = function(url, cb, data) {
  return $.get(url, data, function(data) {
    if (cb)
      cb(null, data);
  },
  "jsonp").error(function(err) {
    if (cb)
      cb(err);
  }).complete(function() {
    console.log('complete');
  });
  
}

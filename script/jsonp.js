var jsonp = function(url, cb, data) {
  console.log(url);
  $.get(url, data, function(data) {
    cb(null, data);
  },
  "jsonp").error(function(err) {
    cb(err);
  });
}

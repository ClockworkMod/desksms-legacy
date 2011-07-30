var sorty = function(list, keyFunction) {
  list.sort(function(a, b) {
    a = keyFunction(a);
    b = keyFunction(b);
    if (a == b)
      return 0;
    if (a < b)
      return -1;
    return 1;
  });
  return list;
};

var select = function(list, selectFunction) {
  var ret = [];
  $.each(list, function(index, value) {
    ret.push(selectFunction(index, value));
  });
  return ret;
}

var filter = function(list, selectFunction) {
  var ret = [];
  $.each(list, function(index, value) {
    var selected = selectFunction(index, value);
    if (selected != null)
      ret.push(selected);
  });
  return ret;
}

var keys = function(o) {
  var ret = [];
  $.each(o, function(a, b) {
    ret.push(a);
  });
  return ret;
}
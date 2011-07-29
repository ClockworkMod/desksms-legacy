var contacts = new function() {
  this.providers = {};
  
  this.addProvider = function(name, value) {
    this.providers[name] = value;
  }
  
  this.list = [];
  
  this.numbersOnly = function(number) {
    var ret = '';
    $.each(number, function(index, c) {
      if (c >= '0' && c <= '9')
        ret += c;
    });
    return ret;
  }
  
  var contactListeners = [];
  
  this.onNewContact = function(listener) {
    contactListeners.push(listener);
  }
  
  this.addContact = function(contact) {
    this.list.push(contact);
    contact.numbersOnly = this.numbersOnly(contact.number);
    
    $.each(contactListeners, function(index, listener) {
      listener(contact);
    });
  }
  
  this.findNumber = function(number, list) {
    if (list == null)
      list = this.list;
    var numbersOnly = this.numbersOnly(number);
    var ret = null;
    $.each(list, function(index, entry) {
      if (entry.numbersOnly == null)
        return;
      if (entry.numbersOnly.indexOf(numbersOnly) != -1 || numbersOnly.indexOf(entry.numbersOnly) != -1)
        ret = entry;
    });
    
    return ret;
  }
}
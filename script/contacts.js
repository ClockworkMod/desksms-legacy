var contacts = new function() {
  this.providers = {};
  
  this.addProvider = function(name, value) {
    this.providers[name] = value;
  }
  
  this.list = [];
  
  this.numbersOnly = function(number) {
    var ret = '';
    $.each(number, function(index, c) {
      // ie bug fix
      c = number.charAt(index);
      if (c >= '0' && c <= '9')
        ret += c;
    });
    // trim off any 0's at the start by converting to an int and back
    var intVal = parseInt(ret, 10);
    if (!isNaN(intVal))
      ret = String(intVal);
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
  
  this.getDisplayName = function(number) {
    var contact = this.findNumber(number);
    if (!contact || !contact.name)
      return number;
    return contact.name;
  }
  
  this.findNumber = function(number, list) {
    if (list == null)
      list = this.list;
    var numbersOnly = this.numbersOnly(number);
    var ret = null;
    $.each(list, function(index, entry) {
      if (number == entry.number || entry.numbersOnly == numbersOnly) {
        ret = entry;
        return;
      }
      // only match 7 digit numbers with fuzzy matches
      if (entry.numbersOnly == null || entry.numbersOnly.length < 7 || numbersOnly.length < 7)
        return;
      if (entry.numbersOnly.indexOf(numbersOnly) != -1 || numbersOnly.indexOf(entry.numbersOnly) != -1)
        ret = entry;
    });
    
    return ret;
  }
}
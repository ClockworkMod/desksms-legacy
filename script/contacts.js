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
  
  this.addContact = function(contact) {
    this.list.push(contact);
    contact.numbersOnly = this.numbersOnly(contact.number);
  }
  
  this.findContact = function(number) {
    var numbersOnly = this.numbersOnly(number);
    var ret = null;
    $.each(this.list, function(index, entry) {
      if (entry.numbersOnly.indexOf(numbersOnly) != -1 || numbersOnly.indexOf(entry.numbersOnly) != -1)
        ret = entry;
    });
    
    return ret;
  }
}
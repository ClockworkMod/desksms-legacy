var desksms = new function() {
  this.BASE_URL = "https://desksms.appspot.com";
  this.API_URL = this.BASE_URL + "/api/v1";
  this.USER_URL = this.API_URL + "/user/default";
  this.SETTINGS_URL = this.USER_URL + "/settings";
  this.SMS_URL = this.USER_URL + "/sms";
  this.CALL_URL = this.USER_URL + "/call";
  this.OUTBOX_URL = this.USER_URL + "/outbox";
  this.LOGIN_URL = this.API_URL + "/user/login?continue=%s";
  this.LOGOUT_URL = this.API_URL + "/user/logout?continue=%s";
  this.WHOAMI_URL = this.API_URL + "/user/whoami";
  this.AUTHSUB_URL = this.API_URL + "/authsub";
  
  this.conversations = {};
  
  this.getLoginUrl = function() {
    return sprintf(this.LOGIN_URL, window.location.href);
  }
  
  this.getLogoutUrl = function() {
    return sprintf(this.LOGOUT_URL, window.location.href);
  }
  
  this.whoami = function(cb) {
    jsonp(this.WHOAMI_URL, cb);
  }
  
  /*
    options = {
      max_date: null,
      min_date: null,
      number: null
    }
  */
  this.getSms = function(options, cb) {
    jsonp(this.SMS_URL, function(err, data) {
      if (data) {
        // bucket these into conversations
        $.each(data.data, function(index, message) {
          var contact = contacts.findContact(message.number, desksms.conversations);
          if (contact == null) {
            var n = contacts.numbersOnly(message.number);
            contact = desksms.conversations[n] = {messages: [], numbersOnly: n, latestMessageDate: message.date, number: message.number};
          }
          
          contact.latestMessageDate = Math.max(contact.latestMessageDate, message.date);
          contact.messages.push(message);
        });
      }
      
      cb(err, data);
    }, options);
  }
  
  this.getOutbox = function(options, cb) {
    jsonp(this.OUTBOX_URL, cb, options);
  }
  
  this.sendSms = function(number, message, cb) {
    var envelope = { data: [{ number: number, message: message }] };
    var stringData = JSON.stringify(envelope);
    console.log(stringData);
    var args = { operation: "POST", data: stringData };
    jsonp(this.OUTBOX_URL, cb, args);
  }
  
};

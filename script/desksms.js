function Conversation(number) {
  this.number = number;
  this.numbersOnly = contacts.numbersOnly(number);
  this.id = Crypto.MD5(this.number);
  this.messages = {};
  this.latestMessageDate = 0;
  this.contact = contacts.findNumber(number);
}

Conversation.prototype.addMessage = function(message) {
  message.id = this.numbersOnly + '-' + message.date;
  message.conversation = this;
  this.latestMessageDate = Math.max(this.latestMessageDate, message.date);
  this.messages[message.id] = message;
}

var desksms = new function() {
  this.BASE_URL = "https://desksms.appspot.com";
  this.API_URL = this.BASE_URL + "/api/v1";
  this.USER_URL = this.API_URL + "/user/default";
  this.SETTINGS_URL = this.USER_URL + "/settings";
  this.SMS_URL = this.USER_URL + "/sms";
  this.CALL_URL = this.USER_URL + "/call";
  this.DIAL_URL = this.USER_URL + "/dial";
  this.OUTBOX_URL = this.USER_URL + "/outbox";
  this.LOGIN_URL = this.API_URL + "/user/login?continue=%s";
  this.LOGOUT_URL = this.API_URL + "/user/logout?continue=%s";
  this.WHOAMI_URL = this.API_URL + "/user/whoami";
  this.PROXY_URL = this.API_URL + "/proxy?proxied=%s";
  this.BADGE_URL = this.USER_URL + "/badge";
  
  this.conversations = {};
  
  this.getCrossOriginImage = function(image) {
    return sprintf(this.PROXY_URL, encodeURIComponent(image))
  }
  
  this.getLoginUrl = function() {
    return sprintf(this.LOGIN_URL, encodeURIComponent(window.location.href));
  }
  
  this.getLogoutUrl = function() {
    return sprintf(this.LOGOUT_URL, encodeURIComponent(window.location.href));
  }
  
  this.whoami = function(cb) {
    jsonp(this.WHOAMI_URL, cb);
  }
  
  this.startConversation = function(number) {
    var convo = this.findConversation(number);
    if (convo)
      return convo;
    convo = new Conversation(number);
    this.conversations[convo.numbersOnly] = convo;
    return convo;
  }
  
  this.findConversation = function(number) {
    return contacts.findNumber(number, desksms.conversations);
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
        if (data.data.length == 0)
          return;
        // bucket these into conversations
        $.each(data.data, function(index, message) {
          var conversation = desksms.startConversation(message.number);
          // if (conversation == null) {
          //   var n = contacts.numbersOnly(message.number);
          //   //conversation = desksms.conversations[n] = {messages: [], numbersOnly: n, latestMessageDate: message.date, number: message.number, id: Crypto.MD5(message.number) };
          //   conversation = desksms.conversations[n] = new Conversation(message.number);
          //   conversation.contact = contacts.findNumber(conversation.number);
          // }

          conversation.addMessage(message);
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
  
  if (window.contacts) {
    contacts.onNewContact(function(contact) {
      var conversation = desksms.findConversation(contact.number);
      if (conversation == null)
        return;

      conversation.contact = contact;
    });
  }
  
  this.dialNumber = function(number, cb) {
    jsonp(this.DIAL_URL, cb, { number: number });
  }
  
  this.deleteConversation = function(number) {
    var conversation = this.findConversation(number);
    if (conversation == null)
      return;
    var numbers = {};
    $.each(conversation.messages, function(index, message) {
      numbers[message.number] = true;
    });
    
    numbers = keys(numbers);
    $.each(numbers, function(index, messageNumber) {
      jsonp(desksms.SMS_URL, null, { operation: "DELETE", number: messageNumber });
    });
  }

  this.lastBadgeDate = null;
  this.badge = function(cb) {
    var data;
    if (desksms.lastBadgeDate) {
      data = { after_date: desksms.lastBadgeDate };
    }
    jsonp(desksms.BADGE_URL, function(err, data) {
      if (!err && (data.badge || !desksms.lastBadgeDate)) {
        desksms.lastBadgeDate = data.date;
      }
      cb(err, data);
    }, data);
  }
};

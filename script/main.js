var page = new function() {
  this.longAgo = function(utc)
   {
      //Consider making more options?
      var theDate = new Date(utc);
      var diff = (new Date()).getTime() - theDate.getTime();
      var dayCount = Math.floor(diff / 86400000);
      var howLong = '';

      if (dayCount >= 14)
          howLong = sprintf('%s %s ago', Math.floor(dayCount / 7), 'weeks');
      else if (dayCount > 1)
          howLong = sprintf('%s %s ago', dayCount, 'days');
      else if (dayCount == 1)
          howLong = '1 day ago';
      else
      {
          //hours
          if (Math.floor(diff / 3600000) > 2)
              howLong = sprintf('%s %s ago', Math.floor(diff / 3600000), 'hours');
          // More than an hour
          else if (diff / 3600000.0 > 1.5)
              howLong = 'Over an hour ago';
          else if (Math.floor(diff / 3600000) == 1)
              howLong = '1 hour ago';
          //minutes
          else if (Math.floor(diff / 60000) >= 1)
              howLong = sprintf('%s %s ago', Math.floor(diff / 60000), 'minutes');
          else if (Math.floor(diff / 60000) == 1)
              howLong = '1 minute ago';
          else if (Math.floor(diff / 1000) > 10)
              howLong = sprintf('%s %s ago', Math.floor(diff / 1000), 'seconds');
          //Just now
          else
              howLong = 'Just now';
      }

      return howLong;
  }
  
  this.setClickHandlers = function() {
    $('.contact-text').click(function(event) {
      var message = $(event.target).parents('.conversation-template');

      var footer = $(event.target).parents('.message-panel-footer');
      var hidden = footer.find('.contact-text-container');

      hidden.show();
      input = hidden.find('.contact-text-content');
      input.focus();
      input.val('');
      input.unbind('blur');
      input.unbind('keypress');
      // there seems to be a race condition between the element
      // disappearing and another text box getting focus
      input.blur(function(event) {
        setTimeout(function() {
          hidden.hide();
        }, 200);
      });
      
      input.keypress(function(event) {
        if (event.which != 13)
          return;
        var contents = input.val();
        if (contents == "")
          return;
        console.log(contents);
        var number = $(message).find('.contact-number').text();
        desksms.sendSms(number, contents, function(err, data) {
          console.log(err);
          console.log(data);
        });
        input.blur();
      });
    });
  }
  
  this.addMessageToConversation = function(message, displayName, messageContainer, messageTemplate, messageElement) {
    var conversation = message.conversation;
    if (messageElement == null) {
      messageElement = $('#message-' + message.id);
    }
    
    if (messageElement == null || messageElement.length == 0) {
      if (messageTemplate == null)
        messageTemplate = $('#contact-message-template');

        messageElement = messageTemplate.clone();
        messageElement.attr('id', 'message-' + message.id);
        messageElement.removeClass("hidden");
        if (messageContainer == null)
          messageContainer = $('#conversation-' + conversation.id).find('#contact-messages-internal');
        messageContainer.append(messageElement);
    }
    
    var date = new Date(message.date);
    messageElement.removeClass("hidden");
    var from = $(messageElement).find(".message-from");
    if (message.type == 'incoming') {
      from.addClass('message-from-' + conversation.id);
      from.text(displayName);
    }
    else {
      from.text('Me');
    }
    $(messageElement).find(".message-content").text(message.message);
    $(messageElement).find(".message-date").text(dateFormat(new Date(message.date), "shortTime"));
    messageContainer.append(messageElement);
  }
  
  this.addConversation = function(conversation, existing) {
    var conversationElement = existing;
    if (conversationElement == null) {
      conversationElement = $('#conversation-' + conversation.id);
    }
    
    if (conversationElement == null || conversationElement.length == 0) {
      var contentContainer = $('#content-container');
      var conversationTemplate = $('#conversation-template');
      conversationElement = conversationTemplate.clone();
      conversationElement.attr('id', 'conversation-' + conversation.id);
      conversationElement.removeClass("hidden");
      contentContainer.append(conversationElement);
    }
    conversationElement.addClass("conversation");
    
    var messageTemplate = $('#contact-message-template');
    var messageContainer = $(conversationElement).find('#contact-messages-internal');
    var messages = conversation.messages.slice(Math.max(0, conversation.messages.length - 10), conversation.messages.length);
    var lastMessage = messages[messages.length - 1];
    
    $(conversationElement).find('.contact-number').text(conversation.number);
    $(conversationElement).find('.contact-last-message-date').text(page.longAgo(lastMessage.date));
    
    var contact = contacts.findNumber(conversation.number);
    var displayName = conversation.number;
    var contactImage = $(conversationElement).find('.contact-image').attr('id', 'contact-image-' + conversation.id);
    var contactNameElement = $(conversationElement).find(".contact-name").attr('id', 'contact-name-' + conversation.id);
    if (contact) {
      if (contact.photo) {
        contactImage.attr('src', contact.photo);
      }
      displayName = contact.name;
      contactNameElement.text(contact.name).removeClass("hidden");
    }
    else {
      contactNameElement.addClass("hidden");
    }

    $.each(messages, function(index, message) {
      page.addMessageToConversation(message, displayName, messageContainer, messageTemplate);
    });
  }
  
  this.lastRefresh = Date.now() - 3 * 24 * 60 * 60 * 1000;
  
  this.refreshInbox = function() {
    console.log(page.lastRefresh);
    desksms.getSms({ min_date: page.lastRefresh }, function(err, data) {
      //console.log(data);
      
      var contacts = Object.keys(desksms.conversations);
      contacts.sort(function(a,b) {
        a = desksms.conversations[a];
        b = desksms.conversations[b];
        if (a.latestMessageDate == b.latestMessageDate)
          return;
        
        if (a.latestMessageDate > b.latestMessageDate)
          return -1;
        
        return 1;
      });
      
      var conversations = [];
      $.each(contacts, function(index, contact) {
        var conversation = desksms.conversations[contact];
        conversations.push(conversation);
        
        page.addConversation(conversation);
      });
      //console.log(conversations);
      
      page.setClickHandlers();
    });
  }

  $(document).ready(function() {
    // figure out who we are
    desksms.whoami(function(err, data) {
      var loginButton = $('#desksms-login');
      if (loginButton) {
        if (!data.email) {
          loginButton.attr('href', desksms.getLoginUrl());
          return;
        }

        loginButton.text("Logout: " + data.email);
        loginButton.attr('href', desksms.getLogoutUrl());
        
        page.refreshInbox();
      }
    });
    
    
    page.setClickHandlers();
  });
  
  contacts.onNewContact(function(contact) {
    var conversation = desksms.findConversation(contact.number);
    if (conversation == null)
      return;
    console.log(contact);
    
    if (contact.photo)
      $("#contact-image-" + conversation.id).attr('src', contact.photo);
    $("#contact-name-" + conversation.id).text(contact.name).removeClass("hidden");
    $(".message-from-" + conversation.id).text(contact.name).removeClass("hidden");
  });
}

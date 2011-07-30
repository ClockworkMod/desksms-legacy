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
    var contactText = $('.contact-text');
    contactText.unbind('click');
    
    contactText.click(function(event) {
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
        var number = $(message).find('.contact-number').text();
        desksms.sendSms(number, contents, function(err, data) {
          if (err) {
            console.log(err);
            return;
          }
          var date = data.data[0];
          var conversation = desksms.findConversation(number);
          var pendingMessage = {};
          pendingMessage.message = contents;
          pendingMessage.type = 'outgoing';
          pendingMessage.date = date;
          pendingMessage.pending = true;
          conversation.addMessage(pendingMessage);
          page.addMessageToConversation(pendingMessage);
        });
        
        input.blur();
      });
    });
    
    
    var contactCall = $('.contact-call');
    contactCall.unbind('click');
    
    contactCall.click(function(event) {
      var message = $(event.target).parents('.conversation-template');
      var number = $(message).find('.contact-number').text();
      var contentStatus = $('#content-status');
      var displayName = contacts.getDisplayName(number);
      contentStatus.text(sprintf('Dialing %s on your phone...', displayName));
      desksms.dialNumber(number, function(err, data) {
        if (err || data.error) {
          contentStatus.text(sprintf('Error dialing %s...', displayName));
        }
        
        contentStatus.fadeOut(10000, function() {
          contentStatus.show();
          contentStatus.text('DeskSMS');
        });
      });
    });
  }
  
  this.addMessageToConversation = function(message, afterMessage, displayName, messageContainer, messageTemplate, messageElement) {
    var conversation = message.conversation;
    if (messageElement == null) {
      messageElement = $('#message-' + message.id);
    }
    
    var needsInsert = false;
    if (messageElement == null || messageElement.length == 0) {
      needsInsert = true;
      if (messageTemplate == null)
        messageTemplate = $('#contact-message-template');

        messageElement = messageTemplate.clone();
        messageElement.attr('id', 'message-' + message.id);
        messageElement.removeClass("hidden");
    }
    
    var date = new Date(message.date);
    messageElement.removeClass("hidden");
    var from = $(messageElement).find(".message-from");
    var displayName = message.number;
    if (message.conversation.contact)
      displayName = message.conversation.contact.name;
    if (message.type == 'incoming') {
      from.addClass('message-from-' + conversation.id);
      from.text(displayName);
    }
    else {
      from.text('Me');
    }
    if (message.pending == true)
      $(messageElement).find('.message-pending').removeClass('hidden');
    else
      $(messageElement).find('.message-pending').addClass('hidden');
    $(messageElement).find(".message-content").text(message.message);
    $(messageElement).find(".message-date").text(dateFormat(new Date(message.date), "shortTime"));
    
    if (needsInsert) {
      if (messageContainer == null)
        messageContainer = $('#conversation-' + conversation.id).find('#contact-messages-internal');
        if (messageContainer == null || messageContainer.length == 0) {
          page.addConversation(message.conversation);
          messageContainer = $('#conversation-' + conversation.id).find('#contact-messages-internal');
        }
      
      if (afterMessage == null)
        messageContainer.append(messageElement);
      else
        $(messageElement).insertAfter('#message-' + afterMessage.id);
    }
  }
  
  this.addConversationToTop = function(conversation, existing) {
    if (conversation == null)
      return;
    var conversationElement = existing;
    if (conversationElement == null) {
      conversationElement = $('#conversation-' + conversation.id);
    }
    
    var conversationTemplate = $('#conversation-template');
    if (conversationElement == null || conversationElement.length == 0) {
      var contentContainer = $('#content-container');
      conversationElement = conversationTemplate.clone();
      conversationElement.attr('id', 'conversation-' + conversation.id);
      conversationElement.removeClass("hidden");
      //contentContainer.append(conversationElement);
      $(conversationElement).insertAfter(conversationTemplate);
    }
    else {
      conversationElement.detach();
      conversationElement.insertAfter(conversationTemplate);
    }
//    conversationElement.addClass("conversation");
    
    var messageTemplate = $('#contact-message-template');
    var messageContainer = $(conversationElement).find('#contact-messages-internal');
    var messageKeys = keys(conversation.messages);
    messageKeys.sort();
    messageKeys = messageKeys.slice(Math.max(0, messageKeys.length - 10), messageKeys.length);
    //var messages = conversation.messages.slice(Math.max(0, conversation.messages.length - 10), conversation.messages.length);
    var messages = [];
    $.each(messageKeys, function(index, value) {
      messages.push(conversation.messages[value]);
    });
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

    return conversationElement;
  }
  
  this.lastRefresh = 0;
  
  this.refreshInbox = function() {
    var lastRefresh = this.lastRefresh;
    if (this.lastRefresh == 0)
      this.lastRefresh = new Date().getTime() - 3 * 24 * 60 * 60 * 1000;
    
    console.log(page.lastRefresh);
    desksms.getSms({ after_date: page.lastRefresh }, function(err, data) {
      if (data.data.length == 0)
        return;
      var conversations = {};
      $.each(data.data, function(index, message) {
        conversations[message.conversation.id] = message.conversation;
        page.lastRefresh = Math.max(page.lastRefresh, message.date);
      });
      
      conversations = sorty(keys(conversations), function(key) {
        return conversations[key].latestMessageDate;
      });
      conversations = select(conversations, function(index, value) {
        return value;
      });
      
      $.each(conversations, function(index, conversation) {
        page.addConversationToTop(desksms.findConversation(conversation));
      });

      var messages = data.data;
      if (lastRefresh == 0) {
        var contentStatus = $('#content-status');
        if (messages.length == 0) {
          contentStatus.text('You are successfully logged in, but no messages were found! Please verify the DeskSMS Android application is installed and syncing SMS on your phone.')
        }
        else {
          //contentStatus.hide();
          contentStatus.text('DeskSMS')
        }
        var convoCounter = {};
        messages.reverse();
        messages = filter(messages, function(index, message) {
          if (!convoCounter[message.conversation.id])
            convoCounter[message.conversation.id] = 0;
          if (++convoCounter[message.conversation.id] >= 10)
            return null;
          return message;
        });
        messages.reverse();
      }
      else {
        $.each(messages, function(index, message) {
          if (message.type == 'incoming')
            notifications.showMessageNotification(message);
        });
      }
      
      $.each(messages, function(index, message) {
        page.addMessageToConversation(message);
      });
      
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

        loginButton.attr('href', desksms.getLogoutUrl());
        loginButton.text("Logout: " + data.email);
        
        var looper = function() {
          setTimeout(looper, 30000);
          page.refreshInbox();
        };
        looper();
      }
    });
    
    var query = $.query.load(window.location.hash);
    var extension = query.get('extension');
    if (extension) {
      $('.link').attr('target', '_blank');
      $('.github-fork').hide();
      $('#market-link').attr('href', 'http://www.clockworkmod.com/desksms');
      $('.content-container').css('width', '95%');
    }
    $('#connect-google').attr('href', googleContacts.getAuthorizationUrl());
    
    page.setClickHandlers();
  });

  var successfullyRetrievedContact = false;
  contacts.onNewContact(function(contact) {
    if (!successfullyRetrievedContact) {
      $('.connect-google-header').hide();
      successfullyRetrievedContact = true;
    }
    var conversation = desksms.findConversation(contact.number);
    if (conversation == null)
      return;
    
    if (contact.photo)
      $("#contact-image-" + conversation.id).attr('src', contact.photo);
    $("#contact-name-" + conversation.id).text(contact.name).removeClass("hidden");
    $(".message-from-" + conversation.id).text(contact.name).removeClass("hidden");
  });
}

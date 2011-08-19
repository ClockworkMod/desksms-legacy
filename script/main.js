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
  
  this.confirmContactAction = function(conversationElement, question, yes, no, cb) {
    var dialog = $(conversationElement).find('.contact-action-confirm-dialog');
    dialog.show();
    setTimeout(function() {
      dialog.fadeOut(500);
    }, 5000);
    var yesElement = $(conversationElement).find('.contact-action-confirm-yes');
    var noElement = $(conversationElement).find('.contact-action-confirm-no');
    var questionElement = $(conversationElement).find('.contact-action-confirm-question');
    questionElement.text(question);
    yesElement.text(yes);
    noElement.text(no);
    yesElement.unbind('click');
    yesElement.click(function() {
      cb();
      dialog.fadeOut(200);
    });
    noElement.unbind('click');
    noElement.click(function() {
      dialog.fadeOut(200);
    });
  }
  
  this.setClickHandlers = function() {
    var contactText = $('.contact-text');
    contactText.unbind('click');
    var inputText = $('.contact-text-content');
    inputText.unbind('click');
    
    var clickHandler = function(event) {
      var conversationElement = $(event.target).parents('.conversation-template');
      var characterCountElement = conversationElement.find('.contact-text-character-count');
      characterCountElement.text("160 characters remaining (1)");

      var footer = conversationElement.find('.message-panel-footer');
      var hidden = conversationElement.find('.contact-text-container-hidden');

      hidden.show();
      var input = hidden.find('.contact-text-content');
      input.focus();

      //input.val('');
      input.unbind('blur');
      input.unbind('keypress');
      // there seems to be a race condition between the element
      // disappearing and another text box getting focus
      input.blur(function(event) {
        setTimeout(function() {
          var inputString = input.val();
          if (!inputString || inputString.length == 0) {
            hidden.hide();
          }
        }, 200);
      });
      
      input.keypress(function(event) {
        var inputString = input.val();
        var len = inputString.length;
        var pages = len / 160 + 1;
        var charactersLeft = 160 - (len % 160);
        var text = sprintf("%d characters remaining (%d)", charactersLeft, pages);
        characterCountElement.text(text);
        
        if (event.which != 13)
          return;
        var contents = input.val();
        if (contents == "")
          return;
        var conversationId = conversationElement.find('#conversation-id').text();
        var conversation = desksms.conversations[conversationId];
        var number = conversation.number;
        _gaq.push(['_trackEvent', 'Send', desksms.email]);
        desksms.sendSms(number, contents, function(err, data) {
          if (err) {
            console.log(err);
            return;
          }
          var date = data.data[0];
          var conversation = desksms.findConversation(number);
          var pendingMessage = {};
          pendingMessage.message = contents;
          pendingMessage.type = 'pending';
          pendingMessage.date = date;
          conversation.addMessage(pendingMessage);
          page.addMessageToConversation(pendingMessage);
        });
        
        input.val('');
      });
    };
    
    contactText.click(clickHandler);
    inputText.click(clickHandler);
    
    var contactCall = $('.contact-call');
    contactCall.unbind('click');
    
    contactCall.click(function(event) {
      var conversationElement = $(event.target).parents('.conversation-template');
      var conversationId = $(conversationElement).find('#conversation-id').text();
      var conversation = desksms.conversations[conversationId];
      var number = conversation.number;
      var displayName = page.getDisplayName(conversation);
      
      page.confirmContactAction(conversationElement, sprintf("Call %s on your phone?", displayName), "yes", "no", function() {
        var contentStatus = $('#content-status');
        contentStatus.show();
        contentStatus.text(sprintf('Dialing %s on your phone...', displayName));
        $('html, body').animate({
            scrollTop: 0
        }, 500);
        desksms.dialNumber(number, function(err, data) {
          if (err || data.error) {
            contentStatus.text(sprintf('Error dialing %s...', displayName));
          }

          contentStatus.fadeOut(10000, function() {
            contentStatus.hide();
            contentStatus.text('');
          });
        });
      });
    });
    
    var contactDelete = $('.contact-delete');
    contactDelete.unbind('click');
    contactDelete.click(function(event) {
      var conversationElement = $(event.target).parents('.conversation-template');
      var conversationId = $(conversationElement).find('#conversation-id').text();
      var conversation = desksms.conversations[conversationId];
      var number = conversation.number;
      var displayName = page.getDisplayName(conversation);
      
      page.confirmContactAction(conversationElement, sprintf("Delete conversation with %s?", displayName), "yes", "no", function() {
        desksms.deleteConversation(conversation);
        conversationElement.remove();
      });
    });
  }

  this.getDisplayName = function(conversation) {
    var contact = conversation.contact;
      var displayName;
    if (!contact) {
      contact = page.getCachedContact(conversation);
    }
    if (contact) {
      displayName = contact.name; 
    }
    else {
      displayName = conversation.number;
    }
    return displayName;
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
    if (message.type == 'pending')
      $(messageElement).find('.message-pending').removeClass('hidden');
    else
      $(messageElement).find('.message-pending').addClass('hidden');
    if (message.image) {
      var img = $('<img></img>').attr('src', sprintf("%s/%s/%s", desksms.IMAGE_URL, encodeURIComponent(message.number), encodeURIComponent(message.date)));
      $(messageElement).find(".message-content").append(img);
    }
    else {
      $(messageElement).find(".message-content").text(message.message);
    }
    $(messageElement).find(".message-date").text(dateFormat(new Date(message.date), "shortTime"));
    
    if (needsInsert) {
      if (messageContainer == null)
        messageContainer = $('#conversation-' + conversation.id).find('#contact-messages-internal');
        if (messageContainer == null || messageContainer.length == 0) {
          console.log('conversation not found.');
          return;
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
    var lastMessageDate = '';
    if (lastMessage)
      lastMessageDate = page.longAgo(lastMessage.date);

    $(conversationElement).find('.contact-number').text(conversation.number);
    $(conversationElement).find('.contact-last-message-date').text(lastMessageDate);
    $(conversationElement).find('#conversation-id').text(conversation.id);
    
    var conversationUnreadElement = $(conversationElement).find('.conversation-unread');
    conversationElement.unbind('click');
    conversationElement.click(function() {
      if (!conversation.read) {
        desksms.read();
        conversation.read = true;
      }
      conversationUnreadElement.fadeOut(500);
    });
    if (conversation.read)
      conversationUnreadElement.hide();
    else
      conversationUnreadElement.show();

    var contact = conversation.contact;
    var displayName = conversation.number;
    var contactImage = $(conversationElement).find('.contact-image').attr('id', 'contact-image-' + conversation.id);
    var contactNameElement = $(conversationElement).find(".contact-name").attr('id', 'contact-name-' + conversation.id);
    if (contact) {
      // save to cache if necessary
      if (!contact.cached) {
        contact.cached = true;
        page.cacheContact(conversation, contact, contactImage);
      }
    }
    else {
      // try load from cache
      conversation.contact = contact = page.getCachedContact(conversation);
    }

    if (conversation.number == 'DeskSMS') {
      contactImage.attr('src', 'images/desksms-small.png');
    }

    if (contact) {
      if (contact.photo) {
        //contactImage.attr('src', contact.photo);
        page.loadContactPhoto(contactImage, conversation, contact);
      }
      displayName = contact.name;
      $(conversationElement).find('.contact-number').show();
    }
    else {
      $(conversationElement).find('.contact-number').hide();
    }
    contactNameElement.text(displayName);

    return conversationElement;
  }
  
  this.hasMarkedRead = false;
  this.lastRefresh = 0;
  this.refreshInProgress = false;
  this.hasSuccessfullySynced = false;
  this.refreshInbox = function(initialSync) {
    if (page.refreshInProgress)
      return;
    if (page.hasSuccessfullySynced && initialSync)
      return;
    page.refreshInProgress = true;
    
    var lastRefresh = this.lastRefresh;
    var startRefresh = this.lastRefresh;
    if (lastRefresh == 0)
      lastRefresh = new Date().getTime() - 3 * 24 * 60 * 60 * 1000;
    
    console.log(lastRefresh);
    desksms.getSms({ after_date: lastRefresh }, function(err, data) {
      page.refreshInProgress = false;
      if (err) {
        console.log(err);
        return;
      }
      hasSuccessfullySynced = true;
      if (data.data == null) {
        console.log('no data returned from sms call');
        return;
      }
      if (data.data.length == 0)
        return;

      if (!page.hasMarkedRead) {
        page.hasMarkedRead = true;
        desksms.read();
      }

      var conversations = {};
      $.each(data.data, function(index, message) {
        conversations[message.conversation.id] = message.conversation;
        lastRefresh = Math.max(lastRefresh, message.date);
      });

      conversations = sorty(keys(conversations), function(key) {
        return conversations[key].latestMessageDate;
      });
      conversations = select(conversations, function(index, value) {
        return value;
      });

      $.each(conversations, function(index, conversation) {
        var convo = desksms.conversations[conversation];
        if (convo.number == 'DeskSMS')
          page.pongReceived = true;
        if (startRefresh == 0)
          convo.read = true;
        page.addConversationToTop(convo);
      });

      var messages = data.data;
      if (startRefresh == 0) {
        var contentStatus = $('#content-status');
        if (messages.length == 0) {
          contentStatus.show();
          contentStatus.text('You are successfully logged in, but no messages were found! Please verify the DeskSMS Android application is installed and syncing SMS on your phone.')
        }
        else {
          contentStatus.hide();
          contentStatus.text('')
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
      
      page.lastRefresh = Math.max(page.lastRefresh, lastRefresh);
    });
  }

  $(document).ready(function() {
    page.updateSound();

    (function() {
      var input = $('#contact-search');
      input.keypress(function(event) {
        if (event.which != 13)
          return;
          var conversation = desksms.startConversation(input.val());
          var conversationElement = $('#conversation-' + conversation.id);
          if (!conversationElement || conversationElement.length == 0) {
            page.addConversationToTop(conversation);
            page.setClickHandlers();
          }
          conversationElement = $('#conversation-' + conversation.id);
          var contactText = $(conversationElement).find('.contact-text');
          contactText.trigger('click');
      });
      input.autocomplete({
        minLength: 1,
        source: function(req, res) {
          if (contacts.list && contacts.list.length > 0) {
            var matches = filter(contacts.list, function(index, contact) {
              if (contact.name.toLowerCase().indexOf(req.term.toLowerCase()) > -1) {
                var entry;
                if (contact.type)
                  entry = sprintf("%s %s - %s", contact.name, contact.number, contact.type);
                else
                  entry = sprintf("%s %s", contact.name, contact.number);
                var searchResult = {
                  value: entry,
                  label: entry,
                  contact: contact
                };
                return searchResult;
              }
            });
            res(matches);
          }
        },
        select: function(event, ui) {
          var contact = ui.item.contact;
          setTimeout(function() {
            input.val(null);
          }, 200);

          var conversation = desksms.startConversation(contact.number);
          var conversationElement = $('#conversation-' + conversation.id);
          if (!conversationElement || conversationElement.length == 0) {
            page.addConversationToTop(conversation);
            page.setClickHandlers();
          }
          conversationElement = $('#conversation-' + conversation.id);
          var contactText = $(conversationElement).find('.contact-text');
          contactText.trigger('click');
        }
      });
    })();


    var query = $.query.load(window.location.hash);
    var extension = query.get('extension');

    // figure out who we are and if we're registered
    var whoamiLooper = function() {
      desksms.whoami(function(err, data) {
        var loginButton = $('#desksms-login');
        if (loginButton) {
          if (err || !data.email) {
            loginButton.attr('href', desksms.getLoginUrl());
            if (extension == 'firefox')
              setTimeout(whoamiLooper, 30000);
            return;
          }

          loginButton.attr('href', desksms.getLogoutUrl());
          loginButton.text("Logout");

          $('.login-hide').hide();
          $('.login-show').show();
          if (!data.registration_id) {
            $('#content-status-not-registered').show();
            if (extension == 'firefox')
              setTimeout(whoamiLooper, 30000);
            return;
          }
          //$('#content-status').show();
          
          page.refreshInbox(true);
          
          page.updateExpiration(data.subscription_expiration);

          var startPush = function() {
            if ($('#push-iframe')[0].contentWindow.startPush) {
              $('#push-iframe')[0].contentWindow.startPush(desksms.buyerId, function(err, data) {
                page.refreshInbox();
              });
            }
          }
          $('#push-iframe')[0].contentWindow.onPushReady = function() {
            startPush();
          }
          startPush();
        }
      });
    };
    whoamiLooper();
    page.refreshInbox(true);
    
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

    // cache the contact
    var key = 'contact-image-' + conversation.id;
    var photoElement = $("#contact-image-" + conversation.id);
    page.cacheContact(conversation, contact, photoElement);
    
    if (contact.photo)
      page.loadContactPhoto(photoElement, conversation, contact);
    $("#contact-name-" + conversation.id).text(contact.name);
    $(".message-from-" + conversation.id).text(contact.name);
  });
  
  this.updateExpiration = function(subscription_expiration) {
    daysLeft = subscription_expiration - new Date().getTime();
    daysLeft = daysLeft / 24 / 60 / 60 / 1000;
    daysLeft = Math.round(daysLeft);
    $('#account-status').text(sprintf("%d days remaining", daysLeft));
    $('#account-status').show();
    if (daysLeft < 14 || page.sandbox) {
      $('#buy-desksms').text(sprintf("%d days left. Extend now!", daysLeft));
      $('#buy-desksms-container').show();
    }
  }
  
  this.loadContactPhoto = function(photoElement, conversation, contact) {
    // if we don't have local cache, or this contact is from cache
    // just use the explicit url
    if (!window.localStorage || contact.fromCache) {
      photoElement.attr('src', contact.photo);
    }
    else {
      // if we are chrome, we can hook the image load to cache the contact image.
      // if not, we have to use the proxy.
      if (!page.isChrome()) {
        // use the proxy service to get a base64 encoded image in a jsonp payload
        jsonp(desksms.getCrossOriginImage(contact.photo), function(err, data) {
          if (err)
            return;
          var photo = 'data:image/png;base64,' + data.data;
          photoElement.attr('src', photo);
          var key = 'contact-' + conversation.id;
          var cachedContact = { name: contact.name, number: contact.number, numbersOnly: contact.numbersOnly, photo: photo };
          localStorage[key] = JSON.stringify(cachedContact);
        }, { alt: 'json'});
      }
      else {
        // do a cross origin request  on chrome.
        // chrome canvas and image can handle cross origin requests.
        photoElement[0].crossOrigin = '';
        photoElement.attr('src', desksms.getCrossOriginImage(contact.photo));
      }
    }
  }
  
  this.cachedContacts = {};
  this.getCachedContact = function(conversation) {
    var key = 'contact-' + conversation.id;
    var ret = this.cachedContacts[key];
    if (ret)
      return ret;
    try {
      ret = JSON.parse(localStorage[key]);
      // verify the cache still matches (in case the matching rules change, and the cache is old)
      if (!contacts.numbersMatch(ret.number, conversation.number))
        return null;
      ret.fromCache = true;
      this.cachedContacts[key] = ret;
      console.log('using cached contact');
      return ret;
    }
    catch(e) {
    }
    return null;
  }
  
  this.isChrome = function() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  }
  
  this.cacheContact = function(conversation, contact, photoElement) {
    if (!window.HTMLCanvasElement || !window.localStorage)
      return;
    
    var key = 'contact-' + conversation.id;
    console.log('cached contact ' + conversation.number);
    var cachedContact = { name: contact.name, number: contact.number, numbersOnly: contact.numbersOnly };
    // preserve the existing contact photo if we need it.
    if (!cachedContact.photo) {
      var existingCachedContact = page.getCachedContact(conversation);
      if (existingCachedContact)
        cachedContact.photo = existingCachedContact.photo;
    }
    localStorage[key] = JSON.stringify(cachedContact);
    // and let's hook the handler on this contact photo in case something gets loaded into it
    photoElement.unbind('load');
    
    // if we are chrome, we can hook the image load to cache the contact image.
    // if not, we have to use the proxy.
    if (!page.isChrome())
      return;
    
    photoElement.load(function() {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', photoElement.width());
      canvas.setAttribute('height', photoElement.height());
      var ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      var data = canvas.toDataURL();
      cachedContact.photo = data;
      localStorage[key] = JSON.stringify(cachedContact);
      console.log('cached contact photo ' + conversation.number);
    });
  }

  this.toggleSound = function() {
    if ($.cookie('play-sound')) {
      $.cookie('play-sound', null);
    }
    else {
      $('#notification-sound')[0].play();
      $.cookie('play-sound', true);
    }
    this.updateSound();
  }

  this.updateSound = function() {
    $('#sound-icon').attr('src', $.cookie('play-sound') ? 'images/sound_on.png' : 'images/sound_off.png');
  }

  this.sandbox = false;
  if (this.sandbox) {
    google.load('payments', '1.0', {
      'packages': ['sandbox_config']
    });
  }
  else {
    google.load('payments', '1.0', {
      'packages': ['production_config']
    });
  }
  
  this.purchaseOnMarket = function() {
    $('#buy-android').fadeIn(500);
  }
  
  this.purchaseOnGoogleCheckout = function() {
    $('#buy-dialog').dialog('close');
    var customPayload = { account: desksms.email };

    jsonp(sprintf('https://clockworkbilling.appspot.com/api/v1/order/koushd@gmail.com/desksms.subscription0?custom_payload=%s&buyer_id=%s&sandbox=%s', encodeURIComponent(JSON.stringify(customPayload)), desksms.buyerId, page.sandbox),
      function(err, data) {
        if (err)
          return;
        if (data.purchased) {
          alert("You've already purchased this!");
          return;
        }
        goog.payments.inapp.buy({
            'jwt': data.jwt,
            'success': function() {
              $('#buy-desksms-container').hide();
              // this is hidden, but we call this to force a server refresh of the subscription time.
              page.updateStatus();
            },
            'failure': function() {}
            });
      });
  }
  
  this.updateStatus = function() {
    desksms.status(function(err, data) {
      if (err)
        return;
      page.updateExpiration(data.subscription_expiration);
    });
  }

  this.purchase = function() {
    $('#account-status').hide()
    $('#buy-checkout-complete').hide();
    $('#buy-android').hide();
    $('#buy-dialog').dialog({ draggable: true, closeOnEscape: true, title: "Checkout Options:"});
    $(':focus').blur();
    page.updateStatus();
  }
  
  this.defaultTheme = function() {
    $.cookie('theme', null);
    window.location.reload();
  }
  
  this.metroDarkTheme = function() {
    $.cookie('theme', 'metro-dark');
    $.getScript('style/theme/metro_dark.js');
  }
  
  this.options = function() {
    $('#options-dialog').dialog({ draggable: true, closeOnEscape: true, title: "Options"});
  }
  
  if ($.cookie('theme') == 'metro-dark') {
    $.getScript('style/theme/metro_dark.js');
  }

  this.pongReceived = false;
  this.pong = function() {
    this.pongReceived = false;
    desksms.pong();
    var contentStatus = $('#content-status');
    contentStatus.show();
    contentStatus.text('Checking connection to phone...');
    contentStatus.fadeOut(9000, function() {
      contentStatus.hide();
      contentStatus.text('');
    });
    $('#options-dialog').dialog('close');
    setTimeout(function() {
      if (page.pongReceived)
        return;
      contentStatus.show();
      contentStatus.text('The push connection to the phone has failed!');
      contentStatus.fadeOut(10000, function() {
        contentStatus.hide();
        contentStatus.text('');
      });
    }, 10000);
  }
}

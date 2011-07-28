var page = new function() {
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
        }, 200)
      });
      
      input.keypress(function(event) {
        if(event.which != 13)
          return;
        console.log('enter' + Date());
      });
    });
  }
  
  this.addConversation = function(conversation) {
    var contentContainer = $('#content-container');
    var conversationTemplate = $('#conversation-template');
    var conversationElement = conversationTemplate.clone();
    
    var messageTemplate = $('#contact-message-template');
    
    var messageContainer = $(conversationElement).find('#contact-messages-internal');
    
    var messages = conversation.messages.slice(conversation.messages.length - 10, conversation.messages.length);
    
    $(conversationElement).find('.contact-name').text(conversation.number);
    $(conversationElement).find('.contact-number').text(conversation.number);
    
    var contact = contacts.findContact(conversation.number);
    var displayName = conversation.number;
    if (contact) {
      if (contact.photo) {
        $(conversationElement).find('.contact-image').attr('src', contact.photo);
      }
      displayName = contact.name;
      $(conversationElement).find(".contact-name").text(contact.name).removeClass("hidden");
    }
    else {
      $(conversationElement).find(".contact-name").addClass("hidden");
    }

    $.each(messages, function(index, message) {
      var messageElement = messageTemplate.clone();

      var date = new Date(message.date);
      messageElement.removeClass("hidden");
      //$(messageElement).find(".message-date").text(message.type == "incoming" ? "Me" : message.number);
      $(messageElement).find(".message-from").text(message.type == "incoming" ? displayName : "Me");
      $(messageElement).find(".message-content").text(message.message);
      messageContainer.append(messageElement);
    });
    
    conversationElement.removeClass("hidden");
    contentContainer.append(conversationElement);
  }
  
  this.refreshInbox = function() {
    desksms.getSms(null, function(err, data) {
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
}

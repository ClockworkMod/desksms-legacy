var notifications = new function() {
  this.showNotification = function(icon, title, message) {
    if (webkitNotifications) {
      console.log(webkitNotifications.checkPermission());
      if (webkitNotifications.checkPermission() != 0)
        return;
      var notification = webkitNotifications.createNotification(icon, title, message);
      notification.show();
    }
  }
  
  this.showMessageNotification = function(message) {
    var icon = 'images/contact.png';
    var displayName = message.number;
    var contact = message.conversation.contact;
    if (contact) {
      displayName = contact.name;
      icon = contact.photo;
    }
    
    var title = sprintf("SMS Received: %s", displayName);
    this.showNotification(icon, title, message.message);
  }
  
  if (webkitNotifications) {
    if (webkitNotifications.checkPermission() == 0)
      $('.enable-chrome-notifications').removeClass('hidden');
  }
}
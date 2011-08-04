var notifications = new function() {
  this.showNotification = function(icon, title, message) {
    var query = $.query.load(window.location.hash);
    var extension = query.get('extension');

    if (window.webkitNotifications) {
      console.log(webkitNotifications.checkPermission());
      if (webkitNotifications.checkPermission() != 0)
        return;
      var notification = webkitNotifications.createNotification(icon, title, message);
      notification.show();
    }
    else if (extension == 'firefox') {
      // firefox only shows badges
      var curCount = 0;
      var firefoxExtensionData = $('#firefox-extension-data');
      curCount = parseInt(firefoxExtensionData.text());
      if (isNaN(curCount))
        curCount = 0;
      curCount++;
      
      firefoxExtensionData.text(curCount);
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
  
  $(document).ready(function() {
    if (window.webkitNotifications) {
      if (webkitNotifications.checkPermission() != 0)
        $('.enable-chrome-notifications').removeClass('hidden');
    }
  });
  
  this.requestPermissions = function() {
    webkitNotifications.requestPermission(function() {
      $('.enable-chrome-notifications').hide();
    });
  }
}
var notifications = new function() {
  var query = null;
  var extension = null;

  this.showNotification = function(icon, title, message) {
    try {
      // play the sound notification
      $('#notification-sound')[0].play();
    }
    catch (e) {
      console.log(e);
    }

    if (window.webkitNotifications && !extension) {
      console.log(webkitNotifications.checkPermission());
      if (webkitNotifications.checkPermission() != 0)
        return;
      var notification = webkitNotifications.createNotification(icon, title, message);
      notification.show();
      setTimeout(function() {
        notification.cancel();
      }, 10000);
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
      if (contact.photo)
        icon = contact.photo;
    }
    
    var title = sprintf("SMS Received: %s", displayName);
    this.showNotification(icon, title, message.message);
  }
  
  $(document).ready(function() {
    query = $.query.load(window.location.hash);
    extension = query.get('extension');

    if (window.webkitNotifications && !extension) {
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
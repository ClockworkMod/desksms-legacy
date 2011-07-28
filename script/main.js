var page = new function() {
  this.refreshInbox = function() {
    desksms.getSms(null, function(err, data) {
      console.log(data);
      
      
      
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
  });
}

var googleContacts = new function() {
  this.getAuthorizationUrl = function() {
    /*
    var url = sprintf('https://www.google.com/accounts/AuthSubRequest?next=%s&scope=%s&session=1&secure=0',
                              encodeURIComponent(window.location.href.substring(0, window.location.href.length - window.location.search.length) + "#return=google"), encodeURIComponent('https://www.google.com/m8/feeds/'));
    */
    var url = 'https://accounts.google.com/o/oauth2/auth?client_id=%s&redirect_uri=%s&scope=%s&response_type=token';
    url = sprintf(url, '131828589063.apps.googleusercontent.com', encodeURIComponent(window.location.protocol + '//' + window.location.host + window.location.pathname), encodeURIComponent('https://www.google.com/m8/feeds/'));
    return url;
  }

  contacts.addProvider("google", googleContacts);

  $(document).ready(function() {
    var haveToken = function() {
      var token = $.cookie('google.access_token');
      
      if (!token)
        return;
      
      jsonp('https://www.google.com/m8/feeds/contacts/default/full?max-results=10000&alt=json', function(err, data) {
        if (err) {
          console.log(err);
          return;
        }
                  
        $.each(data.feed.entry, function(index, contact) {
          if (!contact['gd$phoneNumber'])
            return;
          //console.log(contact);
          var photoLink = null;
          $.each(contact.link, function(index, link) {
            if (link.rel == "http://schemas.google.com/contacts/2008/rel#photo")
              photoLink = link.href + "?oauth_token=" + encodeURIComponent(token);
          });
          $.each(contact['gd$phoneNumber'], function(index, phoneEntry) {
            var type = phoneEntry['rel'];
            if (type)
              type = type.substring(type.indexOf('#') + 1);
            else
              type = null
            
            var number = phoneEntry['$t'];
            var name = contact.title['$t'];
            
            var entry = { name: name, number: number, type: type };
            if (photoLink) {
              entry.photo = photoLink;
              //console.log(photoLink);
            }
            contacts.addContact(entry);
          });
        });
        
      },
      {oauth_token: token});
    }

    var query = $.query.load(window.location.hash);
    var access_token = query.get('access_token');
    if (access_token) {
      $.cookie('google.access_token', access_token);
      window.location.hash = '';
    }

    haveToken();
  });
}

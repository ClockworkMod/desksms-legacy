import oauth2 as oauth
import time
import urllib
import urllib2
import httplib2
import urlparse

# HOLY CRAP
# most of this example is just oauth setup.

# change this for your actual domain... anonymous is bad practice
consumer_key = 'anonymous'
consumer_secret = 'anonymous'

request_token_url = 'https://desksms.appspot.com/_ah/OAuthGetRequestToken'
access_token_url = 'https://desksms.appspot.com/_ah/OAuthGetAccessToken'
authorize_url = 'https://desksms.appspot.com/_ah/OAuthAuthorizeToken'

consumer = oauth.Consumer(consumer_key, consumer_secret)
client = oauth.Client(consumer)

# Step 1: Get a request token. This is a temporary token that is used for 
# having the user authorize an access token and to sign the request to obtain 
# said access token.

resp, content = client.request(request_token_url, "GET")
if resp['status'] != '200':
    raise Exception("Invalid response %s." % resp['status'])

request_token = dict(urlparse.parse_qsl(content))

print "Request Token:"
print "    - oauth_token        = %s" % request_token['oauth_token']
print "    - oauth_token_secret = %s" % request_token['oauth_token_secret']
print 

# Step 2: Redirect to the provider. Since this is a CLI script we do not 
# redirect. In a web application you would redirect the user to the URL
# below.

print "Go to the following link in your browser:"
print "%s?oauth_token=%s" % (authorize_url, request_token['oauth_token'])
print 

# After the user has granted access to you, the consumer, the provider will
# redirect you to whatever URL you have told them to redirect to. You can 
# usually define this in the oauth_callback argument as well.
accepted = 'n'
while accepted.lower() == 'n':
    accepted = raw_input('Have you authorized me? (y/n) ')

# Step 3: Once the consumer has redirected the user back to the oauth_callback
# URL you can request the access token the user has approved. You use the 
# request token to sign this request. After this is done you throw away the
# request token and use the access token returned. You should store this 
# access token somewhere safe, like a database, for future use.
token = oauth.Token(request_token['oauth_token'],
    request_token['oauth_token_secret'])
client = oauth.Client(consumer, token)

resp, content = client.request(access_token_url, "POST")
access_token = dict(urlparse.parse_qsl(content))

print "Access Token:"
print "    - oauth_token        = %s" % access_token['oauth_token']
print "    - oauth_token_secret = %s" % access_token['oauth_token_secret']
print
print "You may now access protected resources using the access tokens above." 
print


# Step 4: prepare the request with the access token
email = raw_input('Enter your email address ')

# Set the API endpoint 
url = "https://desksms.appspot.com/api/v1/user/%s/sms" % (email)

# Set the base oauth_* parameters along with any other parameters required
# for the API call.
params = {
    'oauth_version': "1.0",
    'oauth_nonce': oauth.generate_nonce(),
    'oauth_timestamp': int(time.time())
}

# Set up the retrieved access token
token = oauth.Token(key=access_token['oauth_token'], secret=access_token['oauth_token_secret'])

# Set our token/key parameters
params['oauth_token'] = token.key
params['oauth_consumer_key'] = consumer.key

# Create our request. Change method, etc. accordingly.
req = oauth.Request(method="GET", url=url, parameters=params)

# Sign the request.
signature_method = oauth.SignatureMethod_HMAC_SHA1()
req.sign_request(signature_method, consumer, token)





# ok, now we finally have all the oauth parameters that we need. Make the request.

# The request needs to have an Authorization header with the OAuth parameters, so set that up.
auth = 'OAuth realm="https://desksms.appspot.com/api/v1/user/%s/sms"' % (email)
needed_for_oauth = ['oauth_consumer_key', 'oauth_token', 'oauth_signature_method', 'oauth_signature', 'oauth_timestamp', 'oauth_nonce', 'oauth_version']
for key in req:
    auth += ",%s=%s" % (urllib.quote(str(key)), urllib.quote(str(req[key])))
    
client = httplib2.Http()
resp, content = client.request(url, headers = { 'Authorization': auth })
print resp
print content
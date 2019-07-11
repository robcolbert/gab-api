// gab-api.js
// Copyright (C) 2018 Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const request = require('request-promise-native');

class GabApiClient {

  constructor (config, oauth2, accessToken) {
    var client = this;
    client.config = config;
    client.oauth2 = oauth2;
    client.accessToken = oauth2.createAccessToken(accessToken);
  }

  /*
   * USER DETAILS
   */

  getLoggedInUserDetails ( ) {
    var client = this;
    return client.buildRequest('/v1/accounts/verify_credentials');
  }

  getUserDetails (username) {
    var client = this;
    return client.buildRequest(`/v1/account_by_username/${username}`);
  }

  /*
   * CREATING POSTS
   */

  createPost (post) {
    var client = this;
    return client.buildRequest(`/v1/statuses`, 'POST', post);
  }

  /*
   * UTILITY METHODS
   */

  buildRequest (requestUri, method = 'GET', body = undefined, formData = undefined) {
    var client = this;
    return client.oauth2
    .verifyAccessToken(client.accessToken)
    .then((accessToken) => {
      client.accessToken = accessToken;
      var requestOptions = {
        method: method,
        uri: `https://${client.config.apiHost}/api${requestUri}`,
        body: body,
        formData: formData,
        headers: {
          'Authorization': `${client.accessToken.token.token_type} ${client.accessToken.token.access_token}`
        },
        json: true
      };
      return request(requestOptions);
    });
  }
}

module.exports = (config, oauth2, accessToken) => {
  return new GabApiClient(config, oauth2, accessToken);
};
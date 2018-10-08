// hydra-gab-api.js
// Copyright (C) 2018 Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const simpleOauth2 = require('simple-oauth2');
const request = require('request-promise-native');

class GabApiClient {

  constructor (accessToken) {
    var client = this;
    client.accessToken = accessToken;
  }

  /*
   * USER DETAILS
   */

  getLoggedInUserDetails ( ) {
    var client = this;
    return request(client.buildRequest('/me'));
  }

  getUserDetails (username) {
    var client = this;
    return request(client.buildRequest(`/users/${username}`));
  }

  getUserFollowers (username, before = 0) {
    var client = this;
    return request(client.buildRequest(`/users/${username}/followers?before=${before}`));
  }

  getUserFollowing (username, before = 0) {
    var client = this;
    return request(client.buildRequest(`/users/${username}/following?before=${before}`));
  }

  /*
   * NOTIFICATIONS
   */

  getNotifications (before) {
    var client = this;
    var uri = `/notifications`;
    if (before) {
      uri += `?before=${before}`;
    }
    return request(client.buildRequest(uri));
  }

  /*
   * FEEDS
   */

  getUserFeed (username, before) {
    var client = this;
    var uri = `/users/${username}/feed`;
    if (before) {
      uri += `?before=${before}`;
    }
    return request(client.buildRequest(uri));
  }

  getMainFeed (before) {
    var client = this;
    var uri = `/feed`;
    if (before) {
      uri += `?before=${before}`;
    }
    return request(client.buildRequest(uri));
  }

  /*
   * POPULAR
   */

  getPopularFeed ( ) {
    var client = this;
    return request(client.buildRequest(`/popular/feed`));
  }

  getPopularUsers ( ) {
    var client = this;
    return request(client.buildRequest(`/popular/users`));
  }

  /*
   * ENGAGING WITH OTHER USERS
   */

  followUser (userId) {
    var client = this;
    return request(client.buildRequest(`/users/${userId}/follow`, 'POST'));
  }

  unfollowUser (userId) {
    var client = this;
    return request(client.buildRequest(`/users/${userId}/follow`, 'DELETE'));
  }

  /*
   * REACTING TO POSTS
   */

  postUpvote (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}/upvote`, 'POST'));
  }

  removeUpvote (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}/upvote`, 'DELETE'));
  }

  postDownvote (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}/downvote`, 'POST'));
  }

  removeDownvote (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}/downvote`, 'DELETE'));
  }

  postRepost (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}/repost`, 'POST'));
  }

  removeRepost (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}/repost`, 'DELETE'));
  }

  getPostDetails (postId) {
    var client = this;
    return request(client.buildRequest(`/posts/${postId}`));
  }

  /*
   * GROUPS
   */

  getPopularGroups ( ) {
    var client = this;
    return request(client.buildRequest('/groups'));
  }

  getGroupDetails (groupId) {
    var client = this;
    return request(client.buildRequest(`/groups/${groupId}`));
  }

  getGroupUsers (groupId, before = 0) {
    var client = this;
    var uri = `/groups/${groupId}/users`;
    if (before) {
      uri += `?before=${before}`;
    }
    return request(client.buildRequest(uri));
  }

  getGroupModerationLogs (groupId) {
    var client = this;
    return request(client.buildRequest(`/groups/${groupId}/moderation-logs`));
  }

  /*
   * CREATING POSTS
   */

  createPost (post) {
    var client = this;
    return request(client.buildRequest(`/posts`, 'POST', post));
  }

  /*
   * UTILITY METHODS
   */

  buildRequest (requestUri, method = 'GET', body = undefined) {
    var client = this;
    return {
      method: method,
      uri: `https://api.gab.com/v1.0${requestUri}`,
      body: body,
      headers: {
        'Authorization': `${client.accessToken.token_type} ${client.accessToken.access_token}`
      },
      json: true
    };
  }
}

/*
 * GAB API OAUTH2 ExpressJS Middleware
 */
module.onAuthorize = (req, res, next) => {
  const applicationScope = 'read engage-user engage-post write-post';

  /*
   * If being called with a ?code parameter, generate the OAUTH2 token using
   * the code.
   */
  if (req.query.code) {
    var tokenConfig = {
      code: req.query.code,
      redirect_uri: 'http://localhost:3000/user/connect/gab',
      scope: applicationScope,
      state: req.query.state
    };
    module.log.debug('oauth2.getToken', { token: tokenConfig });
    return module.oauth2.authorizationCode
    .getToken(tokenConfig)
    .then((result) => {
      const accessToken = module.oauth2.accessToken.create(result);
      module.log.debug('onAuthorize access token', {
        token: accessToken,
        state: req.query.state
      });
      return module.saveUserAccessToken(req.query.state, accessToken);
    })
    .then(( ) => {
      return res.redirect('/');
    })
    .catch((error) => {
      module.log.error('onAuthorize token error', { error: error });
      return next(error);
    });
  }

  if (req.query.error) {
    module.log.error('Hydra Gab API error', {
      error: req.query.error,
      msg: req.query.message,
      hint: req.query.hint,
      state: req.query.state
    });
    return next(new Error(req.query.message));
  }

  const authorizationUri = module.oauth2.authorizationCode.authorizeURL({
    redirect_uri: 'http://localhost:3000/user/connect/gab',
    scope: applicationScope,
    state: req.user._id.toString()
  });
  return res.redirect(authorizationUri);
};

module.verifyAccessToken = (userId, tokenObject) => {
  var accessToken = module.oauth2.accessToken.create(tokenObject.accessToken);
  if (!accessToken.expired()) {
    return Promise.resolve(accessToken.token.token);
  }
  module.log.debug('refreshing Gab Access Token', { userId: userId });
  return accessToken
  .refresh()
  .then((accessToken) => {
    return module.saveUserAccessToken(userId, accessToken);
  });
};

module.exports = (config) => {
  module.oauth2 = simpleOauth2.create({
    client: {
      id: config.clientId,
      secret: config.clientSecret
    },
    auth: {
      tokenHost: 'https://api.gab.com'
    }
  });
  module.saveUserAccessToken = config.saveUserAccessToken;

  return {
    authorize: module.onAuthorize,
    verifyAccessToken: module.verifyAccessToken,
    client: (accessToken) => { return new GabApiClient(accessToken); }
  };
};
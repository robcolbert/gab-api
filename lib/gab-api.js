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
    return client.buildRequest('/me');
  }

  getUserDetails (username) {
    var client = this;
    return client.buildRequest(`/users/${username}`);
  }

  getUserFollowers (username, before = 0) {
    var client = this;
    return client.buildRequest(`/users/${username}/followers?before=${before}`);
  }

  getUserFollowing (username, before = 0) {
    var client = this;
    return client.buildRequest(`/users/${username}/following?before=${before}`);
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
    return client.buildRequest(uri);
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
    return client.buildRequest(uri);
  }

  getMainFeed (before) {
    var client = this;
    var uri = `/feed`;
    if (before) {
      uri += `?before=${before}`;
    }
    return client.buildRequest(uri);
  }

  /*
   * POPULAR
   */

  getPopularFeed ( ) {
    var client = this;
    return client.buildRequest(`/popular/feed`);
  }

  getPopularUsers ( ) {
    var client = this;
    return client.buildRequest(`/popular/users`);
  }

  /*
   * ENGAGING WITH OTHER USERS
   */

  followUser (userId) {
    var client = this;
    return client.buildRequest(`/users/${userId}/follow`, 'POST');
  }

  unfollowUser (userId) {
    var client = this;
    return client.buildRequest(`/users/${userId}/follow`, 'DELETE');
  }

  /*
   * REACTING TO POSTS
   */

  postUpvote (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}/upvote`, 'POST');
  }

  removeUpvote (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}/upvote`, 'DELETE');
  }

  postDownvote (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}/downvote`, 'POST');
  }

  removeDownvote (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}/downvote`, 'DELETE');
  }

  postRepost (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}/repost`, 'POST');
  }

  removeRepost (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}/repost`, 'DELETE');
  }

  getPostDetails (postId) {
    var client = this;
    return client.buildRequest(`/posts/${postId}`);
  }

  /*
   * GROUPS
   */

  getPopularGroups ( ) {
    var client = this;
    return client.buildRequest('/groups');
  }

  getGroupDetails (groupId) {
    var client = this;
    return client.buildRequest(`/groups/${groupId}`);
  }

  getGroupUsers (groupId, before = 0) {
    var client = this;
    var uri = `/groups/${groupId}/users`;
    if (before) {
      uri += `?before=${before}`;
    }
    return client.buildRequest(uri);
  }

  getGroupModerationLogs (groupId) {
    var client = this;
    return client.buildRequest(`/groups/${groupId}/moderation-logs`);
  }

  /*
   * CREATING POSTS
   */

  createMediaAttachment (file) {
    var client = this;
    return client.buildRequest(`/media-attachments/images`, 'POST', undefined, {
      file: {
        value: file,
        options: {
          filename: 'gabameme.jpg',
          contentType: 'image/jpeg'
        }
      }
    });
  }

  createPost (post) {
    var client = this;
    return client.buildRequest(`/posts`, 'POST', post);
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
        uri: `https://api.gab.com/v1.0${requestUri}`,
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
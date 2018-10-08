// index.js
// Copyright (C) 2018 Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const gabapi = require('./lib/gab-api');

module.exports = (config) => {
  module.gab = gabapi(config);
  return {
    /*
     * ExpressJS Middleware
     */
    authorize: module.gab.authorize,
    /*
     * USER DETAILS
     */
    getLoggedInUserDetails: (req) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getLoggedInUserDetails();
      });
    },
    getUserDetails: (req, username) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getUserDetails(username);
      });
    },
    getUserFollowers: (req, username, before = 0) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getUserFollowers(username, before);
      });
    },
    getUserFollowing: (req, username, before = 0) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getUserFollowing(username, before);
      });
    },
    /*
     * NOTIFICATIONS
     */
    getNotifications: (req, before) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getNotifications(before);
      });
    },
    /*
     * FEEDS
     */
    getUserFeed: (req, username, before) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getUserFeed(username, before);
      });
    },
    getMainFeed: (req, before) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getMainFeed(before);
      });
    },
    /*
     * POPULAR
     */
    getPopularFeed: (req) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getPopularFeed();
      });
    },
    getPopularUsers: (req) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getPopularUsers();
      });
    },
    /*
     * ENGAGING WITH OTHER USERS
     */
    followUser: (req, userId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.followUser(userId);
      });
    },
    unfollowUser: (req, userId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.unfollowUser(userId);
      });
    },
    /*
     * REACTING TO POSTS
     */
    postUpvote: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.postUpvote(postId);
      });
    },
    removeUpvote: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.removeUpvote(postId);
      });
    },
    postDownvote: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.postDownvote(postId);
      });
    },
    removeDownvote: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.removeDownvote(postId);
      });
    },
    postRepost: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.postRepost(postId);
      });
    },
    removeRepost: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.removeRepost(postId);
      });
    },
    getPostDetails: (req, postId) => {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getPostDetails(postId);
      });
    },
    /*
     * GROUPS
     */
    getPopularGroups (req) {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getPopularGroups();
      });
    },

    getGroupDetails (req, groupId) {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getGroupDetails(groupId);
      });
    },

    getGroupUsers (req, groupId, before = 0) {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getGroupUsers(groupId, before);
      });
    },

    getGroupModerationLogs (req, groupId) {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.getGroupModerationLogs(groupId);
      });
    },

    /*
     * CREATING POSTS
     */

    createPost (req, post) {
      return module
      .getUserAccessToken(config, req)
      .then((accessToken) => {
        var client = module.gab.client(accessToken);
        return client.createPost(post);
      });
    }
  };
};

module.getUserAccessToken = (config, req) => {
  var userId = config.getUserIdFromRequest(req);
  return config
  .getUserAccessToken(userId)
  .then((tokenObject) => {
    return module.gab.verifyAccessToken(userId, tokenObject);
  });
};
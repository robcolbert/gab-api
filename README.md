# gab-api

[Gab.com](https://gab.com) API Client for ExpressJS on Node.js created by [robcolbert](https://gab.com/robcolbert).

## Installation

### NPM
    npm install --save gab-api

### Yarn
    yarn add gab-api

## Getting Started

### Defining the MongoDB GabAccessToken Model

The application is responsible for storign and retrieving Gab API access tokens on behalf of the calling user.

The examples in this README use MongoDB for storing and retrieving Gab Access and Refresh tokens.

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    var GabAccessTokenSchema = new Schema({
      user: { type: Schema.ObjectId, required: true, index: true, ref: 'User' },
      accessToken: {
        token_type: { type: String },
        expires_in: { type: Number },
        expires_at: { type: Date },
        access_token: { type: String },
        refresh_token: { type: String }
      }
    });

    mongoose.model('GabAccessToken', GabAccessTokenSchema);

### Initialize the Gab API Module

When initializing the Gab API Module, the application must provide the Client ID and Secret issued by Gab.com for your application. At Gab.com, go to `Settings` -> `Developer Apps` to configure your application and receive a Client ID and Secret for use with the Gab API.

    /*
     * Initialize the Gab API module
     */
    const gabapi = require('gab-api')({
      clientId: '########-####-####-####-############',
      clientSecret: '########################################',
      getUserIdFromRequest: (req) => {
        return req.user._id;
      },
      getUserAccessToken: (userId) => {
        module.log.debug('getGabAccessToken', { userId: userId });
        return GabAccessToken
        .findOne({ user: userId })
        .lean()
        .then((tokenObject) => {
          return module.gabapi.verifyAccessToken(userId, tokenObject);
        });
      },
      saveUserAccessToken: (userId, accessToken) => {
        return GabAccessToken
        .updateOne(
          { user: userId },
          {
            $set: {
              accessToken: accessToken
            }
          },
          {
            upsert: true
          }
        );
      };
    });

#### getUserIdFromRequest (req : Object) : UserID_Value

The application must provide a callback function that can extract it's concept of a User ID from an ExpressJS request object. The callback is passed the request object and returns the User ID value to be used when storing and retriving Gab.com Access Tokens for a user of the application.

#### saveUserAccessToken (userId : UserID_Value, accessToken : Object) : Promise

The application must provide a callback function that stores Gab.com Access Token objects keyed to an application User ID value. The callback must return a Promise that resolves when the token has been successfully stored to the application's database.

### Mount the Gab API OAUTH2 Authorize Route

OAUTH2 works by having a user request a URL on your server that redirects to a URL on Gab.com to request permissions for the scope(s) requested by your application. If the user authorizes your application, your server will receive a callback with an authorization code. Upon receiving the authorization code, your server must then issue a separate request for access and refresh tokens.

The Gab API module handles this for you using a standard ExpressJS middleware method named `authorize`. Simply choose the route at which you'd like to mount this middleware as shown:

    /*
     * Mount the Gab API OAUTH2 authorize route
     */    
    router.get('/connect-gab', gabapi.authorize);

Now, when the user navigates to https://yourserver.com/connect-gab, they will be redirected to Gab.com to request permissions for your application. And, if they authorize your app, this handler will accept their authorization code and generate an `accessToken` for the user. Your application must then store this `accessToken` and use it to initialize the `client` object per-request in the future.

## Making API Calls

Once a user is authorized and the application has stored their Gab.com access token, the module provides wrappers for every API offered by Gab.com. The application must pass the ExpressJS request object into each call so the module can automate the retrieval of the user's access token per request via the callbacks registered above.

### User Details

#### getLoggedInUserDetails (req : Object) : Promise

Retrieve details about the calling user.

    gabapi
    .getLoggedInUserDetails(req)
    .then((userDetails) => {
      console.log('user details', userDetails);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getUserDetails (req : Object, username : String) : Promise

Retrieve details about the specified user.

    gabapi
    .getUserDetails(req, 'robcolbert', 0)
    .then((userDetails) => {
      console.log('user details', userDetails);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getUserFollowers (req : Object, username : String, before : Number) : Promise

Retrieve the current list of followers for the specified user.

    gabapi
    .getUserFollowers(req, req.params.username, 0)
    .then((followers) => {
      console.log('user followers', followers);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getUserFollowing (req : Object, username : String, before : Number) : Promise

Retrieve the current list of users followed by the specified user.

    gabapi
    .getUserFollowing(req, req.params.username, 0)
    .then((following) => {
      console.log('user is following', following);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Notifications

#### getNotifications (req : Object, before : Number) : Promise

Retrieve the calling user's notifications.

    gabapi
    .getNotifications(req, 0)
    .then((notifications) => {
      console.log('notifications', notifications);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Feeds

#### getMainFeed (req : Object, before : Date) : Promise

Retrieves a list of posts from the calling user's main Gab.com feed.

    gabapi
    .getMainFeed(req, 0)
    .then((feed) => {
      console.log('main feed', feed);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getUserFeed (req : Object, username : String, before : Date) : Promise

Retrieves a list of posts from the specified user's Gab.com feed.

    gabapi
    .getUserFeed(req, 'robcolbert', 0)
    .then((feed) => {
      console.log('user feed', feed);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Popular

#### getPopularFeed (req : Object) : Promise

Retrieve the current list of popular posts on Gab.com.

    gabapi
    .getPopularFeed(req)
    .then((feed) => {
      console.log('popular feed', feed);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getPopularUsers (req : Object) : Promise

    gabapi
    .getPopularUsers(req)
    .then((users) => {
      console.log('popular users', users);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Engaging With Other Users

#### followUser (req : Object, userId : Number) : Promise

Follows the specified user on behalf of the calling user.

    gabapi
    .followUser(req, userId)
    .then((response) => {
      console.log('followUser response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### unfollowUser (req : Object, userId : Number) : Promise

Stops following the specified user on behalf of the calling user.

    gabapi
    .unfollowUser(req, userId)
    .then((response) => {
      console.log('unfollowUser response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Reacting to Posts

#### postUpvote (req : Object, postId : PostID_Value) : Promise

Upvote the specified post on behalf of the calling user.

    gabapi
    .postUpvote(req, postId)
    .then((response) => {
      console.log('post upvote response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### removeUpvote (req : Object, postId : PostID_Value) : Promise

    gabapi
    .removeUpvote(req, postId)
    .then((response) => {
      console.log('remove upvote response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### postDownvote (req : Object, postId : PostID_Value) : Promise

    gabapi
    .postDownvote(req, postId)
    .then((response) => {
      console.log('post downvote response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### removeDownvote (req : Object, postId : PostID_Value) : Promise

    gabapi
    .removeDownvote(req, postId)
    .then((response) => {
      console.log('remove downvote response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### postRepost (req : Object, postId : PostID_Value) : Promise

    gabapi
    .postRepost(req, postId)
    .then((response) => {
      console.log('repost response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### removeRepost (req : Object, postId : PostID_Value) : Promise

    gabapi
    .removeRepost(req, userId)
    .then((response) => {
      console.log('remove repost response', response);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getPostDetails (req : Object, postId : PostID_Value) : Promise

    gabapi
    .getPostDetails(req, postId)
    .then((postDetails) => {
      console.log('post details', postDetails);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Groups

#### getPopularGroups (req : Object) : Promise

    gabapi
    .getPopularGroups(req)
    .then((popularGroups) => {
      console.log('popular groups', popularGroups);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getGroupDetails (req : Object, groupId : GroupID_Value) : Promise

    gabapi
    .getGroupDetails(req, groupId)
    .then((groupDetails) => {
      console.log('group details', groupDetails);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getGroupUsers (req : Object, groupId : GroupID_Value, before : Number) : Promise

    gabapi
    .getGroupUsers(req, groupId)
    .then((groupUsers) => {
      console.log('group users', groupUsers);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

#### getGroupModerationLogs (req : Object, groupId : GroupID_Value) : Promise

    gabapi
    .getGroupModerationLogs(req, groupId)
    .then((logs) => {
      console.log('group moderation logs', logs);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

### Posts

#### createPost (req : Object, post : Object) : Promise

    gabapi
    .createPost(req, { body: 'This is a test post!' })
    .then((newPost) => {
      console.log('new post', newPost);
    })
    .catch((error) => {
      console.log('Gab.com API error', error);
    });

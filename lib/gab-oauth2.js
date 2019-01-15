// gab-oauth2.js
// Copyright (C) 2018 Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const simpleOauth2 = require('simple-oauth2');

module.exports = (config) => {
  var oauth2 = simpleOauth2.create({
    client: {
      id: config.clientId,
      secret: config.clientSecret
    },
    auth: {
      tokenHost: 'https://api.gab.com'
    }
  });

  function authorize (req, res, next) {
    var workingSet = { };

    /*
     * If being called with a ?code parameter, generate the OAUTH2 token using
     * the code.
     */
    if (req.query.code) {
      var tokenConfig = {
        code: req.query.code,
        redirect_uri: config.authorizeUri,
        scope: config.scopes,
        state: req.query.state
      };
      return oauth2.authorizationCode
      .getToken(tokenConfig)
      .then((result) => {
        workingSet.accessToken = oauth2.accessToken.create(result);
        return config.saveUserAccessToken(req, workingSet.accessToken);
      })
      .then(( ) => {
        return res.redirect(config.redirectUri);
      })
      .catch((error) => {
        return next(error);
      });
    }

    /*
     * If being called with an ?error parameter, report the error and abort
     * further processing.
     */
    if (req.query.error) {
      return next(new Error(req.query.message));
    }

    /*
     * Start the user authorization procedure. This should call back to this
     * same URL with either a ?code parameter or an ?error parameter.
     */
    var authOptions = {
      redirect_uri: config.authorizeUri,
      scope: config.scopes
    };
    if (req.query && req.query.state) {
      authOptions.state = req.query.state;
    }
    const authorizationUri = oauth2.authorizationCode.authorizeURL(authOptions);
    return res.redirect(authorizationUri);
  }

  function verifyAccessToken (accessToken) {
    if (!accessToken.expired()) {
      return Promise.resolve(accessToken);
    }
    return accessToken.refresh();
  }

  return {
    authorize: authorize,
    createAccessToken: (accessToken) => {
      return oauth2.accessToken.create(accessToken);
    },
    verifyAccessToken: verifyAccessToken
  };
};
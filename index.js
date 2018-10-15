// index.js
// Copyright (C) 2018 Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const gabapi = require('./lib/gab-api');
const gabOauth2 = require('./lib/gab-oauth2');

module.exports = (config) => {
  var oauth2 = gabOauth2(config);
  return {
    /*
     * GAB API OAUTH2 ExpressJS Middleware
     */
    authorize: oauth2.authorize,
    client: (accessToken) => { return gabapi(config, oauth2, accessToken); }
  };
};

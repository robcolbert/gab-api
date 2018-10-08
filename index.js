// index.js
// Copyright (C) 2018 Rob Colbert <rob.colbert@openplatform.us>
// License: MIT

'use strict';

const gabapi = require('./lib/gab-api');

module.exports = (config) => {
  var gab = gabapi(config);
  return {
    authorize: gab.authorize,
    verifyAccessToken: gab.verifyAccessToken,
    client: gab.client
  };
};
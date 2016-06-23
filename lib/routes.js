var path = require('path');
var Router = require('express').Router;

/**
 * Mount routers on versioned paths and a version catchall middleware.
 *
 * @param {string} baseRoutePath
 *   The base path to use when requiring sub routers.
 * @param {array} supportedVersions
 *   An array of supported version strings to mount.
 *
 * @return {array}
 *   An array of middlewares to mount.
 *
 * @throws {Error}
 *   Thrown if there was a problem mounting a route. An additional errors
 *   property will be populated with the specific error that was thrown.
 */
module.exports = function (baseRoutePath, supportedVersions) {
  var errors = [];
  var routes = {};
  var wares = [];

  if (!Array.isArray(supportedVersions) || supportedVersions.length === 0) {
    throw new Error('You must define at least one supported version.');
  }

  supportedVersions.forEach(function (version) {
    var routeName = path.join(baseRoutePath, version);
    try {
      routes[version] = require(routeName);
      var vRoute = new Router();
      vRoute.use('/' + version, routes[version]);
      wares.push(vRoute);
    }
    catch (e) {
      errors.push({
        message: 'Unsupported route loaded: ' + routeName,
        error: e
      });
    }
  });

  wares.push(function (req, res, next) {
    if (req.version && routes[req.version]) {
      return routes[req.version](req, res, next);
    }

    return next();
  });

  if (errors.length) {
    var e = new Error('One or more unsupported routes was loaded.');
    e.errors = errors;
    throw e;
  }

  return wares;
};


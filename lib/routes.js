'use strict';

const path = require('path');
const Router = require('express').Router;

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
module.exports = (baseRoutePath, supportedVersions) => {
  const errors = [];
  const routes = {};
  const wares = [];

  if (!Array.isArray(supportedVersions) || supportedVersions.length === 0) {
    throw new Error('You must define at least one supported version.');
  }

  supportedVersions.forEach((version) => {
    const routeName = path.join(baseRoutePath, version);
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      routes[version] = require(routeName);
      const vRoute = new Router();
      vRoute.use(`/${version}`, routes[version]);
      wares.push(vRoute);
    }
    catch (e) {
      errors.push({
        message: `Unsupported route loaded: ${routeName}`,
        error: e,
      });
    }
  });

  wares.push((req, res, next) => {
    if (req.version && routes[req.version]) {
      return routes[req.version](req, res, next);
    }
    else if (req.origVersion && routes[req.origVersion]) {
      return routes[req.origVersion](req, res, next);
    }

    return next();
  });

  if (errors.length) {
    const e = new Error('One or more unsupported routes was loaded.');
    e.errors = errors;
    throw e;
  }

  return wares;
};


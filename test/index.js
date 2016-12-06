'use strict';

const express = require('express');
const path = require('path');
const request = require('supertest');
const requestVersion = require('express-request-version');
const versionRoutes = require('../');

module.exports = {
  noVersionsThrowsError(test) {
    test.expect(2);

    test.throws(() => {
      versionRoutes(__dirname);
    });

    test.throws(() => {
      versionRoutes(__dirname, 'v1');
    });

    test.done();
  },

  unsupportedRouteLoaded(test) {
    test.expect(1);

    test.throws(() => {
      versionRoutes(path.join(__dirname, 'routes'), ['v2']);
    });

    test.done();
  },

  mountVersionedRoute: {
    setUp(cb) {
      const app = this.app = express();
      const supportedVersions = ['v1.0.0'];
      app.use(requestVersion.setBySemverPath(supportedVersions));
      app.use(versionRoutes(path.join(__dirname, 'routes'), supportedVersions));
      app.use((req, res) => res.status(404).end());
      cb();
    },
    exactVersion(test) {
      test.expect(2);

      request(this.app).get('/v1.0.0/users')
        .end((err, res) => {
          test.equal(res.statusCode, 200, 'Unexpected status code.');
          test.equal(res.body.version, 'v1.0.0', 'Route not mounted correctly.');
          test.done();
        });
    },
    missingVersion(test) {
      test.expect(1);

      request(this.app).get('/v2.0.0/users')
        .end((err, res) => {
          test.equal(res.statusCode, 404, 'Unexpected status code.');
          test.done();
        });
    },
  },
};


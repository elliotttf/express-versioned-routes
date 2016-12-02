'use strict';

const path = require('path');
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

  mountVersionedRoute(test) {
    test.expect(6);

    const wares = versionRoutes(path.join(__dirname, 'routes'), ['v1']);

    test.equal(wares.length, 2, 'Subrouter not mounted correctly.');

    test.equal(
      wares[0].stack[0].regexp.toString(),
      /^\/v1\/?(?=\/|$)/i.toString(),
      'Version path not mounted.');

    wares[1]({}, {}, () => {
      test.ok(true, 'Unversioned request passes to next.');
      wares[1]({ version: 'v2' }, {}, () => {
        test.ok(true, 'Mismatched version passes to next.');
        wares[1]({ version: 'v1' }, {}, () => {
          test.ok(true, 'Versioned route handled.');
          wares[1]({ version: 'v1.0.0', origVersion: 'v1' }, {}, () => {
            test.ok(true, 'Orig version route handled.');
            test.done();
          });
        });
      });
    });
  },
};


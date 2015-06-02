var path = require('path');
var versionRoutes = require('../');

module.exports = {
  noVersionsThrowsError: function (test) {
    test.expect(2);

    test.throws(function () {
      versionRoutes(__dirname);
    });

    test.throws(function () {
      versionRoutes(__dirname, 'v1');
    });

    test.done();
  },

  unsupportedRouteLoaded: function (test) {
    test.expect(1);

    test.throws(function () {
      versionRoutes(path.join(__dirname, 'routes'), ['v2']);
    });

    test.done();
  },

  mountVersionedRoute: function (test) {
    test.expect(5);

    var wares = versionRoutes(path.join(__dirname, 'routes'), ['v1']);

    test.equal(wares.length, 2, 'Subrouter not mounted correctly.');

    test.equal(
      wares[0].stack[0].regexp.toString(),
      /^\/v1\/?(?=\/|$)/i.toString(),
      'Version path not mounted.'
    );

    wares[1]({}, {}, function () {
      test.ok(true, 'Unversioned request passes to next.');
      wares[1]({ version: 'v2' }, {}, function () {
        test.ok(true, 'Mismatched version passes to next.');
        wares[1]({ version: 'v1' }, {}, function () {
          test.ok(true, 'Versioned route handled.');
          test.done();
        });
      });
    });
  }
};


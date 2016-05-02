Package.describe({
  name: 'sewdn:collection-behaviours',
  summary: 'Extends Mongo.Collection with behaviour patterns using matb33:collection-hooks',
  version: '0.2.0',
  git: 'https://github.com/Sewdn/meteor-collection-behaviours.git'
});

var both = ['client', 'server'];

Package.onUse = Package.onUse || Package.on_use;    // backwards-compat
Package.onTest = Package.onTest || Package.on_test; // backwards-compat

Package.onUse(function (api, where) {
  api.addFiles = api.addFiles || api.add_files;     // backwards-compat

  if (api.versionsFrom) {
    api.versionsFrom('METEOR@0.9.4');
    api.use([
      'mongo',
      'underscore',
      'matb33:collection-hooks@0.7.6'
    ], both);
  } else {
    api.use([
      'mongo-livedata',
      'underscore',
      'collection-hooks'
    ], both);
  }

  api.addFiles([
      'collection-behaviours.js',
      'behaviours/timestampable.js',
      'behaviours/softRemovable.js',
      'behaviours/loggable.js',
      'behaviours/autoIncrementable.js',
      'behaviours/sortable.js',
      'behaviours/trackable.js'
  ], both);

  api.export('CollectionBehaviours');

});

Package.onTest(function(api) {
  api.addFiles = api.addFiles || api.add_files;     // backwards-compat

  api.use([
    'urbanetic:utility@1.2.0',
    'coffeescript',
    'mongo',
    'minimongo',
    'tinytest',
    'test-helpers',
    'underscore',
    'peterellisjones:describe',
    'sewdn:collection-behaviours'
  ]);

  api.addFiles([
    'tests/setup.coffee',
    'tests/collectionsSpec.coffee',
    'tests/softRemovableSpec.coffee'
  ]);
});

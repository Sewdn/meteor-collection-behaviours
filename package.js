Package.describe({
  summary: "Extends Meteor.Collection with behaviour patterns using CollectionHooks",
  version: "0.1.5",
  git: "https://github.com/Sewdn/meteor-collection-behaviours.git"
});

var both = ["client", "server"];

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.use([
    "underscore",
    "matb33:collection-hooks"
  ], both);

  api.add_files([
      "collection-behaviours.js",
      "behaviours/timestampable.js",
      "behaviours/softRemovable.js",
      "behaviours/loggable.js",
      "behaviours/autoIncrementable.js",
      "behaviours/sortable.js",
      "behaviours/trackable.js"
  ], both);

  api.export("CollectionBehaviours");
});

Package.on_test(function (api) {
  /*
  api.use([
    "collection-behaviours",
    "underscore",
    "accounts-base",
    "accounts-password",
    "tinytest",
    "test-helpers"
  ], both);
*/
});

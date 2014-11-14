Package.describe({
  summary: "Extends Meteor.Collection with behaviour patterns using CollectionHooks",
  "version": "0.2.0",
  "git": "https://github.com/Sewdn/meteor-collection-behaviours.git",
  "name": "meteor-collection-behaviours"
});

var both = ["client", "server"];

Package.on_use(function (api, where) {
  if(api.versionsFrom) {
    api.versionsFrom('METEOR@0.9.0');
  }
  api.use([
    "underscore",
    "mongo-livedata",
    "matb33:collection-hooks@0.7.6"
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
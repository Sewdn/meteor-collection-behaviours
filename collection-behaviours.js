var constructor = Meteor.Collection;

CollectionBehaviours = {};

CollectionBehaviours.extendCollectionInstance = function (self) {
  self.timestampable = function(){
    self.before.insert(function (userId, doc) {
      doc.createdAt = Date.now();
    });
    self.before.update(function (userId, doc, fieldNames, modifier, options) {
      modifier.$set.updatedAt = Date.now();
    });
  };
  self.softDeletable = function(){
    self.before.remove(function (userId, doc) {
      self.update({_id: doc._id}, {$set: {removed: true, removedAt: Date.now()}});
      return false;
    });
    self.before.find(function (userId, selector, options) {
      selector.removed = {$exists: false};
    });
    self.before.findOne(function (userId, selector, options) {
      selector.removed = {$exists: false};
    });
    self.unRemove = function(selector){
      //TODO
      self.update(selector, {$set: {removed: false, unRemovedAt: Date.now()}});
    };
  };
  self.loggable = function(){
    self.before.update(function (userId, doc, fieldNames, modifier, options) {
      if(!modifier.$push){
        modifier.$push = {};
      }
      console.log(_.omit(modifier, '$push', 'updatedAt'));
      //modifier.$push.logs = _.omit(modifier, '$push.logs', 'updatedAt');
    });
  };
};

Meteor.Collection = function () {
  var ret = constructor.apply(this, arguments);
  CollectionBehaviours.extendCollectionInstance(this);
  return ret;
};

Meteor.Collection.prototype = Object.create(constructor.prototype);

for (var func in constructor) {
  if (constructor.hasOwnProperty(func)) {
    Meteor.Collection[func] = constructor[func];
  }
}
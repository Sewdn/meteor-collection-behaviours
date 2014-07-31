CollectionBehaviours.defineBehaviour('softRemovable', function(getTransform, args){
  var self = this;
  self.before.remove(function (userId, doc) {
    self.update({_id: doc._id}, {$set: {removed: true, removedAt: Date.now()}});
    //check if after remove hooks exist
    _.each(self._hookAspects.remove.after, function(after){
      if(after.aspect)
        after.aspect.call(self, userId, doc);
    });
    return false;
  });
  self.before.find(function (userId, selector, options) {
    if (typeof selector === 'undefined')
      selector = {}
    if(typeof selector.removed === 'undefined')
      selector.removed = {$exists: false};
  });
  self.before.findOne(function (userId, selector, options) {
    if (typeof selector === 'undefined')
      selector = {}
    if(typeof selector.removed === 'undefined')
      selector.removed = {$exists: false};
  });
  self.unRemove = function(selector){
    //TODO
    self.update(selector, {$unset: {removed: true}, $set: {unRemovedAt: Date.now()}});
  };
});

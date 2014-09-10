CollectionBehaviours.defineBehaviour('softRemovable', function(getTransform, args){
  var self = this;
  self.before.remove(function (userId, doc) {
    self.update({_id: doc._id}, {$set: {removed: true, removedAt: new Date()}});
    // check if after remove hooks exist
    // _.each(self._hookAspects.remove.after, function(after){
    //   if(after.aspect)
    //     after.aspect.call(self, userId, doc);
    // });
    // ! hack to bypass actual removal but dont bypass callback functions and after aspects
    // because of https://github.com/matb33/meteor-collection-hooks/blob/master/remove.js#L27
    return 0;
  });
  self.before.find(function (userId, selector, options) {
    if(selector && typeof selector.removed === 'undefined')
      selector.removed = {$exists: false};
  });
  self.before.findOne(function (userId, selector, options) {
    if(selector && typeof selector.removed === 'undefined')
      selector.removed = {$exists: false};
  });
  self.unRemove = function(selector){
    //TODO
    self.update(selector, {$unset: {removed: true}, $set: {unRemovedAt: Date.now()}});
  };
});

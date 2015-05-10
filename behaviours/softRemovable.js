CollectionBehaviours.defineBehaviour('softRemovable', function(getTransform, args){
  var self = this,
      method = 'softRemovable_' + this._name;
  // server method to by-pass "can only remove by ID" on the client
  if (Meteor.isServer) {
    var methods = {};
    methods[method] = function(selector) {
      return self.unRemove(selector);
    };
    Meteor.methods(methods);
  }

  self.before.remove(function (userId, doc) {
    self.update({_id: doc._id}, {$set: {removed: true, removedAt: new Date()}});
    // check if after remove hooks exist
    // _.each(self._hookAspects.remove.after, function(after){
    //   if(after.aspect)
    //     after.aspect.call(self, userId, doc);
    // });
    // ! hack to bypass actual removal but don't bypass callback functions and after aspects
    // because of https://github.com/matb33/meteor-collection-hooks/blob/master/remove.js#L27
    
    // TODO(aramk) Unsure why the remove is cancelled - it could be a race condition caused by the
    // update above. Might be safer to run the after hooks manually and return false.
  });

  function sanitizeSelector(selector) {
    if (typeof selector === 'string') {
      selector = {_id: selector};
    }
    selector = selector || {};
    if (typeof selector.removed === 'undefined') {
      // Accepts removed being `false` or not existing.
      selector.removed = {$ne: true};
    }
    return selector;
  }

  function findHook(userId, selector, options) {
    // Standardize the selector into an object and re-assign the original selector in the hook
    // context to ensure the "removed" field can be applied by default.
    this.args[0] = sanitizeSelector(selector);
  }

  self.before.find(findHook);
  self.before.findOne(findHook);

  self.unRemove = function(selector, callback) {
    // Typically we won't be publishing removed documents to the client (since .find() will filter
    // them out), so we run the logic on the server.
    if (_.isString(selector)) selector = { _id: selector };
    selector.removed = true;
    if (Meteor.isClient) {
      Meteor.call(method, selector, callback);
    } else {
      var result = self.update(selector, {
        $unset: {removed: true},
        $set: {unRemovedAt: new Date()}
      });
      callback && callback(null, result);
      return result;
    }
  };
});

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
    return 0;
  });

  function sanitizeSelector(selector) {
    if (selector && typeof selector.removed === 'undefined') {
      selector.removed = {$exists: false};
    }
  }

  function find(userId, selector, options) {
    sanitizeSelector(selector);
  }

  self.before.find(find);
  self.before.findOne(find);

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

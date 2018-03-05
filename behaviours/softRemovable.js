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

  self.after.remove(function (userId, doc) {
    var newDoc = _.extend(doc, {removed: true, removedAt: new Date()});
    // Insert a soft-removed copy of the document with the same ID and the removed flags, but only
    // on the server to avoid duplicates on the client. Since we don't publish removed documents,
    // this should have no consequence for the client.
    if (Meteor.isServer) {
      // Avoid triggering insert hooks with the removed document.
      self.direct.insert(newDoc);
    }
  });

  function sanitizeSelector(selector) {
    if (_.isString(selector)) selector = {_id: selector};
    selector = selector || {};
    // Avoid modifiying the original selector, since it may be used for other queries.
    selector = _.clone(selector);
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

  // Add support for a collection.after.unRemove hook.
  // TODO(aramk) Too tedious to use CollectionHooks.defineAdvice() for now, so we cannot remove
  // a hook once it's added yet.

  var hookCallbacks = [];
  self.after.unRemove = function(callback) {
    hookCallbacks.push(callback);
  };
  
  function afterUnRemove(userId, doc, fieldNames, modifier, options) {
    var args = arguments;
    var $unset = modifier.$unset;
    if ($unset && $unset.removed !== undefined) {
      _.each(hookCallbacks, function(callback) { callback.apply(this, args) }, this);
    }
  }

  self.after.update(afterUnRemove);

});

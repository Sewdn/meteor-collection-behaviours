CollectionBehaviours.defineBehaviour('loggable', function(getTransform, args){
  var self = this;
  self.before.update(function (userId, doc, fieldNames, modifier, options) {
    if(!modifier.$push){
      modifier.$push = {};
    }
    //console.log(_.omit(modifier, '$push', 'updatedAt'));
    //modifier.$push.logs = _.omit(modifier, '$push.logs', 'updatedAt');
  });
});

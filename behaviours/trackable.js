CollectionBehaviours.defineBehaviour('trackable', function(getTransform, args){
  var self = this,
    fields = _.isArray(args[0]) ? args[0] : args;
  self.before.update(function (userId, doc, fieldNames, modifier, options) {
    //check if tracked field is being modified
    _.each(_.intersection(fields, fieldNames), function(field){
      if(doc[field]){
        if(!modifier.$push)
          modifier.$push = {};
        track = {trackedAt: Date.now()};
        track[field] = doc[field];
        modifier.$push[field+"Track"] = track;
      }
    });
  });
});
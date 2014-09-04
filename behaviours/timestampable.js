CollectionBehaviours.defineBehaviour('timestampable', function(getTransform, args){
  var self = this;
  self.before.insert(function (userId, doc) {
    doc.createdAt = new Date();
  });
  self.before.update(function (userId, doc, fieldNames, modifier, options) {
    if(!modifier.$set)
      modifier.$set = {};
    modifier.$set.updatedAt = new Date();
  });
});

CollectionBehaviours.defineBehaviour('timestampable', function(getTransform, args){
  var self = this;
  self.before.insert(function (userId, doc) {
    doc.createdAt = Date.now();
  });
  self.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set.updatedAt = Date.now();
  });
});
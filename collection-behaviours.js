var behaviours = {};

CollectionBehaviours = {};

CollectionBehaviours.defineBehaviour = function (name, method) {
  behaviours[name] = method;
};

CollectionBehaviours.extendCollectionInstance = function (self) {
  // Wrap mutator methods, letting the defined advice do the work
  //var collection = Meteor.isClient ? self : self._collection;
  _.each(behaviours, function (behaviour, method) {
    self[method] = function () {
      return behaviour.call(self,
        function (doc) {
          return  _.isFunction(self._transform)
                  ? function (d) {
                    var dd = d || doc;
                    //make sure only valid docs get transformed
                    if(!dd._id)
                      return dd;
                    return self._transform(dd);
                  }
                  : function (d) { return d || doc; };
        },
        _.toArray(arguments)
      );
    };
  });
};

Meteor.addCollectionExtension(function () {
  CollectionBehaviours.extendCollectionInstance(this);
});
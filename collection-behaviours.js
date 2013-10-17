var constructor = Meteor.Collection;
var behaviours = {};

CollectionBehaviours = {};

CollectionBehaviours.defineBehaviour = function (name, method) {
  behaviours[name] = method;
};

CollectionBehaviours.extendCollectionInstance = function (self) {
  _.each(behaviours, function (behaviour, name) {
    self[name] = behaviour;
  });
  // Wrap mutator methods, letting the defined advice do the work
  _.each(behaviours, function (behaviour, method) {
    var _super = Meteor.isClient ? self[method] : self._collection[method];

    (Meteor.isClient ? self : self._collection)[method] = function () {
      return behaviour.call(self,
        function (doc) {
          return  _.isFunction(self._transform)
                  ? function (d) { return self._transform(d || doc); }
                  : function (d) { return d || doc; };
        },
        _.toArray(arguments)
      );
    };
  });
};

Meteor.Collection = function () {
  var ret = constructor.apply(this, arguments);
  CollectionBehaviours.extendCollectionInstance(this);
  return ret;
};

Meteor.Collection.prototype = Object.create(constructor.prototype);

for (var func in constructor) {
  if (constructor.hasOwnProperty(func)) {
    Meteor.Collection[func] = constructor[func];
  }
}
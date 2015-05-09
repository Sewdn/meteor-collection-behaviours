// var constructor = Mongo.Collection;
var behaviours = {};

CollectionBehaviours = {

  defineBehaviour: function (name, method) {
    behaviours[name] = method;
  },

  extendCollectionInstance: function (self) {
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
  },

  // Borrowed from CollectionHooks.
  wrapCollection: function (ns, as, callback) {
    // if (!as._CollectionConstructor) as._CollectionConstructor = as.Collection;
    if (!as._CollectionPrototype) as._CollectionPrototype = new as.Collection(null);

    var constructor = as.Collection;// as._CollectionConstructor;
    // var proto = new as.Collection(null)
    var proto = as._CollectionPrototype;
    console.log('constructor', constructor);
    console.log('proto', proto);

    ns.Collection = function () {
      var ret = constructor.apply(this, arguments);
      callback && callback(this, arguments);
      return ret;
    };

    // NOTE: Prototype must be Mongo.Collection to ensure instanceof check succeeds in the original
    // constructor.
    ns.Collection.prototype = proto;

    for (var prop in constructor) {
      if (constructor.hasOwnProperty(prop)) {
        ns.Collection[prop] = constructor[prop];
      }
    }
  }

};

function extend(collection) {
  CollectionBehaviours.extendCollectionInstance(collection);
}
if (typeof Mongo !== "undefined") {
  CollectionBehaviours.wrapCollection(Meteor, Mongo, extend);
  CollectionBehaviours.wrapCollection(Mongo, Mongo, extend);
} else {
  CollectionBehaviours.wrapCollection(Meteor, Meteor, extend);
}

// Mongo.Collection = function () {
//   var ret = constructor.apply(this, arguments);
//   CollectionBehaviours.extendCollectionInstance(this);
//   return ret;
// };

// Mongo.Collection.prototype = Object.create(constructor.prototype);

// for (var func in constructor) {
//   if (constructor.hasOwnProperty(func)) {
//     Mongo.Collection[func] = constructor[func];
//   }
// }
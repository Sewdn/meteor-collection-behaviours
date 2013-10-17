var collections = {};
CollectionBehaviours.defineBehaviour('sortable', function(getTransform, args){
  var self = this,
      field = args[0];

  self.autoIncrementable(field);
  collections[self._name] = self;

  var o = getTransform()({}).__proto__;
  //TODO: if no transform is set, make one

  self.before.find(function (userId, selector, options) {
    //check if custom ordering has been set, if not order by sortable value (asc)
    if(!options.sort){
      options.sort = {};
      options.sort[field] = 1;
    }
  });
  _.extend(o, {
    up: function(amount){
      if(!amount){
        amount = 1;
      }
      if(amount > 0){
        amount *= -1;
      }
      return this.move(amount);
    },
    down: function(amount){
      if(!amount){
        amount = 1;
      }
      if(amount < 0){
        amount *= -1;
      }
      return this.move(amount);
    },
    move: function(amount){
      if(amount === 0)
        return;
      Meteor.call('sortableMove', self._name, field, this._id, amount);
    }
  });
});

Meteor.methods({
  sortableMove : function (collection, field, docId, amount) {
    var self = collections[collection];
    var doc = self.findOne({_id: docId});

    var p = doc[field];
    //shift current doc,
    //update all affected positions
    var inc = {}, cond = {}, pos = {};
    inc[field] = 1;
    cond[field] = {
      $lt: p - sgn(amount),
      $gte: p + amount,
      $ne: p
    };
    pos[field] = p + amount;

    self.update(cond,{$inc: inc},{multi: true});
    self.update({_id: docId},{$set: pos});
  }
});

var sgn = function(x) {
  return (x > 0) - (x < 0);
};
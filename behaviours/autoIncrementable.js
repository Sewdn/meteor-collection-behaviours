CollectionBehaviours.defineBehaviour('autoIncrementable', function(getTransform, args){
  var self = this,
      field = args[0],
      amount = args[1] ? args[1] : 1;

  self.autoIncrements = {};

  self.before.insert(function (userId, doc) {
    doc[field] = self.autoIncrement(field, amount);
  });

  self.autoIncrement = function(field, amount){
    if(!self.autoIncrements[field]){
      //lookup highest value
      var index = 0;
      var s = {};
      s[field] = -1;
      var doc = self.findOne({},{limit:1, sort:s});
      if(doc)
        index = doc[field];

      self.autoIncrements[field] = index;
    }
    self.autoIncrements[field] += amount;
    return self.autoIncrements[field];
  };
});

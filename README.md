# Mongo Collection Behaviours

Extends Mongo.Collection with custom behaviour patterns.

Uses the excellent collection-hooks package to hook into collection hooks.

--------------------------------------------------------------------------------

### .timestampable()

Adds the timestampable behaviour.

Every document inserted into the collection, will have a createdAt timestamp added to it.
Every document of the collection that is being updated, will have a updatedAt timestamp added to it (or updated).

```javascript
var test = new Mongo.Collection("test");

test.timestampable();
```

#### TODO
- add options to choose the name of the createdAd and updateAt fields
- add options to enable/disable createdAt, updatedAt timestamp

--------------------------------------------------------------------------------

### .autoIncrementable()

Adds an autoIncremented value.

Every document that gets inserted into the collection, will have a field added to it, containing a unique integer that is one (or other increment) higher than the previously inserted document.

```javascript
var test = new Mongo.Collection("test");

test.autoIncrementable('fieldName', 2);
```

--------------------------------------------------------------------------------

### .softRemovable()

Adds the soft delete behaviour.

This behaviour is useful to keep track of removed documents.
Every document that gets removed from the collection, will not really be removed, but a removed boolean and a removedAt timestamp will be added.
Documents that are searched in the collection, will not be found if they have been indicated as being removed.

```javascript
var test = new Mongo.Collection("test");

test.softRemovable();
```

#### TODO
- add options to choose the name of the removed and removedAt fields

--------------------------------------------------------------------------------

### .sortable()

Adds the sortable pattern.

This pattern is useful to add a default sorting to a collection, other than insertion order.
This behaviour uses the autoIncrement behaviour to add a field with an integer value. Extra methods are added to the prototype of the transformed document to change the position in the sorted list.

```javascript
var test = new Mongo.Collection("test");

test.sortable('position');

_(10).times(function(n){
  test.insert({name: n});
}
test.findOne({name: 5}).up();
test.findOne({name: 7}).down(2);
_.pluck(test.find().fetch(), "name"); //returns [1,2,3,5,4,6,8,9,7,10]

```
--------------------------------------------------------------------------------

### .trackable()

Adds the trackable pattern.

This pattern is useful to track the evolution of one or more fields.
For every update of a document of the collection affecting one of the configured field, a trackRecord is kept. This trackRecord consists of an array of objects, containing the previous value and a trackedAt timestamp stating when this value was changed.

```javascript
var test = new Mongo.Collection("test");

test.trackable('field1', 'field2');
test.trackable(['field1', 'field2']);

```

--------------------------------------------------------------------------------

## Define your own behaviours

- Look at the source of the behaviours in the behaviours folder to be able to add your own custom behaviours.
- Simply register a new behaviour with the CollectionBehaviours.defineBehaviour method.

```javascript
CollectionBehaviours.defineBehaviour('blamable', function(getTransform, args){
  var self = this;
  self.before.insert(function (userId, doc) {
    doc.createdBy = userId;
  });
  self.before.update(function (userId, doc, fieldNames, modifier, options) {
    if(!modifier.$set)
      modifier.$set = {};
    modifier.$set.lastUpdatedBy = userId;
  });
}

var test = new Mongo.Collection("test");

test.blamable();
```


--------------------------------------------------------------------------------


## Contributors

- Pieter Soudan (@sewdn)

animals = createTestCollection('soft-animals')
animals.softRemovable()

describe 'softRemovable', ->
  
  it 'can soft remove', (test, next) ->
    id = animals.insert({name: 'dog'})
    test.equal animals.findOne(id)._id, id
    docs = animals.find().fetch()
    test.equal docs[0]._id, id

    beforeHookCalled = false
    animals.before.remove (userId, doc) ->
      beforeHookCalled = true

    animals.after.remove (userId, doc) ->
      test.isTrue beforeHookCalled
      # Removed docs can only be queried on the server.
      # doc = animals.direct.find({_id: id, removed: true}).fetch()
      doc = animals.findOne(id)
      test.isUndefined doc, 'doc should be undefined with default selector'
      if Meteor.isServer
        doc = animals.findOne({_id: id, removed: true})
        test.equal doc._id, id
        test.isTrue doc.removed, 'doc.removed'
        test.instanceOf doc.removedAt, Date, 'doc.removedAt'

      callback = ->
        doc = animals.findOne(id)
        test.equal doc._id, id
        test.isFalse doc.removed, 'doc.removed'
        test.instanceOf doc.removedAt, Date, 'doc.removedAt'
        test.instanceOf doc.unRemovedAt, Date, 'doc.removedAt'
        next()
      
      if Meteor.isClient
        animals.unRemove(id, callback)
      else
        animals.unRemove(id)
        callback()

    animals.remove(id)

animals = createTestCollection('soft-animals')
animals.softRemovable()

describe 'softRemovable', ->

  it 'can soft remove', (test, next) ->
    id = animals.insert({name: 'dog'})
    test.equal animals.findOne(id)._id, id, 'inserted ID'
    docs = animals.find().fetch()
    test.equal docs[0]._id, id, 'doc._id'
    
    hookHandles = []

    beforeHookCalled = false
    hookHandles.push animals.before.remove (userId, doc) ->
      console.log('before remove')
      beforeHookCalled = true
      return undefined

    hookHandles.push animals.after.remove (userId, doc) ->
      console.log('after remove')
      test.isTrue beforeHookCalled, 'before hook was called'
      # Removed docs can only be queried on the server since they should not be published to the
      # client.
      # doc = animals.direct.find({_id: id, removed: true}).fetch()
      doc = animals.findOne(_id: id)
      test.isUndefined doc, 'doc should be undefined with default selector'
      if Meteor.isServer
        # Server can still see all docs if "removed" selector is used.
        doc = animals.findOne({_id: id, removed: true})
        test.equal doc._id, id, 'doc_id'
        test.isTrue doc.removed, 'doc.removed'
        test.instanceOf doc.removedAt, Date, 'doc.removedAt'

      callback = ->
        doc = animals.findOne(_id: id)
        test.equal doc._id, id, 'doc._id'
        test.isFalse doc.removed, 'doc.removed'
        test.instanceOf doc.removedAt, Date, 'doc.removedAt'
        test.instanceOf doc.unRemovedAt, Date, 'doc.removedAt'
        console.log('calling next')
        removeHooks()
        next()

      removeHooks = ->
        # Remove added hooks to prevent them triggering when the test collections are cleared.
        _.each hookHandles, (handle) -> handle.remove()
      
      if Meteor.isClient
        animals.unRemove(id, callback)
      else
        animals.unRemove(id)
        callback()

    animals.remove(id)

animals = createTestCollection('soft-animals')
animals.softRemovable()

describe 'softRemovable', ->
  
  it 'can soft remove', (test, next) ->
    id = animals.insert({name: 'dog'})
    test.equal animals.findOne(id)._id, id
    docs = animals.find({name: 'dog'}).fetch()
    test.equal docs[0]._id, id
    
    animals.remove(id)
    # Removed docs can only be queried on the server.
    # doc = animals.direct.find({_id: id, removed: true}).fetch()
    doc = animals.findOne(id)
    
    if Meteor.isClient
      # We don't publish removed docs to the client-side since find() filters them.
      test.isUndefined doc
    else
      test.equal doc._id, id
      test.isTrue doc.removed
      test.instanceOf doc.removedAt, Date

    callback = ->
      doc = animals.findOne(id)
      test.isUndefined doc.removed
      test.instanceOf doc.removedAt, Date
      test.instanceOf doc.unRemovedAt, Date      
      next()

    if Meteor.isClient
      animals.unRemove(id, callback)
    else
      animals.unRemove(id)
      callback()

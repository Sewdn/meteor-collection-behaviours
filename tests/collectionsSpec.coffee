insertedDocId = null

animals = createTestCollection('animals')

describe 'Collections', ->
  
  # Remove all existing docs from the collection each test run.
  it 'has empty collections', (test, next) ->
    Meteor.call 'removeAllCollections', next

  it 'can insert', (test) ->
    name = 'foo'
    insertedDocId = animals.insert({name: name})
    doc = animals.findOne(insertedDocId)
    test.equal doc.name, name

  it 'can update', (test) ->
    doc = animals.findOne(insertedDocId)
    test.notEqual doc.name, name
    name = 'bar'
    animals.update insertedDocId, {$set: {name: name}}
    doc = animals.findOne(insertedDocId)
    test.equal doc.name, name

  it 'can remove', (test) ->
    doc = animals.findOne(insertedDocId)
    test.isTrue doc?
    animals.remove insertedDocId
    doc = animals.findOne(insertedDocId)
    test.isFalse doc?


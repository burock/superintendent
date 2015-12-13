Meteor.publish("buildings", function (options) {
  return Buildings.find(
    {
    $and:[
        {owner: this.userId},
        {owner: {$exists: true}}
    ]
    }, options);
});

Meteor.publish("flats", function (options,buildingId) {
  Counts.publish(this, 'numberOfFlats', Flats.find(
    {
      buildingId : buildingId
    }
  ), { noReady: true });
  
  return Flats.find(
    {
      buildingId : buildingId
    }
    , options);
});

Meteor.publish("myflats", function (options,email) {
  return Flats.find(
    {
      flatOwnerEmail : email
    }
    , options);
});

Meteor.publish("cashflows", function (options,query) {
  if (query.filter==null) query.filter = '';
  
  Counts.publish(this, 'numberOfCashflows', Cashflows.find(
        {$and: [
                { buildingId : query.buildingId}, 
                { _id : (query.cashflowId!=''?query.cashflowId: { '$regex': '.*.*', '$options' : 'i' }) },
                { description: { '$regex' : '.*' + query.filter || '' + '.*', '$options' : 'i' }}
              ]
        }
  ), { noReady: true });

  return Cashflows.find(
    
            {$and: [
                    { buildingId : query.buildingId}, 
                    { _id : (query.cashflowId!=''?query.cashflowId: { '$regex': '.*.*', '$options' : 'i' }) },
                    { description: { '$regex' : '.*' + query.filter || '' + '.*', '$options' : 'i' }}
                  ]
            }
    , options);
});

Meteor.publish("cashflowsByFlat", function (options,flatId) {
  return Cashflows.find(
    {
      flat : flatId
    }
    , options);
});

Meteor.publish("posts", function (options,buildingId) {
  Counts.publish(this, 'numberOfPosts', Posts.find(
    {
      buildingId : buildingId
    }
  ), { noReady: true });

  return Posts.find(
    {
      buildingId : buildingId
    }
    , options);
});

Meteor.publish("projects", function (options,query) {
  if (query.filter==null) query.filter = '';
  return Projects.find(
    {$and: [
            { buildingId : query.buildingId}, 
            { _id : (query.projectId!=''?query.projectId: { '$regex': '.*.*', '$options' : 'i' }) },
            { title: { '$regex' : '.*' + query.filter || '' + '.*', '$options' : 'i' }}
          ]
    }
    , options);
});

Meteor.publish("reminders",function(options,query){
  // non-recurrent
  return Reminders.find({
      $and: [ {buildingId: query.buildingId}, {recurring: '0'}]
      ,
      $or: [{
          start: {
            $gte: query.start,
            $lt: query.end
          }
        }, {
          end: {
            $gt: query.start,
            $lte: query.end
          }
        }]
    });
});


Meteor.publish("recurrents",function(options, query){
  // recurrent
  return Reminders.find({
      $and: [ {buildingId: query.buildingId}, {recurring: { $ne: '0' }}]
    });
});

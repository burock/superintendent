Meteor.methods({
    c4cal: function(start, end, buildingId) {
        var events = [];
        var c = Cashflows.find({
            buildingId: buildingId,
            date: {
                $gte: start,
                $lt: end
            }
        });
        c.forEach(function(cash) {
            var e = {
                id: cash._id,
                title: cash.description,
                start: cash.date,
                end: cash.date,
                allDay: true,
                url: '/buildings/' + buildingId + '/cashflows/' + cash._id,
                type: 'cashflow',
                className: (cash.amount > 0 ? 'blue' : 'red'),
                //url: '/buildings/' + cash.buildingId + '/cashflows/' + cash._id,
                amount: cash.amount
            };
            events.push(e);
        });
        return events;
    }
});
Meteor.methods({
    p4cal: function(start, end, buildingId) {
        var events = [];
        var c = Projects.find({
            buildingId: buildingId,
            $or: [{
                startDate: {
                    $gte: start,
                    $lt: end
                }
            }, {
                endDate: {
                    $gt: start,
                    $lte: end
                }
            }]
        });
        c.forEach(function(p) {
            var e = {
                id: p._id,
                title: p.title,
                start: p.startDate,
                end: p.endDate,
                url: '/buildings/' + buildingId + '/projects/' + p._id,
                allDay: true,
                type: 'project',
                className: 'projects',
                amount: p.cost
            };
            events.push(e);
        });
        return events;
    }
});

Meteor.methods({
   getRecurrents : function(start,end,buildingId) {
    var events = [];   
    var viewStart = moment(start);
    var viewEnd = moment(end);
    
    var recs = Reminders.find({
      $and: [ {buildingId: buildingId}, {recurring: { $ne:'0'} }]
    });   
    
    recs.forEach(function(r) {
        if (r.recurring) {
              var startDate = moment(r.start);
              var period = r.recurring;
                if (startDate.diff(viewStart,'d')<0) {
                  // move to a visible day
                  while (startDate<viewStart) {
                    startDate.add(1,period);
                  }
                }
                var i=0;
                do {
                  var z = JSON.parse(JSON.stringify(r));
                  z.className = 'recurrent';
                  z.id = z._id;
                  z.start = startDate.clone().toDate();
                  z.end = startDate.clone().toDate();
                  events.push(z);
                  startDate = startDate.add(1,period);
                } while (viewEnd.diff(startDate,'d')>=0);
        }
    });
    return events;
   } 
});

Meteor.methods({
   getReminders : function(start,end,buildingId) {
    
    return Reminders.find({
      $and: [ {buildingId: buildingId}, {recurring: '0'}]
      ,
      $or: [{
          start: {
            $gte: start,
            $lt: end
          }
        }, {
          end: {
            $gt: start,
            $lte: end
          }
        }]
    }).fetch();
    
   } 
});
Meteor.methods({
    removeBuilding: function(buildingId) {
        Flats.remove({
            buildingId: buildingId
        });
        Cashflows.remove({
            buildingId: buildingId
        })
        Projects.remove({
            buildingId: buildingId
        })
        Posts.remove({
            buildingId: buildingId
        });
        Reminders.remove({
            buildingId: buildingId
        });
        Buildings.remove({
            _id : buildingId
        });
        return true;
    }
});
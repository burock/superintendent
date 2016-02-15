Meteor.methods({
    generateCash: function(flats, projectId) {
        Cashflows.remove({
            projectId: projectId
        }, function(err, data) {
            if (err) console.log("error removing old cashflows", err);
            else console.log("Data at removing cashes", data);
        });
        flats.forEach(function(flat) {
            flat.payments.forEach(function(payment) {
                var p = {};
                p.owner = Meteor.user()._id;
                p.projectId = payment.projectId;
                p.flat = flat._id;
                p.description = payment.paymentDescr;
                p.date = payment.paymentDate;
                p.amount = -1 * payment.paymentAmount;
                p.currency = payment.currency;
                p.paid = false;
                p.type = 'payment';
                p.buildingId = flat.buildingId;
                Cashflows.insert(p, function(err, data) {
                    if (err) console.log("error inserting cash", err);
                });
            });
        });
    }
});


Meteor.methods({
    c4cal: function(start, end, buildingId) {
        var events = [];
        var c = Cashflows.find({
            $and: [{
                buildingId: buildingId
            }, {
                date: {
                    $gte: start,
                    $lt: end
                }
            }]
        }, {
            sort: {
                date: 1
            }
        });
        var cpid = '';
        var dd = new Date();
        var cp = {};
        c.forEach(function(cash) {
            if (cash.projectId) {
                if (cpid != cash.projectId && cash.date != dd) {
                    if (cp.start) {
                        events.push(cp);
                    }
                    cpid = cash.projectId;
                    dd = cash.date;
                    cp = {
                        id: cash._id,
                        title: cash.description,
                        start: cash.date,
                        end: cash.date,
                        allDay: true,
                        url: '/buildings/' + buildingId + '/cashflows/' + cash._id,
                        type: 'project',
                        className: (cash.amount > 0 ? 'blue' : 'red'),
                        amount: 0
                    };
                }
            } else {
                var e = {
                    id: cash._id,
                    title: cash.description,
                    start: cash.date,
                    end: cash.date,
                    allDay: true,
                    url: '/buildings/' + buildingId + '/cashflows/' + cash._id,
                    type: 'cashflow',
                    className: (cash.amount > 0 ? 'blue' : 'red'),
                    amount: cash.amount
                };
                events.push(e);
            }
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
    getRecurrents: function(start, end, buildingId) {
        var events = [];
        var viewStart = moment(start);
        var viewEnd = moment(end);

        var recs = Reminders.find({
            $and: [{
                buildingId: buildingId
            }, {
                recurring: {
                    $ne: '0'
                }
            }]
        });

        recs.forEach(function(r) {
            if (r.recurring) {
                var startDate = moment(r.start);
                var period = r.recurring;
                if (startDate.diff(viewStart, 'd') < 0) {
                    // move to a visible day
                    while (startDate < viewStart) {
                        startDate.add(1, period);
                    }
                }
                var i = 0;
                do {
                    var z = JSON.parse(JSON.stringify(r));
                    z.className = 'recurrent';
                    z.id = z._id;
                    z.start = startDate.clone().toDate();
                    z.end = startDate.clone().toDate();
                    events.push(z);
                    startDate = startDate.add(1, period);
                } while (viewEnd.diff(startDate, 'd') >= 0);
            }
        });
        return events;
    }
});

Meteor.methods({
    getReminders: function(start, end, buildingId) {

        return Reminders.find({
            $and: [{
                buildingId: buildingId
            }, {
                recurring: '0'
            }],
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
    getYearTotal: function(buildingId) {

        var series = [];
        var pipeline = [{
            $match: {
                buildingId: buildingId,
                amount: {
                    $gte: 0
                },
                paid: true
                    //date: { $gt: (new Date().getTime() - 1000 * 60 * 60 * 24 * 365 ) } 
            }
        }, {
            $group: {
                _id: {
                    year: {
                        $year: "$date"
                    },
                    month: {
                        $month: "$date"
                    }
                },
                total: {
                    $sum: "$amount"
                }
            }
        }, {
            $project: {
                date: {
                    year: "$_id.year",
                    month: "$_id.month"
                },
                total: 1,
                _id: 0
            }
        }, {
            $sort: {
                "date.year": 1,
                "date.month": 1
            }
        }];
        var i = {
            name: 'income',
            series: Cashflows.aggregate(pipeline)
        }
        series.push(i);

        var pipelineE = [{
            $match: {
                buildingId: buildingId,
                amount: {
                    $lte: 0
                },
                paid: true
                    //date: { $gt: (new Date().getTime() - 1000 * 60 * 60 * 24 * 365 ) } 
            }
        }, {
            $group: {
                _id: {
                    year: {
                        $year: "$date"
                    },
                    month: {
                        $month: "$date"
                    }
                },
                total: {
                    $sum: "$amount"
                }
            }
        }, {
            $project: {
                date: {
                    year: "$_id.year",
                    month: "$_id.month"
                },
                total: 1,
                _id: 0
            }
        }, {
            $sort: {
                "date.year": 1,
                "date.month": 1
            }
        }];
        var e = {
            name: 'expense',
            series: Cashflows.aggregate(pipelineE)
        }
        series.push(e);

        return series;
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
            _id: buildingId
        });
        return true;
    }
});


Meteor.methods({
    importCash: function(cashes) {
        var ret = {};
        ret.exists = [];
        ret.done = [];
        cashes.forEach(function(cash) {
            var check = Cashflows.find({
                amount : cash.amount,
                date : cash.date,
                description : cash.description
            }).count();
            if (check>0) {
                ret.exists.push(cash);
            } else {
                var id = Cashflows.insert(cash, function(err, data) {
                    if (err)
                      console.log('Error inserting cashflow', err);
                    else {
                      cash._id = data;
                      return cash;
                    }
                });
                ret.done.push(id);
            }
        });
        return ret;
    }
});

Meteor.methods({
   findDebts: function(buildingId) {
        var flats = Flats.find({ buildingId: buildingId});
        var debt = 0;
        flats.forEach(function(flat) {
            var pipeline = [{
            $match: {
                flat: flat._id,
                paid: false
            }
            }, {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }];
            var t = Cashflows.aggregate(pipeline);
            try {
                debt += parseFloat(t[0].total);
            } catch (e) {
                console.log("error parsing " + flat.no, e);
            }
        });
       return debt;
   } 
});

Meteor.methods({
   myFlats : function(email) {
        var flats = [];
        Flats.find({ flatOwnerEmail: email }).forEach(function (flat) {
            //building
            var b = Buildings.find({_id : flat.buildingId}).fetch();
            flat.building = b;
            
            //unpaid cashflows
            var unpaid = Cashflows.find({ flat: flat._id, paid : false}, { sort : {date : -1 }}).fetch();
            try {
                var totalDebt = 0;
                unpaid.forEach(function(p) {
                    totalDebt += p.amount;
                });
                flat.unpaidCashflows = unpaid;
                flat.totalDebt = totalDebt;
            } catch (e) {
                flat.unpaidCashflows = 0;
            }
            
            //total paid cash uptil now
            var pipeline = [{
            $match: {
                flat: flat._id,
                paid: true,
                amount : { $gt: 0 }
            }
            }, {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }];
            var p = Cashflows.aggregate(pipeline);
            try {
                flat.totalPaid = p[0].total;
            } catch (e) {
                // console.log('paid err',e);
                flat.totalPaid = 0;
            }
            //latest 20 posts
            var posts = Posts.find({buildingId : flat.buildingId}, {limit:20, sort: {date: -1}}).fetch();
            flat.posts = posts;
            
            flats.push(flat);
        });
        return flats;
   } 
});
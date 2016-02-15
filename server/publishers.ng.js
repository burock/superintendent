Meteor.publish("buildings", function(options) {
    return Buildings.find({
        $and: [{
            owner: this.userId
        }, {
            owner: {
                $exists: true
            }
        }]
    });
});

Meteor.publish("flats", function(query, options) {
    let selector = { buildingId : query.buildingId };
    Counts.publish(this, 'numberOfFlats', Flats.find(selector), {
        noReady: true
    });
    return Flats.find(selector, options);
});

Meteor.publish("cashflows", function(query, options) {

    if (query.filter == null) query.filter = '';
    let selector = {
        $and: [{
            buildingId: query.buildingId
        }]
    };
    if (query.cashflowId != '') selector.$and.push({
        _id: query.cashflowId
    });
    if (query.filter != '') selector.$and.push({
        description: {
            '$regex': '.*' + query.filter || '' + '.*',
            '$options': 'i'
        }
    });
    if (query.filterPaid != '') selector.$and.push({
        paid: (query.filterPaid === "true")
    });
    if (query.filterFlat != '') selector.$and.push({
        flat: query.filterFlat
    });

    Counts.publish(this, 'numberOfCashflows', Cashflows.find(selector), {
        noReady: true
    });
    return Cashflows.find(selector, options);
});

Meteor.publish("cashflowsByFlat", function(query, options) {
    let selector = {
        $and: [{
            flat: query.flatId
        }]
    };
    if (query.filterPaid!=undefined) selector.$and.push({
        paid: query.filterPaid
    });

    Counts.publish(this, 'numberOfCashflowsByFlat', Cashflows.find(
        selector, options
    ), {
        noReady: true
    });

    return Cashflows.find(
        selector, options);
});

Meteor.publish("posts", function(query, options) {
    Counts.publish(this, 'numberOfPosts', Posts.find({
        buildingId: query.buildingId
    }), {
        noReady: true
    });

    return Posts.find({
        buildingId: query.buildingId
    }, options);
});

Meteor.publish("projects", function(query, options) {
    if (query.filter == null) query.filter = '';
    let selector = {};
    if (query.finished != '') {
        selector = {
            $and: [{
                buildingId: query.buildingId
            }, {
                _id: (query.projectId != '' ? query.projectId : {
                    '$regex': '.*.*',
                    '$options': 'i'
                })
            }, {
                title: {
                    '$regex': '.*' + query.filter || '' + '.*',
                    '$options': 'i'
                }
            }, {
                finished: query.finished === 'true'
            }]
        }
    } else {
        selector = {
            $and: [{
                buildingId: query.buildingId
            }, {
                _id: (query.projectId != '' ? query.projectId : {
                    '$regex': '.*.*',
                    '$options': 'i'
                })
            }, {
                title: {
                    '$regex': '.*' + query.filter || '' + '.*',
                    '$options': 'i'
                }
            }]
        }
    }
    Counts.publish(this, 'numberOfProjects', Projects.find(selector), {
        noReady: true
    });

    return Projects.find(selector, options);
});

Meteor.publish("reminders", function(query, options) {
    // non-recurrent
    return Reminders.find({
        $and: [{
            buildingId: query.buildingId
        }, {
            recurring: '0'
        }],
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


Meteor.publish("recurrents", function(query, options) {
    // recurrent
    return Reminders.find({
        $and: [{
            buildingId: query.buildingId
        }, {
            recurring: {
                $ne: '0'
            }
        }]
    });
});

Meteor.publish("legals", function(query, options) {
    Counts.publish(this, 'legalsCount', Legals.find({
        buildingId: query.buildingId
    }), {
        noReady: true
    });

    return Legals.find({
        buildingId: query.buildingId
    }, options);
});

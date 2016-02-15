Buildings = new Meteor.Collection('buildings');

Buildings.allow({
  insert: function (userId, building) {
    return userId && building.owner === userId;
  },
  update: function (userId, building, fields, modifier) {
    return userId && building.owner === userId;
  },
  remove: function (userId, building) {
    return userId && building.owner === userId;
  }
});

Flats = new Meteor.Collection('flats');

Flats.allow({
  insert: function (userId, flat) {
    return userId && flat.owner === userId;
  },
  update: function (userId, flat, fields, modifier) {
    return userId && flat.owner === userId;
  },
  remove: function (userId, flat) {
    return userId && flat.owner === userId;
  }
  
});

Cashflows = new Meteor.Collection('cashflows');
Cashflows.allow({
  insert: function (userId, cashflow) {
    return userId && cashflow.owner === userId;
  },
  update: function (userId, cashflow, fields, modifier) {
    return userId && cashflow.owner === userId;
  },
  remove: function (userId, cashflow) {
    return userId && cashflow.owner === userId;
  }
  
});

Temp = new Meteor.Collection('temp');
Temp.allow({
  insert: function (userId, temp) {
    return userId && temp.buildingOwner === userId;
  },
  update: function (userId, temp, fields, modifier) {
    return userId && temp.buildingOwner === userId;
  },
  remove: function (userId, temp) {
    return userId && temp.buildingOwner === userId;
  }
  
});

Posts = new Meteor.Collection('posts');
Posts.allow({
  insert: function (userId, post) {
    return userId && post.owner === userId;
  },
  update: function (userId, post, fields, modifier) {
    return userId && post.owner === userId;
  },
  remove: function (userId, post) {
    return userId && post.owner === userId;
  }
  
});

Projects = new Meteor.Collection('projects');

Projects.allow({
  insert: function (userId, project) {
    return userId && project.owner === userId;
  },
  update: function (userId, project, fields, modifier) {
    return userId && project.owner === userId;
  },
  remove: function (userId, project) {
    return userId && project.owner === userId;
  }
  
});

Reminders = new Meteor.Collection('reminders');
Reminders.allow({
  insert: function (userId, reminder) {
    return userId && reminder.owner === userId;
  },
  update: function (userId, reminder, fields, modifier) {
    return userId && reminder.owner === userId;
  },
  remove: function (userId, reminder) {
    return userId && reminder.owner === userId;
  }
});

Legals = new Meteor.Collection('legals');
Legals.allow({
  insert: function (userId, legal) {
    return userId && legal.owner === userId;
  },
  update: function (userId, legal, fields, modifier) {
    return userId && legal.owner === userId;
  },
  remove: function (userId, legal) {
    return userId && legal.owner === userId;
  }
});
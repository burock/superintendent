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
    return true;//userId && flat.owner === userId;
  },
  update: function (userId, cashflow, fields, modifier) {
    return userId && cashflow.owner === userId;
  },
  remove: function (userId, cashflow) {
    return userId && cashflow.owner === userId;
  }
  
});

Posts = new Meteor.Collection('posts');

Posts.allow({
  insert: function (userId, post) {
    return true;//userId && flat.owner === userId;
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
    return true;// && flat.owner === userId;
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
    return true;// && flat.owner === userId;
  },
  update: function (userId, reminder, fields, modifier) {
    return true;//userId && reminder.owner === userId;
  },
  remove: function (userId, reminder) {
    return true;//userId && reminder.owner === userId;
  }
  
});

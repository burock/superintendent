angular.module('super').filter('uninvited', function () {
  return function (users, flat) {
    if (!flat)
      return false;
 
    return _.filter(users, function (user) {
      if (user._id == flat.owner ||
        _.contains(flat.invited, user._id))
        return false;
      else
        return true;
    });
  }
});
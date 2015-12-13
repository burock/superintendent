angular.module("super").controller("LoginCtrl", ['$meteor', '$state', '$rootScope', '$translate',
  function ($meteor, $state, $rootScope, $translate) {
    var vm = this;
    
    vm.credentials = {
      email: '',
      password: ''
    };
 
    vm.error = '';
 
    vm.changeLang = function() {
      console.log("changed lang");
      $translate.use(vm.credentials.profile.language);
    }
    
    this.login = () => {
        Meteor.loginWithPassword(this.credentials.email, this.credentials.password, (err) => {
          if (err) {
            this.error = err;
          }
          else {
            Session.set('user',Meteor.user);
            $translate.use(vm.credentials.profile.language);
            $state.go('buildings');
          }
        });
      };
    
  }
]);
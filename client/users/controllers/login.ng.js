angular.module("super").controller("LoginCtrl", ['$state', '$rootScope', '$translate',
  function ( $state, $rootScope, $translate) {
    var vm = this;
    
    vm.credentials = {
      email: '',
      password: ''
    };
 
    vm.error = '';
 
    vm.changeLang = function() {
      try {
      $translate.use(vm.credentials.profile.language);
      } catch(e) {
        console.log('error',e);
      }
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
angular.module("super").controller("ResetCtrl", ['$state',
  function ($state) {
    var vm = this;
 
    vm.credentials = {
      email: ''
    };
 
    vm.error = '';
     vm.reset = () => {
            Accounts.forgotPassword(this.credentials, (err) => {
              if (err) {
                vm.error = "Failed to reset password" + err;
              }
              else {
                $state.go('buildings');
              }
            });
          };
  }
]);
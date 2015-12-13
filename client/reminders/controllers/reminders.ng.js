angular.module("super")
    .controller("EventCalendarController", ['$meteor', '$scope',
        'uiCalendarConfig', '$mdDialog', '$stateParams', '$mdMedia', '$state', '$rootScope', '$translate', '$compile',
        function($meteor, $scope, uiCalendarConfig, $mdDialog, $stateParams, $mdMedia, $state, $rootScope, $translate, $compile) {
            var eventCtrl = this;
            var tracker = new Tracker.Dependency();
            
            $scope.months = [$translate.instant('JAN'),$translate.instant('FEB'),$translate.instant('MAR'),
                            $translate.instant('APR'),$translate.instant('MAY'),$translate.instant('JUN'),
                            $translate.instant('JUL'),$translate.instant('AUG'),$translate.instant('SEP'),
                            $translate.instant('OCT'),$translate.instant('NOV'),$translate.instant('DEC'),];
            $scope.days = [$translate.instant('Sun'), $translate.instant('Mon'), $translate.instant('Tue'), 
                        $translate.instant('Wed'), $translate.instant('Thu'), $translate.instant('Fri'), $translate.instant('Sat')];
            
            $scope.cal = angular.element("#eventCalendar");
            eventCtrl.eventSources = [];
            
            $scope.loading = function(isLoading, view) {
                $scope.isLoading = isLoading;
            }
            
            function notifyUser(err) {
            if (err)
              $rootScope.showSimpleToast(err.reason);
            else
              $rootScope.showSimpleToast('reminders subscription was stopped.');
            };
            
            $meteor.autorun( $scope, function() {
                tracker.depend();

                var start = $scope.view && $scope.view.start;
                var end = $scope.view && $scope.view.end;
                if (!start || !end) {
                    return;
                }
                
                $scope.$meteorSubscribe('reminders',
                      {
                        onStop: notifyUser 
                      }, { start: start,
                           end: end,
                           buildingId: $stateParams.buildingId
                          
                      })
                      .then(function(subscriptionHandle){
                        $scope.reminders =$meteor.collection(function() {
                          return Reminders.find({ recurring: '0'});
                        });
                }); 
                
                $scope.$meteorSubscribe('recurrents',
                      {
                        onStop: notifyUser 
                      }, { start: start,
                           end: end,
                           buildingId: $stateParams.buildingId
                          
                      })
                      .then(function(subscriptionHandle){
                        $scope.recurrents =$meteor.collection(function() {
                          return Reminders.find({ recurring: { $ne: '0'}});
                        });
                }); 
          
                $meteor.call("getRecurrents", start, end, $stateParams.buildingId).then(
                    function(data) {
                        $scope.recurrentEvents = data;
                    },
                    function(err) {
                        console.log('failed', err);
                    }
                );
                
                $meteor.call("getReminders", start, end, $stateParams.buildingId).then(
                    function(data) {
                        $scope.reminderEvents = data;
                    },
                    function(err) {
                        console.log('failed', err);
                    }
                );
                
                $meteor.call("c4cal", start, end, $stateParams.buildingId).then(
                    function(data) {
                        $scope.cashflows = data;
                    },
                    function(err) {
                        console.log('failed', err);
                    }
                );

                $meteor.call("p4cal", start, end, $stateParams.buildingId).then(
                    function(data) {
                        $scope.projects = data;
                    },
                    function(err) {
                        console.log('failed', err);
                    }
                );
                
                
            });
			$scope.customFullscreen = $mdMedia('sm');
			
			$scope.refresh = function() {
			   tracker.changed();
			   $('#eventCalendar').fullCalendar("refetchEvents");
			}
                
			$scope.cancel = function() {
				$mdDialog.hide();
			};

	        $scope.saveReminder = function (reminder) {
	            if (reminder._id) {
	                reminder.id = reminder._id;
    			    reminder.save();
    				$mdDialog.hide();
    	        } else {
    	           if (reminder.recurring=='0')
        	            $scope.reminders.save(reminder);
        	       else 
        	            $scope.recurrents.save(reminder);
    	           $mdDialog.hide();
    	        }
    	        $rootScope.showSimpleToast(this, $translate.instant('SAVED') + ' ' + reminder.title);
    	        $scope.refresh();
			};		
			
			$scope.deleteReminder = function (reminder) {
			    if (reminder.recurring=='0')
                $scope.reminders.remove(reminder);
                else
                $scope.recurrents.remove(reminder);
                
                $rootScope.showSimpleToast(this, $translate.instant('DELETED') + ' ' + reminder.title);
                $scope.refresh();
				$mdDialog.hide();
			};	
			
			$scope.showDialog = function(event) {
				if (event) {
				    $scope.reminder = $meteor.object(Reminders, event._id, false);
				} 
			    $mdDialog.show({
			      templateUrl: 'client/reminders/views/reminder.tmpl.ng.html',
			      scope: $scope,        
  				  preserveScope: true,
			      parent: angular.element(document.body),
			      clickOutsideToClose:true,
			      fullscreen: $mdMedia('sm') && $scope.customFullscreen
		        });
			};
			
			$scope.$watch(function() {
			  return $mdMedia('sm');
			}, function(sm) {
			      $scope.customFullscreen = (sm === true);
		    });
			
			$scope.addReminder = function (start, end) {
				$scope.reminder = {
				    'id'    : '',
					'title' : '',
					'allDay': true,
					'start' : start.toDate(),
					'end'	: end.toDate(),
					'buildingId' : $stateParams.buildingId,
					'done' : false,
					'recurring' : '0'
				};
				$scope.showDialog();    
			};
			
            eventCtrl.calendarConfig = {
                height: 450,
                editable: true,
                customButtons: {
                    refreshButton: {
                        text: $translate.instant('REFRESH'),
                        click: function() {
                           $scope.refresh();
                        }
                    }
                },
                header: {
                    left: 'today month agendaWeek',
                    center: 'title',
                    right: 'prev refreshButton next' //month,agendaWeek, agendaDay
                },
                selectable: true,
                monthNames: $scope.months,
                //monthNamesShort: <?php echo $lang['MONTH_NAMES_SHORT']; ?>,
                //dayNames: <?php echo $lang['DAY_NAMES']; ?>,
                dayNamesShort: $scope.days,
                buttonText: {
                    prev: '<',
                    next: '>',
                    today: $translate.instant('TODAY'),
                    month: $translate.instant('MONTH'),
                    week: $translate.instant('WEEK'),
                    day: $translate.instant('DAY')
                },
                theme: true,
                buttonIcons: {
                    prev: 'icon-chevron-left',
                    next: 'icon-chevron-right'
                },
                //selectHelper: true,
                select: function(start, end, allDay) {
                	$scope.addReminder(start, end);
                },
                eventClick: function(calEvent, jsEvent, view) {
                    if (!calEvent.url)
                	    $scope.showDialog(calEvent);
                },
                eventDragStart:  function(calEvent, jsEvent, ui, view) {
                    $scope.reminder = $meteor.object(Reminders, calEvent._id, false);
		        },
                eventDrop: function(calEvent,dayDelta,minuteDelta,allDay,revertFunc) {
                    $scope.reminder.start = calEvent.start.toDate();
                    try { 
                        $scope.reminder.end = calEvent.end.toDate();
                    } catch (e) {
                        console.log('no end date');
                    };
                    $scope.reminder.save();
    		    },
    		    eventResize: function(calEvent,dayDelta,minuteDelta,allDay,revertFunc) {
    		    },
                viewDisplay: function(view) {
                    $scope.cal.fullCalendar('rerenderEvents');
                },
                loading: $scope.loading,
                viewRender: function(view, render) {
                    $scope.view = {
                        start: view.start.toDate(),
                        end: view.end.toDate()
                    };
                    // visual fixes
                    $('.fc-toolbar button').addClass('md-button');
                    $('.fc-head').addClass('md-caption gray-green calendar-header');
                    $('.fc-row').attr('style', function(i, style) {
                        return 'padding: 2px;';
                    });
                    tracker.changed();
                }
            }
            
            eventCtrl.eventSources = [
                { 
                    events :  function(start, end, timezone, callback) {
                       $.ajax({
                          success: function(doc) {
                                callback($scope.reminderEvents);
                            } 
                           
                       });
                    } 
                },
                {
                    events : function(start, end, timezone, callback) {
                       $.ajax({
                          success: function(doc) {
                            callback($scope.cashflows);      
                          } 
                           
                       });
                    }
                    
                },
                {
                    events : function(start, end, timezone, callback) {
                       $.ajax({
                          success: function(doc) {
                            callback($scope.projects);      
                          } 
                           
                       });
                    }
                    
                },
                {
                    events : function(start, end, timezone, callback) {
                       $.ajax({
                          success: function(doc) {
                            callback($scope.recurrentEvents);      
                          } 
                           
                       });
                    }
                    
                }
                ];
        }
    ]);
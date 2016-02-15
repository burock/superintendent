angular.module("super")
    .controller("EventCalendarController", ['$scope',
        'uiCalendarConfig', '$mdDialog', '$stateParams', '$mdMedia', '$state', 
        '$rootScope', '$translate', '$compile','$reactive',
        function($scope, uiCalendarConfig, $mdDialog, $stateParams, 
                $mdMedia, $state, $rootScope, $translate, $compile,$reactive) {
            if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');
            $reactive(this).attach($scope);
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
            
            $scope.helpers({
                reminders : () => {
                    return Reminders.find({ buildingId: $stateParams.buildingId,  recurring: '0'} , {});
                },
                recurrents : () => {
                    return Reminders.find({  buildingId: $stateParams.buildingId, recurring: { $ne: '0'}}, {});
                }
            })
            
            $scope.autorun(function() {
                tracker.depend();

                var start = $scope.view && $scope.view.start;
                var end = $scope.view && $scope.view.end;
                if (!start || !end) {
                    return;
                }
                
                $scope.subscribe('reminders', () => {
                   return [
                          { 
                              start: start,
                              end: end,
                              buildingId: $stateParams.buildingId
                          }
                       ] 
                });
                $scope.subscribe('recurrents', () => {
                   return [
                          { 
                              start: start,
                              end: end,
                              buildingId: $stateParams.buildingId
                          }
                       ] 
                });
          
                Meteor.call("getRecurrents", start, end, $stateParams.buildingId, function(err,data) {
                    if (err) {
                        console.log('failed', err);
                    } else {
                        $scope.recurrentEvents = data;
                    }
                });
                
                Meteor.call("getReminders", start, end, $stateParams.buildingId, function(err,data) {
                    if (err) {
                        console.log('failed', err);
                    } else {
                         $scope.reminderEvents = data;
                    }
                });
                
                Meteor.call("c4cal", start, end, $stateParams.buildingId, function(err,data) {
                    if (err) {
                        console.log('failed', err);
                    } else {
                        $scope.cashflows = data;
                    }
                });

                Meteor.call("p4cal", start, end, $stateParams.buildingId, function(err,data) {
                    if (err) {
                        console.log('failed', err);
                    } else {
                        $scope.projects = data;
                    }
                });
                
            });
			$scope.customFullscreen = $mdMedia('sm');
			
			$scope.refresh = function() {
			   tracker.changed();
			   $('#eventCalendar').fullCalendar("refetchEvents");
			}
                
			$scope.cancel = function() {
				$mdDialog.hide();
			};

            $scope.updateReminder = function(r) {
                Reminders.update({ _id : r._id }, {
                    $set : {
                        title : r.title,
    					start : r.start,
    					end	: r.end,
    					recurring : r.recurring
                    }
                }, function(err, data) {
                    if (err) {
                        console.log('Error updating reminder', err);
                    } else {
                        $rootScope.showSimpleToast(this, $translate.instant('SAVED') + ' ' + r.title);
    	                $scope.refresh();
                    } 
                });  
                
            };
            
	        $scope.saveReminder = function (reminder) {
	            if (reminder._id) {
	                reminder.id = reminder._id;
    	        }
    	        $scope.updateReminder(reminder);     
    	        $mdDialog.hide();
			};		
			
			$scope.deleteReminder = function (reminder) {
                Reminders.remove({_id : reminder._id });
                $rootScope.showSimpleToast(this, $translate.instant('U_DELETED') + ' ' + reminder.title);
                $scope.refresh();
				$mdDialog.hide();
			};	
			
			$scope.showDialog = function(event) {
				if (event) {
				    $scope.helpers({
				       reminder : () => {
				           var r = Reminders.findOne( { _id: event._id }); 
				           return r
				       } 
				    });
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
				Reminders.insert($scope.reminder, function(err, data) {
				    if (err) 
				        console.log('error', err);
				    else {
				        $scope.reminder.id = data;
				        $scope.reminder._id = data;
				    }
				});
				$scope.showDialog();    
			};
			
            eventCtrl.calendarConfig = {
                height: 'auto',
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
                    $scope.reminder = Reminders.findOne( { _id : calEvent._id });
		        },
                eventDrop: function(calEvent,dayDelta,minuteDelta,allDay,revertFunc) {
                    $scope.reminder.start = calEvent.start.toDate();
                    try { 
                        $scope.reminder.end = calEvent.end.toDate();
                    } catch (e) {
                        console.log('no end date');
                    };
                    $scope.updateReminder($scope.reminder);
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
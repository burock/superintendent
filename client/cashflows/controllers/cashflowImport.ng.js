angular.module("super").controller("CashflowImportCtrl", ['$scope', '$rootScope',
    '$state', '$stateParams', '$mdDialog', '$translate', '$reactive',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $translate, $reactive) {
        $reactive(this).attach($scope);

        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');
        //      $scope.subscribe('cashflows');

        $scope.lines = [];
        $scope.dateFormat = "DD/MM/YYYY-hh:mm:ss";
        $scope.isLoading = false;
        $scope.fileUploaded = false;
        $scope.amountColumn = -1;
        $scope.dateColumn = -1;
        $scope.descriptionColumn = -1;
        $scope.idColumn = -1;
        $scope.selectedColumns = [];
        $scope.selected = [];
        $scope.rows = [];
        $scope.importReady = false;
        $scope.importDone = false;
        $scope.importError = false;
        $scope.importErrorLog = '';
        $scope.buildingId = $stateParams.buildingId;
        
        $scope.readFile = function(f, onLoadCallback) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var contents = e.target.result
                onLoadCallback(contents);
            }
            reader.readAsText(f);
        };

        $scope.getFileName = function(o) {
            $scope.$apply(function() {
                $scope.fileName = o[0].name;
            });
        };

        $scope.uploadFile = function(file,building) {
            var records = [];
            var temp = {
                buildingId: building._id,
                buildingOwner: building.owner,
                lines: records
            }
            var lines = file.split(/\r\n|\n/);
            var l = lines.length - 1;
            var j = 1;
            lines.forEach(function(line) {
                var line_parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                line_parts = line_parts || [];
                var record = [];
                var i = 1;
                line_parts.forEach(function(e) {
                    var v1 = e.replace(/\"/g, "");
                    var v = v1.replace(/,/g, "")
                    record.push({
                        value: v
                    });
                    i++;
                });
                records.push({
                    columns: record
                });
                j++;
            });
            return temp.lines;
        };
        
        $scope.startImport = function() {
            if (!$scope.fileName) {
                alert($translate.instant('MISSING_FILE'));
                return ;
            }
            $scope.isLoading = true;
            var f = document.getElementById('file-input').files[0];
            $scope.readFile(f, function(content) {
                $scope.lines = $scope.uploadFile(content, $rootScope.building);
                $scope.fileUploaded = true;
                $scope.isLoading = false;
            });
        };

        $scope.labelColumn = function(index, o) {
            if (o.column == 'amount') {
                $scope.amountColumn = index;
            } else if (o.column == 'date') {
                $scope.dateColumn = index;
            } else if (o.column == 'description') {
                $scope.descriptionColumn = index;
            } else if (o.column == 'id') {
                $scope.idColumn = index;
            }
        };

        $scope.toggle = function(item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
                $scope.rows.splice(idx, 1);
            } else {
                list.push(item);
                $scope.rows.push($scope.lines[item]);
            }
        };

        $scope.exists = function(item, list) {
            return list.indexOf(item) > -1;
        };

        $scope.finalImport = function() {
            if (
                $scope.amountColumn == -1 ||
                $scope.dateColumn == -1 ||
                $scope.descriptionColumn == -1
            ) {
                $mdDialog.show(
                    $mdDialog.alert()
                    //.parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($translate.instant("CASHIMP_MISS_FLDS"))
                    .textContent($translate.instant("CASHIMP_MISS_FLDS_DETAILS"))
                    .ariaLabel($translate.instant("CASHIMP_MISSING_FIELDS"))
                    .ok($translate.instant("OK"))
                    //.targetEvent(ev)
                );
                return;
            }
            if ($scope.selected.length<1) {
                $mdDialog.show(
                    $mdDialog.alert()
                    //.parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($translate.instant("CASHIMP_NO_ROWS"))
                    .textContent($translate.instant("CASHIMP_NO_ROWS_DETAILS"))
                    .ariaLabel($translate.instant("CASHIMP_NO_ROWS"))
                    .ok($translate.instant("OK"))
                    //.targetEvent(ev)
                );
                return;
            }
            $scope.isLoading = true;
            $scope.lines = [];
            $scope.rows.forEach(function(row) {
                // date format
                var d,m,f;
                try {
                    d = row.columns[$scope.dateColumn].value;
                    m = moment(d, $scope.dateFormat);
                } catch(e) {
                    $scope.importError = true;
                    $scope.importErrorLog += 'Date Value:' + d + '\r\n'; 
                }
                try {
                    f = parseFloat(row.columns[$scope.amountColumn].value)
                } catch(e) {
                    $scope.importError = true;
                    $scope.importErrorLog += 'Amount Value:' + row.columns[$scope.amountColumn].value + '\r\n'; 
                }
                var cash = {
                    description: row.columns[$scope.descriptionColumn].value,
                    amount: f,
                    date: m.clone().toDate(),
                    type: row.columns[$scope.amountColumn].value > 0 ? 'dues' : 'payment',
                    paid: true,
                    imported: true,
                    buildingId: $stateParams.buildingId,
                    owner: Meteor.user()._id,
                    captureDate: new Date
               }
                if ($scope.idColumn > -1) cash._id = row.columns[$scope.idColumn].value;

                $scope.lines.push(cash);
                $scope.importReady = true;
            });
            $scope.selected = [];
            $scope.rows = [];
            $scope.isLoading = false;
            if ($scope.importError) {
                $mdDialog.show(
                    $mdDialog.alert()
                    //.parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($translate.instant("CASHIMP_ERROR"))
                    .textContent($scope.importErrorLog)
                    .ariaLabel($translate.instant("CASHIMP_ERROR"))
                    .ok($translate.instant("OK"))
                    //.targetEvent(ev)
                );
                return;
            }
        };
        
        $scope.import = function() {
            $scope.isLoading = true;
            var alreadyExists = [];
            Meteor.call('importCash', $scope.lines, function(err, data) {
                if (err) {
                    console.log("Import error", err);
                } else {
                    if (data.exists.length>0) {
                        var existents = '';
                        data.exists.forEach(function(e) {
                            existents += '* ' + e.amount + ', ';
                        });
                        $mdDialog.show(
                            $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title($translate.instant("CASHIMP_EXISTS") + " " + data.exists.length)
                            .content(existents)
                            .ariaLabel($translate.instant("CASHIMP_EXISTS"))
                            .ok($translate.instant("OK"))
                        );
                    }
                    console.log('done', data);
                }
                $scope.isLoading = false;
                $scope.importDone = true;
            });
        }
    }
]);
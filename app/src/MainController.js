angular.module('nofapp-web')
.controller('MainController', function($scope, $mdSidenav, $mdBottomSheet, $log, $q, $mdToast, $firebaseObject, $firebaseArray, StatsList,
  StatsNotifications) {
  
  /*
  *   Toast
  */
  $scope.notificationsTriggered = 0;
  
  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  $scope.showSimpleToast = function(text) {
    $mdToast.show(
      $mdToast.simple()
        .content(text)
        .position($scope.getToastPosition())
        .hideDelay(3000)
    );
  };
  
  $scope.showEventNotification = function(event) {
    switch (event.type) {
      case 4: $scope.showSimpleToast("Someone just had Sex! Nice!"); break;
      case 5: $scope.showSimpleToast("Someone just relapsed :("); break;
    }
  };

  /*
  *   Counts
  */

  var refStats = new Firebase("https://nofapp.firebaseio.com/stats");
  $scope.stats = $firebaseObject(refStats);
  
  /*
  *   Events
  */

  var refEvents = new Firebase("https://nofapp.firebaseio.com/events");
  
  $scope.refEventsArray = $firebaseArray(refEvents);
  
  // $scope.statsNotifications = StatsNotifications;
  $scope.refEventsArray.$loaded().then(function() {
    $scope.refEventsArrayLength = $scope.refEventsArray.length;
    $scope.$watch(function() {
      return $scope.refEventsArray.length;
    }, function(length) {
      if (length !== $scope.refEventsArrayLength) {
        $scope.showEventNotification($scope.refEventsArray[length-1]);
      }
    });
  });

});

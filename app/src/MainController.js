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

  var sortEventSeriesByUser = function() {
    var events = {};
    for (i = 0; i < $scope.refEventsArray.length; i++) {
      if (typeof events[$scope.refEventsArray[i].uid] !== "undefined") {
        // User found in Array
        if ($scope.refEventsArray[i].type === 5) {
          // Relapse, extend Array
          events[$scope.refEventsArray[i].uid][events[$scope.refEventsArray[i].uid].length] = [];
        }
        // Enter Data
        events[$scope.refEventsArray[i].uid][events[$scope.refEventsArray[i].uid].length-1].push($scope.refEventsArray[i]);
      }
      else {
        // User not found in Array
        events[$scope.refEventsArray[i].uid] = [];
        events[$scope.refEventsArray[i].uid][0] = [];
        events[$scope.refEventsArray[i].uid][0].push($scope.refEventsArray[i]);
      }
    }
    console.log(events);
    splitEventSeriesIntoTypes(events);
  }
  
  var splitEventSeriesIntoTypes = function(events) {
    var eventsSplit = new Array(5);
    for (i = 0; i < eventsSplit.length; i++) {
      eventsSplit[i] = [];
    }
    
    for (var key in events) {
      // User Level
      for (j = 0; j < events[key].length; j++) {
        console.log(events[key][j]);
        // FapSeries Level
        // Get last Fap Time
        for (k = 0; k < events[key][j].length; k++) {
          if (events[key][j][k].type === 4) { var lastFap = events[key][j][k].time; break; }
        }
        
        console.log("lastFap: " + lastFap);
        
        for (k = 0; k < events[key][j].length; k++) {
          // Data Level. Finally!
          console.log(events[key][j][k]);
          console.log(eventsSplit[events[key][j][k].type].length);
          if (eventsSplit[events[key][j][k].type][eventsSplit[events[key][j][k].type].length-1] !== events[key] + "-" + events[key][j]) {
            eventsSplit[events[key][j][k].type].push(events[key] + "-" + events[key][j]);
          }
          eventsSplit[events[key][j][k].type][eventsSplit[events[key][j][k].type].length-1].push([events[key][j][k].time - lastFap, events[key][j][k].value]);
        }
      }
    }
  }

  var refEvents = new Firebase("https://nofapp.firebaseio.com/events");
  
  $scope.refEventsArray = $firebaseArray(refEvents.orderByChild("time"));
  
  // $scope.statsNotifications = StatsNotifications;
  $scope.refEventsArray.$loaded().then(function() {
    $scope.refEventsArrayLength = $scope.refEventsArray.length;
    sortEventSeriesByUser();
    $scope.$watch(function() {
      return $scope.refEventsArray.length;
    }, function(length) {
      if (length !== $scope.refEventsArrayLength) {
        $scope.showEventNotification($scope.refEventsArray[length-1]);
      }
    });
  });

});

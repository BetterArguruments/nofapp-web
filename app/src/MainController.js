angular.module('nofapp-web')
.controller('MainController', function($window, $scope, $mdSidenav, $mdBottomSheet, $log, $q, $mdToast, $firebaseObject, $firebaseArray, StatsList,
  StatsNotifications) {
  
    $scope.$watch(function(){
           return $window.innerWidth;
        }, function(value) {
          $scope.windowWidth = value;
       });
  
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
      default: $scope.showSimpleToast("Someone added some Data");
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
    var lastFap = null;
    var jSwitch = 0;
    var eventsSplit = new Array(6);
    for (i = 0; i < eventsSplit.length; i++) {
      eventsSplit[i] = {};
    }
    
    for (var key in events) {
      // User Level
      for (j = 0, jSwitch=1; j < events[key].length; j++, jSwitch=1) {
        // FapSeries Level
        // Get last Fap Time
        for (k = 0; k < events[key][j].length; k++) {
          if (events[key][j][k].type === 4) { lastFap = events[key][j][k].time; break; }
          if (k === events[key][j].length-1) { console.log("lastFap not found!"); }
        }
        
        for (k = 0; k < events[key][j].length; k++) {
          if (events[key][j][k].type === 5) {
            // Skip Fap
            continue;
          }
          // Data Level. Finally!
          
          // Initialize Array where FapSeries per User reside
          if (typeof eventsSplit[events[key][j][k].type][key] === "undefined") {
            eventsSplit[events[key][j][k].type][key] = [];
          }
          // Extend Array where single FapSeries reside
          if (jSwitch === 1 || eventsSplit[events[key][j][k].type][key].length === 0) {
            eventsSplit[events[key][j][k].type][key][eventsSplit[events[key][j][k].type][key].length] = [];
            jSwitch = 0;
          }
          eventsSplit[events[key][j][k].type][key][eventsSplit[events[key][j][k].type][key].length-1].push([events[key][j][k].time - lastFap, events[key][j][k].value]);
        }
      }
    }
    console.log(eventsSplit);
    extractEventData(eventsSplit);
  }
  
  var extractEventData = function(events) {
    var eventChartData = new Array(6);
    for (i = 0; i < eventChartData.length; i++) {
      eventChartData[i] = [];
    }
    
    for (i = 0; i < events.length; i++) {
      for (var key in events[i]) {
        for (j = 0; j < events[i][key].length; j++) {
          eventChartData[i].push({
            "key": key + "-" + j,
            "values": events[i][key][j]
          });
        }
      }
    }
    console.log(eventChartData);
    $scope.eventChartData = eventChartData;
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

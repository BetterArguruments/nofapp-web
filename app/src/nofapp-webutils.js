// Angular Module for entering data into the database
// The most awesome DB Manager!
angular.module('nofapp-web.utils', ['firebase'])

.factory('Stats', function($firebaseArray) {
  function Stats(snap) {
    this.id = snap.key();
    this.val = snap.val();
  }
  
  Stats.prototype = {
    update: function(snap) {
      if (snap.val() !== this.val) {
        this.val = snap.val();
        return true;
      }
      return false;
    },
    toJSON: function() {
      return this.val;
    }
  };
  
  return Stats;
})

.factory('StatsFactory', function($firebaseArray, Stats, StatsNotifications) {
  return $firebaseArray.$extend({
    
    $$added: function(snap) {
      StatsNotifications.val = new Stats(snap);
      return new Stats(snap);
    },
    
    $$updated: function(snap) {
      var stat = this.$getRecord(snap.key());
      return stat.update(snap);
    },
    
    $$getKey: function(rec) {
      return rec.id;
    }
    
  });
})

.factory('StatsNotifications', function() {
  var self = this;
  self.val = {};
  return self;
})

.factory('StatsList', function(StatsFactory) {
  
  return function(ref) {
    return new StatsFactory(ref);
  };
  
});
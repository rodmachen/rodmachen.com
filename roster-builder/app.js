angular.module('roster', ['ngStorage','firebase',])
.controller('MainCtrl', function($scope, $localStorage, $firebaseArray) {

  var players = $firebaseArray(new Firebase('https://torrid-torch-9549.firebaseio.com/'));
  $scope.players = players;
  $scope.players.$loaded().then(function(players) {
    if (!$scope.players.length) {
      $scope.players.$add({num: 01, last: 'Murray', first: 'Kyler', pos: 'QB'});
      $scope.players.$add({num: 10, last: 'Allen', first: 'Kyle', pos: 'QB'});
      // $scope.players.$add({num: 01, last: 'Murray', first: 'Kyler', pos: 'QB'};
      // $scope.players.$add({num: 02, last: 'Noil', first: 'Speedy', pos: 'WR'};
      // $scope.players.$add({num: 03, last: 'Kirk', first: 'Christian', pos: 'WR'};
      // $scope.players.$add({num: 9, last: 'Brees', first: 'Drew', pos: 'QB'};
    }
  });

  $scope.sortType     = 'num';
  $scope.sortReverse  = false;

  $scope.addPlayer = function() {
    $scope.players.$add({num: $scope.num, last: $scope.last, first: $scope.first, pos: $scope.pos});
    $scope.num = '';
    $scope.last = '';
    $scope.first = '';
    $scope.pos = '';
  };

  $scope.removePlayer = function(player) {
    for (var i = 0; i < $scope.players.length; i++) {
      if ($scope.players[i] === player) {
        $scope.players.$remove(i);
      }
    }
  };

});

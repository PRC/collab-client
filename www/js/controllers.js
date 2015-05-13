angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(){
    $scope.chats.pop()
  }
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('DecisionsCtrl', function($scope, Decisions) {
  $scope.decisions = [];

  Decisions.all().then(function(doc){
    $scope.$apply( $scope.decisions[0] = decision(doc) );
  })

  Decisions.onUpdate(function(doc){
    $scope.$apply( $scope.decisions[0] = decision(doc) );
  })

  $scope.save = function(){
    console.log('saving')
    Decisions.save($scope.decisions[0])
  }

  $scope.answer = function(answer) {
    console.log('answering decision');
    if (!$scope.decisions[0].answers) $scope.decisions[0].answers = [];
    $scope.decisions[0].answers.push(answer);
    Decisions.save($scope.decisions[0]);
  }

  function decision(doc) {
    doc.yesPercent = function() {
      var total = 0;
      for (i = 0; i < doc.answers.length; i++) {
        if (doc.answers[i]) total++;
      }
      return Math.round(total / doc.answers.length * 100);
    };

    doc.noPercent = function() {
      var total = 0;
      for (i = 0; i < doc.answers.length; i++) {
        if (!doc.answers[i]) total++;
      }
      return Math.round(total / doc.answers.length * 100);
    };

    console.log('yes % = ' + doc.yesPercent());
    console.log('no % = ' + doc.noPercent());

    return doc;
  }
  
});


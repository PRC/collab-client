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
  $scope.decisions = {};
  $scope.data      = {};

  //listens to DB updates - merges remote diffs (to be changed)
  Decisions.synchDB(function(result){
    console.log('controller: synchDB(' + result + ')');
    $scope.$apply(function(){
      _.each(result, function(element, index, list){
        $scope.decisions[element._id] = element;
      })}
    );
  });

  //retrieves all decisions
  Decisions.getDecisions(function(result){
    console.log('controller: getDecisions(' + result + ')');
    $scope.$apply($scope.decisions = result);
  });

  //adds a decision by passing a question
  $scope.addDecision = function(){
    console.log('controller: addDecision(' + $scope.data.question + ')');
    Decisions.addDecision($scope.data.question); 
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
    $scope.data.question = '';
  }

  //updates a decision
  $scope.updateDecision = function(decision){
    console.log('controller: updateDecision(' + decision + ')');
    Decisions.updateDecision(decision);
  }

  //removes a decision
  $scope.removeDecision = function(decision){
    console.log('controller: removeDecision(' + decision + ')');
    Decisions.removeDecision(decision);
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
  }
  
  //accepts a decision
  $scope.acceptDecision = function(decision){
    console.log('controller: acceptDecision(' + decision + ')');
    Decisions.addAnswer(decision, true);
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
  }

  //rejects a decision
  $scope.rejectDecision = function(decision){
    console.log('controller: rejectDecision(' + decision + ')');
    Decisions.addAnswer(decision, false);
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
  }
});


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
  //init
  $scope.decisions = {};
  $scope.data      = {};

  var DEBUG = Decisions.getDebug();

  //retrieves all decisions
  Decisions.getDecisions(function(result){
    if(DEBUG){console.log('controller: getDecisions(', result, ')');}
    $scope.$apply($scope.decisions = result);
  });

  //listens to DB updates - merges remote diffs (to be changed)
  Decisions.synchDB(function(result){
    if(DEBUG){console.log('controller: synchDB(', result, ')');}
    $scope.$apply(function(){
      _.each(result, function(element, index, list){
        if(element._deleted){
          delete($scope.decisions[element._id]);
        } else {
          $scope.decisions[element._id] = element;
        }
      })}
    );
  });

  //adds a decision by passing a question
  $scope.addDecision = function(){
    if(DEBUG){console.log('controller: addDecision(', $scope.data.question, ')');}
    Decisions.addDecision($scope.data.question); 
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
    $scope.data.question = '';
  }

  //updates a decision
  $scope.updateDecision = function(decision){
    if(DEBUG){console.log('controller: updateDecision(', decision, ')');}
    Decisions.updateDecision(decision);
  }

  //removes a decision
  $scope.removeDecision = function(decision){
    if(DEBUG){console.log('controller: removeDecision(', decision, ')');}
    Decisions.removeDecision(decision);
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
  }
  
  //adds an answer to a decision
  $scope.setDecision = function(decision, answer){
    if(DEBUG){console.log('controller: acceptDecision(', decision, ', ', answer, ')');}
    Decisions.addAnswer(decision, answer);
    Decisions.getDecisions(function(result){
      $scope.$apply($scope.decisions = result);
    });
  }

});


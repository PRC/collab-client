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
    console.log('first doc', doc)
    doc.numAnswers = _.size(doc.answers)
    doc.trueAnswers = _.filter(doc.answers, function(answer){
      return answer;
    })
    doc.numTrue = _.size(doc.trueAnswers);
    $scope.$apply(function(){
      $scope.decisions[0] = doc;
    });
  })

  Decisions.onUpdate(function(doc){
    //@TODO create a doc factory to hydrate this
    doc.numAnswers = _.size(doc.answers)
    doc.trueAnswers = _.filter(doc.answers, function(answer){
      return answer;
    })
    doc.numTrue = _.size(doc.trueAnswers);
    $scope.$apply( 
      $scope.decisions[0] = doc 
    );
  })

  $scope.save = function(){
    console.log('saving', $scope.decisions[0])
    console.log('underscore', _)
    Decisions.save($scope.decisions[0])
  }
  
})

.controller('SignInCtrl', function($scope, $state, Decisions) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    Decisions.signIn(user)
    $state.go('tab.decisions');
  };
  
});


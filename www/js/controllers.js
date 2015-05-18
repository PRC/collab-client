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
    $scope.$apply( $scope.decisions[0] = doc );
  })

  Decisions.onUpdate(function(doc){
    $scope.$apply( $scope.decisions[0] = doc );
  })

  $scope.save = function(){
    console.log('saving')
    Decisions.save($scope.decisions[0].question)
  }
  
})

.controller('SignInCtrl', function($scope, $state) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('tab.decisions');
  };
  
});


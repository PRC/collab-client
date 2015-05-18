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
    if(Decisions.user){
      console.log('have user checkig', Decisions.user)
      doc.myAnswer = doc.answers[Decisions.user.username];
    }
    $scope.$apply(function(){
      $scope.decisions[0] = doc;
    });
  })

  Decisions.onUpdate(function(doc){
    console.log('updating', Decisions.user)
    //@TODO create a doc factory to hydrate this
    doc.numAnswers = _.size(doc.answers)
    doc.trueAnswers = _.filter(doc.answers, function(answer){
      return answer;
    })
    doc.numTrue = _.size(doc.trueAnswers);
    if(Decisions.user){
      console.log('have user checkig', Decisions.user)
      doc.myAnswer = doc.answers[Decisions.user.username];
    }
    $scope.$apply( 
      $scope.decisions[0] = doc 
    );
  })

  $scope.save = function(){
    if(Decisions.user){
      if($scope.decisions[0].myAnswer === "true"){
        $scope.decisions[0].answers[Decisions.user.username] = true;
      } else {
        $scope.decisions[0].answers[Decisions.user.username] = false;
      }
    }
    Decisions.save( $scope.decisions[0] )
  }
  
})

.controller('SignInCtrl', function($scope, $state, Decisions) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    Decisions.signIn(user)
    $state.go('tab.decisions');
  };
  
});


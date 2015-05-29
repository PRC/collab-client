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

.controller('GroupsCtrl', function($scope, $state, Groups) {
  // $scope.groups = Groups.all();
  $scope.newGroup = {}
  if(!Groups.user){ 
    console.log("no user on group", Groups)
    $state.go('/sign-in');
  } else{
    console.log('have user')
  }

  Groups.all(function(groups){ 
    console.log('got groups', groups)
    $scope.$apply(function(){
      $scope.groups = groups;
    });
  })

  Groups.onUpdate(function(groups){  
    $scope.$apply(function(){
      $scope.groups = groups;
    });
  })

  $scope.addGroup = function(){
    console.log('trying to add group', $scope.newGroup);
    Groups.addGroup($scope.newGroup.name)
  }
})

.controller('GroupDetailCtrl', function($scope, $stateParams, Groups, Group) {

  console.log('group detail controller $stateParams', $stateParams)
  $scope.decisions = [];

  var group = new Group($stateParams.groupName, Groups.user)

  console.log('group', group)

  group.getAllDecisions(function(decisions){
    console.log('got decisions', decisions);
    $scope.$apply(function(){
      $scope.decisions = decisions;
    });
  })

  group.onUpdate(function(decision){
    console.log('something changed', decisions);
    $scope.$apply(function(){
      $scope.decisions = decisions;
    });  
  })

  $scope.save = function(){
    console.log('saving', Groups.user)
    if(Groups.user){
      if($scope.decisions[0].myAnswer === "true"){
        $scope.decisions[0].answers[Groups.user.name] = true;
      } else {
        $scope.decisions[0].answers[Groups.user.name] = false;
      }
    }
    group.save( $scope.decisions[0] )
  }
})

.controller('SignInCtrl', function($scope, $state, Groups) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    Groups.signIn(user, function(user){
      console.log('success', user)
      $state.go('tab.groups');
    }.bind(this))  
  };
  
});


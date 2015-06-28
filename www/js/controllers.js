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
  $scope.newGroup = {};
  if(!Groups.user){ 
    console.log("no user on group", Groups);
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
    Groups.addGroup($scope.newGroup.name);
  }
})

.controller('GroupDetailCtrl', function($scope, $stateParams, Groups, Group) {

  console.log('group detail controller $stateParams', $stateParams)
  $scope.decisions = [];
  $scope.newDecision = {};
  $scope.newUser = {};

  var group = new Group($stateParams.groupName, Groups.user);

  console.log('group', group);

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

  $scope.save = function(index){
    console.log('saving index', index);
    if(Groups.user){
      if($scope.decisions[index].myAnswer === "true"){
        $scope.decisions[index].answers[Groups.user.name] = true;
      } else {
        $scope.decisions[index].answers[Groups.user.name] = false;
      }
    }
    group.save( $scope.decisions[index] )
  }

  $scope.addDecision = function(){
    console.log('trying to add group', $scope.newDecision);
    console.log('sup brah');
    group.addDecision($scope.newDecision.question);
  }

  $scope.addUser = function(){
    console.log('trying to add user', $scope.newUser);

    group.addUser($scope.newUser.name);
  }
})

.controller('SignInCtrl', function($scope, $state, Groups) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    Groups.signIn(user, function(user){
      console.log('success', user);
      $state.go('tab.groups');
    }.bind(this))  
  }

  $scope.signUp = function(user) {
    console.log('Sign-Up', user);
    Groups.signUp(user, function(user){
      console.log('success', user);
      $state.go('tab.groups');
    }.bind(this))  
  } 

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

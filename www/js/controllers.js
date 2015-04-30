angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(){
    $scope.chats.pop()
  }
  setTimeout(function(){
    console.log('removing');
    $scope.$apply($scope.remove());
    // $scope.chats.push({
    //   id: 1,
    //   name: 'NEW GUY',
    //   lastText: 'Come late',
    //   face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    // })
  }, 1000)
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


.controller('DecisionsCtrl', function($scope) {
  //test to see can play with pouchdb
  console.log('pouchDB constructor', PouchDB)
  var db = new PouchDB('decisions-jakamama', {adapter : 'websql'});
  var db = new PouchDB('decisions-jakamama'); //if testing in firefox
  console.log('have local db', db);
  // var remotedb = new PouchDB('http://localhost:3000/decisions-jakamama');//local node CORS problems
  var remotedb = new PouchDB('http://jakamama.iriscouch.com/decisions-jakamama');// remote working
  // var remotedb = new PouchDB('http://localhost:5984/decisions-jakamama');//remote working
  console.log('have remoteDB', remotedb);

  // $scope.decisions = [{id:1, question:"Who is jakamama?"}];
  $scope.decisions = [];

  db.get('1').then(function(doc){
    console.log('doc', doc);
    $scope.$apply( $scope.decisions[0] = doc );
  })

  db.sync(remotedb).on('complete', function () {
    // yay, we're in sync!
    console.log('something has changed dude')
    db.get('1').then(function(doc){
      console.log('doc', doc);
      $scope.$apply( $scope.decisions[0] = doc );
    })
  }).on('error', function (err) {
    console.log('error', err)
    // boo, we hit an error!
  });

  db.sync(remotedb, {
    live: true,
    retry: true
  }).on('change', function (change) {
    console.log("Something has changed dude")
    // yo, something changed!
    db.get('1').then(function(doc){
      console.log('doc', doc);
      $scope.$apply( $scope.decisions[0] = doc );
    })
  });


  $scope.save = function(){
    console.log('saving')
    db.get('1').then(function(doc) {
      return db.put({
        _id: '1',
        _rev: doc._rev,
        question: $scope.decisions[0].question
      });
    }).then(function(response) {
      console.log("local db updated!");
    }).catch(function (err) {
      console.log(err);
    });
  }
});


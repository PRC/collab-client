var module = angular.module('starter.services', [])

module.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Jimmy de Jew',
    lastText: 'Have you got my money, oy vey?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Handsome Iain Ronald + 1',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

module.factory('Decisions', function(){
  var localDB = new PouchDB('decisions-jakamama', {adapter : 'websql'});//remove adaptrer if testing in firefox
  console.log('have localDB', localDB);
  var remoteDB = new PouchDB('http://jakamama.iriscouch.com/decisions-jakamama');// remote working
  console.log('have remoteDB', remoteDB);

  return {
    all:function(){
      return localDB.get('1')
    },

    onUpdate:function(callBack){
      localDB.sync(remoteDB).on('complete', function () {
        // yay, we're in sync!
        console.log('something has changed dude')
        localDB.get('1').then(function(doc){
          console.log('doc', doc);
          callBack(doc)
        })
      }).on('error', function (err) {
        console.log('error', err)
        // boo, we hit an error!
      });

      localDB.sync(remoteDB, {
        live: true,
        retry: true
      }).on('change', function (change) {
        console.log("Something has changed dude")
        // yo, something changed!
        localDB.get('1').then(function(doc){
          console.log('doc', doc);
          callBack(doc)
        })
      });      
    },

    save:function(question){
      localDB.get('1').then(function(doc) {
        return localDB.put({
          _id: '1',
          _rev: doc._rev,
          question: question
        });
      }).then(function(response) {
        console.log("local db updated!");
      }).catch(function (err) {
        console.log(err);
      });      
    }
  }

})

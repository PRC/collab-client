var module = angular.module('starter.services', [])

module.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Mark Sparrow',
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
  console.log('local DB established');
  var remoteDB = new PouchDB('http://jakamama.iriscouch.com/decisions-jakamama');// remote working
  console.log('remote DB established');

  return {
    
    //synchs local DB with remote
    synchDB: function(callback){
     console.log('services: synchDB()');
     localDB.sync(remoteDB, {
        live : true
       ,retry: true
      }).on('change', function(result){
        console.log(result);
        callback(result.change.docs);
      }).on('error', function (err) {
        console.log(err);
      });
    },

    //returns a collection of all decisions from local DB
    getDecisions: function(callback){
      console.log('services: getDecisions()');
      localDB.allDocs({
        include_docs: true
       ,descending  : true
      }).then(function(result){
        var decisions = _.object(_.pluck(result.rows, 'id'), _.pluck(result.rows, 'doc'));        
          callback(decisions);
        }).catch(function (err) {
          console.log(err); 
        });
    },

    //adds a decision to the local DB and sets its one and only question
    addDecision: function(question) {
      console.log('services: addDecision(' + question + ')');
      var decision = {
        _id     : new Date().toISOString()
       ,_deleted: false
       ,question: question
       ,answers : []
      }
      localDB.put(decision, function(err, result) {
        if (err) {return console.log(err);}
      });
    },

    //removes a decision from local DB by flagging it as 'deleted'
    removeDecision: function(decision) {
      console.log('services: removeDecision(' + decision + ')');
      decision._deleted= true;
      localDB.put(decision, function(err, result) {
        if (err) {return console.log(err);}
      });
    },
    
    //updates a decision and all its attributes in the local DB
    updateDecision: function(decision) {
      console.log('services: updateDecision(' + decision + ')');
      localDB.put(decision, function(err, result) {
        if (err) {return console.log(err);}
      });
    },

    //adds an answer to the array of answers of a given decision and updates local DB
    addAnswer: function(decision, answer){
      console.log('services: addAnswer(' + decision + ', ' + answer + ')');
      decision.answers.push(answer);
      localDB.put(decision, function(err, result) {
        if (err) {return console.log(err);}
      });
    }

  }
})

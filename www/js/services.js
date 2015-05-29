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
    name: 'Jimmy',
    lastText: 'Have youy?',
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

module.factory('Groups', function($http){

  return {

    all: function(callback){
      // return [
      //   {id:1, name: "decisions-jakamama-jay"},
      //   {id:2, name: "decisions-STC"}
      // ]#
      console.log('trying to find 1', this.localGroupsDB)
      this.localGroupsDB.allDocs({include_docs: true}).then(function(docs){
        if(docs.rows.length > 0){
          console.log('alldocs', docs);
          console.log('docs.rows[0]', docs.rows[0].doc)
          callback(docs.rows[0].doc.groups)
        }
      }.bind(this))
    },

    onUpdate:function(callback){
      this.localGroupsDB.on('change', function (change) {
        this.localGroupsDB.allDocs({include_docs: true}).then(function(docs){
          console.log('alldocs', docs);
          console.log('docs.rows[0]', docs.rows[0].doc)
          callback(docs.rows[0].doc.groups)
        }.bind(this))
      }.bind(this))
    },

    signIn:function(user, success){
      console.log('sign in user', user)
      var signInDB = new PouchDB('http://jakamama.iriscouch.com/decisions-jakamama');
      signInDB.login(user.username, user.password).then(function (user) {
        console.log("I'm user", user);
        console.log('this', this)
        this.user = user;
        this.localGroupsDB = new PouchDB(user.name, {adapter : 'websql'});
        console.log('have localDB', this.localGroupsDB);
        var remoteDB = new PouchDB('http://jakamama.iriscouch.com/' + user.name);
        console.log('have remoteDB', remoteDB);
        // this.localGroupsDB.sync(remoteDB, { live:true, retry:true } );
        // PouchDB.replicate(remoteDB, this.localGroupsDB, { live:true, retry:true })
        this.localGroupsDB.sync(remoteDB, { live:true, retry:true } );
        success(user);
      }.bind(this));
    },

    addGroup:function(name){
      if(!this.user){return false}
      console.log('name', name)
      // add it to the list - should we do this l
      this.localGroupsDB.allDocs({include_docs: true}).then(function(docs){
        var groupsDoc = docs.rows[0].doc
        groupsDoc.groups.push( { id:3,  name:name} )
        console.log('adding group', groupsDoc )
        this.localGroupsDB.put(groupsDoc); 
      }.bind(this))
      
      //create a new database -need my admin friend to do this so send over deets
      // var newRemoteDB = new PouchDB('http://jakamama.iriscouch.com/' + name);
      //should use a POST for this but getting cors shit so not doing for meantime
      $http.get('http://localhost:8080?name=' + name + '&user=' + this.user.name)
      //edit the security document new databse so only this.user can edit"'
    }
    // signUp:function(user){
    //   remoteDB.signup(user.username, user.password, {
    //     metadata : {
    //     }
    //   }, function (err, response) {
    //     // etc.
    //   });      
    // },
  }
});
module.factory('Group', function(){
  var Group = function(name, user){
    this.name = name;
    this.user = user;
    this.localDB = new PouchDB(name, {adapter : 'websql'});
    var remoteDB = new PouchDB('http://jakamama.iriscouch.com/' + name);
    this.localDB.sync(remoteDB, { live:true, retry:true } );
  }
  Group.prototype = {
    docToDecision:function(doc){
      console.log('THE DOC', doc)
      var decision = {}
      decision._id = doc._id;
      decision.question = doc.question;
      decision.answers = doc.answers;
      decision.numAnswers = _.size(doc.answers);
      decision.trueAnswers = _.filter(doc.answers, function(answer){
        return answer;
      })
      decision.numTrue = _.size(decision.trueAnswers);
      decision.myAnswer = doc.answers[this.user.name];
      return decision;
    },
    getAllDecisions: function(callback){
      this.localDB.allDocs({include_docs: true}).then(function(docs){
        console.log('alldocs', docs);
        console.log('docs.rows[0]', docs.rows[0].doc)
        decisions = docs.rows.map(function(result){
          return this.docToDecision(result.doc);
        }.bind(this));
        console.log('decisions', decisions)
        callback(decisions)
      }.bind(this))      
    },
    onUpdate:function(callback){
      this.localDB.on('change', function (change) {
        console.log("Something has changed dude")
        this.getAllDecisions(callback)
      }.bind(this))  
    },
    addUser:function(user){
      //want to add to the security document of thr group
      //want to add the list of groups on the user database
    },
    save:function(newDoc){
      console.log('saving new Doc', newDoc)
      this.localDB.get(newDoc._id).then(function(doc) {
        return this.localDB.put({
          _id: doc._id,
          _rev: doc._rev,
          question: newDoc.question,
          answers: newDoc.answers
        });
      }.bind(this)).then(function(response) {
        console.log("local db updated!");
      }).catch(function (err) {
        console.log(err);
      });      
    }
  }

  return Group;
})

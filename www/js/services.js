var module = angular.module('starter.services', [])

module.factory('Util', function(){
  var devDb = "http://localhost:5984/";
  var remoteDb ="http://jakamama.iriscouch.com/";

  var devAdminDb = "http://admin:jakamama@localhost:5984/";
  var remoteAdminDb ="http://admin:jakamama@jakamama.iriscouch.com/";

  var devServer = "http://localhost:8080/"
  var remoteServer = "https://hydro-minister-3539.herokuapp.com/"
  return {
    server: devServer,
    db: devDb,
    adminDb:devAdminDb
  }
})


module.factory('Admin', function(Util){
  return{
    createUserDb: function(username){
      console.log('username', username)
      var db = new PouchDB( Util.db + username );
      console.log('db', db);
      console.log('db', db);
      return db.info()
    }
  }
})

module.factory('AuthDB', function(Util){
  return new PouchDB(Util.db + 'temp_users');
})


module.factory('Groups', function($http, AuthDB, Util, Admin){

  return {
    all: function(callback){
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
      this.localGroupsDB.sync(this.remoteDB, { live:true, retry:true, include_docs:true } ).on('change', function(info){
        console.log('something has changed SYNNC', info)
        if(info.direction == "pull"){
          callback(info.change.docs[0].groups)
        }
      }.bind(this));
    },

    signIn:function(user, success){
      console.log('sign in ', Util)
      this.signOut()
      console.log('sign in user', user)
      AuthDB.login(user.username, user.password).then(function (user) {
        console.log("I'm user", user);
        console.log('this', this)
        this.user = user;
        this.localGroupsDB = new PouchDB(user.name, {adapter : 'websql'});
        this.remoteDB = new PouchDB(Util.db + user.name);
        console.log('have localDB', this.localGroupsDB);
        console.log('have remoteDB', this.remoteDB);
        success(user);
      }.bind(this));
    },

    signUp: function(user, success){
      //get reference to service in order to call other service
      this.signOut()
      var self = this;
      console.log('sign up user')
      AuthDB.signup(user.username, user.password, function(err, response){
        if (err){
          if (err.name === 'conflict') {
            console.log('Username already exists, Error: ', err, response)
          }else if (err.name === 'forbidden'){
            console.log('Forbidden characters used, Error: ', err, response)
          }else {
            console.log('Error: ', err, response)
          }
        }
        else{
          //When the user has successfully been signed up, call the host to create the users db
          console.log('trying to createUserDb')
          Admin.createUserDb(user.username).then(function(result){
            console.log('db has been created with info', result)
            self.signIn(user, success)
          }).catch(function(err){
            console.log('error creating the user database', err)
          })
         //  $http.get(Util.server + 'add_user?name=' + user.username + '&user=' + user.username).success(function(data, status, headers, config) {
         //    // this callback will be called asynchronously when the response is available
         //    console.log('add group request success' + status)
         //    //signIn using the new user.
         //    self.signIn(user, success)
         //  }).error(function(data, status, headers, config) {
         //    // called asynchronously if an error occurs or server returns response with an error status.
         //    console.log('add group request failure', headers )
         // });
        }
      });
     },

    signOut: function(){
      AuthDB.logout(function(err, response){
        if(err){
          console.log("Something went bad when logging out")
          return;
        }
        console.log('just logged out')
      })
    },


    addGroup:function(name){
      if(!this.user){return false}


      //@TODO create a new localdb so can progress without connection

      //create a new database on remote -need my admin friend to do this so send over deets
      //should use a POST for this but getting cors shit so not doing for meantime
      $http.get(Util.server + 'add_group?name=' + name + '&user=' + this.user.name).
        success(function(data){
          console.log('heroku created a group for use ')
        }).
        error(function(data){
          console.log('heroku bailed on creating a group boo ')
        });

      //@TODOedit the security document new databse so only this.user can edit"'
    }
  }
});
module.factory('Group', function($http, Util){
  var Group = function(name, user){
    this.name = name;
    this.user = user;
    this.localDB = new PouchDB(name, {adapter : 'websql'});
    this.remoteDB = new PouchDB(Util.db + name);
    this.localDB.sync(this.remoteDB, { live:true, retry:true } );
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
        decisions = []
        docs.rows.forEach(function(result){
          if(result.doc._id != "users"){
            decisions.push(this.docToDecision(result.doc));
          }
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
    addDecision:function(question){
      console.log('adding decision', question)
      this.localDB.get("users").then(function(doc){
        answers = {}
        doc.users.forEach(function(user){
          answers[user] = false
        })
        this.localDB.post({question: question, answers:answers}); //change to put and manually create id
      }.bind(this))
    },
    addUser:function(newUser){
      //Add user to the users table of the group db
      this.localDB.get("users").then(function(doc){
        var users = doc.users;
        users.push(newUser)
        return this.localDB.put({
          _id: doc._id,
          _rev: doc._rev,
          users: users
        });
      }.bind(this)) 

      //Add user to the members on the security document of the group
      //@TODO must have connection to internet, how to remove this
      this.remoteDB.get("_security").then(function(doc){
        var members = doc.members
        members.names.push(newUser)
        this.remoteDB.request({
          method: 'PUT',
          url: '_security',  
          body: {
            admins: doc.admins,
            members: members
          }
        }).then(function(){
          console.log('security doc updated')
        });
      }.bind(this))

      //Add the group to the list of groups on the user database
      //@TODO must have connection to internet, how to remove this
      var userDB = new PouchDB(Util.db + newUser);
      console.log('userDB', userDB);
      userDB.allDocs({include_docs: true}).then(function(docs){
        console.log('alldocs', docs);
        console.log('docs.rows[0]', docs.rows[0].doc)
        var userDoc = docs.rows[0].doc;
        var groups = userDoc.groups || [];
        groups.push( { id:'xxx', name:this.name } );
        return userDB.put({
          _id: userDoc._id,
          _rev: userDoc._rev,
          groups: groups
        });

      }.bind(this))    

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
  };
    
  return Group;//return group const
})

module.factory('Decisions', function(Util){
  //init
  var DEBUG = true;

  var localDB = new PouchDB('decisions-jakamama', {adapter : 'websql'});//remove adaptrer if testing in firefox
  if(DEBUG){console.log('local DB established', localDB);}
  var remoteDB = new PouchDB(Util.db + 'decisions-jakamama');// remote working
  if(DEBUG){console.log('remote DB established', remoteDB);}

  return {
    //utils
    getDebug: function(){
      return DEBUG;
    },

    //synchs local DB with remote
    synchDB: function(callback){
     if(DEBUG){console.log('services: synchDB(', callback, ')');}
     localDB.sync(remoteDB, {
        live : true
       ,retry: true
      }).on('change', function(result){
        callback(result.change.docs);  
      }).on('error', function (err) {
        console.log(err);
      });
    },

    //returns a collection of all decisions from local DB
    getDecisions: function(callback){
      if(DEBUG){console.log('services: getDecisions(', callback, ')');}
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
      if(DEBUG){console.log('services: addDecision(', question, ')');}
      var decision = {
        _id     : new Date().toISOString()
       ,question: question
       ,answers : []
      }
      localDB.put(decision, function(err, result) {
        if(err){return console.log(err);}
      });
    },

    //removes a decision from local DB by flagging it as 'deleted'
    removeDecision: function(decision) {
      if(DEBUG){console.log('services: removeDecision(', decision, ')');}
      decision._deleted = true;
      localDB.put(decision, function(err, result) {
        if(err){return console.log(err);}
      });
    },
    
    //updates a decision and all its attributes in the local DB
    updateDecision: function(decision) {
      if(DEBUG){console.log('services: updateDecision(', decision, ')');}
      localDB.put(decision, function(err, result) {
        if(err){return console.log(err);}
      });
    },

    //adds an answer to the array of answers of a given decision and updates local DB
    addAnswer: function(decision, answer){
      if(DEBUG){console.log('services: addAnswer(', decision, ', ', answer, ')');}
      decision.answers.push(answer);
      localDB.put(decision, function(err, result) {
        if(err){return console.log(err);}
      });
    }

  }
})

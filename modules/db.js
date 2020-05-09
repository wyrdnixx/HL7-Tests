import MongoClient from 'mongodb';

//var url = "mongodb://localhost:27017/testhl7DB";
var user = encodeURIComponent('root');
var password = encodeURIComponent('example');
var authMechanism = 'DEFAULT';

// Connection URL
//var url = `mongodb://${user}:${password}@localhost:27017/myproject?authMechanism=${authMechanism}`;

//var url = `mongodb://${user}:${password}@localhost:27017/testhl7DB`;
//var url = `mongodb://root:example@localhost:27017/testhl7DB`;
var url = `mongodb://localhost:27017`;
var database = "hl7tests";

class db {
    

    constructor(testmsg) {

        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db(database);
          dbo.createCollection("pat", function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
            db.close();
          });
        });

    }

    dbAddPat (pat) {

        //console.log('in dbAddPat')



        MongoClient.connect(url &"1", function(err, db) {
            if (err) throw err;
            var dbo = db.db("hl7tests");
            //var myobj = { name: "Company Inc", address: "Highway 37" };
            dbo.collection("pat").insertOne(pat, function(err, res) {
              if (err) callback(new Error(err));
              console.log("1 document inserted");
              db.close();
            });
          });    
    }

    

}

export default new db();
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
var collection = "pat";
class db {
    

    constructor(testmsg) {

        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db(database);
          dbo.createCollection(collection, function(err, res) {
            if (err) throw err;
            //console.log("Collection created!");
            db.close();
          });
        });

    }

    dbAddPat (pat, done) {

        //console.log('in dbAddPat')


        MongoClient.connect(url, function(err, db) {
            if (err) {
                //console.log('db error: ',err.message)
                return done (Error (`DB Connection error: ${ err.message} `));
            }
            else{

                var dbo = db.db(database);
                //var myobj = { name: "Company Inc", address: "Highway 37" };
                dbo.collection(collection).insertOne(pat, function(err, res) {
                    
                    if (err) return done (Error ('DB insert error: ',err.message));
                    else
                       // console.log("1 document inserted");
                    db.close();
                    return done (null);
                });                
            }            
          });    
          
    }

    

}

export default new db();
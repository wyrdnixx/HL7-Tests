import MongoClient from 'mongodb';
import eventBus from './eventbus.js';


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
          if (err)  throw err;

          var dbo = db.db(database);
          dbo.createCollection(collection, function(err, res) {
            if (err) throw err;
            //console.log("Collection created!");
            db.close();
          });
        });

    }

    dbAddPat (pat, done) {

        MongoClient.connect(url, function(err, db) {
            if (err) {
                //console.log('db error: ',err.message)
                eventBus.emit('ACK-ERR',clientId, hl7,207, `database connection error:${err}`);
                return done (Error (`DB Connection error: ${ err.message} `));
            }
            else{

                var dbo = db.db(database);
                //var myobj = { name: "Company Inc", address: "Highway 37" };

                var checkpat = {
                    "pat" : pat['pat']
                    }
                
                   dbo.collection(collection).find(checkpat).toArray(function(err, result) {
                    if (err) {
                        eventBus.emit('ACK-ERR',clientId, hl7,207, `database connection error:${err}`);
                        return done;
                    }
                    //return done (Error ('DB checkpat error: ',err.message));
                    
                    if (result.length != '0' ) {
                        //console.log('patient doppelt: ', result.length)
                        
                        // errorcode 205 = duppölicate key identifier
                        return done (Error ('Patient allready exists'), 205);
                        
                    } else {
                        dbo.collection(collection).insertOne(pat, function(err, res) {
                    
                            if (err) {
                                // errorcode 207 = Application internal errer
                                return done (Error ('database connection error'), 207);                                
                            }
                            
                            else
                               // console.log("1 document inserted");
                            db.close();
                            return done (null);
                        }); 
                    }
                    //console.log(result);
                    db.close();
                  });


                               
            }            
          });    
          
    }

    

}

export default new db();
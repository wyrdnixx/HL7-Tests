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
          });          

          db.close();
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
               
                var checkpat = {
                    "pat" : pat['pat']
                    }
                
                   dbo.collection(collection).find(checkpat).toArray(function(err, patfound) {
                    if (err) {
                        eventBus.emit('ACK-ERR',clientId, hl7,207, `database connection error:${err}`);
                        return done;
                    }                    
                    
                    if (patfound.length != '0' ) {
                     
                        return done (Error ('Patient allready exists'), 205);
                        
                    } else {
                        dbo.collection(collection).insertOne(pat, function(err, res) {
                    
                            if (err) {
                                // errorcode 207 = Application internal errer
                                return done (Error ('database error on pat insert'), 207);                                
                            }                               
                            
                        }); 

                    }
                    //console.log(result);
                    db.close();
                    return done (null);
                  });


                               
            }            
          });    
          
    }


    dbupdateVisit(pat, done) {
        
        console.log("update visit")
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db(database);
            var myquery = { pat: pat.pat };
            //var myquery = { pat: "1234" };
            var newvalues = { $set: 
              {                
                per        : pat.per,
                gebdat     : pat.gebdat,
                surname    : pat.surname,
                givenname  : pat.gvenname,
                sex        : pat.sex,
                street     : pat.street,
                city       : pat.city,
                plz        : pat.plz,
                country    : pat.country,
                station    : pat.station,
                facility   : pat.facility
              } 
            };
         
          
             dbo.collection(collection).find(myquery).toArray(function(err, patfound) {
              if (err) {                  
                  return done (Error (`database connection error:${err}`), 207);                                                    
              } else if (patfound.length != 1)  {

                return done (Error (`pat not found: ${pat.pat}`), 204);                
              } else {
              
                dbo.collection(collection).updateOne(myquery, newvalues, function(err, res) {
                  if (err) {
                    console.log(err.message)
                    db.close();
                    return done (Error (`database connection error:${err}`), 207);                                                    
                                       
                  }else {
                    //console.log("Updated fields: ", res.result.nModified);

                    if(res.result.nModified != 1) {
                      db.close();
                      return done (Error (`pat update error : pat ${pat.pat} - Modified fields: ${res.result.nModified}`), 204);                      
                    } else {
                      return done (null);                      
                      
                    }
                    
                    
                  }
                  
                }); 
              }

            });

            
          });



    }

    
    dbdischarge(pat, done) {
        
      console.log("discharge visit")
       MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db(database);
          var myquery = { pat: pat.pat, per :pat.per };
          
          dbo.collection(collection).find(myquery).toArray(function(err, patfound) {
            if (err) {                  
                return done (Error (`database connection error:${err}`), 207);                                                    
            } else if (patfound.length != 1)  {
              console.log(` ${patfound}`)
              return done (Error (`pat not found: ${pat.pat}`), 204);                
            } else {

              
              dbo.collection(collection).deleteOne(myquery, function(err, res) {
                if (err) {
                  db.close();
                  console.log(err)
                  return done (Error (`database error on pat discharge: ${err.message}`), 207);                                
                }else {
                  db.close();
                  return done (null);
                }
              });
            }}); 
          });
    }
  
}

export default new db();
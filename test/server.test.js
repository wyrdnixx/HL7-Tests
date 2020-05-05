import test from 'ava';
import Server from '../modules/server.js'
import HL7 from 'hl7-standard';
import net from 'net';

let server;
let testport = '8081'
let client;

let testHL7A01 = `MSH|^~\&|DPS||HUS||202004051719||ADT^A01|14090640|P|2.2|||AL|NE|
EVN|A01|20200405171912|
PID||21539741|21539741|200018516|MSurname^MGivenname||20070528|F|||ExampleStreet. 39B^^ExampleCity^^PLZ00^D|09776116|08382-6388|||||||||||N|
PV1||I|F-9^^^F-PAED||200018516||||||F-9-F-PAED|||||||S|200018516||K||||||||||||||||||93795|||||20200405171800|||||0|200018516|`;

test.before.cb((t) => {
    server = new Server(testport, '0.0.0.0');
    client = new net.Socket();


    //console.log(server)
    /* server.on(
        'SrvStarted',
        () => {
            //console.log('listening')   
                             
         
            client.connect(testport, '127.0.0.1', function() {     
                client.on('open', t.end)
            });
        }
    ) */

    t.end()
})

test('simple ava test test', t => {
    t.pass();
})

test.cb('Srv & Cli objects created', (t) => {
    
    t.is(typeof(server), 'object' )
    t.is(typeof(client), 'object' )
    t.end()    
})

test.cb('client connect to Server', (t) => {
    
    server.server.on(
        'connection',       
         () => {
           //  console.log('TEST: Server conneceted')
         
           t.end()
         }  
        )
        client.connect(testport, '127.0.0.1', function() {     
        // client.write mit hl7 wird für den reinen connect test nicht benötigt   
        // client.write(testHL7A01)
        
        });
    //console.log('Server: ', server)
    
})


// bis jetzt nur reiner receive - hl7 Check muss noch rein
test.cb('ACK hl7', (t) => {

    console.log(client)
   client.on(
      'data',
      (data) => {
          console.log('receiving data: ', data.toString());
          t.end();
      }
      )
    //client.connect(testport, '127.0.0.1', function() {     
            client.write(testHL7A01); 
    //})
    
}); 


test.after(() => {
    
   /*  console.log(typeof(server)) 
    client.close(); */
});
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


let testHL7unsupported = `MSH|^~\&|DPS||HUS||202004051719||ADT^X01|14090640|P|2.2|||AL|NE|
EVN|A01|20200405171912|
PID||21539741|21539741|200018516|MSurname^MGivenname||20070528|F|||ExampleStreet. 39B^^ExampleCity^^PLZ00^D|09776116|08382-6388|||||||||||N|
PV1||I|F-9^^^F-PAED||200018516||||||F-9-F-PAED|||||||S|200018516||K||||||||||||||||||93795|||||20200405171800|||||0|200018516|`;


let testHL7A02 = `MSH|^~\&|DPS||HUS||202004051719||ADT^A02|14090640|P|2.2|||AL|NE|
EVN|A01|20200405171912|
PID||21539741|21539741|200018516|MSurname^MGivenname||20070528|F|||ExampleStreet. 39B^^ExampleCity^^PLZ00^D|09776116|08382-6388|||||||||||N|
PV1||I|F-1^^^F-PG10||200018516||||||F-1-F-PG10|||||||S|200018516||K||||||||||||||||||93795|||||20200405171800|||||0|200018516|`;

let testHL7A02unknown = `MSH|^~\&|DPS||HUS||202004051719||ADT^A02|14090640|P|2.2|||AL|NE|
EVN|A01|20200405171912|
PID||21539741|21539741|10000000|xSURNAMENAME^XGIVENNAME||20070528|F|||ExampleStreet. 39B^^ExampleCity^^PLZ00^D|09776116|08382-6388|||||||||||N|
PV1||I|F-1^^^F-PG10||200018516||||||F-1-F-PG10|||||||S|200018516||K||||||||||||||||||93795|||||20200405171800|||||0|200018516|`;

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


test.cb('ACK correct hl7', (t) => {
    let testmessage = testHL7A01;
    //console.log(client)
   client.on(
      'data',
      (data) => {
        
        
        var receivedData = data.toString();
        // remove first ascii char, if ist VT - vertical Tab
        if (receivedData[0].charCodeAt()  == 11 ) {            
            receivedData = receivedData.substring(1);
        }

        let testA01 = new HL7(testmessage);
        let ack = new HL7(receivedData);


        

        try {
            
            ack.transform();
            testA01.transform();
            
            t.is(ack.get('MSH.7'), testA01.get('MSH.7'),' MSH.7 Message ID incorrect')                        
            t.is(ack.get('MSH.3'), testA01.get('MSH.5'),' MSH.3 and MSH.5 (Apps) not correct switched')            
            t.is(ack.get('MSH.9.1'),'ACK',' MSH.9.1 is not ACK')
            t.is(ack.get('MSH.9.2'),testA01.get('MSH.9.2'),' MSH.9.2 Messagetype is not correct A01')
            t.is(ack.getSegment('ERR'), null, `ERR-Segement present: ${ack.get('ERR.4')}`)
            
            t.end();

           } catch (e) {
             console.error('HL7 Transform error: ', e);
             t.fail();
           }          
      }
      )    
    client.write(testmessage); 
    
}); 

test.cb('A02 pat transfer' ,(t) => {
    let testmessage = testHL7A02;
    
    //console.log(client)
   client.on(
      'data',
      (data) => {
        
        
        var receivedData = data.toString();
        // remove first ascii char, if ist VT - vertical Tab
        if (receivedData[0].charCodeAt()  == 11 ) {
            receivedData = receivedData.substring(1);
        }

        let msg = new HL7(testmessage);
        let ack = new HL7(receivedData);

        try {
            
            ack.transform();
            msg.transform();

            t.is(ack.get('MSH.7'), msg.get('MSH.7'),' MSH.7 Message ID incorrect')                        
            t.is(ack.get('MSH.3'), msg.get('MSH.5'),' MSH.3 and MSH.5 (Apps) not correct switched')                        
            t.is(ack.get('MSH.9.1'),'ACK',' MSH.9.1 is not ACK')
            t.is(ack.get('MSH.9.2'),msg.get('MSH.9.2'),' MSH.9.2 Messagetype is not correct A02')
            t.is(ack.getSegment('ERR'), null, `ERR-Segement present: ${ack.get('ERR.4')}`)
            t.end();

           } catch (e) {
             console.error('HL7 Transform error: ', e);
             t.fail();
           }          
      }
      )    
    client.write(testmessage); 

});

test.cb('A02 unknown pat transfer request ' ,(t) => {
    let testmessage = testHL7A02unknown;
    
    //console.log(client)
   client.on(
      'data',
      (data) => {
        
        
        var receivedData = data.toString();
        // remove first ascii char, if ist VT - vertical Tab
        if (receivedData[0].charCodeAt()  == 11 ) {
            receivedData = receivedData.substring(1);
        }

        let msg = new HL7(testmessage);
        let ack = new HL7(receivedData);

        try {
            
            ack.transform();
            msg.transform();

            t.is(ack.get('MSH.7'), msg.get('MSH.7'),' MSH.7 Message ID incorrect')                        
            t.is(ack.get('MSH.3'), msg.get('MSH.5'),' MSH.3 and MSH.5 (Apps) not correct switched')                        
            t.is(ack.get('MSH.9.1'),'ACK',' MSH.9.1 is not ACK')
            t.is(ack.get('MSH.9.2'),msg.get('MSH.9.2'),' MSH.9.2 Messagetype is not correct A02')
            t.is(ack.get('ERR.2'),'204','ERROR code not correct')            
            t.is(ack.get('ERR.4'), `patient database save error:Error: pat not found: ${msg.get('PID.4')  }`,'ERROR Message not correct')

            t.end();

           } catch (e) {
             console.error('HL7 Transform error: ', e);
             t.fail();
           }          
      }
      )    
    client.write(testmessage); 

});


test.cb('ACK-ERR unsupported', (t) => {
    let testmessage = testHL7unsupported;
    
    //console.log(client)
   client.on(
      'data',
      (data) => {
        
        
        var receivedData = data.toString();
        // remove first ascii char, if ist VT - vertical Tab
        if (receivedData[0].charCodeAt()  == 11 ) {
            receivedData = receivedData.substring(1);
        }

        let msg = new HL7(testmessage);
        let ack = new HL7(receivedData);

        try {
            
            ack.transform();
            msg.transform();

            t.is(ack.get('MSH.7'), msg.get('MSH.7'),' MSH.7 Message ID incorrect')                        
            t.is(ack.get('MSH.3'), msg.get('MSH.5'),' MSH.3 and MSH.5 (Apps) not correct switched')            
            t.is(ack.get('ERR.2'),'200','ERROR code not correct')            
            t.is(ack.get('ERR.4'), 'Message type not supported by application.','ERROR Message not correct')
            
            t.end();

           } catch (e) {
             console.error('HL7 Transform error: ', e);
             t.fail();
           }          
      }
      )    
    client.write(testmessage); 
    
}); 

test.cb('ACK-ERR dupplicate patient', (t) => {
    let testmessage = testHL7A01;
    
    //console.log(client)
   client.on(
      'data',
      (data) => {
        
        
        var receivedData = data.toString();
        // remove first ascii char, if ist VT - vertical Tab
        if (receivedData[0].charCodeAt()  == 11 ) {
            receivedData = receivedData.substring(1);
        }

        let msg = new HL7(testmessage);
        let ack = new HL7(receivedData);

        try {
            
            ack.transform();
            msg.transform();

            t.is(ack.get('MSH.7'), msg.get('MSH.7'),' MSH.7 Message ID incorrect')                        
            t.is(ack.get('MSH.3'), msg.get('MSH.5'),' MSH.3 and MSH.5 (Apps) not correct switched')            
            t.is(ack.get('ERR.2'),'205','ERROR code not correct')            
            t.is(ack.get('ERR.4'), 'patient database save error:Error: Patient allready exists',`ERROR Message not correct:  ${ack.get('ERR.4')}`)
            
            t.end();

           } catch (e) {
             console.error('HL7 Transform error: ', e);
             t.fail();
           }          
      }
      )    
    client.write(testmessage); 
    
}); 


test.after(() => {
    
   /*  console.log(typeof(server)) 
    client.close(); */
});
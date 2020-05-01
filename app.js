
//import eventBus from './modules/eventbus.js';


import Server from './modules/server.js';
import HL7 from 'hl7-standard';
import simplehl7 from 'simple-hl7';
import fs from 'fs';



// simple-hl7 Server

var app = simplehl7.tcp();

app.use(function(req, res, next) {
  //req.msg is the HL7 message
  console.log('******message received*****')
  console.log(req.msg.log());
  //console.log("5:", req.msg.getField(5))
  next();
})
 
app.use(function(req, res, next){
  //res.ack is the ACK
  //acks are created automatically
 
  //send the res.ack back
  console.log('******sending ack*****')
  res.end()
})

app.start(8081);


///////////////////



const server = new Server(8080,'0.0.0.0');

server.on(
  'SrvStarted',
  () => {
    console.log('HL7 Server is started...')
  }  
);


server.on(
  'hl7msg',  
(clientId,hl7,) => {
  console.log('write message to file.')
  
  // MSH.6 =  Message Date
  fs.writeFile('./hl7/' + hl7.get('MSH.7') + '.hl7',hl7.build(), (err) => {
    if (err) {
      console.log('fs write file error: ', err.message);
      throw err;
    } else {
        console.log('The file has been saved!');
      }    
  });
  
  server.emit('ACK',clientId, hl7);


});

server.on(
  'ACK',
  (clientId, hl7) => {
    
    console.log('building ACK')
    let ack = new HL7();

   
   
    
    ack.createSegment('MSH');
    ack.set('MSH', {
      'MSH.2': '^~\\&',
      'MSH.3': hl7.get('MSH.5'), //MSH-3 Sendende Anwendung
      'MSH.4': hl7.get('MSH.4'),
      'MSH.5':  hl7.get('MSH.3'), // MSH-5 Empfangende Anwendung
      'MSH.6': '',
      'MSH.7': hl7.get('MSH.7'), //Message ID
      'MSH.8': '',
      'MSH.9': {
          'MSH.9.1': 'ACK',
          'MSH.9.2': hl7.get('MSH.9.2')
      },
      'MSH.10': hl7.get('MSH.10'),
      'MSH.11': hl7.get('MSH.11'),
      'MSH.12': hl7.get('MSH.12')
    });
    ack.createSegment('MSA');
    ack.set('MSA', {
      'MSA.1': 'CA',
      'MSA.2': hl7.get('MSH.10')
    });


/* Wert	Beschreibung	Typ	Bedeutung
CA	Accept acknowledgment: Commit Accept	Transportquittung	empfangen
CE	Accept acknowledgment: Commit Error	Transportquittung	fehlerhafte Übertragung
CR	Accept acknowledgment: Commit Reject	Transportquittung	Empfang abgelehnt
AA	Application acknowledgment: Accept	Verarbeitungsquittung	verarbeitet
AE	Application acknowledgment: Error	Verarbeitungsquittung	fehlerhaft
AR	Application acknowledgment: Reject	Verarbeitungsquittung	abgelehnt
 */
     /* Diese Antwort vom simple-hl wird vom Openlink angenommen
      MSH|^~\&|PHILIPS||DPS|FRI|20200429203609||ACK|ACK20200429203609|P|2.3
      MSA|AA|14076145
      */   

     ack.createSegment('ERR');
     ack.set('ERR', {
       'ERR.2': 'myapp',
       'ERR.3': '207', // Errorcode - 207 = Application internal error	
       'ERR.4': 'E', // Error severity -> Error, Information, Warning
       'ERR.7': 'Trump denied it ' //Error-Text
     });
 

       // MSH.7 =  Message Date     

   fs.appendFile('./hl7/' + hl7.get('MSH.7') + '.hl7', '\n\n' + 'Sending ACK:' + '\n' + ack.build(), (err) => {
    if (err) {
      console.log('fs write file error: ', err.message);
      throw err;
    } else {
        console.log('The file has been saved!');
      }    
  });
 
      console.log(ack.getSegment('MSH'));
    server.sendData(clientId, ack.build());
    
  }
)
/* 
server.on(
  'ACK',
  (clientId, hl7) => {
    let hl7 = new HL7();
    hl7.createSegment('MSH');
    hl7.set('MSH', {
      'MSH.2': '^~\\&',
      'MSH.3': 'PHILIPS', //Subsystem
      'MSH.4': '',
      'MSH.5': 'DPS', //Main System
      'MSH.6': 'FRI',
      'MSH.7': '20200429203609', //Message ID
      'MSH.8': '',
      'MSH.9': {
          'MSH.9.1': 'ACK'
      },
      'MSH.10': 'ACK20200429203609',
      'MSH.11': 'P',
      'MSH.12': '2.3'
    });
    hl7.createSegment('MSA');
    hl7.set('MSA', {
      'MSA.1': 'AA',
      'MSA.2': '14076145'});

     // Diese Antwort vom simple-hl wird vom Openlink angenommen
     // MSH|^~\&|PHILIPS||DPS|FRI|20200429203609||ACK|ACK20200429203609|P|2.3
     // MSA|AA|14076145
      //   
       
    server.sendData(clientId, hl7.build());
    
  }
)

 */



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


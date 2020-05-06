import eventBus from './eventbus.js';
import fs from 'fs';
import HL7 from 'hl7-standard';


class hl7processor {

    /**hl7processor constructor
     */
    constructor() {
    }

    processMessage (clientId, hl7) {
        //console.log('hl7processor got message: ', hl7)

        //console.log('write message to file.')
                
        // MSH.6 =  Message Date
        //fs.writeFile('./hl7/' + hl7.get('MSH.7') + '.hl7',hl7.build(), (err) => {
          fs.appendFile('./hl7/hl7log.log', '\n\n' + 'Got HL7:' + '\n' + hl7.build(), (err) => {
          if (err) {
            console.log('fs write file error: ', err.message);
            throw err;
          } else {
              console.log('The file has been saved!');
            }    
        });
        
        eventBus.emit('ACK',clientId, hl7);     

    }

    createAck (hl7) {

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
         ack.createSegment('ERR');
         ack.set('ERR', {
           'ERR.2': 'myapp',
           'ERR.3': '207', // Errorcode - 207 = Application internal error	
           'ERR.4': 'E', // Error severity -> Error, Information, Warning
           'ERR.7': 'Trump denied it ' //Error-Text
         });

         return ack;
    }

}

export default new hl7processor();
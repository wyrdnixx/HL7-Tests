//Patient Processor

import eventBus from './eventbus.js';
import db from  './db.js';
import Patient from '../models/Patient.js';

class pattask {

    constructor(){};

    hl7ADT_A01 (hl7, clientId) {

        let pat = new Patient(hl7);
        
            db.dbAddPat(pat,(err, errcode) => {
                if(err) {
                   // console.log('hl7Processor sending ACK-ERR: ', err)
                    eventBus.emit('ACK-ERR',clientId, hl7,errcode, `patient database save error:${err}`);     
                }
                else {
                    //console.log('hl7Processor sending ACK')
                    eventBus.emit('ACK',clientId, hl7);     
                }
            });         
        

    }
    hl7ADT_Update (hl7, clientId) {

        let pat = new Patient(hl7);
        
            db.dbupdateVisit(pat,(err, errcode) => {
                if(err) {
                   // console.log('hl7Processor sending ACK-ERR: ', err)
                    eventBus.emit('ACK-ERR',clientId, hl7,errcode, `patient database save error:${err}`);     
                }
                else {
                    //console.log('hl7Processor sending ACK')
                    eventBus.emit('ACK',clientId, hl7);     
                }
            });         
        

    }

    hl7ADT_A03 (hl7, clientId) {

        let pat = new Patient(hl7);
        
            db.dbdischarge(pat,(err, errcode) => {
                if(err) {
                   // console.log('hl7Processor sending ACK-ERR: ', err)
                    eventBus.emit('ACK-ERR',clientId, hl7,errcode, `patient database save error:${err}`);     
                }
                else {
                    //console.log('hl7Processor sending ACK')
                    eventBus.emit('ACK',clientId, hl7);     
                }
            });         
        

    }
}

export default new pattask()




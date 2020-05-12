//Patient Processor

import eventBus from './eventbus.js';
import db from  './db.js';
import Patient from '../models/Patient.js';

class pattask {

    constructor(){};

    hl7ADT_A01 (hl7, clientId) {

        let pat = new Patient(hl7);
                // verschobe in constructor
/*         pat.per         =hl7.get('PID.2')
        pat.pat         =hl7.get('PID.4')        
        pat.gebdat      =hl7.get('PID.7')
        pat.surname     =hl7.get('PID.5.1')
        pat.givenname   =hl7.get('PID.5.2')
        pat.sex         =hl7.get('PID.8')
        pat.street      =hl7.get('PID.11.1')
        pat.city        =hl7.get('PID.11.3')
        pat.plz         =hl7.get('PID.11.5')
        pat.country     =hl7.get('PID.11.6')
 */
//        console.log(pat);  

        
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
}

export default new pattask()




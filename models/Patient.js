import HL7 from 'hl7-standard';

class pat {
   

    constructor(hl7) {
                
        this.per        =hl7.get('PID.2')
        this.pat        =hl7.get('PID.4')        
        this.gebdat     =hl7.get('PID.7')
        this.surname    =hl7.get('PID.5.1')
        this.givenname  =hl7.get('PID.5.2')
        this.sex        =hl7.get('PID.8')
        this.street     =hl7.get('PID.11.1')
        this.city       =hl7.get('PID.11.3')
        this.plz        =hl7.get('PID.11.5')
        this.country    =hl7.get('PID.11.6')
        this.station    =hl7.get('PV1.3.1')
        this.facility   =hl7.get('PV1.3.4')

    } 
}

export default pat;

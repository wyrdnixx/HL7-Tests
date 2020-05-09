class pat {
    pat = '';
    per = '';
    gebdat = '';
    surname = '';
    givenname = '';
    street = '';
    city = '';
    plz = '';
    

    constructor(pat, per, gebdat, surname, givenname, street, city, plz) {
        this.pat = pat;
        this.per = per;
        this.gebdat= gebdat;
        this.surname=surname;
        this.givenname=givenname
        this.street=street;
        this.city=city;
        this.plz=plz
    } 
}

export default pat;

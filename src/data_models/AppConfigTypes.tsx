



export interface Config {
    data: Data;
}

export interface Data {
    config: ConfigClass;
    cc:string;
}

// export interface Config {
//     config: ConfigClass;
//     cc: string;
// }
export interface ConfigClass {
    apiurl:        string;
    apiver:        string;
    weburls:       Weburls;
    localeurl:     string;
    supportedlang: string[];
    defaultlang:   string;
    paywallurl: string;
    customersession: string;
    videoanalytics: string;
    googlesync:string;
    facebook : FacebookConfig;
    gentokenurl: string;

}

export interface Weburls {
    

   // support:  string;
  //  feedback: string;
   // faqs:     string;


    aboutus: string; 
    tnc:      string;
    privacy:  string;
    contactus:  string;
    contentcomplaints:  string;
    refund:  string;
    disclaimer: string;
    
}

export interface FacebookConfig {
    id : string,
    client_token : string
}
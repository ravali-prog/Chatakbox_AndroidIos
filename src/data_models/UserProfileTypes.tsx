export class UserprofileResponse {
    data: UserprofileData = { } as UserprofileData;
}

export class UserprofileData {

    email:     string = "";
    everified: string = "";
    mobile:    string = "";
    mverified: string = "";
    dob:       string = "";
    name:      string = "";
    image:     string = "";
    profileid: string = "";
    phoneno:   string = "";
    nickname:  string = "";
    gender:    string = "";
    resultcode: string = "";
    resultmsg:  string = "";
    uuid:       string = "";
    token:      string = "";
    registered  : number = -99;
    profile:    UserProfile[] = [];
    token_expiry: string = "";
    setpassword?: boolean;
}

export class UserProfile {
    name:      string = "";
    image:     string = "";
    profileid: string = "";
    phoneno:   string = "";
    email:     string = "";
    nickname:  string = "";
    gender:    string = "";
}
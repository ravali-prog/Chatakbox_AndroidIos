export interface ContentTokenResponse {
    data: ContentTokenResponseData;
}

export interface ContentTokenResponseData {
    resultcode: string;
    resultmsg:  string;
    token : string;
}
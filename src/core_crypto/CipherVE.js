
import * as CryptoJS from "crypto-js";
import { CONFIG_URL } from "../app_config/AppConstants";

const btoa = (str) => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
const atob = (b64) => CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(b64));

class VenEncrypt {
  constructor(config = {}) {
    this.apiSecret = config.apiSecret || '71b7607451f2b0d923fa56193aec8f67efdf17ec77f284ca4aedeacd990d18f9';
    this.apiSecretBin = CryptoJS.enc.Hex.parse(this.apiSecret);
    this.apiKey = config.apiKey || 'nx_e4c06be7990f1d28ec9624180d325884';
    this.appKey = config.appKey || '4ToUgfHmqmzqoirt88RE4xXGSzgdgrb';
  }

  decrypt(key, data) {
    let decryptedData = "";
    try {
      const fkey = typeof key === 'string' && key.length === 64
        ? CryptoJS.enc.Hex.parse(key) : CryptoJS.enc.Utf8.parse(key);
      const text = atob(data).split(":");
      const encryptedData = text[1];
      const ciphertext = CryptoJS.enc.Base64.parse(encryptedData);
      const fiv1 = CryptoJS.enc.Base64.parse(text[0]);
      const dec = CryptoJS.AES.decrypt({ ciphertext }, fkey, {
        iv: fiv1,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      decryptedData = dec.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      // console.error("VenEncrypt.decrypt error:", err);
    }
    return decryptedData;
  }

  encrypt(key, data) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const fkey = typeof key === 'string' && key.length === 64
      ? CryptoJS.enc.Hex.parse(key) : CryptoJS.enc.Utf8.parse(key);
    const enc = CryptoJS.AES.encrypt(data, fkey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const encryptedData = enc.ciphertext.toString(CryptoJS.enc.Base64);
    const final = iv.toString(CryptoJS.enc.Base64) + ":" + encryptedData;
    return btoa(final);
  }

  getjson(data) {
    const decrypted = this.decrypt(this.apiSecret, data);
    return JSON.parse(decrypted);
  }

  signRequest(body, timestamp) {
    return CryptoJS.HmacSHA256(body + "|" + timestamp, this.apiSecret).toString();
  }

  async callApi(payload, token = null) {
    if (token) {
      payload._token = token;
    }
    const payloadJson = JSON.stringify(payload);
    const encrypted = this.encrypt(this.apiSecret, payloadJson);
    const body = JSON.stringify({ data: encrypted });
    const timestamp = new Date().toISOString();
    const signature = this.signRequest(body, timestamp);

    const proxyUrl = CONFIG_URL; // "https://screengamez.mobi/vbs_new/web/v3/proxy.php";

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Key": this.appKey,
        "X-API-Key": this.apiKey,
        "X-API-Timestamp": timestamp,
        "X-API-Signature": signature,
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const respJson = await response.json();
    const envelope = JSON.parse(respJson.body);
    const decrypted = this.decrypt(this.apiSecret, envelope.data);
    return JSON.parse(decrypted);
  }
}

const VEncrypt = new VenEncrypt();
export default VEncrypt;


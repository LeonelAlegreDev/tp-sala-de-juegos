import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarvelService {
  private endpoint = "https://gateway.marvel.com/v1/public/";
  private publicKey = environment.marvel.publicKey;
  private privateKey = environment.marvel.privateKey;


  constructor(private http: HttpClient) { }

  private async GenerateHash(ts: string): Promise<string>{
    const data = new TextEncoder().encode(ts + this.privateKey + this.publicKey);
    const hashBuffer = await crypto.subtle.digest('md5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async GetCharacters(){
    const ts = new Date().getTime().toString();
    const hash = await this.GenerateHash(ts);
    console.log("hash: ",hash);
    console.log(ts);
    console.log(this.publicKey);
  }
}

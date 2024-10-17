import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class MarvelService {
  private endpoint = "https://gateway.marvel.com/v1/public/";
  private publicKey = environment.marvel.publicKey;
  private privateKey = environment.marvel.privateKey;


  constructor(private http: HttpClient) { }

  private GenerateHash(ts: string): string{
    // const data = new TextEncoder().encode(ts + this.privateKey + this.publicKey);
    // const hashBuffer = await crypto.subtle.digest('md5', data);
    // const hashArray = Array.from(new Uint8Array(hashBuffer));
    // const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');


    const md5 = new Md5();
    const hash = md5.appendStr(ts + this.privateKey + this.publicKey).end();

    return hash as string;
  }

  GetCharacters(){
    const ts = new Date().getTime().toString();
    const hash = this.GenerateHash(ts);
    
    return this.http.get<any[]>(`${this.endpoint}characters?ts=${ts}&apikey=${this.publicKey}&hash=${hash}`)
    // .pipe(map(paises => paises.sort((a,b) => {
    //     if (a.name.common < b.name.common) {
    //       return -1;
    //     } else if (a.name.common > b.name.common) {
    //       return 1;
    //     } else {
    //       return 0;
    //     }
    //   })));
  }
}

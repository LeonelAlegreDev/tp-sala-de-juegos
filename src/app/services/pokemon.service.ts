import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private http = inject(HttpClient);
  private endpoint = "https://pokeapi.co/api/v2";

  private pokemones: any[] = [];

  GetPokemons(): Observable<any[]> {
    const pokemonesPopulares = [1, 6, 25, 39, 94, 130, 150, 151, 143];

    const requests = pokemonesPopulares.map(id => 
      this.http.get<any>(`${this.endpoint}/pokemon/${id}`).pipe(
        map(result => ({
          name: result.name,
          image: result.sprites.other['official-artwork'].front_default,
          type1: result.types[0].type.name,
          type2: result.types[1] ? result.types[1].type.name : null
        }))
      )
    );

    return forkJoin(requests);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class QuizService {

  constructor(private http: HttpClient) { }

  get(url: string) {
    console.log(this.http.get(url));
    return this.http.get(url);
  }

  getAll() {
    return [
      { id: 'data/scrum_test01.json', name: 'Scrum Test 1' },
      { id: 'data/aspnet.json', name: 'aspnet' },
      { id: 'data/csharp.json', name: 'csharp' },
      { id: 'data/designPatterns.json', name: 'Design Patterns' }

    ];
  }

}

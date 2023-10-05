import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  private messenger = new BehaviorSubject(null);
  public messengerObsvbl = this.messenger.asObservable();

  make(action: string) {
    if(action && action.length) {
      // @ts-ignore
      this.messenger.next(action);
    }
  }
}

import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() {
  }

  private toaster = new BehaviorSubject(null);
  public toastObsvbl = this.toaster.asObservable();

  toast(text: string, type = 'success') {
    const msg = {text: text, type: type};
    // @ts-ignore
    if (this.isValidToast(msg)) {
      // @ts-ignore
      this.toaster.next(msg);
    }
  }

  private isValidToast(msg: string): boolean {
    // @ts-ignore
    return (msg.text && msg.type);
  }
}

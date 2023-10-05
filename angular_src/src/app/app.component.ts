import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBar} from "@angular/material/snack-bar";
import {ToastService} from "./services/toast.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private toastService: ToastService,
    private toast: MatSnackBar,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {

    this.sendToast('');

    this.cdr.detectChanges();

    this.toastService.toastObsvbl.subscribe(msg => {
      if (msg) {
        // @ts-ignore
        this.sendToast(msg.text, msg.type);
      }
    });
  }

  sendToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.openFromComponent(Toast, {data: {text, type}, duration: 3000, verticalPosition: 'bottom', horizontalPosition: "center"});
  }
}

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'toast',
  templateUrl: './toast/toast.html',
  styleUrls: ['./toast/toast.scss'],
})
export class Toast {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: ToastData) {
  }
}

export interface ToastData {
  text: string;
  type: 'error' | 'success';
}

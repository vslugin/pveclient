import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular_src';
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

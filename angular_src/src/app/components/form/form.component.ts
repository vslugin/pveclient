// @ts-nocheck
import {Component, Input, NgZone, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Toast} from "../../app.component";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  form = this.fb.group({
    server: [null, Validators.required],
    login: [null, Validators.required],
    password: [null, Validators.required]
  });

  @Input() servers: Array<any> = [];

  constructor(private fb: FormBuilder, private toast: MatSnackBar, private ngZone: NgZone) {
  }

  ngOnInit() {
  }

  onSubmit(): void {

    if (!this.form.valid) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {

        window.pveclient.emitEvent('evt-set-selected-server', {
          selectedServer: this.form.value.server
        });

        // вызываем бэк для получения списка доступных виртуальных машин
        // @ts-ignore
        window.pveclient.emitEvent('evt-get-virtual-machines', {
          addr: this.form.value.server.addr,
          port: this.form.value.server.port,
          proxyPort: this.form.value.server.proxyPort,
          login: this.form.value.login,
          password: this.form.value.password
        });
      } else {
        this.sendToast('Запуск вне контекста Electron!', 'error');
      }
    });

  }

  sendToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.openFromComponent(Toast, {data: {text, type}, verticalPosition: 'bottom'});
  }
}

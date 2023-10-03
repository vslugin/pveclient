// @ts-nocheck
import {Component, Input, OnInit} from '@angular/core';
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

  constructor(private fb: FormBuilder, private toast: MatSnackBar) {
  }

  ngOnInit() {
    // @ts-ignore
    if (window.pveclient) {
      // @ts-ignore
      window.pveclient.handleEvent('evt-run-spice-client', (event, data) => {
        switch (data.action) {
          case 'reply':
            this.sendToast(data.msg, 'success');
            break;
          case 'error':
            this.sendToast(data.err, 'error');
            break;
        }
      });
    } else {
      this.sendToast('Запуск вне контекста Electron!', 'error');
    }
  }

  onSubmit(): void {

    if (!this.form.valid) {
      return;
    }

    // @ts-ignore
    if (window.pveclient) {

      // вызываем бэк для обновления конфига
      // @ts-ignore
      window.pveclient.emitEvent('evt-run-spice-client', {
        addr: this.form.value.server.addr,
        port: this.form.value.server.port,
        proxyPort: this.form.value.server.proxyPort,
        login: this.form.value.login,
        password: this.form.value.password
      });
    } else {
      this.sendToast('Запуск вне контекста Electron!', 'error');
    }

  }

  sendToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.openFromComponent(Toast, {data: {text, type}, verticalPosition: 'bottom'});
  }
}

// @ts-nocheck
import {AfterViewInit, ChangeDetectorRef, Component, Input, NgZone, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Toast} from "../../app.component";

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit, AfterViewInit {
  form = this.fb.group({
    virtualMachine: [null, Validators.required]
  });

  @Input() virtualMachines: Array<any> = [];

  constructor(private fb: FormBuilder, private toast: MatSnackBar, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnInit() {

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {
        // @ts-ignore
        window.pveclient.handleEvent('evt-run-virt-viewer', (event, data) => {
          switch (data.action) {
            case 'reply':
              // console.log('REPLY DETECTED', data);
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
    });

  }

  onSubmit(): void {

    if (!this.form.valid) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {
        // вызываем бэк для обновления конфига
        // @ts-ignore
        window.pveclient.emitEvent('evt-run-virt-viewer', {
          virtualMachine: this.form.value.virtualMachine
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

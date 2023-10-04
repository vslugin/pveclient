import {AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Toast} from "../../app.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-page-main',
  templateUrl: './page-main.component.html',
  styleUrls: ['./page-main.component.scss']
})
export class PageMainComponent implements OnInit, AfterViewInit {

  servers = [{name: 'Select'}];
  virtualMachines: Array<any> = [];
  isVirtualMachinesReady = false;

  constructor(private toast: MatSnackBar, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
  }

  ngAfterViewInit() {
    // вызываем бэк для обновления конфига
    // @ts-ignore
    window.pveclient.emitEvent('evt-config-set');
  }

  ngOnInit(): void {

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {

        // хэндлим ответ от бэка
        // @ts-ignore
        window.pveclient.handleEvent('evt-config-set', (event, data) => {
          switch (data.action) {
            case 'reply':
              this.sendToast(data.msg, 'success');
              break;
            case 'error':
              this.sendToast(data.err, 'error');
              break;
            case 'new-config':
              this.servers = data.config.servers;
              break;
          }
        });

        // хэндлим получение списка виртуальных машин
        // @ts-ignore
        window.pveclient.handleEvent('evt-get-virtual-machines', (event, data) => {
          switch (data.action) {
            case 'virtual-machines':
              this.virtualMachines = data.vms;
              this.isVirtualMachinesReady = true;
              this.cdr.detectChanges();
              /* setTimeout(() => {


               }, 1000);*/

              // console.log('this.virtualMachines', this.virtualMachines);
              break;
          }
        });

      } else {
        // стандартный конфиг, если отладка ангуляр приложения вне контекста электрона
        // @ts-ignore
        this.servers = [{title: 'localhost', addr: 'localhost', port: 8006, proxyPort: 3128}];
        this.sendToast('Запуск вне контекста Electron!', 'error');
      }
    });

  }

  sendToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.openFromComponent(Toast, {data: {text, type}, verticalPosition: 'bottom'});
  }

}

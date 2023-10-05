// @ts-nocheck
import {AfterViewInit, ChangeDetectorRef, Component, NgZone, OnChanges, OnInit} from '@angular/core';
import {Toast} from "../../app.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Server} from "../form/form.component";
import {VirtualMachine} from "../form-list/form-list.component";
import {SharedService} from "../../services/shared.service";

@Component({
  selector: 'app-page-main',
  templateUrl: './page-main.component.html',
  styleUrls: ['./page-main.component.scss']
})
export class PageMainComponent implements AfterViewInit {

  servers: Array<Server> = [];
  virtualMachines: Array<VirtualMachine> = [];
  isVirtualMachinesReady = false;

  constructor(
    private toast: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sharedService: SharedService) {
  }

  ngAfterViewInit() {
    // вызываем бэк для обновления конфига
    // @ts-ignore
    window.pveclient.emitEvent('evt-config-set');
    this.cdr.detectChanges();

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {

        // хендлим сообщения от общего сервиса
        this.sharedService.messengerObserver.subscribe((message) => {
          switch (message) {
            case 'BACK_FROM_FORM_LIST' :
              this.isVirtualMachinesReady = false;
              break;
            case 'BACK_FROM_FORM' :
              // здесь нужно в IPC электрона, поэтому вся подписка внутри ngZone
              // @ts-ignore
              window.pveclient.emitEvent('evt-close-attempt');
              break;
          }
        });

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

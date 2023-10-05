// @ts-nocheck
import {AfterViewInit, ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {Server} from "../form/form.component";
import {VirtualMachine} from "../form-list/form-list.component";
import {SharedService} from "../../services/shared.service";
import {ToastService} from "../../services/toast.service";

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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private toastService: ToastService,
    private sharedService: SharedService) {
  }

  ngAfterViewInit() {

    this.cdr.detectChanges();

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {

        // вызываем бэк для обновления конфига
        // @ts-ignore
        window.pveclient.emitEvent('evt-config-set');
        // this.cdr.detectChanges();

        // хендлим сообщения от общего сервиса
        this.sharedService.messengerObsvbl.subscribe((message) => {
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
              this.toastService.toast(data.msg, 'success');
              break;
            case 'error':
              this.toastService.toast(data.err, 'error');
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
            case 'reply':
              this.toastService.toast(data.msg, 'success');
              break;
            case 'error':
              this.toastService.toast(data.err, 'error');
              break;
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
        this.servers = [{title: 'localhost', addr: 'localhost', port: 8006}];
        this.toastService.toast('Запуск вне контекста Electron!', 'error')
      }
    });

  }
}

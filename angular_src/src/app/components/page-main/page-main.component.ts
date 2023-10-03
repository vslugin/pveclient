import {Component, OnInit} from '@angular/core';
import {Toast} from "../../app.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-page-main',
  templateUrl: './page-main.component.html',
  styleUrls: ['./page-main.component.scss']
})
export class PageMainComponent implements OnInit {

  servers = [];

  constructor(private toast: MatSnackBar) {
  }

  ngOnInit(): void {
    // @ts-ignore
    if (window.pveclient) {
      // вызываем бэк для обновления конфига
      // @ts-ignore
      window.pveclient.emitEvent('evt-config-set');

      // хэндлим ответ от бэка
      // @ts-ignore
      window.pveclient.handleEvent('evt-config-set', (event, data) => {
        switch (data.action) {
          case 'new-config':
            this.servers = data.config.servers;
            break;
        }
      });
    } else {
      // стандартный конфиг, если отладка ангуляр приложения вне контекста электрона
      // @ts-ignore
      this.servers = [{title: 'localhost', addr: 'localhost', port: 8006, proxyPort: 3128}];
      this.sendToast('Запуск вне контекста Electron!', 'error');
    }
  }

  sendToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.openFromComponent(Toast, {data: {text, type}, verticalPosition: 'bottom'});
  }

}

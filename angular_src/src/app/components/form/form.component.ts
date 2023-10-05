// @ts-nocheck
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Toast} from "../../app.component";
import {map, Observable, startWith} from "rxjs";
import {SharedService} from "../../services/shared.service";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements AfterViewInit, OnChanges {
  form = this.fb.group({
    server: [null, Validators.required],
    login: [null, Validators.required],
    password: [null, Validators.required]
  });

  filteredServers: Observable<Server[]>;

  @Input() servers: Array<Server> = [];

  constructor(
    private fb: FormBuilder,
    private toast: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService
  ) {
  }

  displayFn(srv: Server): string {
    return srv && srv.title ? srv.title : '';
  }

  private _filter(title: string): Server[] {
    const filterValue = title.toLowerCase();
    return this.servers.filter(option => option.title.toLowerCase().includes(filterValue));
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();

    this.filteredServers = this.form.controls.server.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.title;
        return name ? this._filter(name as string) : this.servers.slice();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.servers) {
      const currentItems = changes.servers.currentValue;
      const previousItems = changes.servers.previousValue;
      if (currentItems !== previousItems) {
        if (currentItems.length) {
          this.form.controls.server.setValue('');
        }
      }
    }
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

  back() {
    this.sharedService.make('BACK_FROM_FORM');
  }
}

export interface Server {
  title: string;
  addr: string;
  port: number;
}

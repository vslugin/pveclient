// @ts-nocheck
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnChanges, OnInit,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {map, Observable, startWith} from "rxjs";
import {SharedService} from "../../services/shared.service";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, AfterViewInit, OnChanges {

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
    private toastService: ToastService,
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.filteredServers = this.form.controls.server.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.title;
        return name ? this._filter(name as string) : this.servers.slice();
      })
    );
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
        this.toastService.toast('Запуск вне контекста Electron!', 'error');
      }
    });

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

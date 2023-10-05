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
import {map, Observable, startWith} from "rxjs";
import {SharedService} from "../../services/shared.service";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit, AfterViewInit, OnChanges {

  form = this.fb.group({
    virtualMachine: [null, Validators.required]
  });

  filteredVirtualMachines: Observable<VirtualMachine[]>;

  @Input() virtualMachines: Array<VirtualMachine> = [];

  constructor(
    private fb: FormBuilder,
    private toast: MatSnackBar,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private sharedService: SharedService
  ) {
  }

  displayFn(vm: VirtualMachine): string {
    return vm && vm.name ? vm.name : '';
  }

  private _filter(name: string): VirtualMachine[] {
    const filterValue = name.toLowerCase();
    return this.virtualMachines.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.virtualMachines) {
      const currentItems = changes.virtualMachines.currentValue;
      const previousItems = changes.virtualMachines.previousValue;
      if (currentItems !== previousItems) {
        if (currentItems.length) {
          this.form.controls.virtualMachine.setValue('');
        }
      }
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnInit() {

    this.filteredVirtualMachines = this.form.controls.virtualMachine.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.virtualMachines.slice();
      })
    );

    this.ngZone.runOutsideAngular(() => {
      // @ts-ignore
      if (window.pveclient) {
        // @ts-ignore
        window.pveclient.handleEvent('evt-run-virt-viewer', (event, data) => {
          switch (data.action) {
            case 'reply':
              this.toastService.toast(data.msg, 'success');
              break;
            case 'error':
              this.toastService.toast(data.err, 'error');
              break;
          }
        });
      } else {
        this.toastService.toast('Запуск вне контекста Electron!', 'error');
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
        this.toastService.toast('Запуск вне контекста Electron!', 'error');
      }
    });

  }

  back() {
    this.sharedService.make('BACK_FROM_FORM_LIST');
  }
}

export interface VirtualMachine {
  id: string;
  vmid: number;
  template: boolean;
  name: string;
  status: string;
  mem: number;
  disk: number;
  diskread: number;
  cpu: number;
  diskwrite: number;
  uptime: number;
  type: string;
  maxdisk: number;
  netin: number;
  netout: number;
  node: string;
  maxcpu: number;
  maxmem: number;
}

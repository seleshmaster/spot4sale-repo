import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Store} from './store.models';
import {StoreService} from './store.service';

@Component({
  selector: 'app-store-edit',
  templateUrl: './store-edit.component.html',
  imports: [
    ReactiveFormsModule
  ]
})
export class StoreEditComponent implements OnInit {
  storeForm!: FormGroup;
  storeId!: string;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('id')!;

    this.storeService.getStore(this.storeId).subscribe((store:Store) => {
      this.storeForm = this.fb.group({
        name: [store.name, Validators.required],
        description: [store.description],
        address: [store.address, Validators.required],
        city: [store.city, Validators.required],
        zipCode: [store.zipCode, Validators.required],
        latitude: [store.latitude],
        longitude: [store.longitude]
      });
    });
  }

  updateStore() {
    if (!this.storeForm.valid) return;
    this.storeService.updateStore(this.storeId, this.storeForm.value)
      .subscribe(() => {
        alert('Store updated!');
        this.router.navigate(['/owner/dashboard']);
      });
  }

  deleteStore() {
    if (!confirm('Are you sure you want to delete this store?')) return;
    this.storeService.deleteStore(this.storeId).subscribe(() => {
      alert('Store deleted!');
      this.router.navigate(['/owner/dashboard']);
    });
  }
}

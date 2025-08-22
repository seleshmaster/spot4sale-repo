import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
    <h1>Welcome to Spot4Sale</h1>
    <p>Find and book a garage sale spot near you.</p>
    <a routerLink="/search">Search stores →</a>
  `
})
export class HomeComponent {}

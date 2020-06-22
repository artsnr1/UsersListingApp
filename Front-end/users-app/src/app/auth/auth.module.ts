import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SignUpComponent } from './components/sign-up/sign-up.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { EmailVerificationGuard } from './guards/verify-email.guard';
import { AuthGuard } from './guards/auth.guard';

const authRoutes = [
  { path: 'signup', component: SignUpComponent, canActivate: [AuthGuard]},
  { path: 'signin', component: SignInComponent, canActivate: [AuthGuard]},
  { path: 'verify/:token', component: SignInComponent, canActivate: [EmailVerificationGuard]},
]

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(authRoutes)
  ],
  providers: [
    AuthService, 
    AuthGuard,
    EmailVerificationGuard],
  declarations: [
                  SignUpComponent,
                  SignInComponent
                ]
})

export class AuthModule {
 }

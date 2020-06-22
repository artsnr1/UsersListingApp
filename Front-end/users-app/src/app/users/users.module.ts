import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersListingComponent } from './components/users-listing/users-listing.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';
import { FormsModule } from '@angular/forms';

const usersRoutes = [
  { path: 'users', component: UsersListingComponent, canActivate: [AuthGuard]}
]


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(usersRoutes)
  ],
  providers: [UsersService],
  declarations: [UsersListingComponent]
})
export class UsersModule { }

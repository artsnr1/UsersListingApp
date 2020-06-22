import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  @ViewChild ('signInForm') signInForm: NgForm;
  errorMsg: string

  constructor(private authService: AuthService,
              private router: Router) {}

  ngOnInit() {
  }

  onSignIn(form: NgForm) {
    if(this.signInForm.invalid) {
      const firstInvalid = <HTMLElement>document.getElementsByClassName("ng-invalid")[1];
      firstInvalid.focus();
    }
    else {
      this.authService.signInUser(form.value)
      .subscribe((response: Response) => {
        this.errorMsg = null;
        this.router.navigate(['/users']);
      }, (errorResponse: any) => {
          console.log(errorResponse);
          this.errorMsg = errorResponse.error.error;
          setTimeout(() => {
            this.errorMsg = null;
          }, 5000);
      });
    }
  }
}

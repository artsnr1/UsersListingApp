import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  @ViewChild('signUpForm') signUpForm: NgForm;
  signUpSucceeded: Boolean = false;
  errorMsgs: {
    email: string,
    first_name: string,
    last_name: string,
    password: string
  };

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onSignUp(form: NgForm) {
    if(this.signUpForm.invalid) {
      const firstInvalid = <HTMLElement>document.getElementsByClassName("ng-invalid")[1];
      firstInvalid.focus();
    }
    else {
      this.clearMessages();
      this.authService.signUpUser(form.value)
      .subscribe((response) => {
        console.log(response)
        this.signUpSucceeded =  true;
      }, (errorResponse ) => {
        this.errorMsgs = errorResponse.error.error;
        console.log(this.errorMsgs)
        setTimeout(() => {
          this.errorMsgs = null;
        }, 5000);
      })
    }

  }
  clearMessages() {
    this.errorMsgs = null;
    this.signUpSucceeded = false;
  }

}

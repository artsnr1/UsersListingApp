import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../users.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users-listing',
  templateUrl: './users-listing.component.html',
  styleUrls: ['./users-listing.component.css']
})
export class UsersListingComponent implements OnInit {
  users: User[] = []
  pg: {
    current_page: number,
    per_page: number,
    total_records: number,
    total_pages: number
  }
  searchTerm: string;
  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.onGetUsers(1);
  }
  onUpdatePage(page) {
    this.onGetUsers(page)
  }

  onGetUsers(page) {
    this.usersService.getUsers(page, this.searchTerm).subscribe(resp => {
      this.users = resp['users'];
      this.pg = resp['pagination'];
      console.log(this.users)
    }, error => {
      console.log(error)
    })
  }

  onGetUserFile(userId, format) {
    const type = format === 'pdf'? 'application/pdf': 'text/csv'
    this.usersService.getUserDataFile(userId, format).subscribe(data => {
      // const blob = new Blob([data], {type: type});

      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = `user${userId}.${format}`;
      link.click();
    }, error => {
      console.log(error)
    })
  }
}

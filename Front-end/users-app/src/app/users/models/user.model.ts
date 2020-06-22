export class User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  status: string;

  constructor(user) {
    for (const key of Object.keys(user)) {
      this[key] = user[key];
    }
  }
  // getFullName() {
  //   return `${this.first_name} ${this.last_name}`;
  // }
}

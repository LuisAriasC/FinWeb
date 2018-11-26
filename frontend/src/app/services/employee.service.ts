import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response, Headers } from '@angular/http';
import { map } from "rxjs/operators";
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';
//import { EmployeesComponent } from '../components/employees/employees.component';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  selectedEmployee: Employee;
  employees: Employee[];
  readonly URL_API = 'http://localhost:3977/api/';

  constructor(private http: HttpClient) {
    this.selectedEmployee = new Employee();
   }

  getEmployees() {
    console.log('Conectar a BD --------');
    //this.employees = this.http.get(this.URL_API + 'employees');
    //console.log(this.employees);
    return this.http.get(this.URL_API + 'employees');
    //return this.http.get(this.URL_API + 'employee/5bfae3fd2772781e5b0b2c72');
  }

  postEmployee(employee: Employee) {
    return this.http.post(this.URL_API, employee);
  }

  putEmployee(employee: Employee) {
    return this.http.put(this.URL_API + `/${employee._id}`, employee);
  }

  deleteEmployee (_id: string) {
    return this.http.delete(this.URL_API + `/${_id}`);
  }
}

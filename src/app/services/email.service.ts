import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = environment.apiUrl + '/contact';

  constructor(private http: HttpClient) {}

  sendContactEmail(formData: ContactFormData): Observable<{ success: boolean; message: string }> {
    // In a real application, this would call your backend API
    // For now, we'll simulate a successful API call
    
    // Uncomment this when you have a backend API ready:
    /*
    return this.http.post<{ success: boolean; message: string }>(this.apiUrl, formData)
      .pipe(
        catchError(error => {
          console.error('Error sending email:', error);
          return of({ success: false, message: 'Failed to send email. Please try again later.' });
        })
      );
    */
    
    // Simulate API call with a delay
    return of(formData).pipe(
      map(() => {
        console.log('Email would be sent to:', 'harsh351998@gmail.com');
        console.log('Email content:', formData);
        return { 
          success: true, 
          message: 'Your message has been sent successfully!' 
        };
      })
    );
  }
} 
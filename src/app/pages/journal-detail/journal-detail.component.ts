import { Component, OnInit } from '@angular/core';
import { NgIf, DatePipe, AsyncPipe, NgFor, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JournalService } from '../../services/journal.service';
import { JournalEntry, SentimentType } from '../../models/user.model';
import { catchError, EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-journal-detail',
  templateUrl: './journal-detail.component.html',
  styleUrls: ['./journal-detail.component.scss']
})
export class JournalDetailComponent implements OnInit {
  entryId: string | null = null;
  entry: JournalEntry | null = null;
  isLoading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private journalService: JournalService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.entryId = params.get('id');
        this.isLoading = true;
        
        if (!this.entryId) {
          return EMPTY;
        }
        
        // Use the real endpoint
        return this.journalService.getJournalEntryById(this.entryId).pipe(
          catchError(error => {
            console.error('Error loading journal entry:', error);
            this.isLoading = false;
            this.entry = null;
            this.snackBar.open('Failed to load journal entry', 'Dismiss', {
              duration: 5000
            });
            return EMPTY;
          })
        );
      })
    ).subscribe(entry => {
      this.entry = entry;
      this.isLoading = false;
    });
  }
  
  getSentimentClass(sentiment: SentimentType | undefined): string {
    // Determine class based on sentiment enum
    if (sentiment === undefined) {
      return 'sentiment-neutral';
    }
    
    if (typeof sentiment === 'number') {
      switch (sentiment) {
        case SentimentType.Positive:
          return 'sentiment-positive';
        case SentimentType.Neutral:
          return 'sentiment-neutral';
        case SentimentType.Negative:
          return 'sentiment-negative';
        default:
          return 'sentiment-neutral';
      }
    } else {
      // Fallback to determine sentiment based on the entry's mood rating if available
      return 'sentiment-neutral';
    }
  }
  
  getSentimentIcon(sentiment: SentimentType | undefined): string {
    // Determine icon based on sentiment enum
    if (sentiment === undefined) {
      return 'sentiment_neutral';
    }
    
    if (typeof sentiment === 'number') {
      switch (sentiment) {
        case SentimentType.Positive:
          return 'sentiment_very_satisfied';
        case SentimentType.Neutral:
          return 'sentiment_neutral';
        case SentimentType.Negative:
          return 'sentiment_very_dissatisfied';
        default:
          return 'help_outline';
      }
    } else {
      return 'help_outline';
    }
  }
  
  getSentimentLabel(sentiment: SentimentType | undefined): string {
    // Determine label based on sentiment enum
    if (sentiment === undefined) {
      return 'Neutral';
    }
    
    if (typeof sentiment === 'number') {
      switch (sentiment) {
        case SentimentType.Positive:
          return 'Positive';
        case SentimentType.Neutral:
          return 'Neutral';
        case SentimentType.Negative:
          return 'Negative';
        default:
          return 'Unknown';
      }
    } else {
      return 'Unknown';
    }
  }
  
  confirmDelete(): void {
    if (!this.entry || !this.entryId) {
      return;
    }
    
    if (confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      // Use delete endpoint
      this.journalService.deleteJournalEntry(this.entryId).subscribe({
        next: () => {
          this.snackBar.open('Journal entry deleted successfully', 'Dismiss', {
            duration: 3000
          });
          this.router.navigate(['/journal/list']);
        },
        error: (error) => {
          console.error('Error deleting journal entry:', error);
          this.snackBar.open('Failed to delete journal entry', 'Dismiss', {
            duration: 5000
          });
          
          // For demo purposes, navigate anyway
          this.router.navigate(['/journal/list']);
        }
      });
    }
  }
}
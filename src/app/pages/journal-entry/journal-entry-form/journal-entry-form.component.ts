import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../../services/journal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JournalEntry, JournalRequestDto } from '../../../models/user.model';
import { finalize, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-journal-entry-form',
  templateUrl: './journal-entry-form.component.html',
  styleUrls: ['./journal-entry-form.component.scss']
})
export class JournalEntryFormComponent implements OnInit {
  journalForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  entryId: string = '';
  
  moodRatingLabels: { [key: number]: string } = {
    1: 'Very Bad',
    2: 'Bad',
    3: 'Neutral',
    4: 'Good',
    5: 'Very Good'
  };
  
  moodEmojis: { [key: number]: string } = {
    1: '😞',
    2: '😟',
    3: '😐',
    4: '🙂',
    5: '😃'
  };

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.journalForm = this.fb.group({
      entryText: ['', [Validators.required, Validators.minLength(3)]],
      moodRating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      tags: [''],
      isPrivate: [false]
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            this.isEditMode = true;
            this.entryId = id;
            this.isLoading = true;
            return this.journalService.getJournalEntryById(id);
          }
          return of(null);
        }),
        catchError(error => {
          this.handleError('Failed to load journal entry', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(entry => {
        if (entry) {
          this.populateForm(entry);
        }
      });
  }

  populateForm(entry: JournalEntry): void {
    this.journalForm.patchValue({
      entryText: entry.entryText,
      moodRating: entry.moodRating,
      tags: entry.tags?.join(', ') || '',
      isPrivate: entry.isPrivate || false
    });
  }

  onSubmit(): void {
    if (this.journalForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    
    // Parse tags
    let tagsArray: string[] = [];
    const tagsValue = this.journalForm.get('tags')?.value;
    if (tagsValue && typeof tagsValue === 'string') {
      tagsArray = tagsValue
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    const journalData: JournalRequestDto = {
      entryText: this.journalForm.get('entryText')?.value,
      moodRating: Number(this.journalForm.get('moodRating')?.value),
      tags: tagsArray,
      isPrivate: this.journalForm.get('isPrivate')?.value || false,
    };

    console.log('Submitting journal entry:', journalData);

    if (this.isEditMode) {
      this.journalService.updateJournalEntry(this.entryId, journalData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          }),
          catchError(error => {
            this.handleError('Failed to update journal entry', error);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            this.showSnackBar('Journal entry updated successfully!');
            this.navigateToDashboard();
          }
        });
    } else {
      this.journalService.createJournalEntry(journalData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          }),
          catchError(error => {
            this.handleError('Failed to create journal entry', error);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            this.showSnackBar('Journal entry created successfully!');
            this.navigateToDashboard();
          }
        });
    }
  }

  navigateToDashboard(): void {
    console.log('Navigating to dashboard');
    // Small delay to ensure the entry is processed
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 500);
  }

  handleError(message: string, error: any): void {
    console.error(message, error);
    this.showSnackBar(`${message}: ${error.message || 'Unknown error'}`);
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar']
    });
  }

  getMoodRatingLabel(): string {
    const rating = this.journalForm.get('moodRating')?.value;
    return rating ? `${this.moodEmojis[rating]} ${this.moodRatingLabels[rating]}` : '';
  }

  getMoodRatingColor(): string {
    const rating = this.journalForm.get('moodRating')?.value;
    
    if (!rating) return '';

    switch (rating) {
      case 1: return 'var(--rating-very-bad)';
      case 2: return 'var(--rating-bad)';
      case 3: return 'var(--rating-neutral)';
      case 4: return 'var(--rating-good)';
      case 5: return 'var(--rating-very-good)';
      default: return '';
    }
  }
} 
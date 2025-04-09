import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from '../../services/journal.service';
import { JournalEntry, JournalRequestDto, JournalEntryUpdateDto, SentimentType } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { catchError, EMPTY, of, switchMap } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

/**
 * Component for creating and editing journal entries.
 * This component handles both the creation of new entries and editing of existing ones.
 */
@Component({
  selector: 'app-journal-form',
  templateUrl: './journal-form.component.html',
  styleUrls: ['./journal-form.component.scss']
})
export class JournalFormComponent implements OnInit {
  // Form group for the journal entry form
  journalForm: FormGroup;
  
  // Current journal entry being edited (null for new entries)
  journalEntry: JournalEntry | null = null;
  
  // Loading state indicators
  isLoading = false;
  isSubmitting = false;
  
  // Flag to determine if we're in edit mode
  isEditMode = false;
  
  // ID of the entry being edited (null for new entries)
  entryId: string | null = null;
  
  // Current date for display purposes
  currentDate: Date;
  
  // Character count for the entry text
  charCount: number = 0;
  
  // Sentiment analysis results
  sentiment: string = '';
  detectedSentiment: SentimentType = SentimentType.Neutral;
  
  // Flag to indicate if mood rating and detected sentiment don't match
  moodSentimentMismatch: boolean = false;
  
  /**
   * Constructor for JournalFormComponent
   * @param fb FormBuilder service for creating reactive forms
   * @param route ActivatedRoute service for accessing route parameters
   * @param router Router service for navigation
   * @param journalService Service for journal entry operations
   * @param authService Service for authentication operations
   * @param notificationService Service for displaying notifications
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private journalService: JournalService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Initialize the form with validation
    this.journalForm = this.fb.group({
      entryText: ['', [Validators.required, Validators.minLength(3)]],
      moodRating: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
    
    // Set current date
    this.currentDate = new Date();
    
    // Subscribe to mood rating changes to check for sentiment consistency
    this.journalForm.get('moodRating')?.valueChanges.subscribe(value => {
      this.checkMoodSentimentConsistency();
    });
  }
  
  /**
   * Lifecycle hook that is called after component initialization
   * Checks if we're in edit mode and loads the entry if needed
   */
  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.entryId = params.get('id');
        
        if (this.entryId) {
          this.isEditMode = true;
          this.isLoading = true;
          
          // Load the journal entry for editing
          return this.journalService.getJournalEntryById(this.entryId).pipe(
            catchError(error => {
              console.error('Error loading journal entry:', error);
              this.isLoading = false;
              this.notificationService.error('Failed to load journal entry');
              return EMPTY;
            })
          );
        }
        
        return of(null);
      })
    ).subscribe(entry => {
      this.journalEntry = entry;
      this.isLoading = false;
      
      if (entry) {
        // Populate the form with the entry data
        this.journalForm.patchValue({
          entryText: entry.entryText,
          moodRating: entry.moodRating
        });
      }
    });
  }
  
  /**
   * Formats the mood rating for display
   * @param value The mood rating value
   * @returns The formatted mood rating
   */
  formatMoodLabel(value: number): string {
    return value.toString();
  }
  
  /**
   * Gets a description for the mood rating
   * @param value The mood rating value
   * @returns A description of the mood
   */
  getMoodDescription(value: number): string {
    switch (value) {
      case 1:
        return 'Having a very difficult day';
      case 2:
        return 'Feeling down';
      case 3:
        return 'Neutral - neither good nor bad';
      case 4:
        return 'Feeling pretty good';
      case 5:
        return 'Having a great day!';
      default:
        return '';
    }
  }
  
  /**
   * Handles form submission
   * Creates a new entry or updates an existing one
   */
  onSubmit(): void {
    this.isSubmitting = true;
    
    // Check for inconsistency and warn user if needed
    if (this.moodSentimentMismatch) {
      const confirm = window.confirm('The sentiment detected in your text seems inconsistent with your mood rating. Do you want to continue anyway?');
      if (!confirm) {
        this.isSubmitting = false;
        return;
      }
    }
    
    // Creating a valid GUID for development purposes
    const devUserId = '00000000-0000-0000-0000-000000000001';
    const moodRating = this.journalForm.value.moodRating;
    
    if (this.isEditMode && this.entryId) {
      // Update existing entry
      const updateData: JournalEntryUpdateDto = {
        id: this.entryId,
        entryText: this.journalForm.value.entryText,
        moodRating: moodRating,
        tags: this.journalEntry?.tags || [],
        isPrivate: this.journalEntry?.isPrivate || false,
        sentiment: this.getMoodSentiment(moodRating)
      };
      
      this.journalService.updateJournalEntry(this.entryId, updateData)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.notificationService.success('Journal entry updated successfully!');
            this.router.navigate(['/journal/list']);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.notificationService.error('Error updating journal entry');
            console.error('Error updating journal entry:', error);
          }
        });
    } else {
      // Create new entry
      const createData: JournalRequestDto = {
        userId: devUserId,
        entryText: this.journalForm.value.entryText,
        moodRating: moodRating,
        tags: [],
        isPrivate: false,
        sentiment: this.getMoodSentiment(moodRating)
      };
      
      this.journalService.createJournalEntry(createData)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.notificationService.success('Journal entry created successfully!');
            this.router.navigate(['/journal/list']);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.notificationService.error('Error creating journal entry');
            console.error('Error creating journal entry:', error);
          }
        });
    }
  }
  
  /**
   * Updates the character count and calculates sentiment
   * @param text The entry text
   */
  updateCharCount(text: string): void {
    this.charCount = text.length;
    this.calculateSentiment(text);
    this.checkMoodSentimentConsistency();
  }
  
  /**
   * Calculates the sentiment of the text
   * @param text The entry text
   */
  calculateSentiment(text: string): void {
    if (!text || text.length < 5) {
      this.sentiment = '';
      this.detectedSentiment = SentimentType.Neutral;
      return;
    }
    
    // Simple sentiment analysis - count positive and negative words
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'love', 'beautiful', 'pleased', 'glad', 
      'delighted', 'wonderful', 'success', 'achieve', 'accomplish', 'peaceful', 'relaxed', 'calm', 'hope', 'confident', 'proud'];
      
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'angry', 'upset', 'hate', 'annoyed', 'disappointed', 
      'frustrated', 'worried', 'anxious', 'stress', 'unhappy', 'regret', 'fail', 'miserable', 'depressed', 'fear', 'hurt'];
    
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = textLower.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = textLower.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    });
    
    // Determine sentiment based on word counts
    if (positiveCount > negativeCount) {
      this.sentiment = 'Positive';
      this.detectedSentiment = SentimentType.Positive;
    } else if (negativeCount > positiveCount) {
      this.sentiment = 'Negative';
      this.detectedSentiment = SentimentType.Negative;
    } else {
      this.sentiment = 'Neutral';
      this.detectedSentiment = SentimentType.Neutral;
    }
  }
  
  /**
   * Checks if the mood rating is consistent with the detected sentiment
   */
  checkMoodSentimentConsistency(): void {
    const moodRating = this.journalForm.get('moodRating')?.value;
    if (!moodRating) return;
    
    const moodSentiment = this.getMoodSentiment(moodRating);
    this.moodSentimentMismatch = moodSentiment !== this.detectedSentiment;
  }
  
  /**
   * Gets the sentiment type based on mood rating
   * @param moodRating The mood rating (1-5)
   * @returns The corresponding sentiment type
   */
  getMoodSentiment(moodRating: number): SentimentType {
    if (moodRating <= 2) {
      return SentimentType.Negative;
    } else if (moodRating >= 4) {
      return SentimentType.Positive;
    } else {
      return SentimentType.Neutral;
    }
  }
  
  resetForm(): void {
    this.journalForm.reset();
    this.charCount = 0;
    this.sentiment = '';
  }
} 
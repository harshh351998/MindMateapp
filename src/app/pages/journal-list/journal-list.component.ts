import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, AsyncPipe, KeyValuePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { JournalService } from '../../services/journal.service';
import { AuthService } from '../../services/auth.service';
import { JournalEntry, SentimentType } from '../../models/user.model';
import { catchError, startWith, of } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

/**
 * Component for displaying and managing a list of journal entries.
 * This component handles fetching, filtering, and displaying journal entries.
 */
@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: ['./journal-list.component.scss']
})
export class JournalListComponent implements OnInit {
  userId: string | null = null;
  entries: JournalEntry[] = [];
  filteredEntries: JournalEntry[] = [];
  isLoading = true;
  SentimentType = SentimentType;
  
  // Filter controls
  searchText: string = '';
  selectedMood: number = 0;
  selectedSentiment: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Pagination state
  currentPage = 1;
  pageSize = 10;
  totalEntries = 0;
  
  /**
   * Constructor for JournalListComponent
   * @param journalService Service for journal entry operations
   * @param authService Service for authentication
   * @param router Router service for navigation
   * @param notificationService Service for displaying notifications
   */
  constructor(
    private journalService: JournalService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.userId = this.authService.getUserId();
  }
  
  /**
   * Lifecycle hook that is called after component initialization
   * Loads the initial set of journal entries
   */
  ngOnInit(): void {
    this.loadJournalEntries();
  }

  /**
   * Refreshes the journal entries list
   */
  refreshEntries(): void {
    this.loadJournalEntries();
  }
  
  /**
   * Clears the search text and reapplies filters
   */
  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }
  
  /**
   * Loads journal entries from the service
   * Applies any active filters
   */
  loadJournalEntries(): void {
    this.isLoading = true;

    // Check if we have active filters to use specialized endpoints
    if (this.hasActiveFilters()) {
      this.loadFilteredEntries();
    } else {
      // Use the main endpoint if no filters are active
      this.journalService.getAllJournalEntries()
        .pipe(
          catchError(error => {
            console.error('Error loading journal entries:', error);
            return of([]);
          })
        )
        .subscribe(entries => {
          this.isLoading = false;
          
          // Sort entries by date
          this.entries = entries.sort((a, b) => 
            new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
          );
          this.filteredEntries = [...this.entries];
          this.totalEntries = this.entries.length;
        });
    }
  }
  
  /**
   * Loads filtered entries using the specialized service methods
   */
  loadFilteredEntries(): void {
    // Choose the most specific filter to apply
    if (this.searchText) {
      // Search is the most specific filter
      this.journalService.searchEntries(this.searchText)
        .subscribe(entries => this.processFilteredEntries(entries));
    } 
    else if (this.selectedMood !== 0) {
      // Filter by mood
      this.journalService.getEntriesByMoodRating(this.selectedMood)
        .subscribe(entries => this.processFilteredEntries(entries));
    }
    else if (this.selectedSentiment) {
      // Filter by sentiment
      const sentimentType = this.getSentimentTypeFromString(this.selectedSentiment);
      if (sentimentType !== null) {
        this.journalService.getEntriesBySentiment(sentimentType)
          .subscribe(entries => this.processFilteredEntries(entries));
      } else {
        this.applyFilters(); // Fallback to client-side filtering
      }
    }
    else if (this.startDate && this.endDate) {
      // Filter by date range
      this.journalService.getEntriesByDateRange(this.startDate, this.endDate)
        .subscribe(entries => this.processFilteredEntries(entries));
    }
    else {
      // Apply multiple filters client-side
      this.journalService.getAllJournalEntries()
        .subscribe(entries => {
          this.entries = entries;
          this.applyFilters();
          this.isLoading = false;
        });
    }
  }
  
  /**
   * Process filtered entries from service methods
   */
  processFilteredEntries(entries: JournalEntry[]): void {
    this.isLoading = false;
    
    // Sort entries by date
    this.entries = entries.sort((a, b) => 
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );
    
    // Apply any remaining filters
    this.applyFilters();
    this.totalEntries = this.filteredEntries.length;
  }
  
  /**
   * Convert sentiment string to SentimentType enum
   */
  getSentimentTypeFromString(sentiment: string): SentimentType | null {
    switch (sentiment) {
      case 'positive':
        return SentimentType.Positive;
      case 'negative':
        return SentimentType.Negative;
      case 'neutral':
        return SentimentType.Neutral;
      default:
        return null;
    }
  }

  /**
   * Applies all active filters to the current entries
   */
  applyFilters(): void {
    console.log('Filtering entries, current count:', this.entries.length);
    console.log('Filter values:', {
      search: this.searchText,
      mood: this.selectedMood,
      sentiment: this.selectedSentiment,
      startDate: this.startDate,
      endDate: this.endDate
    });
    
    this.filteredEntries = this.entries.filter(entry => {
      // Apply mood filter
      if (this.selectedMood !== 0 && this.selectedMood !== entry.moodRating) {
        return false;
      }
      
      // Apply sentiment filter
      if (this.selectedSentiment && this.selectedSentiment !== this.getSentimentAsString(entry)) {
        return false;
      }
      
      // Apply date filter
      if (this.startDate && new Date(entry.dateCreated) < this.startDate) {
        return false;
      }
      
      if (this.endDate && new Date(entry.dateCreated) > this.endDate) {
        return false;
      }
      
      // Apply search text filter
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        return entry.entryText.toLowerCase().includes(searchLower) ||
               entry.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      }
      
      return true;
    });
    
    console.log('Filtered entries count:', this.filteredEntries.length);
  }

  /**
   * Resets all filters to their default values
   */
  resetFilters(): void {
    this.searchText = '';
    this.selectedMood = 0;
    this.selectedSentiment = '';
    this.startDate = null;
    this.endDate = null;
    this.filteredEntries = [...this.entries];
  }
  
  /**
   * Sets the mood filter
   * @param mood The mood rating to filter by
   */
  setMoodFilter(mood: number): void {
    this.selectedMood = mood;
    this.applyFilters();
  }
  
  /**
   * Sets the sentiment filter
   * @param sentiment The sentiment to filter by
   */
  setSentimentFilter(sentiment: string): void {
    this.selectedSentiment = sentiment;
    this.applyFilters();
  }
  
  /**
   * Sets the date filter
   * @param date The date to filter by
   */
  setDateFilter(date: Date | null): void {
    this.startDate = date;
    this.endDate = date;
    this.applyFilters();
  }
  
  /**
   * Handles search text changes
   * @param text The search text
   */
  onSearch(text: string): void {
    this.searchText = text;
    this.applyFilters();
  }
  
  /**
   * Truncates text to a specified length
   * @param text The text to truncate
   * @param maxLength The maximum length
   * @returns The truncated text
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substr(0, maxLength) + '...';
  }

  /**
   * Gets the CSS class for the sentiment
   * @param entry The journal entry
   * @returns The CSS class name
   */
  getSentimentClass(entry: JournalEntry): string {
    // Determine sentiment class based on entry sentiment
    const sentiment = this.getSentimentAsString(entry);
    return sentiment;
  }
  
  /**
   * Navigates to the edit page for a journal entry
   * @param entryId The ID of the entry to edit
   */
  editEntry(entryId: string): void {
    this.router.navigate(['/journal/edit', entryId]);
  }
  
  /**
   * Deletes a journal entry
   * @param entry The journal entry to delete
   */
  deleteEntry(entry: JournalEntry): void {
    if (confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      this.journalService.deleteJournalEntry(entry.id).subscribe({
        next: () => {
          this.entries = this.entries.filter(e => e.id !== entry.id);
          this.filteredEntries = this.filteredEntries.filter(e => e.id !== entry.id);
          this.notificationService.success('Journal entry deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting journal entry:', error);
          this.notificationService.error('Failed to delete journal entry');
        }
      });
    }
  }
  
  /**
   * Gets the sentiment icon based on the entry
   * @param entry The journal entry
   * @returns The icon name
   */
  getSentimentIcon(entry: JournalEntry): string {
    const sentiment = this.getSentimentAsString(entry);
    switch (sentiment) {
      case 'positive':
        return 'sentiment_very_satisfied';
      case 'neutral':
        return 'sentiment_neutral';
      case 'negative':
        return 'sentiment_very_dissatisfied';
      default:
        return 'sentiment_neutral';
    }
  }
  
  /**
   * Gets the mood icon based on the mood rating
   * @param rating The mood rating
   * @returns The icon name
   */
  getMoodIcon(rating: number): string {
    switch (rating) {
      case 1:
        return 'sentiment_very_dissatisfied';
      case 2:
        return 'sentiment_dissatisfied';
      case 3:
        return 'sentiment_neutral';
      case 4:
        return 'sentiment_satisfied';
      case 5:
        return 'sentiment_very_satisfied';
      default:
        return 'sentiment_neutral';
    }
  }
  
  /**
   * Gets the sentiment text based on the entry
   * @param entry The journal entry
   * @returns The sentiment text
   */
  getSentimentText(entry: JournalEntry): string {
    const sentiment = this.getSentimentAsString(entry);
    if (sentiment === 'positive') {
      return 'Positive';
    } else if (sentiment === 'neutral') {
      return 'Neutral';
    } else {
      return 'Negative';
    }
  }
  
  /**
   * Converts the SentimentType enum to a string value
   * @param entry The journal entry
   * @returns The sentiment string
   */
  getSentimentAsString(entry: JournalEntry): string {
    if (entry.moodRating >= 4) {
      return 'positive';
    } else if (entry.moodRating === 3) {
      return 'neutral';
    } else {
      return 'negative';
    }
  }
  
  /**
   * Handles page changes for pagination
   * @param page The new page number
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  /**
   * Checks if any filters are currently active
   * @returns True if any filters are active, false otherwise
   */
  hasActiveFilters(): boolean {
    return this.searchText !== '' || 
           this.selectedMood !== 0 || 
           this.selectedSentiment !== '' || 
           this.startDate !== null || 
           this.endDate !== null;
  }

  /**
   * Gets the total count of journal entries
   */
  get entryCount(): number {
    return this.entries.length;
  }

  /**
   * Gets the loading state
   */
  get loading(): boolean {
    return this.isLoading;
  }
} 
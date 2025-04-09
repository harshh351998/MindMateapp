import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, Subject, of } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JournalEntry, JournalRequestDto, JournalEntryUpdateDto, SentimentType } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = `${environment.url || environment.apiUrl}/api/journalentries`;
  private useLocalMockData = true; // Always use mock data
  
  // Add subject to notify components when journal entries change
  private journalChangesSubject = new Subject<void>();
  journalChanges = this.journalChangesSubject.asObservable();
  
  // Local store for demo entries
  private mockEntries: JournalEntry[] = [];
  private nextId = 1;
  
  // Cache for entries to reduce API calls
  private entriesCache: JournalEntry[] | null = null;
  private lastCacheTime = 0;
  private cacheDuration = 60000; // 1 minute cache

  constructor(private http: HttpClient) {
    // Initialize mock entries
    this.setupMockEntries();
  }

  // Get all journal entries with optional cache busting
  getAllJournalEntries(bustCache: boolean = false): Observable<JournalEntry[]> {
    // If using mock data, return mock entries
    if (this.useLocalMockData) {
      this.logDebug('Using mock entries:', this.mockEntries.length);
      return of([...this.mockEntries]);
    }
    
    const now = Date.now();
    // Use cache if available and not expired
    if (!bustCache && this.entriesCache && (now - this.lastCacheTime < this.cacheDuration)) {
      this.logDebug('Using cached entries:', this.entriesCache.length);
      return of(this.entriesCache);
    }
    
    // Add a timestamp parameter to bust cache if needed
    const url = bustCache ? 
      `${this.apiUrl}?timestamp=${now}` : 
      this.apiUrl;
        
    return this.http.get<JournalEntry[]>(url).pipe(
      tap(response => this.logDebug('Raw API response:', JSON.stringify(response).substring(0, 200) + '...')),
      map(entries => this.convertDates(entries)),
      retry(2), // Retry the request up to 2 times if it fails
      tap(entries => {
        this.logDebug(`Fetched ${entries.length} journal entries`);
        // Update cache
        this.entriesCache = entries;
        this.lastCacheTime = now;
      }),
      catchError(error => {
        console.error('Error fetching journal entries:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  // Get a specific journal entry by ID
  getJournalEntryById(id: string): Observable<JournalEntry> {
    // If using mock data, find entry in mock entries
    if (this.useLocalMockData) {
      const entry = this.mockEntries.find(e => e.id === id);
      if (entry) {
        return of({...entry}); // Return a copy to prevent mutation
      }
      return throwError(() => new Error('Entry not found'));
    }
    
    // Check if we have it in cache first
    if (this.entriesCache) {
      const entry = this.entriesCache.find(e => e.id === id);
      if (entry) {
        this.logDebug('Found entry in cache:', id);
        return of({...entry}); // Return a copy to prevent mutation
      }
    }
    
    return this.http.get<JournalEntry>(`${this.apiUrl}/${id}`).pipe(
      map(entry => this.convertDate(entry)),
      catchError(error => this.handleError('Error fetching journal entry', error))
    );
  }

  // Create a new journal entry
  createJournalEntry(entry: JournalRequestDto): Observable<JournalEntry> {
    this.logDebug('Creating journal entry:', entry);
    
    // Ensure sentiment is consistent with mood rating
    const consistentEntry = {
      ...entry,
      sentiment: this.getSentimentFromMood(entry.moodRating)
    };
    
    // If using mock data, create entry locally
    if (this.useLocalMockData) {
      const newEntry: JournalEntry = {
        id: (this.nextId++).toString(),
        entryText: consistentEntry.entryText,
        moodRating: consistentEntry.moodRating,
        tags: consistentEntry.tags || [],
        isPrivate: consistentEntry.isPrivate || false,
        sentiment: consistentEntry.sentiment,
        dateCreated: new Date(),
        dateModified: new Date()
      };
      
      this.mockEntries.push(newEntry);
      this.logDebug('Created mock entry:', newEntry);
      this.journalChangesSubject.next();
      return of({...newEntry}); // Return a copy to prevent mutation
    }
    
    return this.http.post<JournalEntry>(this.apiUrl, consistentEntry).pipe(
      tap(response => this.logDebug('Create entry response:', response)),
      map(newEntry => this.convertDate(newEntry)),
      tap(newEntry => {
        // Notify subscribers that a new entry was created
        this.logDebug('Journal entry created with ID:', newEntry.id);
        // Update cache
        if (this.entriesCache) {
          this.entriesCache.unshift(newEntry);
        }
        this.journalChangesSubject.next();
      }),
      catchError(error => this.handleError('Error creating journal entry', error))
    );
  }

  // Update an existing journal entry
  updateJournalEntry(id: string, entry: JournalEntryUpdateDto): Observable<JournalEntry> {
    this.logDebug('Updating journal entry:', id, entry);
    
    // Ensure sentiment is consistent with mood rating
    const consistentEntry = {
      ...entry,
      sentiment: this.getSentimentFromMood(entry.moodRating)
    };
    
    // If using mock data, update entry locally
    if (this.useLocalMockData) {
      const index = this.mockEntries.findIndex(e => e.id === id);
      if (index !== -1) {
        const updatedEntry: JournalEntry = {
          ...this.mockEntries[index],
          entryText: consistentEntry.entryText,
          moodRating: consistentEntry.moodRating,
          tags: consistentEntry.tags || [],
          isPrivate: consistentEntry.isPrivate || false,
          sentiment: consistentEntry.sentiment,
          dateModified: new Date()
        };
        
        this.mockEntries[index] = updatedEntry;
        this.logDebug('Updated mock entry:', updatedEntry);
        this.journalChangesSubject.next();
        return of({...updatedEntry}); // Return a copy to prevent mutation
      }
      return throwError(() => new Error('Entry not found'));
    }
    
    return this.http.put<JournalEntry>(`${this.apiUrl}/${id}`, consistentEntry).pipe(
      tap(response => this.logDebug('Update entry response:', response)),
      map(updatedEntry => this.convertDate(updatedEntry)),
      tap(updatedEntry => {
        // Notify subscribers that an entry was updated
        this.logDebug('Journal entry updated - notifying subscribers');
        // Update cache if it exists
        if (this.entriesCache) {
          const index = this.entriesCache.findIndex(e => e.id === id);
          if (index !== -1) {
            this.entriesCache[index] = updatedEntry;
          }
        }
        this.journalChangesSubject.next();
      }),
      catchError(error => this.handleError('Error updating journal entry', error))
    );
  }

  // Delete a journal entry
  deleteJournalEntry(id: string): Observable<any> {
    this.logDebug('Deleting journal entry:', id);
    
    // If using mock data, delete entry locally
    if (this.useLocalMockData) {
      const index = this.mockEntries.findIndex(e => e.id === id);
      if (index !== -1) {
        this.mockEntries.splice(index, 1);
        this.logDebug('Deleted mock entry with ID:', id);
        this.journalChangesSubject.next();
        return of({ success: true });
      }
      return throwError(() => new Error('Entry not found'));
    }
    
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(response => this.logDebug('Delete entry response:', response)),
      tap(() => {
        // Notify subscribers that an entry was deleted
        this.logDebug('Journal entry deleted - notifying subscribers');
        // Update cache if it exists
        if (this.entriesCache) {
          this.entriesCache = this.entriesCache.filter(e => e.id !== id);
        }
        this.journalChangesSubject.next();
      }),
      catchError(error => this.handleError('Error deleting journal entry', error))
    );
  }

  // Helper methods
  private convertDates(entries: any): JournalEntry[] {
    // Handle the case when the API returns null or undefined
    if (!entries) {
      this.logDebug('Received null or undefined entries');
      return [];
    }
    
    // Handle response format with $values (ASP.NET serialization format)
    if (entries.$values && Array.isArray(entries.$values)) {
      this.logDebug('Processing entries from $values array:', entries.$values.length);
      return entries.$values.map((entry: any) => this.convertDate(entry));
    }
    
    // Regular array handling
    if (Array.isArray(entries)) {
      this.logDebug('Processing entries from direct array:', entries.length);
      return entries.map(entry => this.convertDate(entry));
    }
    
    // Handle single entry object (sometimes APIs return this instead of array for single item)
    if (entries.id) {
      this.logDebug('Processing single entry object');
      return [this.convertDate(entries)];
    }
    
    console.warn('Expected array or object with entries but received:', entries);
    return [];
  }

  private convertDate(entry: JournalEntry): JournalEntry {
    if (!entry) {
      console.warn('Received null or undefined entry');
      return {} as JournalEntry;
    }
    
    try {
      return {
        ...entry,
        dateCreated: entry.dateCreated ? new Date(entry.dateCreated) : new Date(),
        dateModified: entry.dateModified ? new Date(entry.dateModified) : new Date()
      };
    } catch (error) {
      console.error('Error converting dates for entry:', entry, error);
      return entry;
    }
  }

  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
  
  // Helper method to get sentiment from mood rating
  private getSentimentFromMood(moodRating: number): SentimentType {
    if (moodRating <= 2) return SentimentType.Negative;
    if (moodRating >= 4) return SentimentType.Positive;
    return SentimentType.Neutral;
  }
  
  // Helper method to conditionally log debug messages only in development
  private logDebug(...args: any[]): void {
    if (!environment.production) {
      console.log(...args);
    }
  }

  private setupMockEntries(): void {
    // Create some sample entries for development
    const sampleTexts = [
      "Had a great day today! The weather was beautiful and I accomplished a lot of tasks at work.",
      "Feeling a bit down today. Nothing seems to be going right and I'm struggling to focus.",
      "Neutral day today. Nothing particularly good or bad happened, just the usual routine.",
      "Very excited about my upcoming vacation! Can't wait to relax and recharge.",
      "Stressed about the upcoming presentation. I hope I've prepared enough.",
      "Feeling grateful for my friends who supported me through a difficult time.",
      "Disappointed with the outcome of the project, but trying to see it as a learning experience."
    ];
    
    const sampleTags = [
      ['work', 'productivity', 'happy'],
      ['stress', 'mental health'],
      ['routine', 'neutral'],
      ['vacation', 'planning', 'excited'],
      ['work', 'anxiety', 'presentation'],
      ['friends', 'gratitude', 'support'],
      ['work', 'learning', 'reflection']
    ];
    
    // Create entries with different dates and moods
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Create entries for past days
      
      const moodRating = Math.floor(Math.random() * 5) + 1; // Random mood 1-5
      const textIndex = Math.floor(Math.random() * sampleTexts.length);
      
      this.mockEntries.push({
        id: (this.nextId++).toString(),
        entryText: sampleTexts[textIndex],
        moodRating: moodRating,
        sentiment: this.getSentimentFromMood(moodRating), // Set consistent sentiment
        tags: [...sampleTags[textIndex], moodRating >= 4 ? 'good day' : moodRating <= 2 ? 'bad day' : 'neutral day'],
        isPrivate: Math.random() > 0.7, // 30% chance of being private
        dateCreated: new Date(date),
        dateModified: new Date(date)
      });
    }
    
    this.logDebug('Created', this.mockEntries.length, 'mock journal entries for development');
  }

  // Get entries filtered by date range
  getEntriesByDateRange(startDate: Date, endDate: Date): Observable<JournalEntry[]> {
    this.logDebug('Getting entries by date range:', startDate, endDate);
    
    if (this.useLocalMockData) {
      const filteredEntries = this.mockEntries.filter(entry => {
        const entryDate = new Date(entry.dateCreated);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      this.logDebug(`Found ${filteredEntries.length} entries in date range`);
      return of([...filteredEntries]);
    }
    
    // If we were using a backend, this would call a specialized API endpoint
    return this.getAllJournalEntries().pipe(
      map(entries => entries.filter(entry => {
        const entryDate = new Date(entry.dateCreated);
        return entryDate >= startDate && entryDate <= endDate;
      }))
    );
  }
  
  // Get entries filtered by sentiment
  getEntriesBySentiment(sentiment: SentimentType): Observable<JournalEntry[]> {
    this.logDebug('Getting entries by sentiment:', sentiment);
    
    if (this.useLocalMockData) {
      const filteredEntries = this.mockEntries.filter(entry => 
        entry.sentiment === sentiment
      );
      
      this.logDebug(`Found ${filteredEntries.length} entries with sentiment: ${sentiment}`);
      return of([...filteredEntries]);
    }
    
    // If we were using a backend, this would call a specialized API endpoint
    return this.getAllJournalEntries().pipe(
      map(entries => entries.filter(entry => entry.sentiment === sentiment))
    );
  }
  
  // Get entries filtered by mood rating
  getEntriesByMoodRating(moodRating: number): Observable<JournalEntry[]> {
    this.logDebug('Getting entries by mood rating:', moodRating);
    
    if (this.useLocalMockData) {
      const filteredEntries = this.mockEntries.filter(entry => 
        entry.moodRating === moodRating
      );
      
      this.logDebug(`Found ${filteredEntries.length} entries with mood rating: ${moodRating}`);
      return of([...filteredEntries]);
    }
    
    // If we were using a backend, this would call a specialized API endpoint
    return this.getAllJournalEntries().pipe(
      map(entries => entries.filter(entry => entry.moodRating === moodRating))
    );
  }
  
  // Search entries by text (in entry text and tags)
  searchEntries(searchText: string): Observable<JournalEntry[]> {
    this.logDebug('Searching entries for:', searchText);
    const searchLower = searchText.toLowerCase();
    
    if (this.useLocalMockData) {
      const filteredEntries = this.mockEntries.filter(entry => 
        entry.entryText.toLowerCase().includes(searchLower) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
      
      this.logDebug(`Found ${filteredEntries.length} entries matching search: ${searchText}`);
      return of([...filteredEntries]);
    }
    
    // If we were using a backend, this would call a specialized API endpoint
    return this.getAllJournalEntries().pipe(
      map(entries => entries.filter(entry => 
        entry.entryText.toLowerCase().includes(searchLower) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      ))
    );
  }
} 
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { JournalService } from '../../services/journal.service';
import { AuthService } from '../../services/auth.service';
import { JournalEntry, SentimentType } from '../../models/user.model';
import { catchError, map, of, Subscription, filter, finalize, take } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';

interface CalendarDay {
  date: Date;
  moodLevel: number;
  tooltip: string;
  isCurrentMonth: boolean;
}

interface WordCount {
  text: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', '../../styles/emoji-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Make Math available to the template
  Math = Math;
  
  userId: string | null = null;
  isLoading = true;
  lastRefreshTime = 0;
  
  private routerSubscription: Subscription | null = null;
  private journalSubscription: Subscription | null = null;
  
  // Stats data
  totalEntries = 0;
  averageMood = 0;
  positiveCount = 0;
  neutralCount = 0;
  negativeCount = 0;
  
  // Journal entries 
  recentEntries: JournalEntry[] = [];
  
  // Calendar data
  calendarDays: CalendarDay[] = [];
  
  // Word analysis
  commonWords: WordCount[] = [];
  
  // Chart data
  moodChartData: ChartConfiguration<'line'>['data'] = {
    datasets: []
  };
  
  moodChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          },
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Mood Rating',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#555'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          },
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#555'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(65, 84, 176, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return 'Date: ' + tooltipItems[0].label;
          },
          label: function(context) {
            return 'Mood: ' + context.raw + '/5';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hitRadius: 8
      }
    }
  };
  
  constructor(
    private journalService: JournalService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.userId = this.authService.getUserId();
  }
  
  ngOnInit(): void {
    this.loadDashboardData();
    
    // Subscribe to journal changes
    this.journalSubscription = this.journalService.journalChanges
      .pipe(take(10)) // Limit the number of refresh operations (for safety)
      .subscribe(() => {
        this.logDebug('Journal changes detected, refreshing dashboard');
        // Add a small delay to ensure the backend has processed the change
        setTimeout(() => this.refreshDashboard(true), 500);
      });
    
    // Refresh data when navigating back to dashboard
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/dashboard' || event.url === '/') {
          this.logDebug('Navigated to dashboard, refreshing data');
          this.refreshDashboard();
        }
      });
  }
  
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.journalSubscription) {
      this.journalSubscription.unsubscribe();
    }
  }
  
  refreshDashboard(forceBustCache: boolean = false): void {
    const now = Date.now();
    // Prevent refreshing more than once every 2 seconds unless forced
    if (forceBustCache || now - this.lastRefreshTime > 2000) {
      this.logDebug('Refreshing dashboard data' + (forceBustCache ? ' (with cache busting)' : ''));
      this.lastRefreshTime = now;
      this.loadDashboardData(forceBustCache);
    } else {
      this.logDebug('Refresh skipped - too soon since last refresh');
    }
  }
  
  loadDashboardData(bustCache: boolean = false): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.journalService.getAllJournalEntries(bustCache)
      .pipe(
        catchError(error => {
          console.error('Error loading journal entries:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(entries => {
        // Process data in a separate zone to avoid blocking the UI
        this.ngZone.runOutsideAngular(() => {
          // Ensure proper type conversion for mood ratings
          const processedEntries = entries.map(entry => ({
            ...entry,
            moodRating: Number(entry.moodRating)
          }));
          
          this.logDebug('Processed entries:', processedEntries.length);
          
          // Sort entries by date (newest first)
          const sortedEntries = this.sortEntries(processedEntries);
          
          // Run the UI updates back in the Angular zone
          this.ngZone.run(() => {
            // Recent entries (top 6)
            this.recentEntries = sortedEntries.slice(0, 6);
            
            // Calculate stats
            this.totalEntries = processedEntries.length;
            this.calculateStats(processedEntries);
            
            // Generate calendar data
            this.generateCalendarData(processedEntries);
            
            // Generate chart data
            this.generateMoodChartData(processedEntries);
            
            // Generate word cloud data
            this.generateWordCloudData(processedEntries);
            
            // Mark for change detection since we're using OnPush
            this.cdr.markForCheck();
          });
        });
      });
  }
  
  // Sort entries by date (newest first) - extracted for performance
  private sortEntries(entries: JournalEntry[]): JournalEntry[] {
    return [...entries].sort((a, b) => 
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );
  }
  
  calculateStats(entries: JournalEntry[]): void {
    if (entries.length === 0) {
      this.averageMood = 0;
      this.positiveCount = 0;
      this.neutralCount = 0;
      this.negativeCount = 0;
      return;
    }
    
    // Calculate average mood
    const moodSum = entries.reduce((sum, entry) => sum + entry.moodRating, 0);
    this.averageMood = parseFloat((moodSum / entries.length).toFixed(1));
    
    // Count sentiment distribution
    this.positiveCount = entries.filter(entry => entry.sentiment === SentimentType.Positive).length;
    this.neutralCount = entries.filter(entry => entry.sentiment === SentimentType.Neutral).length;
    this.negativeCount = entries.filter(entry => entry.sentiment === SentimentType.Negative).length;
  }
  
  generateCalendarData(entries: JournalEntry[]): void {
    // Create calendar days for the current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Get the day of the week the month starts on (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    
    // Calculate how many days from next month to show
    const totalDaysInCalendar = 35; // 5 rows of 7 days
    const daysFromNextMonth = totalDaysInCalendar - lastDay.getDate() - daysFromPrevMonth;
    
    // Create a map for quick lookup of entries by date
    const entryMap = new Map<string, number>();
    entries.forEach(entry => {
      const dateKey = new Date(entry.dateCreated).toISOString().split('T')[0]; // YYYY-MM-DD
      // If multiple entries on same day, use the average mood
      if (entryMap.has(dateKey)) {
        const existingMood = entryMap.get(dateKey) || 0;
        entryMap.set(dateKey, (existingMood + entry.moodRating) / 2);
      } else {
        entryMap.set(dateKey, entry.moodRating);
      }
    });
    
    // Clear previous calendar days
    this.calendarDays = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(today.getFullYear(), today.getMonth() - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      
      this.calendarDays.push({
        date,
        moodLevel: entryMap.has(dateKey) ? Math.round(entryMap.get(dateKey) || 0) : 0,
        tooltip: this.getDateTooltip(date, entryMap.has(dateKey) ? Math.round(entryMap.get(dateKey) || 0) : 0),
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      
      this.calendarDays.push({
        date,
        moodLevel: entryMap.has(dateKey) ? Math.round(entryMap.get(dateKey) || 0) : 0,
        tooltip: this.getDateTooltip(date, entryMap.has(dateKey) ? Math.round(entryMap.get(dateKey) || 0) : 0),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month if needed
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth() + 1, day);
      const dateKey = date.toISOString().split('T')[0];
      
      this.calendarDays.push({
        date,
        moodLevel: entryMap.has(dateKey) ? Math.round(entryMap.get(dateKey) || 0) : 0,
        tooltip: this.getDateTooltip(date, entryMap.has(dateKey) ? Math.round(entryMap.get(dateKey) || 0) : 0),
        isCurrentMonth: false
      });
    }
  }
  
  getDateTooltip(date: Date, moodLevel: number): string {
    const formatDate = date.toLocaleDateString('en-US', {
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
    
    if (moodLevel === 0) {
      return `${formatDate} - No entry`;
    }
    
    let moodDescription = '';
    switch (moodLevel) {
      case 1: moodDescription = 'Very Bad'; break;
      case 2: moodDescription = 'Bad'; break;
      case 3: moodDescription = 'Neutral'; break;
      case 4: moodDescription = 'Good'; break;
      case 5: moodDescription = 'Very Good'; break;
    }
    
    return `${formatDate} - Mood: ${moodDescription} (${moodLevel}/5)`;
  }
  
  generateMoodChartData(entries: JournalEntry[]): void {
    if (entries.length === 0) {
      this.moodChartData = { datasets: [] };
      return;
    }
    
    // Get entries for the past 14 days
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 13); // 14 days including today
    
    // Filter entries within date range and sort by date (oldest first for the chart)
    const filteredEntries = entries
      .filter(entry => {
        const entryDate = new Date(entry.dateCreated);
        return entryDate >= twoWeeksAgo && entryDate <= today;
      })
      .sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
    
    // Create a map for entries by date (handling multiple entries per day)
    const entriesByDate = new Map<string, number[]>();
    
    filteredEntries.forEach(entry => {
      const dateStr = new Date(entry.dateCreated).toISOString().split('T')[0];
      if (!entriesByDate.has(dateStr)) {
        entriesByDate.set(dateStr, []);
      }
      entriesByDate.get(dateStr)?.push(entry.moodRating);
    });
    
    // Generate labels and data points for each day
    const labels: string[] = [];
    const dataPoints: number[] = [];
    
    // Iterate through each day in the 14-day period
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(twoWeeksAgo);
      currentDate.setDate(twoWeeksAgo.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const formattedDate = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      labels.push(formattedDate);
      
      if (entriesByDate.has(dateStr)) {
        const moodRatings = entriesByDate.get(dateStr) || [];
        const avgMood = moodRatings.reduce((sum, mood) => sum + mood, 0) / moodRatings.length;
        dataPoints.push(Number(avgMood.toFixed(1)));
      } else {
        // Use null for days with no entries to create gaps in the chart
        dataPoints.push(NaN);
      }
    }
    
    // Update chart data
    this.moodChartData = {
      labels,
      datasets: [
        {
          data: dataPoints,
          borderColor: '#4154b0',
          backgroundColor: 'rgba(65, 84, 176, 0.5)',
          pointBackgroundColor: '#4154b0',
          pointHoverBackgroundColor: '#ffffff',
          pointBorderColor: '#4154b0',
          pointHoverBorderColor: '#4154b0',
          spanGaps: true // Connect data points across gaps
        }
      ]
    };
  }
  
  generateWordCloudData(entries: JournalEntry[]): void {
    if (entries.length === 0) {
      this.commonWords = [];
      return;
    }
    
    // Combine all entry text
    const allText = entries.map(entry => entry.entryText).join(' ').toLowerCase();
    
    // Extract individual words, excluding very common words
    const commonStopWords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
      'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
      'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
      'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
      'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
      'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
      'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
    ]);
    
    // Extract tags from entries
    const allTags = entries.reduce((tags, entry) => {
      if (entry.tags && entry.tags.length > 0) {
        tags.push(...entry.tags);
      }
      return tags;
    }, [] as string[]);
    
    // Process text to extract meaningful words
    const words = allText
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/) // Split on spaces
      .filter(word => word.length > 3 && !commonStopWords.has(word)); // Filter out stop words and short words
    
    // Count word frequencies (include tags with boosted count)
    const wordCounts = new Map<string, number>();
    
    // Add extracted words
    words.forEach(word => {
      const count = wordCounts.get(word) || 0;
      wordCounts.set(word, count + 1);
    });
    
    // Add tags with a higher weight (counted as 3 occurrences)
    allTags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      const count = wordCounts.get(normalizedTag) || 0;
      wordCounts.set(normalizedTag, count + 3); // Tags are more important
    });
    
    // Convert to array and sort by count
    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25) // Take top 25 words
      .map(([text, count]) => ({ text, count }));
    
    this.commonWords = sortedWords;
  }
  
  // Helper methods used in the template
  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text || '';
    }
    return text.substring(0, maxLength) + '...';
  }
  
  getSentimentClass(entry: JournalEntry): string {
    if (!entry || entry.sentiment === undefined) {
      return 'sentiment-neutral emoji-sentiment-neutral';
    }
    
    switch (entry.sentiment) {
      case SentimentType.Positive:
        return 'sentiment-positive emoji-sentiment-positive';
      case SentimentType.Negative:
        return 'sentiment-negative emoji-sentiment-negative';
      case SentimentType.Neutral:
      default:
        return 'sentiment-neutral emoji-sentiment-neutral';
    }
  }
  
  getSentimentIcon(entry: JournalEntry): string {
    if (!entry || entry.sentiment === undefined) {
      return 'sentiment_neutral';
    }
    
    switch (entry.sentiment) {
      case SentimentType.Positive:
        return 'sentiment_very_satisfied';
      case SentimentType.Negative:
        return 'sentiment_very_dissatisfied';
      case SentimentType.Neutral:
      default:
        return 'sentiment_neutral';
    }
  }
  
  getSentimentText(entry: JournalEntry): string {
    if (!entry || entry.sentiment === undefined) {
      return 'Neutral';
    }
    
    switch (entry.sentiment) {
      case SentimentType.Positive:
        return 'Positive';
      case SentimentType.Negative:
        return 'Negative';
      case SentimentType.Neutral:
      default:
        return 'Neutral';
    }
  }
  
  getAverageMoodClass(): string {
    if (!this.averageMood) return 'mood-3 emoji-mood-3';
    
    const moodRounded = Math.round(this.averageMood);
    
    if (moodRounded <= 2) {
      return 'mood-' + moodRounded + ' emoji-mood-' + moodRounded;
    } else if (moodRounded === 3) {
      return 'mood-3 emoji-mood-3';
    } else {
      return 'mood-' + moodRounded + ' emoji-mood-' + moodRounded;
    }
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  getMoodIcon(moodRating: number): string {
    switch (moodRating) {
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
  
  // Helper method to conditionally log debug messages only in development
  private logDebug(...args: any[]): void {
    if (!environment.production) {
      console.log('[Dashboard]', ...args);
    }
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface OfflineQueueItem {
  id: string,
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  payload?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private interval: any;
  private queueKey = 'offline-queue';
  private queueSubject = new BehaviorSubject<OfflineQueueItem[]>(this.getQueue());
  public queue$ = this.queueSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startQueue();
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  apiRequest(request: Omit<OfflineQueueItem, 'id' | 'status'>): string {
    const queueItem: OfflineQueueItem = {
      ...request,
      id: crypto.randomUUID(),
      status: 'pending',
    };

    const queue = this.getQueue();
    queue.push(queueItem);
    this.saveQueue(queue);
    this.queueSubject.next(queue);
    console.log(`Request queued: ${request.method} ${request.url}`);
    return queueItem.id;
  }

  private getQueue(): OfflineQueueItem[] {
    return JSON.parse(localStorage.getItem(this.queueKey) || '[]');
  }

  private saveQueue(queue: OfflineQueueItem[]) {
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
    this.queueSubject.next(queue);
  }

  private updateItemStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'failed') {
    const queue = this.getQueue();
    const itemIndex = queue.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      queue[itemIndex].status = status;
      this.saveQueue(queue);
      console.log(`Item ${id} status updated to ${status}`);
    }
  }

  private removeFromQueue(id: string) {
    const queue = this.getQueue();
    const itemIndex = queue.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      queue.splice(itemIndex, 1);
      this.saveQueue(queue);
      console.log(`Item ${id} removed from queue`);
    }
  }

  private startQueue() {
    this.interval = setInterval(() => {
      console.log('Checking offline queue...', navigator.onLine ? 'Online' : 'Offline');
      const queue = this.getQueue();
      const pendingItem = queue.find(item => item.status === 'pending');
      console.log(`Checking queue: ${queue.length} items, ${pendingItem ? 'processing' : 'no pending items'}`);
      if (pendingItem) {
        this.processItem(pendingItem);
      }
    }, 5000);
  }

  private processItem(item: OfflineQueueItem) {
    this.updateItemStatus(item.id, 'processing');

    let req;
    switch (item.method) {
      case 'POST':
        req = this.http.post(item.url, item.payload);
        break;
      case 'PUT':
        req = this.http.put(item.url, item.payload);
        break;
      case 'DELETE':
        req = this.http.delete(item.url);
        break;
      default:
        console.warn('Unknown method', item.method);
        return;
    }

    req.subscribe({
      next: () => {
        this.updateItemStatus(item.id, 'completed');
        this.removeFromQueue(item.id);
      },
      error: (err) => {
        console.warn(`⚠️ Failed ${item.method} to ${item.url}`, err);
        this.updateItemStatus(item.id, 'pending');
        this.saveQueue(this.getQueue());
      }
    });
  }

}

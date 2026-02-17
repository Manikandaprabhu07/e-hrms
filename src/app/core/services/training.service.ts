import { Injectable, signal } from '@angular/core';

export interface TrainingSession {
    id: string;
    title: string;
    trainer: string;
    date: string;
    duration: string;
    status: 'Upcoming' | 'Completed' | 'InProgress' | 'Cancelled';
    enrolledCount: number;
    maxParticipants: number;
    description?: string;
    location?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private trainingSessionsSignal = signal<TrainingSession[]>([
        {
            id: 'TRN001',
            title: 'Advanced Angular Workshop',
            trainer: 'Google Experts',
            date: '2026-02-15',
            duration: '2 Days',
            status: 'Upcoming',
            enrolledCount: 15,
            maxParticipants: 20,
            description: 'Deep dive into signals and standalone components',
            location: 'Conference Room A'
        },
        {
            id: 'TRN002',
            title: 'Leadership Skills',
            trainer: 'John Maxwell Team',
            date: '2026-02-20',
            duration: '4 Hours',
            status: 'Upcoming',
            enrolledCount: 8,
            maxParticipants: 15,
            location: 'Online Zoom'
        },
        {
            id: 'TRN003',
            title: 'Security Compliance 2026',
            trainer: 'Internal Security Team',
            date: '2026-01-10',
            duration: '2 Hours',
            status: 'Completed',
            enrolledCount: 45,
            maxParticipants: 50,
            location: 'Auditorium'
        },
        {
            id: 'TRN004',
            title: 'Clean Code Practices',
            trainer: 'Robert Martin',
            date: '2026-02-12',
            duration: '1 Day',
            status: 'InProgress',
            enrolledCount: 25,
            maxParticipants: 30,
            location: 'Training Hall 1'
        },
        {
            id: 'TRN005',
            title: 'System Architecture Review',
            trainer: 'Kiruthik Aswanth',
            date: '2026-03-05',
            duration: '3 Hours',
            status: 'Upcoming',
            enrolledCount: 12,
            maxParticipants: 20,
            description: 'Architecture review session led by Senior Architect',
            location: 'Board Room'
        }
    ]);

    private isLoadingSignal = signal<boolean>(false);

    sessions = this.trainingSessionsSignal.asReadonly();
    isLoading = this.isLoadingSignal.asReadonly();

    constructor() { }

    getSessions() {
        // Already loaded in mock
        return this.sessions();
    }
}

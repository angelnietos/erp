import { Injectable, inject, signal, computed } from '@angular/core';
import { Project, ProjectService } from '../services/project.service';

@Injectable({ providedIn: 'root' })
export class ProjectsFacade {
  private readonly projectService = inject(ProjectService);

  // State
  private readonly _projects = signal<Project[]>([]);
  private readonly _selectedProject = signal<Project | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Selectors
  readonly projects = this._projects.asReadonly();
  readonly selectedProject = this._selectedProject.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Tabs
  readonly tabs = computed(() => {
    const projects = this._projects();
    const all = projects.length;
    const active = projects.filter((p) => p.status === 'ACTIVE').length;
    const completed = projects.filter((p) => p.status === 'COMPLETED').length;
    const cancelled = projects.filter((p) => p.status === 'CANCELLED').length;

    return [
      { id: 'all', label: 'Todos', badge: all },
      { id: 'ACTIVE', label: 'Activos', badge: active },
      { id: 'COMPLETED', label: 'Completados', badge: completed },
      { id: 'CANCELLED', label: 'Cancelados', badge: cancelled },
    ];
  });

  // Actions
  loadProjects(force = false): void {
    if (!force && this._projects().length > 0) return;
    this._isLoading.set(true);
    this._error.set(null);
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this._projects.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error loading projects');
        this._isLoading.set(false);
      },
    });
  }

  searchProjects(term: string): void {
    this._isLoading.set(true);
    this.projectService.searchProjects(term).subscribe({
      next: (data) => {
        this._projects.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error searching projects');
        this._isLoading.set(false);
      },
    });
  }

  createProject(project: Omit<Project, 'id' | 'createdAt'>): void {
    this._isLoading.set(true);
    this.projectService.createProject(project).subscribe({
      next: (newProject) => {
        this._projects.update((projects) => [...projects, newProject]);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error creating project');
        this._isLoading.set(false);
      },
    });
  }

  updateProject(id: string, updates: Partial<Project>): void {
    this._isLoading.set(true);
    this.projectService.updateProject(id, updates).subscribe({
      next: (updatedProject) => {
        this._projects.update((projects) =>
          projects.map((p) => (p.id === id ? updatedProject : p)),
        );
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error updating project');
        this._isLoading.set(false);
      },
    });
  }

  deleteProject(id: string): void {
    this._isLoading.set(true);
    this.projectService.deleteProject(id).subscribe({
      next: (success) => {
        if (success) {
          this._projects.update((projects) =>
            projects.filter((p) => p.id !== id),
          );
        }
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error deleting project');
        this._isLoading.set(false);
      },
    });
  }

  setTab(_tabId: string): void {
    // Tab logic can be implemented if needed
  }
}

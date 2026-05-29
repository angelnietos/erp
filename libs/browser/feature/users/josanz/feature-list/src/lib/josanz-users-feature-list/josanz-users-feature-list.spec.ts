import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JosanzUsersListComponent } from './josanz-users-feature-list';

describe('JosanzUsersListComponent', () => {
  let component: JosanzUsersListComponent;
  let fixture: ComponentFixture<JosanzUsersListComponent>;
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    router = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [JosanzUsersListComponent],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    fixture = TestBed.createComponent(JosanzUsersListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have title', () => {
      expect(component.title).toBe('Usuario/as');
    });

    it('should have primaryBtnLabel', () => {
      expect(component.primaryBtnLabel).toBe('Añadir Usuario +');
    });

    it('should have userLabels', () => {
      expect(component.userLabels).toEqual(['Email', 'Teléfono', 'Rol', 'Último acceso']);
    });

    it('should have filterOptions', () => {
      expect(component.filterOptions).toEqual(['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z']);
    });

    it('should have userItems', () => {
      expect(component.userItems.length).toBe(3);
    });
  });

  describe('onAdd', () => {
    it('should navigate to /users/new', () => {
      component.onAdd();
      expect(router.navigate).toHaveBeenCalledWith(['/users/new']);
    });
  });

  describe('openDetail', () => {
    it('should navigate to user detail', () => {
      component.openDetail();
      expect(router.navigate).toHaveBeenCalledWith(['/users/1']);
    });
  });

  describe('userItems data', () => {
    it('should have correct data structure', () => {
      const user = component.userItems[0];
      expect(user.id).toBe('admin@josanz.com');
      expect(user.title).toBe('Admin Josanz');
      expect(user.status).toBe('Activo');
      expect(user.statusVariant).toBe('success');
      expect(user.data).toHaveLength(4);
    });
  });
});
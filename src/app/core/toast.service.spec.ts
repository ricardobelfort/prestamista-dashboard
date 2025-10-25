import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { toast } from 'ngx-sonner';

jest.mock('ngx-sonner');

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call toast.success', () => {
    service.success('Success message');
    expect(toast.success).toHaveBeenCalledWith('Success message');
  });

  it('should call toast.error', () => {
    service.error('Error message');
    expect(toast.error).toHaveBeenCalledWith('Error message');
  });

  it('should call toast.warning', () => {
    service.warning('Warning message');
    expect(toast.warning).toHaveBeenCalledWith('Warning message');
  });

  it('should call toast.message', () => {
    service.info('Info message');
    expect(toast.message).toHaveBeenCalledWith('Info message');
  });
});

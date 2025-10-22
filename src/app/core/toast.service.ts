import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(msg: string) { toast.success(msg); }
  error(msg: string) { toast.error(msg); }
  info(msg: string) { toast.message(msg); }
}
import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(msg: string) { toast.success(msg); }
  error(msg: string) { toast.error(msg); }
  warning(msg: string) { toast.warning(msg); }
  info(msg: string) { toast.message(msg); }
}
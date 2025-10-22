# Estilos CSS para Notificações e Alertas

## ✅ Estilos Implementados

### 🎨 **Classes de Alert Disponíveis**

#### **Alert Base**
```html
<div class="alert">
  <icon class="alert-icon"></icon>
  <div class="alert-content">
    <div class="alert-title">Título</div>
    <div class="alert-description">Descrição</div>
  </div>
</div>
```

#### **Variantes de Alert**

**🔴 Erro/Destructive**
```html
<div class="alert alert-destructive">
  <fa-icon [icon]="faExclamationTriangle" class="alert-icon"></fa-icon>
  <div class="alert-content">
    <div class="alert-title">Erro</div>
    <div class="alert-description">Mensagem de erro</div>
  </div>
</div>
```

**🟢 Sucesso**
```html
<div class="alert alert-success">
  <fa-icon [icon]="faCheckCircle" class="alert-icon"></fa-icon>
  <div class="alert-content">
    <div class="alert-title">Sucesso</div>
    <div class="alert-description">Operação realizada com sucesso</div>
  </div>
</div>
```

**🟡 Aviso/Warning**
```html
<div class="alert alert-warning">
  <fa-icon [icon]="faExclamationTriangle" class="alert-icon"></fa-icon>
  <div class="alert-content">
    <div class="alert-title">Atenção</div>
    <div class="alert-description">Mensagem de aviso importante</div>
  </div>
</div>
```

**🔵 Informação**
```html
<div class="alert alert-info">
  <fa-icon [icon]="faInfoCircle" class="alert-icon"></fa-icon>
  <div class="alert-content">
    <div class="alert-title">Informação</div>
    <div class="alert-description">Informação adicional</div>
  </div>
</div>
```

### 🍞 **Toast Notifications (ngx-sonner)**

Os toasts do `ngx-sonner` agora são estilizados automaticamente com:
- `sonner-toast[data-type="success"]` - Verde
- `sonner-toast[data-type="error"]` - Vermelho
- `sonner-toast[data-type="warning"]` - Laranja
- `sonner-toast[data-type="info"]` - Azul

### 📦 **Classes de Container Utilitárias**

#### **Error Container**
```html
<div class="error-container">
  <h3 class="error-title">Título do Erro</h3>
  <p class="error-message">Mensagem de erro detalhada</p>
</div>
```

#### **Success Container**
```html
<div class="success-container">
  <h3 class="success-title">Título de Sucesso</h3>
  <p class="success-message">Mensagem de sucesso detalhada</p>
</div>
```

#### **Warning Container**
```html
<div class="warning-container">
  <h3 class="warning-title">Título de Aviso</h3>
  <p class="warning-message">Mensagem de aviso detalhada</p>
</div>
```

## 🎨 **Cores Utilizadas**

### **Destructive/Error**
- Borda: `hsl(var(--destructive) / 0.5)`
- Fundo: `hsl(var(--destructive) / 0.05)`
- Texto: `hsl(var(--destructive))`

### **Success**
- Borda: `hsl(142.1 76.2% 36.3% / 0.5)`
- Fundo: `hsl(142.1 76.2% 36.3% / 0.05)`
- Texto: `hsl(142.1 70.6% 45.3%)`

### **Warning**
- Borda: `hsl(45.4 93.4% 47.5% / 0.5)`
- Fundo: `hsl(45.4 93.4% 47.5% / 0.05)`
- Texto: `hsl(25 95% 53%)`

### **Info**
- Borda: `hsl(221.2 83.2% 53.3% / 0.5)`
- Fundo: `hsl(221.2 83.2% 53.3% / 0.05)`
- Texto: `hsl(221.2 83.2% 53.3%)`

## 🔧 **Como Usar**

### **1. Substituir Estados de Erro Antigos**
```html
<!-- ANTES -->
<div class="card border-destructive bg-destructive/5">
  <div class="p-6">
    <div class="flex items-center">
      <fa-icon [icon]="faExclamationTriangle" class="text-destructive text-xl mr-3"></fa-icon>
      <div>
        <h3 class="text-destructive font-semibold">Erro</h3>
        <p class="text-destructive/80 text-sm mt-1">Mensagem</p>
      </div>
    </div>
  </div>
</div>

<!-- AGORA -->
<div class="alert alert-destructive">
  <fa-icon [icon]="faExclamationTriangle" class="alert-icon"></fa-icon>
  <div class="alert-content">
    <div class="alert-title">Erro</div>
    <div class="alert-description">Mensagem</div>
  </div>
</div>
```

### **2. Toast Service Usage**
```typescript
// Os toasts já são automaticamente estilizados
this.toastService.success('Sucesso!');
this.toastService.error('Erro!');
this.toastService.warning('Atenção!');
this.toastService.info('Info!');
```

### **3. FontAwesome Icons Recomendados**
```typescript
// Importe estes ícones nos componentes
import { 
  faExclamationTriangle,  // Warning/Error
  faCheckCircle,          // Success
  faInfoCircle,          // Info
  faExclamationCircle    // Alert
} from '@fortawesome/free-solid-svg-icons';
```

## ✅ **Componentes Atualizados**

- ✅ **loans.component.html** - Alert de erro atualizado
- ✅ **payments.component.html** - Alert de erro atualizado
- ✅ **clients.component.html** - Alert de erro atualizado
- ✅ **routes.component.html** - Alert de erro atualizado

## 🚀 **Benefícios**

1. **Consistência Visual**: Todos os alertas seguem o mesmo padrão
2. **Acessibilidade**: Estrutura semântica correta
3. **Responsividade**: Adaptam-se a diferentes tamanhos de tela
4. **Tematização**: Integram-se com o sistema de cores do Tailwind/shadcn
5. **Reutilização**: Classes utilitárias para uso em qualquer componente

Os estilos estão agora padronizados e seguem as melhores práticas de design system! 🎨✨
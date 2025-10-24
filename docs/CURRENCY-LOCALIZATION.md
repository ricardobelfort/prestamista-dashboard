# Sistema de Localização de Moeda

## Visão Geral

O sistema de localização de moeda foi implementado para suportar múltiplas moedas e locales de acordo com o idioma selecionado pelo usuário.

## Idiomas e Moedas Suportados

| Idioma | Locale | Moeda | Símbolo |
|--------|--------|-------|---------|
| Português (Brasil) | pt-BR | BRL | R$ |
| Español (Paraguay) | es-PY | PYG | ₲ |
| English (US) | en-US | USD | $ |

## Componentes Principais

### 1. LanguageService

O `LanguageService` gerencia o idioma atual e fornece informações sobre a moeda e locale correspondentes:

```typescript
interface Language {
  code: string;        // ex: 'pt-BR'
  name: string;        // ex: 'Português'
  flag: string;        // ex: '🇧🇷'
  nativeName: string;  // ex: 'Português (Brasil)'
  currency: string;    // ex: 'BRL'
  locale: string;      // ex: 'pt-BR'
}
```

Métodos disponíveis:
- `getCurrentCurrency()`: Retorna o código da moeda atual (BRL, PYG, USD)
- `getCurrentLocale()`: Retorna o locale atual (pt-BR, es-PY, en-US)
- `setLanguage(langCode)`: Altera o idioma e atualiza automaticamente a moeda

### 2. LocalizedCurrencyPipe

Pipe customizado que formata valores monetários de acordo com o idioma atual:

```typescript
@Pipe({
  name: 'localizedCurrency',
  standalone: true,
  pure: false  // Importante: permite reagir a mudanças de idioma
})
export class LocalizedCurrencyPipe implements PipeTransform {
  transform(
    value: number,
    display: 'code' | 'symbol' = 'symbol',
    digitsInfo?: string
  ): string | null
}
```

## Uso no Template

### Antes (Moeda fixa em BRL)
```html
{{ value | currency:'BRL':'symbol':'1.2-2' }}
```

### Depois (Moeda localizada)
```html
{{ value | localizedCurrency:'symbol':'1.2-2' }}
```

## Exemplos de Formatação

### Português (Brasil)
```typescript
1234.56 | localizedCurrency:'symbol':'1.2-2'
// Resultado: R$ 1.234,56
```

### Español (Paraguay)
```typescript
1234.56 | localizedCurrency:'symbol':'1.2-2'
// Resultado: ₲ 1.235  (PYG não usa decimais)
```

### English (US)
```typescript
1234.56 | localizedCurrency:'symbol':'1.2-2'
// Resultado: $1,234.56
```

## Componentes Atualizados

Todos os componentes que exibem valores monetários foram atualizados para usar o `LocalizedCurrencyPipe`:

1. ✅ `home.component.html` - Dashboard principal
2. ✅ `client-history-modal.component.html` - Histórico de clientes
3. ✅ `payments.component.html` - Listagem de pagamentos
4. ✅ `loans.component.html` - Listagem de empréstimos

## Como Adicionar Suporte a Novas Moedas

1. Adicione o locale em `LanguageService`:
```typescript
import localeEs from '@angular/common/locales/es-AR';
registerLocaleData(localeEs, 'es-AR');
```

2. Adicione a nova moeda no array `availableLanguages`:
```typescript
{ 
  code: 'es-AR', 
  name: 'Español', 
  flag: '🇦🇷', 
  nativeName: 'Español (Argentina)',
  currency: 'ARS',
  locale: 'es-AR'
}
```

3. Adicione o arquivo de tradução em `public/assets/i18n/es-AR.json`

## Importante: Pure vs Impure Pipe

O `LocalizedCurrencyPipe` é marcado como `pure: false` porque:

1. Precisa reagir a mudanças no idioma selecionado
2. O valor da moeda depende de um estado externo (LanguageService)
3. Sem isso, os valores não seriam atualizados ao trocar o idioma

## Conversão de Valores

⚠️ **IMPORTANTE**: O sistema atualmente **NÃO** faz conversão de valores entre moedas.

Ele apenas **formata** os valores de acordo com o locale selecionado. Por exemplo:

- Um empréstimo de R$ 1.000 registrado no banco de dados
- Em português: exibe "R$ 1.000"
- Em espanhol: exibe "₲ 1.000"
- Em inglês: exibe "$1,000"

Se você precisar de conversão real entre moedas, será necessário:

1. Adicionar taxas de câmbio no backend
2. Criar uma função de conversão
3. Armazenar a moeda original de cada transação
4. Converter valores na leitura/exibição

## Benefícios da Implementação

1. ✅ Experiência de usuário melhorada
2. ✅ Suporte nativo a múltiplos locales
3. ✅ Formatação automática de números e moedas
4. ✅ Consistência em toda a aplicação
5. ✅ Fácil manutenção e extensão
6. ✅ Mudança de idioma atualiza moeda automaticamente

## Testes Recomendados

Para testar o sistema:

1. Acesse o dashboard
2. Observe os valores em R$ (Real Brasileiro)
3. Troque o idioma para Español
4. Verifique se os valores aparecem em ₲ (Guaraní Paraguaio)
5. Troque para English
6. Verifique se os valores aparecem em $ (Dólar Americano)

## Arquivos Modificados

```
src/
├── app/
│   ├── core/
│   │   └── language.service.ts          # Gerenciamento de idiomas e moedas
│   ├── shared/
│   │   └── pipes/
│   │       └── localized-currency.pipe.ts  # Pipe de formatação
│   └── dashboard/
│       ├── home/
│       │   ├── home.component.ts        # Importa LocalizedCurrencyPipe
│       │   └── home.component.html      # Usa localizedCurrency pipe
│       ├── loans/
│       │   ├── loans.component.ts       # Importa LocalizedCurrencyPipe
│       │   └── loans.component.html     # Usa localizedCurrency pipe
│       └── payments/
│           ├── payments.component.ts    # Importa LocalizedCurrencyPipe
│           └── payments.component.html  # Usa localizedCurrency pipe
```

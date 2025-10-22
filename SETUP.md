# Prestamista Dashboard

## Configuração do Supabase

Para configurar o Supabase no projeto, siga os passos abaixo:

1. **Crie um projeto no Supabase:**
   - Acesse https://supabase.com
   - Crie uma nova conta ou faça login
   - Crie um novo projeto

2. **Configure as variáveis de ambiente:**
   - Vá até o dashboard do seu projeto no Supabase
   - Acesse Settings > API
   - Copie a Project URL e a anon key
   - Substitua os valores em `src/environments/environment.ts`:

   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'SEU_PROJECT_URL_AQUI',
     supabaseKey: 'SUA_ANON_KEY_AQUI'
   };
   ```

3. **Configure autenticação:**
   - No dashboard do Supabase, vá até Authentication > Settings
   - Configure o método de autenticação desejado (email/password é o padrão)
   - Crie usuários de teste se necessário

## Executar o projeto

```bash
npm start
```

## Estrutura do projeto

- `src/app/auth/` - Componentes de autenticação
- `src/app/core/` - Serviços principais (Supabase, Auth, Guards)
- `src/app/dashboard/` - Componentes do dashboard
- `src/app/shared/` - Componentes compartilhados
- `src/environments/` - Configurações de ambiente

## Tecnologias utilizadas

- Angular 20
- Tailwind CSS 4
- Supabase
- TypeScript
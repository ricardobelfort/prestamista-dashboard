# 🚀 Sistema de Versionamento Automático

## 📋 Visão Geral

Sistema que incrementa versão automaticamente baseado no estilo dos seus commits usando **Conventional Commits**.

## 🎯 Como Funciona

### 📝 Padrões de Commit Reconhecidos:

| Prefixo | Tipo | Incremento | Exemplo |
|---------|------|------------|---------|
| `feat:` | Nova funcionalidade | **MINOR** | `feat: nova tela de relatórios` |
| `fix:` | Correção de bug | **PATCH** | `fix: corrigindo erro no login` |
| `feat!:` | Breaking change | **MAJOR** | `feat!: nova API incompatível` |
| `chore:` | Manutenção | _Nenhum_ | `chore: atualizando dependências` |
| `docs:` | Documentação | _Nenhum_ | `docs: atualizando README` |
| Outros | Mudanças gerais | **PATCH** | `ajustando layout` |

### 🔍 Análise Automática:

O sistema analisa todos os commits desde a última tag de versão e determina o maior incremento necessário:

- **MAJOR** > **MINOR** > **PATCH**
- Se houver `feat!:` ou `BREAKING CHANGE`, sempre será **MAJOR**
- Se houver `feat:`, será no mínimo **MINOR**
- Se houver apenas `fix:`, será **PATCH**

## 🛠️ Como Usar

### 🤖 Modo Automático (Recomendado):

```bash
# Analisa commits e incrementa automaticamente
npm run version:auto

# Ou com push automático
npm run release
```

### 🎛️ Modo Manual:

```bash
# Forçar incremento específico
npm run version:patch   # 1.1.0 -> 1.1.1
npm run version:minor   # 1.1.0 -> 1.2.0  
npm run version:major   # 1.1.0 -> 2.0.0
```

## 📊 Exemplo de Análise

```bash
📦 Versão atual: 1.1.0

📊 Analisando commits desde v1.1.0:
abc1234 feat: nova área de administração
def5678 fix: corrigindo bug no dashboard  
ghi9012 chore: limpando console.log

✨ MINOR: abc1234 feat: nova área de administração
🐛 PATCH: def5678 fix: corrigindo bug no dashboard
🔧 CHORE: ghi9012 chore: limpando console.log

🚀 Incrementando versão: 1.1.0 -> 1.2.0 (minor)
```

## ⚡ Scripts Disponíveis

```json
{
  "version:auto": "Versionamento automático baseado em commits",
  "version:patch": "Incremento manual patch",
  "version:minor": "Incremento manual minor", 
  "version:major": "Incremento manual major",
  "release": "Versiona automaticamente + push com tags"
}
```

## 🔄 Workflow Recomendado

### 💻 Durante Desenvolvimento:

1. **Faça commits descritivos** com prefixos:
   ```bash
   git commit -m "feat: implementando área de admin"
   git commit -m "fix: corrigindo erro de autenticação"
   git commit -m "chore: atualizando dependências"
   ```

2. **Quando pronto para release**:
   ```bash
   npm run release
   ```

### 🚀 Resultado Automático:

- ✅ Versão incrementada corretamente
- ✅ Tag criada no Git
- ✅ Commit de bump automático
- ✅ Push para repositório

## 💡 Dicas

### ✅ Bons Exemplos:
```bash
feat: nova tela de empréstimos
fix: corrigindo cálculo de juros
feat!: mudando API de autenticação (breaking)
chore: removendo arquivos desnecessários
docs: atualizando documentação
```

### ❌ Evitar:
```bash
mudanças gerais           # Vira PATCH por segurança
varios ajustes           # Muito vago
fix                      # Sem descrição
```

## 🎯 Benefícios

- ✅ **Automático**: Sem necessidade de lembrar de incrementar versão
- ✅ **Consistente**: Segue semântica baseada no impacto das mudanças  
- ✅ **Rastreável**: Histórico claro de mudanças via commits
- ✅ **Padronizado**: Força uso de conventional commits
- ✅ **Flexível**: Permite override manual quando necessário
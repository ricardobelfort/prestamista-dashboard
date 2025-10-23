#!/bin/bash

# Script para aplicar traduções nos componentes restantes
# Payments, Routes e Admin

echo "Aplicando traduções no componente Payments..."

# Substituições no payments.component.html
sed -i '' 's/Pagamentos/{{ '\''payments.title'\'' | translate }}/g' src/app/dashboard/payments/payments.component.html
sed -i '' 's/Gerencie todos os pagamentos recebidos/{{ '\''payments.subtitle'\'' | translate }}/g' src/app/dashboard/payments/payments.component.html
sed -i '' 's/Novo Pagamento/{{ '\''payments.newPayment'\'' | translate }}/g' src/app/dashboard/payments/payments.component.html
sed -i '' 's/Lista de Pagamentos/{{ '\''payments.list'\'' | translate }}/g' src/app/dashboard/payments/payments.component.html
sed -i '' 's/Carregando pagamentos.../{{ '\''payments.loading'\'' | translate }}/g' src/app/dashboard/payments/payments.component.html
sed -i '' 's/Erro ao carregar pagamentos/{{ '\''payments.errorLoading'\'' | translate }}/g' src/app/dashboard/payments/payments.component.html

echo "Aplicando traduções no componente Routes..."

# Substituições no routes.component.html  
sed -i '' 's/Rotas de Cobrança/{{ '\''routes.title'\'' | translate }}/g' src/app/dashboard/routes/routes.component.html
sed -i '' 's/Organize suas rotas e áreas de cobrança/{{ '\''routes.subtitle'\'' | translate }}/g' src/app/dashboard/routes/routes.component.html
sed -i '' 's/Nova Rota/{{ '\''routes.newRoute'\'' | translate }}/g' src/app/dashboard/routes/routes.component.html
sed -i '' 's/Lista de Rotas/{{ '\''routes.list'\'' | translate }}/g' src/app/dashboard/routes/routes.component.html
sed -i '' 's/Carregando rotas.../{{ '\''routes.loading'\'' | translate }}/g' src/app/dashboard/routes/routes.component.html
sed -i '' 's/Erro ao carregar rotas/{{ '\''routes.errorLoading'\'' | translate }}/g' src/app/dashboard/routes/routes.component.html

echo "Aplicando traduções no componente Admin..."

# Substituições no admin.component.html
sed -i '' 's/Administração/{{ '\''admin.title'\'' | translate }}/g' src/app/dashboard/admin/admin.component.html
sed -i '' 's/Gerencie membros da equipe e configurações/{{ '\''admin.subtitle'\'' | translate }}/g' src/app/dashboard/admin/admin.component.html
sed -i '' 's/Convidar Membro/{{ '\''admin.inviteMember'\'' | translate }}/g' src/app/dashboard/admin/admin.component.html

echo "Traduções aplicadas com sucesso!"

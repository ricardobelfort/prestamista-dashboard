#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Função para incrementar versão
function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      throw new Error('Tipo de versão inválido. Use: patch, minor, major');
  }
}

// Obter argumentos da linha de comando
const args = process.argv.slice(2);
const versionType = args[0];

if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Uso: node bump-version.js <patch|minor|major>');
  console.error('   patch: 1.0.0 -> 1.0.1 (bugfixes)');
  console.error('   minor: 1.0.0 -> 1.1.0 (new features)');
  console.error('   major: 1.0.0 -> 2.0.0 (breaking changes)');
  process.exit(1);
}

try {
  // Ler package.json
  const packagePath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Incrementar versão
  const newVersion = incrementVersion(currentVersion, versionType);
  
  console.log(`📦 Incrementando versão: ${currentVersion} -> ${newVersion}`);
  
  // Atualizar package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  // Gerar nova versão
  execSync('node generate-version.js', { stdio: 'inherit' });
  
  // Commit das mudanças
  execSync(`git add package.json src/assets/version.json`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
  
  // Criar tag
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  
  console.log(`✅ Versão ${newVersion} criada com sucesso!`);
  console.log(`📋 Para publicar:`);
  console.log(`   git push origin main`);
  console.log(`   git push origin v${newVersion}`);
  
} catch (error) {
  console.error('❌ Erro ao incrementar versão:', error.message);
  process.exit(1);
}
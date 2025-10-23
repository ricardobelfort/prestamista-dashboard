#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Função para executar comandos git de forma segura
function safeExec(command, fallback = '') {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return fallback;
  }
}

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
      return version;
  }
}

// Analisar commits desde a última tag de versão
function analyzeCommits() {
  try {
    // Obter última tag
    const lastTag = safeExec('git describe --tags --abbrev=0', '');
    
    // Se não há tags, analisar todos os commits
    const commitRange = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    
    // Obter commits desde a última tag
    const commits = safeExec(`git log ${commitRange} --oneline`);
    
    if (!commits) {
      return null;
    }
    
    const commitLines = commits.split('\n');
    let hasMajor = false;
    let hasMinor = false;
    let hasPatch = false;
    
    for (const commit of commitLines) {
      const message = commit.toLowerCase();
      
      // BREAKING CHANGES (major)
      if (message.includes('breaking') || message.includes('!:')) {
        hasMajor = true;
      }
      // Novas funcionalidades (minor)
      else if (message.includes('feat:') || message.includes('feature:')) {
        hasMinor = true;
      }
      // Correções de bugs (patch)
      else if (message.includes('fix:') || message.includes('bugfix:')) {
        hasPatch = true;
      }
      // Outros commits sem prefixo padrão - consideramos patch por segurança
      else if (!message.includes('chore:') && !message.includes('docs:') && !message.includes('style:')) {
        hasPatch = true;
      }
    }
    
    // Determinar tipo de incremento
    if (hasMajor) return 'major';
    if (hasMinor) return 'minor';
    if (hasPatch) return 'patch';
    
    return null;
    
  } catch (error) {
    console.error('❌ Erro ao analisar commits:', error.message);
    return null;
  }
}

// Função principal
function autoVersion() {
  try {
    // Ler package.json
    const packagePath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Analisar commits
    const versionType = analyzeCommits();
    
    if (!versionType) {
      console.log('Nenhuma mudança de versão necessária.');
      return;
    }
    
    // Incrementar versão
    const newVersion = incrementVersion(currentVersion, versionType);
    
    console.log(`Incrementando versão: ${currentVersion} -> ${newVersion} (${versionType})`);
    
    // Atualizar package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    // Gerar nova versão
    execSync('node generate-version.js', { stdio: 'inherit' });
    
    // Commit das mudanças
    execSync(`git add package.json public/version.json`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    
    // Criar tag
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    
    console.log(`Versão ${newVersion} criada com sucesso!`);
    
  } catch (error) {
    console.error('Erro ao processar versionamento automático:', error.message);
    process.exit(1);
  }
}

// Verificar se é chamada com argumentos (modo manual) ou automático
const args = process.argv.slice(2);

if (args.length > 0) {
  // Modo manual - usar o bump-version.js original
  const versionType = args[0];
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('Uso: node auto-version.js <patch|minor|major>');
    console.error('Ou execute sem argumentos para análise automática baseada nos commits');
    process.exit(1);
  }
  
  // Usar a lógica do bump-version.js
  try {
    const packagePath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    const newVersion = incrementVersion(currentVersion, versionType);
    
    console.log(`Incrementando versão: ${currentVersion} -> ${newVersion}`);
    
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    execSync('node generate-version.js', { stdio: 'inherit' });
    execSync(`git add package.json public/version.json`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    
    console.log(`Versão ${newVersion} criada com sucesso!`);
    
  } catch (error) {
    console.error('Erro ao incrementar versão:', error.message);
    process.exit(1);
  }
} else {
  // Modo automático - analisar commits
  autoVersion();
}
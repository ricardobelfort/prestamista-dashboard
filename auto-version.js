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
      console.log('📋 Nenhum commit novo encontrado desde a última versão.');
      return null;
    }
    
    console.log(`📊 Analisando commits desde ${lastTag || 'início'}:`);
    console.log(commits);
    console.log('');
    
    const commitLines = commits.split('\n');
    let hasMajor = false;
    let hasMinor = false;
    let hasPatch = false;
    
    for (const commit of commitLines) {
      const message = commit.toLowerCase();
      
      // BREAKING CHANGES (major)
      if (message.includes('breaking') || message.includes('!:')) {
        hasMajor = true;
        console.log(`🔥 MAJOR: ${commit}`);
      }
      // Novas funcionalidades (minor)
      else if (message.includes('feat:') || message.includes('feature:')) {
        hasMinor = true;
        console.log(`✨ MINOR: ${commit}`);
      }
      // Correções de bugs (patch)
      else if (message.includes('fix:') || message.includes('bugfix:')) {
        hasPatch = true;
        console.log(`🐛 PATCH: ${commit}`);
      }
      // Outros commits que não afetam versão
      else if (message.includes('chore:') || message.includes('docs:') || message.includes('style:')) {
        console.log(`🔧 CHORE: ${commit}`);
      }
      // Commits sem prefixo padrão - consideramos patch por segurança
      else {
        hasPatch = true;
        console.log(`📝 OTHER (patch): ${commit}`);
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
    
    console.log(`📦 Versão atual: ${currentVersion}`);
    console.log('');
    
    // Analisar commits
    const versionType = analyzeCommits();
    
    if (!versionType) {
      console.log('📋 Nenhuma mudança de versão necessária.');
      console.log('💡 Dica: Use prefixos nos commits:');
      console.log('   feat: para novas funcionalidades (minor)');
      console.log('   fix: para correções (patch)');
      console.log('   feat!: ou BREAKING CHANGE para mudanças incompatíveis (major)');
      return;
    }
    
    // Incrementar versão
    const newVersion = incrementVersion(currentVersion, versionType);
    
    console.log('');
    console.log(`🚀 Incrementando versão: ${currentVersion} -> ${newVersion} (${versionType})`);
    
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
    console.error('❌ Erro ao processar versionamento automático:', error.message);
    process.exit(1);
  }
}

// Verificar se é chamada com argumentos (modo manual) ou automático
const args = process.argv.slice(2);

if (args.length > 0) {
  // Modo manual - usar o bump-version.js original
  const versionType = args[0];
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ Uso: node auto-version.js <patch|minor|major>');
    console.error('   patch: 1.0.0 -> 1.0.1 (bugfixes)');
    console.error('   minor: 1.0.0 -> 1.1.0 (new features)');
    console.error('   major: 1.0.0 -> 2.0.0 (breaking changes)');
    console.error('');
    console.error('💡 Ou execute sem argumentos para análise automática baseada nos commits');
    process.exit(1);
  }
  
  // Usar a lógica do bump-version.js
  try {
    const packagePath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    const newVersion = incrementVersion(currentVersion, versionType);
    
    console.log(`📦 Incrementando versão: ${currentVersion} -> ${newVersion}`);
    
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    execSync('node generate-version.js', { stdio: 'inherit' });
    execSync(`git add package.json src/assets/version.json`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    
    console.log(`✅ Versão ${newVersion} criada com sucesso!`);
    console.log(`📋 Para publicar:`);
    console.log(`   git push origin main`);
    console.log(`   git push origin v${newVersion}`);
    
  } catch (error) {
    console.error('❌ Erro ao incrementar versão:', error.message);
    process.exit(1);
  }
} else {
  // Modo automático - analisar commits
  autoVersion();
}
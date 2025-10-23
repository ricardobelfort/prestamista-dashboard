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

// Ler o package.json para obter a versão base
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const baseVersion = packageJson.version;

// Obter informações do Git e CI/CD
const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA || 
                  process.env.GITHUB_SHA || 
                  safeExec('git rev-parse HEAD', 'local');

const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || 
                  process.env.GITHUB_REF_NAME || 
                  safeExec('git rev-parse --abbrev-ref HEAD', 'main');

const buildNumber = process.env.GITHUB_RUN_NUMBER || 
                    process.env.VERCEL_BUILD_ID || 
                    Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp

// Gerar versão baseada no ambiente
let version = baseVersion;

// Detectar se é produção de forma mais robusta
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.VERCEL_ENV === 'production' ||
                     process.env.VERCEL ||  // Se está no Vercel (qualquer branch)
                     gitBranch === 'main' && (process.env.CI || process.env.VERCEL);

if (isProduction) {
  // Produção: usar versão do package.json + build number
  version = `${baseVersion}.${buildNumber}`;
} else if (gitBranch !== 'main' && gitBranch !== 'master') {
  // Branch de desenvolvimento: incluir nome do branch
  const branchName = gitBranch.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  version = `${baseVersion}-${branchName}.${buildNumber}`;
} else {
  // Main/master em desenvolvimento local
  version = `${baseVersion}-dev.${buildNumber}`;
}

// Informações adicionais para debug
const buildInfo = {
  version,
  baseVersion,
  buildNumber,
  gitCommit: gitCommit.substring(0, 7), // Short commit hash
  gitBranch,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  buildTime: new Date().toISOString(),
  isProduction: isProduction
};

// Criar o arquivo de versão
const versionInfo = {
  version,
  formatted: `v${version}`,
  buildInfo: {
    baseVersion,
    buildNumber,
    gitCommit: gitCommit.substring(0, 7),
    gitBranch,
    environment: buildInfo.environment,
    buildTime: buildInfo.buildTime,
    isProduction: isProduction
  }
};

// Escrever o arquivo version.json
fs.writeFileSync('./public/version.json', JSON.stringify(versionInfo, null, 2));

console.log(`✅ Version generated: v${version}`);
console.log(`   Environment: ${buildInfo.environment}`);
console.log(`   Branch: ${gitBranch}`);
console.log(`   Commit: ${buildInfo.gitCommit}`);
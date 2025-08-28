const fs = require('fs');
const path = require('path');

// Fonction pour nettoyer les logs de debug
function cleanupDebugLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Remplacer les console.log simples par des versions conditionnelles
    content = content.replace(
      /console\.log\(([^)]+)\);/g,
      (match, args) => {
        hasChanges = true;
        return `if (process.env.NODE_ENV === 'development') {\n        console.log(${args});\n      }`;
      }
    );

    // Remplacer les console.log avec template literals
    content = content.replace(
      /console\.log\(`([^`]+)`\);/g,
      (match, template) => {
        hasChanges = true;
        return `if (process.env.NODE_ENV === 'development') {\n        console.log(\`${template}\`);\n      }`;
      }
    );

    // Remplacer les console.log avec des arguments complexes
    content = content.replace(
      /console\.log\(([^;]+)\);/g,
      (match, args) => {
        // Éviter de remplacer les console.error et console.warn
        if (match.includes('console.error') || match.includes('console.warn')) {
          return match;
        }
        hasChanges = true;
        return `if (process.env.NODE_ENV === 'development') {\n        console.log(${args});\n      }`;
      }
    );

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Nettoyé: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDir(dir, fileExtensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath, fileExtensions);
    } else if (fileExtensions.some(ext => file.endsWith(ext))) {
      cleanupDebugLogs(filePath);
    }
  });
}

// Dossiers à nettoyer
const directories = [
  'app',
  'components',
  'lib',
  'hooks'
];

console.log('🧹 Nettoyage des logs de debug en cours...\n');

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Traitement du dossier: ${dir}`);
    walkDir(dir);
  }
});

console.log('\n🎉 Nettoyage terminé !');
console.log('💡 Tous les console.log sont maintenant conditionnels et ne s\'afficheront qu\'en développement.');

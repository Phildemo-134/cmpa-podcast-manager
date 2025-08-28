const fs = require('fs');
const path = require('path');

// Fonction pour nettoyer un fichier
function cleanupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Remplacer les console.log non conditionnels par des versions conditionnelles
    content = content.replace(
      /console\.log\(([^;]+)\);/g,
      (match, args) => {
        // Vérifier si c'est déjà dans une condition NODE_ENV
        const lines = content.split('\n');
        const lineIndex = content.indexOf(match);
        const lineNumber = content.substring(0, lineIndex).split('\n').length;
        
        // Vérifier les lignes précédentes pour voir si on est déjà dans une condition
        let isInCondition = false;
        for (let i = lineNumber - 2; i >= Math.max(0, lineNumber - 10); i--) {
          const line = lines[i];
          if (line.includes('if (process.env.NODE_ENV === \'development\')')) {
            isInCondition = true;
            break;
          }
          if (line.includes('}') && !line.includes('if')) {
            break;
          }
        }
        
        if (!isInCondition) {
          hasChanges = true;
          return `if (process.env.NODE_ENV === 'development') {\n        console.log(${args});\n      }`;
        }
        return match;
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
  const results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...walkDir(filePath, fileExtensions));
    } else if (fileExtensions.some(ext => file.endsWith(ext))) {
      // Ignorer les fichiers de test et les scripts
      if (!file.includes('test') && !file.includes('script') && !file.includes('cleanup')) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Dossiers à nettoyer
const directories = [
  'app',
  'components',
  'lib'
];

console.log('🧹 Nettoyage final des logs de debug en cours...\n');

let totalCleaned = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Traitement du dossier: ${dir}`);
    const files = walkDir(dir);
    
    files.forEach(file => {
      if (cleanupFile(file)) {
        totalCleaned++;
      }
    });
  }
});

console.log(`\n🎉 Nettoyage terminé ! ${totalCleaned} fichiers ont été nettoyés.`);
console.log('💡 Tous les console.log sont maintenant conditionnels et ne s\'afficheront qu\'en développement.');

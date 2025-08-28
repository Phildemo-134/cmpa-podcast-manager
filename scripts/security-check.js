const fs = require('fs');
const path = require('path');

// Patterns de sécurité à vérifier
const securityPatterns = {
  // Logs de debug non conditionnels
  debugLogs: {
    pattern: /console\.log\(/g,
    description: 'console.log non conditionnels trouvés',
    critical: true
  },
  
  // Logs de debug conditionnels (OK)
  conditionalLogs: {
    pattern: /if\s*\(\s*process\.env\.NODE_ENV\s*===\s*['"]development['"]\s*\)\s*\{\s*console\.log/g,
    description: 'console.log conditionnels (OK)',
    critical: false
  },
  
  // Variables d'environnement exposées
  exposedEnvVars: {
    pattern: /process\.env\.[A-Z_]+/g,
    description: 'Variables d\'environnement utilisées',
    critical: false
  },
  
  // Clés API hardcodées
  hardcodedKeys: {
    pattern: /(sk_|pk_|whsec_)[a-zA-Z0-9_]+/g,
    description: 'Clés API potentiellement hardcodées',
    critical: true
  },
  
  // URLs de développement
  devUrls: {
    pattern: /localhost|127\.0\.0\.1|\.local/g,
    description: 'URLs de développement trouvées',
    critical: true
  },
  
  // TODO/FIXME/HACK
  todos: {
    pattern: /(TODO|FIXME|HACK|XXX):/gi,
    description: 'TODOs/FIXMEs trouvés',
    critical: false
  }
};

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    Object.entries(securityPatterns).forEach(([key, pattern]) => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        // Filtrer les faux positifs pour les logs conditionnels
        if (key === 'debugLogs') {
          // Vérifier si le console.log est dans une condition NODE_ENV
          const lines = content.split('\n');
          matches.forEach(match => {
            const lineIndex = content.indexOf(match);
            const lineNumber = content.substring(0, lineIndex).split('\n').length;
            const line = lines[lineNumber - 1];
            
            // Vérifier si la ligne contient une condition NODE_ENV
            const hasCondition = line.includes('process.env.NODE_ENV') && line.includes('development');
            if (!hasCondition) {
              issues.push({
                type: key,
                description: pattern.description,
                line: lineNumber,
                content: line.trim(),
                critical: pattern.critical
              });
            }
          });
        } else if (key === 'conditionalLogs') {
          // Compter les logs conditionnels (pour information)
          issues.push({
            type: key,
            description: pattern.description,
            count: matches.length,
            critical: pattern.critical
          });
        } else {
          // Autres patterns
          issues.push({
            type: key,
            description: pattern.description,
            count: matches.length,
            critical: pattern.critical
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    return [{
      type: 'error',
      description: `Erreur lors de la lecture du fichier: ${error.message}`,
      critical: true
    }];
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
      const issues = analyzeFile(filePath);
      if (issues.length > 0) {
        results.push({
          file: filePath,
          issues
        });
      }
    }
  });
  
  return results;
}

// Dossiers à analyser
const directories = [
  'app',
  'components',
  'lib',
  'hooks'
];

console.log('🔒 Vérification de sécurité en cours...\n');

const allIssues = [];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Analyse du dossier: ${dir}`);
    const issues = walkDir(dir);
    allIssues.push(...issues);
  }
});

// Résumé des résultats
console.log('\n📊 RÉSULTATS DE LA VÉRIFICATION DE SÉCURITÉ\n');
console.log('=' .repeat(60));

if (allIssues.length === 0) {
  console.log('✅ Aucun problème de sécurité détecté !');
} else {
  let criticalCount = 0;
  let warningCount = 0;
  
  allIssues.forEach(fileResult => {
    console.log(`\n📄 ${fileResult.file}`);
    console.log('-'.repeat(40));
    
    fileResult.issues.forEach(issue => {
      if (issue.critical) {
        criticalCount++;
        console.log(`🚨 CRITIQUE: ${issue.description}`);
      } else {
        warningCount++;
        console.log(`⚠️  ATTENTION: ${issue.description}`);
      }
      
      if (issue.line) {
        console.log(`   Ligne ${issue.line}: ${issue.content}`);
      }
      if (issue.count) {
        console.log(`   Nombre: ${issue.count}`);
      }
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`📈 RÉSUMÉ:`);
  console.log(`   🚨 Problèmes critiques: ${criticalCount}`);
  console.log(`   ⚠️  Avertissements: ${warningCount}`);
  console.log(`   📄 Fichiers analysés: ${allIssues.length}`);
  
  if (criticalCount > 0) {
    console.log('\n❌ ATTENTION: Des problèmes critiques ont été détectés !');
    console.log('   L\'application ne doit PAS être mise en production.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('\n⚠️  Des avertissements ont été détectés. Vérifiez-les avant la production.');
  } else {
    console.log('\n✅ Tous les problèmes ont été résolus !');
  }
}

console.log('\n🎉 Vérification de sécurité terminée !');

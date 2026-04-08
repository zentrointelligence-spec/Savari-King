/**
 * Script pour exécuter les tests des filtres de ToursPage.jsx
 * Ce script exécute d'abord l'insertion des données de test, puis les tests des filtres
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers
const insertDataPath = path.resolve('..', 'backend', 'src', 'data', 'insertTestData.js');
const testsPath = path.resolve(__dirname, 'ToursPageFiltersTest.js');
const resultsPath = path.resolve(__dirname, 'TestResults.md');

console.log('Chemins des fichiers:');
console.log(`- insertDataPath: ${insertDataPath}`);
console.log(`- testsPath: ${testsPath}`);
console.log(`- resultsPath: ${resultsPath}`);

// Fonction pour exécuter une commande
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Exécution de: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur d'exécution: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      
      console.log(`Stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Fonction pour sauvegarder les résultats dans un fichier Markdown
function saveResults(insertOutput, testOutput) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const content = `# Résultats des Tests des Filtres de ToursPage.jsx

Date d'exécution: ${new Date().toLocaleString()}

## 1. Insertion des Données de Test

\`\`\`
${insertOutput}
\`\`\`

## 2. Résultats des Tests des Filtres

\`\`\`
${testOutput}
\`\`\`

## 3. Résumé

### Tests Exécutés
- Test 1: Recherche textuelle
- Test 2: Filtre de prix
- Test 3: Filtre de notation
- Test 4: Filtre de durée
- Test 5: Tri par prix croissant
- Test 6: Tri par notation décroissante
- Test 7: Combinaison de filtres

### Problèmes Identifiés
- À compléter après analyse des résultats

### Recommandations
- À compléter après analyse des résultats
`;
  
  fs.writeFileSync(resultsPath, content);
  console.log(`Résultats sauvegardés dans: ${resultsPath}`);
}

// Fonction principale pour exécuter les tests
async function runAllTests() {
  try {
    console.log('Démarrage du processus de test...');
    
    // 1. Insérer les données de test
    console.log('\n=== Étape 1: Insertion des données de test ===');
    const insertOutput = await runCommand(`node "${insertDataPath}"`);
    
    // 2. Exécuter les tests des filtres
    console.log('\n=== Étape 2: Exécution des tests des filtres ===');
    const testOutput = await runCommand(`node --experimental-vm-modules "${testsPath}"`);
    
    // 3. Sauvegarder les résultats
    console.log('\n=== Étape 3: Sauvegarde des résultats ===');
    saveResults(insertOutput, testOutput);
    
    console.log('\nProcessus de test terminé avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution des tests:', error);
  }
}

// Exécuter tous les tests
runAllTests();
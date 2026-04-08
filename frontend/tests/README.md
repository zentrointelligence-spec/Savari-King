# Tests des Filtres de ToursPage.jsx

Ce dossier contient des scripts pour tester le fonctionnement des filtres de recherche implémentés dans le composant ToursPage.jsx.

## Structure des Fichiers

- `insertTestData.js` : Script pour insérer des données de test dans la base de données
- `ToursPageFiltersTest.js` : Script pour tester les différents filtres de recherche
- `runTests.js` : Script pour exécuter l'ensemble du processus de test
- `TestResults.md` : Fichier généré contenant les résultats des tests

## Prérequis

1. Base de données PostgreSQL configurée selon les paramètres du fichier .env
2. Backend et frontend en cours d'exécution
3. Node.js installé

## Comment Exécuter les Tests

### Option 1 : Exécution complète

Pour exécuter l'ensemble du processus de test (insertion des données + tests des filtres) :

```bash
node runTests.js
```

Cette commande va :
1. Insérer les données de test dans la base de données
2. Exécuter les tests des filtres
3. Générer un fichier de résultats `TestResults.md`

### Option 2 : Exécution individuelle

Pour insérer uniquement les données de test :

```bash
node ../../backend/src/data/insertTestData.js
```

Pour exécuter uniquement les tests des filtres :

```bash
node ToursPageFiltersTest.js
```

## Tests Implémentés

1. **Test de recherche textuelle** : Vérifie que la recherche par mot-clé fonctionne correctement
2. **Test de filtre de prix** : Vérifie que le filtrage par plage de prix fonctionne
3. **Test de filtre de notation** : Vérifie que le filtrage par notation minimale fonctionne
4. **Test de filtre de durée** : Vérifie que le filtrage par durée de séjour fonctionne
5. **Test de tri par prix** : Vérifie que le tri par prix croissant fonctionne
6. **Test de tri par notation** : Vérifie que le tri par notation décroissante fonctionne
7. **Test de combinaison de filtres** : Vérifie que la combinaison de plusieurs filtres fonctionne

## Interprétation des Résultats

Le fichier `TestResults.md` généré contient :

- Les logs d'insertion des données de test
- Les résultats détaillés de chaque test
- Un résumé des tests exécutés

Pour chaque test, vérifiez que :

1. Le nombre de résultats correspond à ce qui est attendu
2. Les tours retournés correspondent aux critères de filtrage
3. L'ordre des résultats est correct pour les tests de tri

## Données de Test

Les données de test insérées comprennent :

- 4 catégories de tours (Beach Tours, Cultural Tours, Wildlife Tours, Hill Station Tours)
- 8 tours avec différentes caractéristiques :
  - Prix variant de 999 à 8500
  - Notations variant de 4.2 à 4.9
  - Durées variant de 3 à 7 jours
  - Différentes caractéristiques (featured, bestseller, trending)

Ces données sont conçues pour tester efficacement tous les filtres disponibles dans l'interface utilisateur.

## Dépannage

Si les tests échouent, vérifiez :

1. Que le backend est en cours d'exécution sur le port correct
2. Que la base de données est accessible avec les identifiants fournis
3. Que les tables nécessaires existent dans la base de données
4. Que les API endpoints sont correctement implémentés

## Extension des Tests

Pour ajouter de nouveaux tests :

1. Modifiez `ToursPageFiltersTest.js` pour ajouter de nouveaux cas de test
2. Ajoutez de nouvelles données de test dans `insertTestData.js` si nécessaire
3. Mettez à jour le résumé dans `runTests.js` pour refléter les nouveaux tests
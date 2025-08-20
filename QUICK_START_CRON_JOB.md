# 🚀 Démarrage Rapide - Test du Cron Job en 5 Minutes

## ⚡ Test Express

### 1. **Vérification Rapide** (1 min)
```bash
npm run test:cron
```
✅ Vérifie la connexion, crée un tweet de test et le nettoie

### 2. **Création des Tweets de Test** (1 min)
```bash
npm run create:test-tweets
```
✅ Crée 3 tweets planifiés dans 1, 2 et 5 minutes

### 3. **Lancement du Planificateur** (2 min)
```bash
npm run scheduler:watch
```
✅ Surveille et publie automatiquement les tweets

### 4. **Vérification** (1 min)
- Vérifiez les logs du planificateur
- Consultez l'interface web : http://localhost:3001/schedule-tweet
- Vérifiez la base de données

## 🎯 Résultat Attendu

Après 5 minutes, vous devriez voir :
- ✅ 3 tweets publiés automatiquement
- ✅ Statuts mis à jour en base
- ✅ Logs détaillés du processus

## 🧹 Nettoyage

```bash
npm run cleanup:test-tweets
```
🗑️ Supprime tous les tweets de test

---

**💡 Pro Tip** : Gardez le planificateur en mode surveillance pour voir la publication en temps réel !

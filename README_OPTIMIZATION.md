# 🚀 Fonctionnalité d'Optimisation des Transcriptions

## ✨ Nouveau : Bouton "Optimiser" avec Google Gemini 2.5 Flash

Nous avons ajouté un bouton **"Optimiser"** à côté du bouton "Régénérer" qui utilise l'IA Google Gemini pour améliorer automatiquement la qualité de vos transcriptions.

## 🎯 Ce que fait l'optimisation

- **Supprime les mots de remplissage** : "hum", "euh", "en fait", "tu vois"
- **Corrige les attributions** des locuteurs
- **Combine les paragraphes** d'un même speaker
- **Améliore la lisibilité** tout en gardant l'essentiel
- **Maintient le formatage** des timestamps

## 🛠️ Configuration requise

### 1. Installer les dépendances
```bash
npm install @google/genai mime
```

### 2. Obtenir une clé API Google Gemini
1. Allez sur [Google AI Studio](https://aistudio.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Générez une clé API pour Gemini
4. Copiez la clé

### 3. Configurer la variable d'environnement
Créez ou modifiez le fichier `.env.local` :
```bash
# Ajouter cette ligne
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

## 🎮 Comment utiliser

### Dans l'interface
1. **Accédez à un épisode** avec transcription existante
2. **Cliquez sur "Optimiser"** (icône ✨) dans la section transcription
3. **Attendez le traitement** (indicateur de chargement)
4. **Consultez le résultat** dans la nouvelle section "Transcription optimisée"

### Exemple visuel
```
[Avant] Transcription brute avec mots de remplissage
[Après] Transcription optimisée et fluide
```

## 🔧 Test de la fonctionnalité

### Test rapide
```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester l'API
node test-optimization.js
```

### Test manuel
1. Ouvrez un épisode avec transcription
2. Cliquez sur "Optimiser"
3. Vérifiez que la section optimisée apparaît

## 📊 Résultats attendus

### Exemple de transformation
**Avant :**
```
[00:01:08] Dimitri : Uhm, euh, ok, je pensais que, tu vois
[00:01:18] Dimitri : les températures ont diminuées, hum, par rapport aux, aux derniers jours
```

**Après :**
```
[00:01:08] Dimitri
les températures ont diminuées par rapport aux derniers jours
```

## ⚠️ Dépannage

### Erreur "Clé API Gemini non configurée"
- Vérifiez que `GEMINI_API_KEY` est dans `.env.local`
- Redémarrez le serveur après modification

### Erreur "Erreur lors de l'optimisation"
- Vérifiez votre connexion internet
- Contrôlez la validité de votre clé API
- Consultez les logs de la console

### Le bouton n'apparaît pas
- Assurez-vous qu'une transcription existe
- Vérifiez que le composant compile correctement

## 🔒 Sécurité et limitations

- **Clé API** : Stockée côté serveur uniquement
- **Limites** : Respecte les quotas Google Gemini
- **Données** : Aucune donnée n'est stockée par Google
- **Taille** : Limite selon votre plan Gemini

## 📈 Améliorations futures

- [ ] Sauvegarde des transcriptions optimisées
- [ ] Historique des optimisations
- [ ] Personnalisation des règles d'optimisation
- [ ] Support de plusieurs langues
- [ ] Optimisation par lots

## 🤝 Support

Pour toute question :
1. Vérifiez cette documentation
2. Consultez les logs de la console
3. Testez avec un texte simple
4. Vérifiez la configuration de votre clé API

---

**Note** : Cette fonctionnalité utilise l'API Google Gemini 2.5 Flash. Assurez-vous de respecter les conditions d'utilisation de Google.

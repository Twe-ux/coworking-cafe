# Améliorations suggérées pour le PDF de contrat

## 🎯 Observations du PDF actuel

### ✅ Points positifs
- Structure claire et professionnelle
- Tableaux bien formatés
- Pagination correcte sur 7 pages
- Toutes les informations présentes

### 📝 Améliorations suggérées

#### 1. **Espacement et lisibilité**
- **Problème** : Certaines sections sont trop serrées
- **Solution** :
  ```tsx
  // Dans styles.ts
  section: {
    marginBottom: 25,  // Réduire légèrement (au lieu de 30)
  }

  text: {
    marginBottom: 8,   // Espacement entre paragraphes
  }
  ```

#### 2. **Taille des tableaux**
- **Problème** : Police très petite (9pt) dans les tableaux
- **Solution** :
  ```tsx
  tableCell: {
    fontSize: 10,      // Augmenter à 10pt (au lieu de 9)
    padding: 10,       // Plus d'espace (au lieu de 8)
  }
  ```

#### 3. **Titres d'articles**
- **Problème** : Titres d'articles peu visibles
- **Solution** :
  ```tsx
  articleTitle: {
    fontSize: 12,      // Plus gros (au lieu de 11)
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,     // Ajouter marge du haut
  }
  ```

#### 4. **En-tête et titre principal**
- **Amélioration** : Rendre le titre plus visible
  ```tsx
  title: {
    fontSize: 14,      // Plus gros (au lieu de 13)
    fontWeight: 'bold',
    marginBottom: 10,
  }
  ```

#### 5. **Signatures**
- **Amélioration** : Plus d'espace pour signer
  ```tsx
  signatureLine: {
    height: 60,        // Plus d'espace (au lieu de 40)
    marginBottom: 15,
  }
  ```

## 🚀 Application rapide

Pour appliquer toutes ces améliorations d'un coup :

1. Ouvrir `/src/lib/pdf/templates/contract/styles.ts`
2. Remplacer les valeurs comme indiqué ci-dessus
3. La preview PDFViewer se met à jour automatiquement
4. Tester et ajuster selon vos préférences

## 📊 Modifications avancées

### Ajouter un logo d'entreprise
```tsx
// Dans ContractDocument.tsx
import { Image } from '@react-pdf/renderer'

<View style={styles.header}>
  <Image
    src="/logo-ily-sarl.png"
    style={{ width: 100, height: 50 }}
  />
</View>
```

### Ajouter des numéros de page
```tsx
// Dans ContractDocument.tsx
<Text
  style={styles.pageNumber}
  render={({ pageNumber, totalPages }) => (
    `Page ${pageNumber} / ${totalPages}`
  )}
  fixed
/>
```

### Colorer certaines sections
```tsx
articleTitle: {
  color: '#1e40af',  // Bleu pour les titres
  borderBottom: '2px solid #1e40af',
}
```

## 🎨 Conseils de mise en forme

1. **Cohérence** : Gardez les mêmes espacements partout
2. **Lisibilité** : Police minimum 10pt pour le corps de texte
3. **Hiérarchie visuelle** : Titres > Sous-titres > Texte
4. **Tableaux** : Utilisez des couleurs subtiles pour les en-têtes
5. **Marges** : Au moins 20mm sur tous les côtés

## 🧪 Workflow de test

1. Modifier `styles.ts`
2. Basculer sur "Aperçu PDF" dans le modal
3. Vérifier le rendu
4. Ajuster
5. Télécharger pour vérifier le PDF final

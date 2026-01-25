# Refonte PDF Contrat - Version Moderne 🎨

## 🎯 Objectif

Créer un contrat PDF moderne et professionnel tout en gardant le contenu textuel identique.

## ✨ Améliorations apportées

### 1. **Palette de couleurs professionnelle**

```
Primary:    #1e40af (Bleu professionnel) - Titres, en-têtes
Secondary:  #64748b (Gris ardoise) - Textes secondaires
Accent:     #3b82f6 (Bleu clair) - Puces, accents
Background: #f8fafc (Gris très clair) - Fonds
Border:     #e2e8f0 (Gris bordure) - Bordures subtiles
```

### 2. **Typographie améliorée**

| Élément | Avant | Après | Amélioration |
|---------|-------|-------|--------------|
| **Titre principal** | 13pt, noir | 15pt, bleu (#1e40af), bold | +15% taille, couleur |
| **Titres d'article** | 11pt, souligné | 11.5pt, bleu, bordure bas | Moderne, coloré |
| **Texte normal** | 11pt | 10.5pt, justifié | Lisibilité |
| **Tableaux** | 9pt | 10pt | +11% lisibilité |
| **Labels "Ci-après"** | Italique noir | Style dédié, gris | Distinction claire |

### 3. **Tableaux modernes**

**Avant** :
- Bordures noires épaisses (1pt)
- Pas de bordure globale
- Fond gris foncé (#e9ecef)

**Après** :
- ✅ Bordures grises subtiles (0.75pt, #e2e8f0)
- ✅ Bordure globale avec coins arrondis (4pt)
- ✅ Fond bleu très clair (#f1f5f9)
- ✅ En-têtes en bleu (#1e40af)
- ✅ Plus d'espace (padding: 10 au lieu de 8)

### 4. **Espacements harmonieux**

| Zone | Avant | Après |
|------|-------|-------|
| Marges page | 20/25pt | 35/40pt |
| Entre sections | 30pt | 22pt |
| Entre paragraphes | 10pt | 9pt |
| Titres articles | 12pt | 10pt + bordure |
| Zone signature | 40pt | 60pt |

### 5. **Hiérarchie visuelle**

**Niveaux de hiérarchie clairement définis** :

```
1. Titre principal (15pt, bleu, bold, centré)
   └─ Sous-titre (10pt, italique, gris, centré)

2. Titre de section (12pt, noir foncé, bold)
   └─ "Ci-après..." (10pt, italique, gris)

3. Titre d'article (11.5pt, bleu, bold, bordure)
   └─ Texte article (10.5pt, noir, justifié)
      └─ Texte en gras (Helvetica-Bold, noir foncé)
```

## 📊 Comparaison visuelle

### Tableaux

**Avant** :
```
┏━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓  ← Bordures noires épaisses
┃ Label (gras)┃ Valeur      ┃  ← Fond gris foncé
┣━━━━━━━━━━━━━╋━━━━━━━━━━━━━┫
┃ Nom         ┃ GUENEDAL    ┃  ← Texte 9pt
┗━━━━━━━━━━━━━┻━━━━━━━━━━━━━┛
```

**Après** :
```
╔═══════════════╦═══════════════╗  ← Bordure globale arrondie
║ Label (bleu)  ║ Valeur        ║  ← Fond bleu clair
╟───────────────╫───────────────╢  ← Bordures grises fines
║ Nom           ║ GUENEDAL      ║  ← Texte 10pt
╚═══════════════╩═══════════════╝
```

### Titres d'articles

**Avant** :
```
Article 1 - Engagement et période d'essai
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾  ← Souligné noir
```

**Après** :
```
Article 1 - Engagement et période d'essai   ← Bleu (#1e40af)
_____________________________________________  ← Bordure grise subtile
```

## 🎨 Nouveaux styles disponibles

### Styles ajoutés

1. **`labelText`** : Pour "Ci-après l'Employeur/le Salarié"
   - Italique, gris, distinct du texte normal

2. **`infoBox`** : Pour info importantes (non utilisé encore)
   ```tsx
   <View style={styles.infoBox}>
     <Text style={styles.infoBoxText}>
       Information importante à mettre en évidence
     </Text>
   </View>
   ```

3. **`pageNumber`** : Pour numéros de page (optionnel)
   ```tsx
   <Text
     style={styles.pageNumber}
     render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
     fixed
   />
   ```

## 📝 Textes conservés à l'identique

✅ **Tous les textes légaux restent identiques** :
- Articles 1-10
- Informations entreprise
- Informations employé
- Tableaux de disponibilités
- Signatures

**Seule la présentation visuelle a changé.**

## 🧪 Test et validation

### Pour tester

1. Ouvrir http://localhost:3001/admin/hr/employees
2. Cliquer "Générer contrat" pour un employé
3. Basculer sur "Aperçu PDF"
4. Vérifier :
   - ✅ Titres en bleu
   - ✅ Tableaux avec bordures fines
   - ✅ Espacement harmonieux
   - ✅ Texte justifié
   - ✅ "Ci-après..." en gris italique

### Comparaison

Télécharger le PDF et comparer avec l'ancien :
- Même contenu textuel
- Meilleure lisibilité
- Aspect plus professionnel
- Hiérarchie plus claire

## 🔧 Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `styles.ts` | Refonte complète avec palette moderne |
| `PDFTable.tsx` | Ajout bordure globale + coins arrondis |
| `ContractDocument.tsx` | Utilisation du style `labelText` |

## 📈 Prochaines améliorations possibles

1. **Logo entreprise** : Ajouter en haut de page 1
2. **Numéros de page** : Ajouter en bas de chaque page
3. **En-tête/pied de page** : Info entreprise en footer
4. **Police custom** : Utiliser Roboto ou Inter
5. **Couleurs personnalisées** : Adapter aux couleurs de la marque

## 🎯 Résultat

Un contrat PDF :
- ✅ **Moderne** : Design 2024
- ✅ **Professionnel** : Couleurs corporate
- ✅ **Lisible** : Hiérarchie claire
- ✅ **Conforme** : Textes légaux identiques
- ✅ **Harmonieux** : Espacement cohérent

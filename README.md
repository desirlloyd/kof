# Kòf — « Kòf ou, kle ou. »

> Sérieux sur la sécurité, jamais sur le ton.

**Kòf** (« coffre » en créole haïtien) est un gestionnaire de mots de passe **local-first** moderne et sécurisé, chiffré directement sur votre appareil via la **Web Crypto API**.

Inspiré de l'esthétique énergique et colorée des tap-taps et de l'art naïf haïtien (« Tap-tap noir »), Kòf allie protection cryptographique et interface soignée dotée d'une vraie personnalité grâce à son gardien **Ti Kòf**.

---

## Fonctionnalités Clés

- **Chiffrement Authentifié de bout en bout** : AES-256-GCM avec clé dérivée par PBKDF2-SHA256 (≥ 600 000 itérations) et sel cryptographique unique.
- **Zéro serveur & Zéro fuite** : Toutes les données restent stockées sous forme chiffrée dans **IndexedDB** sur votre appareil. Le mot de passe maître n'est jamais stocké nulle part.
- **Mascotte réactive « Ti Kòf »** : 4 humeurs interactives en SVG animé (neutre, content, inquiet, endormi) qui réagit à la robustesse des mots de passe, aux tentatives et aux états du coffre.
- **Générateur cryptographique** : Modes Mot de passe robuste et Phrase de passe mémorable avec `crypto.getRandomValues`.
- **Presse-papiers sécurisé** : Copie avec compte à rebours visuel et effacement automatique après 20 secondes.
- **Bilan de santé du coffre** : Audit en direct des mots de passe faibles, réutilisés et anciens avec score sur 100.
- **Sauvegarde & Migration** : Export d'archive chiffrée `.kof` et import rapide depuis les fichiers CSV de vos anciens navigateurs ou gestionnaires.
- **Multilingue (i18n)** : Français (par défaut), Kreyòl Ayisyen et English.
- **Design System « Tap-tap noir »** : Thème sombre chaleureux aux accents Safran, Turquoise, Hibiscus et Lime, avec prise en charge du thème clair « Crème Solaire ».

---

## Démarrage Rapide

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### Installation & Lancement

```bash
# Cloner le projet
git clone <url-du-repo>
cd gestiondemotdepasse

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Exécuter les tests unitaires cryptographiques
npm test

# Compiler pour la production
npm run build
```

---

## Raccourcis Clavier
- **`Ctrl + Shift + L`** (ou `Cmd + Shift + L` sur Mac) : Verrouillage d'urgence instantané du coffre avec purge de la mémoire.

---

## Architecture

```
src/
├── core/
│   ├── crypto/           # PBKDF2, AES-GCM, entropie, Web Crypto
│   └── storage/          # idb (IndexedDB), persistance sécurisée
├── features/
│   ├── auth/             # Onboarding 3 étapes, déverrouillage, master password
│   ├── vault/            # CRUD secrets, filtres, recherche instantanée
│   ├── generator/        # Mots de passe & passphrases aléatoires
│   ├── audit/            # Analyse de santé et détection des faiblesses
│   └── settings/         # Thème, langue, auto-lock, export/import
├── components/
│   ├── ui/               # Button, Input, Badge, StrengthMeter (Tap-tap)
│   └── mascot/           # Ti Kòf en SVG interactif
├── i18n/                 # Traductions (FR, HT, EN)
└── styles/               # Tokens CSS, thèmes sombre et clair
```

---

## Sécurité & Modèle de Menace

Pour consulter les garanties cryptographiques détaillées et les limites du modèle local-first, lisez le fichier [`SECURITY.md`](./SECURITY.md).

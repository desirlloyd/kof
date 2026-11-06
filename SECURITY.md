# Modèle de Sécurité et Menaces — Kòf

« Kòf ou, kle ou. » Sérieux sur la sécurité, jamais sur le ton.

Ce document décrit en toute transparence l'architecture de sécurité de **Kòf**, les garanties apportées par son modèle local-first, ainsi que ses limites explicites.

---

## 1. Principes Fondamentaux

1. **Local-first & Zero-Knowledge** : Aucune donnée d'identification, aucun secret, aucun identifiant ni mot de passe maître n'est jamais transmis à un serveur distant. L'application s'exécute intégralement dans le bac à sable de votre navigateur.
2. **Aucun tracker ni télémétrie** : Pas de requêtes réseau tierces, pas de cookies publicitaires, pas d'analytics.
3. **Zéro stockage en clair** : Le mot de passe maître n'est jamais persisté (ni dans `localStorage`, ni dans `sessionStorage`, ni dans `IndexedDB`).
4. **Effacement mémoire au verrouillage** : Dès que le coffre est verrouillé (manuellement ou par inactivité), la clé cryptographique en RAM et les enregistrements déchiffrés sont purgés.

---

## 2. Primitives Cryptographiques (Web Crypto API standard)

- **Dérivation de clé (KDF)** :
  - Algorithme : `PBKDF2` (HMAC-SHA-256).
  - Itérations : **600 000 itérations** (conformité avec les recommandations OWASP).
  - Sel : 16 octets pseudo-aléatoires générés par `crypto.getRandomValues`.
- **Chiffrement symétrique authentifié** :
  - Algorithme : **AES-256-GCM** (Galois/Counter Mode).
  - IV (Initialization Vector) : 12 octets (96 bits) uniques par opération d'écriture, générés par `crypto.getRandomValues`.
  - Intégrité : Le tag d'authentification GCM (128 bits) garantit que toute corruption ou tentative de modification du ciphertext rend le déchiffrement impossible.
- **Générateur aléatoire** :
  - 100 % basé sur l'entropie du système d'exploitation via `crypto.getRandomValues`.
  - Jamais de recours à `Math.random()`.

---

## 3. Modèle de Menace

### Ce contre quoi Kòf vous protège :
- **Attaque sur le réseau (Man-in-the-Middle, fuite serveur)** : L'application n'émettant aucune donnée chiffrée ou en clair vers un serveur, une interception réseau ne peut rien dérober.
- **Vol physique ou extraction de la base IndexedDB** : Un attaquant ayant extrait les fichiers IndexedDB sur votre disque dur ne trouvera que des payloads AES-256-GCM chiffrés et un sel aléatoire. Sans le mot de passe maître, casser le coffre nécessite une attaque par force brute sur 600 000 itérations PBKDF2 par essai.
- **Altération furtive des données** : Toute modification d'un seul bit dans les fichiers sauvegardés provoque une erreur d'intégrité immédiate (rejet AES-GCM).
- **Fuite par le presse-papiers** : Les données copiées sont automatiquement purgées du presse-papiers au bout de 20 secondes.

### Ce contre quoi Kòf ne peut PAS vous protéger (Limites) :
- **Malware ou enregistreur de frappe (Keylogger) sur la machine hôte** : Si votre système d'exploitation est infecté par un logiciel espion observant vos saisies clavier ou lisant la mémoire vive du navigateur, le mot de passe maître peut être intercepté au moment de la frappe.
- **Extensions de navigateur malveillantes** : Des extensions disposant des permissions d'accès au DOM peuvent inspecter les champs de saisie ou manipuler le contexte d'exécution.
- **Perte du mot de passe maître** : Par conception (zero-knowledge), il n'existe **aucun mécanisme de récupération, aucune porte dérobée, aucun bouton « mot de passe oublié »**. Si vous perdez votre mot de passe maître, vos données sont définitivement irrécupérables.
- **Audit formel externe** : Kòf utilise des algorithmes et APIs recommandés par les standards de l'industrie (NIST, OWASP, W3C Web Cryptography), mais le code n'a pas fait l'objet d'un audit de sécurité par un cabinet externe certifié.

---

## 4. Signalement de Vulnérabilité

Si vous découvrez une faiblesse ou une vulnérabilité potentielle, merci de la signaler directement en ouvrant une issue privée ou en contactant les mainteneurs du dépôt.

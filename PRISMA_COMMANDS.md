# Guide des Commandes Prisma

## Commandes de Base

### `npx prisma init`
Initialise Prisma dans votre projet.
- Crée le dossier `prisma/` avec un fichier `schema.prisma`
- Crée un fichier `.env` pour les variables d'environnement
- Configure la structure de base pour commencer

### `npx prisma generate`
Génère le Prisma Client basé sur votre schéma.
- Lit le fichier `schema.prisma`
- Génère le code TypeScript pour interagir avec la base de données
- À exécuter après chaque modification du schéma
- Crée les types TypeScript automatiquement

### `npx prisma db push`
Synchronise votre schéma Prisma avec la base de données.
- Applique les changements du schéma directement à la DB
- Idéal pour le développement rapide
- Ne crée pas de fichiers de migration
- Attention : peut perdre des données en production

### `npx prisma db pull`
Génère un schéma Prisma depuis une base de données existante.
- Analyse la structure de votre DB
- Crée/met à jour le fichier `schema.prisma`
- Utile pour travailler avec une DB existante
- Permet de faire de l'ingénierie inverse

## Commandes de Migration

### `npx prisma migrate dev`
Crée et applique une migration en développement.
- Crée un fichier de migration SQL
- Applique la migration à la DB
- Régénère le Prisma Client automatiquement
- Demande un nom pour la migration

Exemple :
```bash
npx prisma migrate dev --name add_user_table
```

### `npx prisma migrate deploy`
Applique les migrations en production.
- Exécute toutes les migrations en attente
- Ne crée pas de nouvelles migrations
- Utilisé dans les pipelines CI/CD
- Sécurisé pour la production

### `npx prisma migrate reset`
Réinitialise complètement la base de données.
- Supprime toutes les données
- Réapplique toutes les migrations
- Exécute les seeds si configurés
- ⚠️ Attention : perte de toutes les données !

### `npx prisma migrate status`
Affiche l'état des migrations.
- Liste les migrations appliquées
- Montre les migrations en attente
- Utile pour vérifier la synchronisation

## Commandes Studio

### `npx prisma studio`
Ouvre l'interface graphique Prisma Studio.
- Interface web pour visualiser/éditer les données
- Accessible sur `http://localhost:5555`
- Permet de gérer les données sans SQL
- Très pratique pour le développement

## Commandes de Validation

### `npx prisma validate`
Valide votre schéma Prisma.
- Vérifie la syntaxe du `schema.prisma`
- Détecte les erreurs de configuration
- Utile avant de commit

### `npx prisma format`
Formate votre fichier schema.prisma.
- Applique un formatage cohérent
- Organise les modèles proprement
- Exécuté automatiquement par certains éditeurs

## Commandes de Seed

### `npx prisma db seed`
Exécute le script de seed pour peupler la DB.
- Remplit la DB avec des données de test
- Configure dans `package.json` :
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

## Workflow Typique

### Développement Initial
```bash
# 1. Initialiser Prisma
npx prisma init

# 2. Configurer DATABASE_URL dans .env

# 3. Définir votre schéma dans schema.prisma

# 4. Créer la première migration
npx prisma migrate dev --name init

# 5. Ouvrir Studio pour vérifier
npx prisma studio
```

### Modifications du Schéma
```bash
# 1. Modifier schema.prisma

# 2. Créer et appliquer la migration
npx prisma migrate dev --name description_du_changement

# 3. Le client est régénéré automatiquement
```

### Déploiement en Production
```bash
# 1. Appliquer les migrations
npx prisma migrate deploy

# 2. Générer le client (si nécessaire)
npx prisma generate
```

## Options Utiles

### `--schema`
Spécifie un chemin personnalisé pour le schéma.
```bash
npx prisma generate --schema=./custom/path/schema.prisma
```

### `--skip-generate`
Saute la génération du client (pour migrate dev).
```bash
npx prisma migrate dev --skip-generate
```

### `--create-only`
Crée une migration sans l'appliquer.
```bash
npx prisma migrate dev --create-only
```

## Commandes de Debug

### `npx prisma debug`
Affiche des informations de débogage.
- Version de Prisma
- Configuration système
- Utile pour résoudre les problèmes

## Variables d'Environnement Importantes

```env
# URL de connexion à la base de données
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Pour désactiver les télémétries
PRISMA_TELEMETRY_DISABLED=1
```

## Bonnes Pratiques

1. **Toujours utiliser des migrations en production** (pas `db push`)
2. **Nommer les migrations de façon descriptive**
3. **Versionner les fichiers de migration** dans Git
4. **Tester les migrations** avant le déploiement
5. **Faire des backups** avant `migrate reset`
6. **Utiliser `prisma studio`** pour explorer les données
7. **Exécuter `prisma generate`** après `npm install` dans CI/CD

## Résolution de Problèmes

### Le client n'est pas à jour
```bash
npx prisma generate
```

### La DB n'est pas synchronisée
```bash
npx prisma migrate dev
```

### Erreur de connexion
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier que la DB est accessible
- Tester la connexion manuellement

### Migrations en conflit
```bash
# Réinitialiser (développement uniquement)
npx prisma migrate reset

# Ou résoudre manuellement les conflits
npx prisma migrate resolve --applied "migration_name"
```

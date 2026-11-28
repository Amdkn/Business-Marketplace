# Cadrage — Fermer Day 1 (RECOVERY)

> Document de cadrage, préparé le 2026-11-27.
> Tête vérifiée : `9addd37f091a88314d55feb7730e3cae214231c5` (PR n° 1, brouillon). Corrections de l'audit contradictoire Gemini (27 nov.) appliquées ; décision mailer tranchée par le Capitaine le 2026-11-27 19:59 (option 1, autoconfirm temporaire).
> Document de référence : `docs/MANUEL-EXPLOITATION.md` (§ 5 pour les critères
> de sortie complets, § 7 pour les blocages).

## 1. Objectif

Fermer Day 1, c'est prouver que le socle tient debout : un inconnu peut
s'inscrire, obtenir son organisation et son workspace, y travailler, et rester
isolé des autres locataires — sans intervention manuelle, sans l'auteur du
code.

Ce n'est pas écrire du code. Le code de la chaîne existe déjà à la tête
`9addd37`. C'est **prouver, dans le navigateur, sur l'aperçu de référence**,
que la chaîne fonctionne de bout en bout.

**Bloquant n° 1 (nouveau, audit Gemini 27 nov., vérifié au dépôt) :**
l'inscription échoue avant `create_tenant` — `mailer_autoconfirm=false`
sans SMTP (`docs/AUTH_CONFIGURATION_2026-11-26.md`), et
`AuthProvider.signUp()` appelle `signInWithPassword` immédiatement après
`signUp`. Un inconnu qui s'inscrit reçoit « Email not confirmed » et
`create_tenant` n'est jamais appelé. **Décision TRANCHÉE le 2026-11-27
19:59 (Capitaine) : option 1 — `mailer_autoconfirm=true` temporaire,
dérogation Day 1 (environnement fermé / aperçu uniquement).** Préalable
aux preuves : basculer le réglage dans le tableau de bord du projet
`swegnrvaxxgfrnshdpxx` (1 réglage, 0 commit), sans refactoriser
`AuthProvider.tsx` ni risquer le quota Vercel. **Garde-fou :** les
critères « confirmation email » et « mot de passe oublié » sortent du
gate Day 1 et basculent en ticket bloquant obligatoire (`not_started`)
avant ouverture publique / Day 3 — branchement SMTP perso + repassage
à `mailer_autoconfirm=false` + découplage de `create_tenant`
post-confirmation.

## 2. Découverte qui change le cadrage (vérifiée au dépôt)

La session S6 décrivait le bloquant Day 1 ainsi : `AuthProvider` appellerait
une fonction `sign-up-organization` qui n'existe pas, et `create_organization`
ne créerait pas le premier workspace. **Cette description est dépassée par le
code livré ensuite dans la même journée** (commits `0c4f966` « onboarding
backend atomique » et `c05f278` « câblage onboarding App »), vérifié à la tête
`9addd37` :

- `src/components/saas/auth/AuthProvider.tsx` appelle `marketplace-api`,
  action `create_tenant` (aucune fonction `sign-up-organization` n'existe
  dans `supabase/functions`).
- `supabase/functions/marketplace-api/index.ts` implémente `create_tenant`
  (fonction `createTenant`) : une seule transaction serveur crée
  l'organisation, le membership, le rôle `B1_CEO`, le workspace
  (`Main Workspace`) et le membership `OWNER`.
- `create_organization` (autre action) crée l'organisation, le membership et
  le rôle, **mais pas de workspace** : c'est la voie opérateur, pas la voie
  d'inscription.

**Conséquence, tranchée ici : on valide la voie existante `create_tenant`.
On ne crée pas `sign-up-organization`. On ne détourne pas
`create_organization`.** Cette décision contredit l'hypothèse de la directive
de cadrage initiale, qui supposait le choix encore ouvert : le choix n'est
plus ouvert, le code l'a déjà tranché, et c'est la preuve bout en bout qui
manque — pas le code.

## 3. Verrou 1 — Choix tranché et atomicité SQL

**Choix retenu, unique : `create_tenant` (voie existante).** Aucune autre
option n'est autorisée.

Atomicité, vérifiée dans le code (`marketplace-api/index.ts`) :

- `createTenant` tourne dans `withServiceRole`, qui ouvre une transaction
  (`db.begin`) : toutes les écritures — organisation, membership, rôle,
  workspace, membership OWNER — sont dans **une seule transaction**.
  Un échec à la création du workspace annule la création de l'organisation :
  **aucun locataire orphelin possible**.
- Idempotence : verrou consultatif par utilisateur
  (`pg_advisory_xact_lock`), clé d'organisation déterministe
  (`USR_` + identifiant utilisateur), `ON CONFLICT DO NOTHING` puis relecture
  avec vérification du propriétaire et du contenu. Un même appel répété
  retourne le même locataire, il n'en crée pas un second.
- Si la preuve échoue, on corrige `create_tenant` (ou `AuthProvider`).
  Une nouvelle fonction ne se justifie que si la preuve montre que
  `create_tenant` ne peut pas porter la chaîne — et cette preuve n'existe
  pas aujourd'hui.

## 4. Verrou 2 — Chaîne complète vérifiable

```
Inscription Auth (user)
  → Organization
    → Membership (B1_CEO)
      → Workspace
        → Workspace Owner
          → Contexte résolu (RPC get_current_workspace_context)
```

Chaque maillon doit être vérifié dans le navigateur, sur l'aperçu de
référence, sans intervention manuelle en base :

- L'utilisateur s'inscrit depuis la page d'inscription et arrive dans un
  workspace vide qui porte son nom d'organisation.
- Après inscription, le contexte (`organization_id`, `workspace_id`,
  `role_code`) est résolu via la RPC
  `identity.get_current_workspace_context()` ; un rafraîchissement de
  session le conserve. Le JWT ne porte pas `org_id` / `role` : le hook JWT
  est un vestige legacy, voir § 5.
- Le contexte est résolu dès la première requête par la RPC
  `identity.get_current_workspace_context()` (résolution serveur
  déterministe). Une résolution qui exige une seconde connexion ou une
  intervention manuelle ne ferme pas Day 1.

Ce qui n'est **pas** prouvé à ce jour (matrice `docs/evidence/`,
D1.03 / D1.04 / D1.09) : l'inscription dans le navigateur, le cycle de session, le deuxième locataire, le refus croisé entre
locataires.

## 5. Verrou 3 — Frontière `identity` propre

Fait vérifié au dépôt (migration
`20261124000100_identity_tenant_foundation.sql`) : le rôle `authenticated`
n'a aucun droit **par défaut** sur les tables `identity` — la migration
commence par `REVOKE ALL ... FROM PUBLIC, anon, authenticated`
(lignes 160–161). **Mais la même migration accorde ensuite** `USAGE` sur le
schéma `identity` et `SELECT` (sous RLS, sur `auth.uid()`) sur
`identity.organizations`, `identity.organization_memberships`,
`identity.delegations` et `identity.role_bindings` (lignes 162–164) ; la
migration `20261124024550` ajoute `SELECT, INSERT, UPDATE` sur
`identity.profiles` pour `authenticated`. Les politiques RLS de ces tables
filtrent sur `auth.uid()` (ex. `organizations_read_active_member`).
**Seuls `identity.agent_principals`, `identity.agent_delegations` et le
schéma `enterprise` sont fermés au navigateur — et c'est la bonne
frontière.** (Correction de l'audit Gemini 27 nov., confirmée au dépôt :
notre première lecture s'arrêtait aux `REVOKE` et manquait les `GRANT` qui
suivent dans la même migration.)

Fait vérifié au dépôt : le hook `custom_access_token_hook` **n'existe pas
dans les 69 migrations appliquées** — son SQL n'est présent que dans
l'archive legacy
(`supabase/archive/legacy-unapplied-migrations/20260811000004_jwt_hook.sql`).
**Il est un vestige legacy, pas un bloquant : 0 politique RLS dans
`supabase/migrations` ne lit `auth.jwt()`** (vérifié : aucune occurrence).
Les politiques de `workspace_data` et du bucket privé
`marketplace-documents` filtrent sur `auth.uid()` via
`identity.is_active_workspace_member` /
`identity.can_manage_workspace` (`SECURITY DEFINER`, migration
`20261126092033`), et `AuthProvider` résout le contexte via la RPC
`identity.get_current_workspace_context()` (`SECURITY DEFINER`, exécutable
par `authenticated`, migration `20261126093031`). Le commentaire d'en-tête
d'`AuthProvider.tsx` (L3–4) est obsolète — à nettoyer en phase
implémentation, sans modifier le code ici.

**Interdiction formelle : accorder un droit de lecture publique sur
`identity`, ou désactiver une politique RLS pour faire passer la preuve.**

## 6. Verrou 4 — Test d'acceptation 2-tenants (preuve de sortie unique)

Day 1 est fermé quand **toutes** ces preuves existent, exécutées sur
l'aperçu de référence à la tête en cours, avec leur date et leur auteur
inscrits dans la matrice `docs/evidence/day1-closure-matrix.md`.
Le test 2-tenants est la **preuve de sortie unique** : sans lui, Day 1
reste OUVERT, quels que soient les tests unitaires ou l'aperçu.

### 6.1. Création de zéro (flux réel uniquement)

- **Tenant A** : un nouvel utilisateur s'inscrit depuis la page
  d'inscription, sans aide, et arrive dans un workspace vide qui porte son
  nom d'organisation.
- **Tenant B** : un second utilisateur, sans lien avec le premier, s'inscrit
  et obtient son propre workspace.
- **Zéro `INSERT` manuel en base** pour créer A ou B : les deux locataires
  naissent du flux réel d'inscription. Toute donnée créée à la main invalide
  la preuve.

### 6.2. Isolation positive

- Le contexte résolu pour A (via la RPC) désigne uniquement
  l'organisation et le workspace de A ; idem pour B.
- Chacun ne voit que ses propres données (CRUD, listes, stockage).

### 6.3. Tests négatifs obligatoires

Avec le JWT de A, tenter sur les données de B — **retour attendu strict :
`0` ligne, ou erreur `403` / `404`** (tout autre résultat = échec) :

- `SELECT` sur une table métier appartenant à B ;
- `UPDATE` sur une table métier appartenant à B ;
- `DELETE` sur une table métier appartenant à B ;
- lecture d'un fichier Storage appartenant à B.

Mêmes quatre tentatives avec le JWT de B sur les données de A.

### 6.4. Idempotence

Relancer l'appel d'onboarding (`create_tenant`) pour un utilisateur déjà
initialisé : **il ne crée pas de deuxième workspace fantôme**.
Le même appel retourne le même locataire (vérifié dans le code : clé
déterministe + `ON CONFLICT DO NOTHING` + relecture ; à confirmer par la
preuve dans le navigateur).

### 6.5. Autres critères de sortie

- **CRUD authentifié** : créer, lire, modifier, supprimer un enregistrement
  (client, mission, document) dans le workspace, puis vérifier la
  persistance après reconnexion.
- **Stockage privé** : un fichier déposé dans le workspace n'est lisible
  que par son locataire.
- **Session** : déconnexion puis reconnexion, le contexte est retrouvé ;
  mot de passe oublié : hors gate Day 1 — ticket bloquant obligatoire
  avant ouverture publique / Day 3 (voir § 8, R-01 / R-04).
- **Sauvegarde / restauration** : une sauvegarde est démontrée, ou la
  limite Free est acceptée par écrit comme limite de la franchise.
- **Test E-Myth** : un opérateur qui n'a pas écrit le code exécute les
  points 6.1 à 6.5 en suivant le manuel seul.

Tant qu'un seul de ces points manque, le gate Day 1 reste **OUVERT**.

> Tension à régler pendant l'exécution : la matrice demande de « ne pas créer
> un autre locataire pour la commodité des tests », alors que le critère 6.1
> exige un deuxième locataire. La résolution : le deuxième locataire est un
> locataire de test, créé uniquement pour l'acceptation, documenté comme tel,
> puis supprimé ou isolé après la preuve. Il ne doit pas polluer la liste
> des locataires réels.

## 7. Étapes

| N° | Étape | Livrable |
|---|---|---|
| 1 | Appliquer la décision tranchée du Capitaine (27 nov. 19:59) : basculer `mailer_autoconfirm=true` dans le tableau de bord du projet `swegnrvaxxgfrnshdpxx` (1 réglage, 0 commit, préalable aux preuves) et confirmer les prérequis cloud (§ 8, R-02 à R-04) : version déployée de `marketplace-api`, référence du projet Supabase, aperçu à la tête actuelle | Réglage appliqué + décision écrite + note datée dans la matrice |
| 2 | Vérifier que l'aperçu Vercel à la tête en cours est READY et que `bun run verify` passe | Lien de l'aperçu, commit vérifié |
| 3 | Exécuter le parcours d'inscription (critère 6.1, Tenant A) dans le navigateur, session authentifiée | Capture + date + auteur dans la matrice |
| 4 | Créer le Tenant B de test, vérifier l'isolation positive et les tests négatifs (critères 6.2, 6.3) | Preuves inscrites dans la matrice |
| 5 | Exécuter idempotence, CRUD, stockage privé, session (critères 6.4, 6.5) | Preuves inscrites dans la matrice |
| 6 | Démontrer sauvegarde / restauration ou acter la limite par écrit | Preuve ou décision écrite |
| 7 | Faire passer le test E-Myth par un opérateur extérieur au code | Compte rendu dans le manuel |
| 8 | Mettre à jour le manuel (`docs/MANUEL-EXPLOITATION.md`) : date, tête, gate Day 1 → FERMÉ, blocages résolus | Demande de fusion |

## 8. Risques

| N° | Risque | Effet si avéré | Parade |
|---|---|---|---|
| R-01 | **`mailer_autoconfirm=false` sans SMTP** (`docs/AUTH_CONFIGURATION_2026-11-26.md`) ; `AuthProvider.signUp()` appelle `signInWithPassword` immédiatement → « Email not confirmed » → `create_tenant` jamais appelé | Aucune inscription possible, aucune preuve Day 1 | **Décision TRANCHÉE le 2026-11-27 19:59 (Capitaine) : option (a) — `mailer_autoconfirm=true` temporaire, dérogation Day 1 (environnement fermé / aperçu uniquement).** Préalable aux preuves : basculer le réglage dans le tableau de bord `swegnrvaxxgfrnshdpxx` (1 réglage, 0 commit). **Garde-fou :** confirmation email + mot de passe oublié = ticket bloquant obligatoire (`not_started`) avant ouverture publique / Day 3 — SMTP perso + repassage à `mailer_autoconfirm=false` + découplage de `create_tenant` post-confirmation |
| R-02 | Version déployée de `marketplace-api` : v30 (matrice) contre v31 (session S6) | La preuve testerait une ancienne version | Confirmer la version déployée, redéployer à la tête en cours si besoin |
| R-03 | Projet Supabase : **CLOS** — `swegnrvaxxgfrnshdpxx` (« Aspace MarketPlace ») est l'unique projet vivant (audit Gemini 27 nov., base live) | — | Corriger `linked-project.json` côté poste du Capitaine (`supabase link --project-ref swegnrvaxxgfrnshdpxx`) |
| R-04 | Réinitialisation de mot de passe : dépend de l'email, donc de la décision R-01 | Parcours non prouvable tant que R-01 n'est pas tranché | Hors gate Day 1 — ticket bloquant obligatoire (`not_started`) avant ouverture publique / Day 3 : SMTP perso + `mailer_autoconfirm=false` + découplage (voir R-01) |
| R-05 | Quota Vercel 24 h | Aperçu indisponible au moment de la preuve ; tests de régression OAuth déjà bloqués une fois (quota 402) | Planifier les preuves hors pic de quota ; sortir du Free si le blocage se répète |
| R-06 | Bug de parsing des scopes OAuth (callback v2, worker v8) | Connexion d'adaptateur en échec pendant les preuves | Le bug relève de Day 2 (adaptateurs) ; ne pas le laisser bloquer Day 1, sauf s'il touche l'inscription elle-même |
| R-07 | La tête avance pendant les preuves (25 commits entre `b7c2b29` et `8326c44`) | Preuves faites sur une tête dépassée | Figer la tête au début de l'étape 2 ; toute nouvelle livraison rouvre la vérification de l'aperçu |

## 9. Hors périmètre

- Day 2 (adaptateurs, OAuth Google, Drive) et Day 3 (vente, paiements, PSP,
  réplication d'entreprise).
- Runtime agents.
- Blueprints (20 familles / 73 fournisseurs) : ils restent des plans.
- Écrans Wallet et prix : suspendus.
- Fermeture de la PR n° 63 (V5) : elle suit la vérification du transfert,
  elle ne fait pas partie de la fermeture de Day 1.
- Toute nouvelle fonction Edge : voir § 3, aucune n'est prévue.
- Toute nouvelle feature : interdite tant que Day 1 n'est pas fermé.

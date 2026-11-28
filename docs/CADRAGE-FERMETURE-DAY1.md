# Cadrage — Fermer Day 1 (RECOVERY)

> Document de cadrage, préparé le 2026-11-27.
> Tête vérifiée : `8326c4485fa4d67d2e9019fa7eff4f9853048e9b` (PR n° 1, brouillon).
> Document de référence : `docs/MANUEL-EXPLOITATION.md` (§ 5 pour les critères
> de sortie complets, § 9 pour les blocages).

## 1. Objectif

Fermer Day 1, c'est prouver que le socle tient debout : un inconnu peut
s'inscrire, obtenir son organisation et son workspace, y travailler, et rester
isolé des autres locataires — sans intervention manuelle, sans l'auteur du
code.

Ce n'est pas écrire du code. Le code de la chaîne existe déjà à la tête
`8326c44`. C'est **prouver, dans le navigateur, sur l'aperçu de référence**,
que la chaîne fonctionne de bout en bout.

## 2. La chaîne atomique à fermer

```
Inscription Auth
  → Organisation
    → Membership actif
      → Rôle B1_CEO
        → Workspace par défaut
          → Membership workspace OWNER
            → Contexte JWT (org_id, role)
```

État vérifié du code à la tête `8326c44` :

- `src/components/saas/auth/AuthProvider.tsx` appelle `marketplace-api`,
  action `create_tenant`.
- `supabase/functions/marketplace-api/index.ts` implémente `create_tenant` :
  une seule transaction serveur crée l'organisation, le membership, le rôle
  `B1_CEO`, le workspace (`Main Workspace`) et le membership `OWNER`.
  L'appel est idempotente (même appel répété = même locataire).
- `create_organization` (autre action) crée l'organisation, le membership et
  le rôle, **mais pas de workspace** : c'est la voie opérateur, pas la voie
  d'inscription.

Ce qui n'est **pas** prouvé à ce jour (matrice `docs/evidence/`,
D1.03 / D1.04 / D1.09) : l'inscription dans le navigateur, la confirmation
email, le cycle de session, le deuxième locataire, le refus croisé entre
locataires.

## 3. Les deux options, et la recommandation

### Option A — Créer une fonction `sign-up-organization`

Créer une 5e Edge Function dédiée à l'inscription, appelée par `AuthProvider`
à la place de `marketplace-api`.

- Contre : cette fonction n'existe pas dans le dépôt, et rien ne montre
  qu'elle soit nécessaire. La voie `create_tenant` existe déjà, elle est
  atomique et idempotente. Ajouter une fonction, c'est ajouter une surface à
  maintenir, à sécuriser et à tester, pour refaire ce qui existe.
- Pour : rien de vérifié. L'idée venait d'une lecture de la session S6,
  dépassée par le code livré ensuite dans la même journée
  (commits `0c4f966` « onboarding backend atomique » et `c05f278`
  « câblage onboarding App »).

**Recommandation : ne pas créer cette fonction.**

### Option B — Faire créer le premier workspace par `create_organization`

Modifier `create_organization` pour qu'elle crée aussi le workspace, et faire
de cette action la voie d'inscription.

- Contre : `create_organization` est la voie opérateur (création avec clé
  explicite, types `INTERNAL_VENTURE`, `SUPPLIER`, `CUSTOMER`, `PARTNER`).
  La détourner vers l'inscription publique mélangerait deux usages et deux
  niveaux de confiance. Et cela ne réglerait pas la preuve manquante :
  le workspace créé en base ne prouve pas l'inscription bout en bout.
- Pour : une seule action à maintenir au lieu de deux — mais au prix d'un
  mélange des rôles.

**Recommandation : ne pas modifier `create_organization` pour l'inscription.
La garder comme voie opérateur.**

### Recommandation retenue

**Ne rien créer, ne rien détourner. Valider la voie existante `create_tenant`
bout en bout, sur l'aperçu de référence, dans le navigateur.**

Si la preuve échoue, on corrige `create_tenant` (ou `AuthProvider`), on ne
crée pas une nouvelle fonction. Une nouvelle fonction ne se justifie que si la
preuve montre que `create_tenant` ne peut pas porter la chaîne — et cette
preuve n'existe pas aujourd'hui.

## 4. Critères de sortie vérifiables

Day 1 est fermé quand **toutes** ces preuves existent, exécutées sur
l'aperçu de référence à la tête en cours, avec leur date et leur auteur
inscrits dans la matrice `docs/evidence/day1-closure-matrix.md` :

1. **Inscription de zéro** : un nouvel utilisateur s'inscrit depuis la page
   d'inscription, sans aide, et arrive dans un workspace vide qui porte son
   nom d'organisation.
2. **Deuxième locataire** : un second utilisateur, sans lien avec le premier,
   s'inscrit et obtient son propre workspace. Les deux locataires sont
   isolés : chacun ne voit que ses propres données (CRUD, listes, stockage).
3. **Refus croisé** : une tentative d'accès du locataire A aux données du
   locataire B (URL directe, appel API avec le jeton de A) est refusée.
4. **Contexte JWT** : après inscription, le JWT porte `org_id` et `role`
   corrects ; un rafraîchissement de session les conserve. (Dépend du hook
   JWT, voir § 6, risque R-01.)
5. **CRUD authentifié** : créer, lire, modifier, supprimer un enregistrement
   (client, mission, document) dans le workspace, puis vérifier la
   persistance après reconnexion.
6. **Stockage privé** : un fichier déposé dans le workspace n'est lisible
   que par son locataire.
7. **Session** : déconnexion puis reconnexion, le contexte est retrouvé ;
   mot de passe oublié : parcours testé ou limite acceptée par écrit
   (voir § 6, risque R-04).
8. **Sauvegarde / restauration** : une sauvegarde est démontrée, ou la
   limite Free est acceptée par écrit comme limite de la franchise.
9. **Test E-Myth** : un opérateur qui n'a pas écrit le code exécute les
   points 1 à 6 en suivant le manuel seul.

Tant qu'un seul de ces points manque, le gate Day 1 reste **OUVERT**.

> Tension à régler pendant l'exécution : la matrice demande de « ne pas créer
> un autre locataire pour la commodité des tests », alors que le critère n° 2
> exige un deuxième locataire. La résolution : le deuxième locataire est un
> locataire de test, créé uniquement pour l'acceptation, documenté comme tel,
> puis supprimé ou isolé après la preuve. Il ne doit pas polluer la liste
> des locataires réels.

## 5. Étapes

| N° | Étape | Livrable |
|---|---|---|
| 1 | Confirmer les prérequis cloud (§ 6, R-01 à R-04) : hook JWT, version déployée de `marketplace-api`, référence du projet Supabase, aperçu à la tête actuelle. | Note datée dans la matrice |
| 2 | Vérifier que l'aperçu Vercel à la tête en cours est READY et que `bun run verify` passe (548/548). | Lien de l'aperçu, commit vérifié |
| 3 | Exécuter le parcours d'inscription (critère n° 1) dans le navigateur, session authentifiée. | Capture + date + auteur dans la matrice |
| 4 | Créer le deuxième locataire de test, vérifier l'isolation et le refus croisé (critères n° 2, 3). | Preuves inscrites dans la matrice |
| 5 | Exécuter CRUD, stockage privé, session (critères n° 4, 5, 6, 7). | Preuves inscrites dans la matrice |
| 6 | Démontrer sauvegarde/restauration ou acter la limite par écrit (critère n° 8). | Preuve ou décision écrite |
| 7 | Faire passer le test E-Myth par un opérateur extérieur au code (critère n° 9). | Compte rendu dans le manuel |
| 8 | Mettre à jour le manuel (`docs/MANUEL-EXPLOITATION.md`) : date, tête, gate Day 1 → FERMÉ, blocages résolus. | Demande de fusion |

## 6. Risques

| N° | Risque | Effet si avéré | Parade |
|---|---|---|---|
| R-01 | Hook JWT non configuré côté cloud (configuration non visible dans le dépôt). | `org_id` / `role` absents du JWT → RLS silencieuse, 0 ligne. | Vérifier le hook sur le tableau de bord avant l'étape 3 ; sinon le configurer. |
| R-02 | Version déployée de `marketplace-api` : v30 (matrice) contre v31 (session S6). | La preuve testerait une ancienne version. | Confirmer la version déployée, redéployer à la tête en cours si besoin. |
| R-03 | Projet Supabase : `swegnrvaxxgfrnshdpxx` (sessions) contre `qjrwcdzaebyqponqkiqs` (fichier `linked-project.json` du dépôt). | Preuves faites sur le mauvais projet. | Confirmer le projet vivant avant l'étape 3. |
| R-04 | Pas de SMTP personnel. | Confirmation email et réinitialisation impossibles à prouver. | Configurer un SMTP, ou accepter la limite par écrit et retirer ces deux points des critères (décision à inscrire). |
| R-05 | Quota Vercel 24 h. | Aperçu indisponible au moment de la preuve ; tests de régression OAuth déjà bloqués une fois (quota 402). | Planifier les preuves hors pic de quota ; sortir du Free si le blocage se répète. |
| R-06 | Bug de parsing des scopes OAuth (callback v2, worker v8). | Connexion d'adaptateur en échec pendant les preuves. | Le bug relève de Day 2 (adaptateurs) ; ne pas le laisser bloquer Day 1, sauf s'il touche l'inscription elle-même. |
| R-07 | La tête avance pendant les preuves (25 commits entre `b7c2b29` et `8326c44`). | Preuves faites sur une tête dépassée. | Figer la tête au début de l'étape 2 ; toute nouvelle livraison rouvre la vérification de l'aperçu. |

## 7. Hors périmètre

- Day 2 (adaptateurs, OAuth Google, Drive) et Day 3 (vente, paiements, PSP,
  réplication d'entreprise).
- Runtime agents.
- Blueprints (20 familles / 73 fournisseurs) : ils restent des plans.
- Écrans Wallet et prix : suspendus.
- Fermeture de la PR n° 63 (V5) : elle suit la vérification du transfert,
  elle ne fait pas partie de la fermeture de Day 1.
- Toute nouvelle fonction Edge : voir § 3, aucune n'est prévue.

# Business Marketplace — configuration Auth et fournisseurs

Ce guide concerne exclusivement l'authentification des utilisateurs de **A’Space Business Marketplace** via le projet Supabase existant.

- Application de production : https://business-marketplace-amd-lab.vercel.app
- Projet Supabase : `Aspace MarketPlace` (`swegnrvaxxgfrnshdpxx`)
- Project URL : `https://swegnrvaxxgfrnshdpxx.supabase.co`
- Callback Supabase des fournisseurs d'identité : `https://swegnrvaxxgfrnshdpxx.supabase.co/auth/v1/callback`
- Callback frontend après retour Supabase : `/auth/callback`

## 1. État de configuration vérifié

| Élément | État |
|---|---|
| Supabase Auth | ACTIVE_HEALTHY |
| Email / mot de passe | Activé |
| Confirmation d'adresse | Activée |
| SMTP personnalisé | **Non configuré** |
| Google Sign-In | Désactivé / non configuré |
| Apple Sign-In | Désactivé / non configuré |
| Microsoft (Azure) | Désactivé / non configuré |

La configuration des URL de redirection est déjà appliquée dans Supabase :
- `https://business-marketplace-amd-lab.vercel.app/**`
- `https://business-marketplace-*-amd-lab.vercel.app/**`
- `http://localhost:5173/**`
- `http://localhost:3000/**`

Cette configuration ne prouve pas que l'envoi des emails fonctionne. Aucun compte Auth réel n'est encore enregistré dans le projet.

## 2. Débloquer l'inscription email — SMTP

C'est le prochain prérequis Day 1. La confirmation d'adresse est requise (`mailer_autoconfirm=false`), mais aucun SMTP personnalisé n'est configuré.

Dans le Dashboard Supabase :
1. Ouvrir le projet **Aspace MarketPlace**.
2. Aller dans **Authentication → SMTP Settings** (le libellé peut varier selon la version du Dashboard).
3. Activer le SMTP personnalisé.
4. Renseigner les paramètres fournis par le service d'envoi choisi : host, port, username, password, sender email et sender name.
5. Enregistrer, puis vérifier la configuration d'envoi et les limites du fournisseur.
6. Tester une inscription depuis l'application de production avec une adresse contrôlée.
7. Confirmer le lien reçu, se reconnecter, puis vérifier qu'une session valide est créée.

**Sécurité :** ne jamais coller le mot de passe SMTP dans GitHub, dans ce fichier, dans le frontend ou dans une conversation. Il doit rester dans les paramètres sécurisés du projet Supabase.

Ne désactive pas la confirmation d'email simplement pour faire passer le test. L'acceptation Day 1 exige un vrai cycle signup → email → confirmation → signin.

## 3. Google Sign-In

Google Sign-In pour la connexion des utilisateurs Marketplace est distinct du connecteur Google Drive utilisé par les tenants. Il faut deux configurations OAuth séparées, avec des audiences et des callbacks distincts.

1. Dans Google Cloud Console, créer un client OAuth de type **Web application** pour Business Marketplace.
2. Ajouter comme origine JavaScript de production : `https://business-marketplace-amd-lab.vercel.app`.
3. Ajouter comme URI de redirection autorisée :
   `https://swegnrvaxxgfrnshdpxx.supabase.co/auth/v1/callback`.
4. Dans Supabase → Authentication → Providers → Google, activer Google et saisir le Client ID et le Client Secret.
5. Enregistrer et tester le parcours depuis l'application.

Ne pas réutiliser le client OAuth Google Drive de l'adaptateur Marketplace. Celui-ci sert à autoriser l'accès aux ressources Drive d'un tenant, pas à authentifier un utilisateur sur la plateforme.

## 4. Microsoft Sign-In (Azure)

1. Dans Microsoft Entra ID → App registrations, créer une application Web.
2. Choisir les types de comptes acceptés selon la politique d'accès Marketplace.
3. Ajouter l'URI de redirection :
   `https://swegnrvaxxgfrnshdpxx.supabase.co/auth/v1/callback`.
4. Créer un secret client et le conserver dans un gestionnaire sécurisé.
5. Dans Supabase → Authentication → Providers → Azure, activer Azure et saisir Client ID, Client Secret et tenant autorisé (`common` uniquement si les comptes personnels et professionnels doivent être acceptés).
6. Tester le retour vers `/auth/callback`.

## 5. Apple Sign-In

Apple Sign-In nécessite un compte Apple Developer, un App ID, un Services ID et une clé privée. Configurer le domaine et l'URL de retour exigés par Apple, puis saisir le Service ID et le secret JWT signé dans Supabase → Authentication → Providers → Apple.

Le secret Apple est une donnée sensible et ne doit jamais être versionné. Sa rotation et son expiration doivent être suivies.

## 6. Contrat applicatif et validation

- Le formulaire email utilise `supabase.auth.signUp` et `signInWithPassword`.
- Le retour OAuth frontend est `/auth/callback`.
- La page de callback attend la matérialisation de la session Supabase avant de revenir à la racine.
- Les statuts des boutons Google / Apple / Microsoft sont lus depuis `/auth/v1/settings`; ils ne doivent pas être déduits d'une sonde HEAD.
- Les niveaux affichés dans les métadonnées utilisateur ne constituent jamais une autorisation. Les droits doivent provenir des memberships, role bindings et délégations vérifiés côté serveur.
- Ne créer aucun utilisateur, organisation ou workspace artificiel pour simuler une validation.

### Critères de validation Day 1

- [ ] Email SMTP configuré et délivrabilité confirmée.
- [ ] Signup réel effectué.
- [ ] Email de confirmation reçu et lien validé.
- [ ] Signin email/mot de passe réussi.
- [ ] Session restaurée après rechargement.
- [ ] Logout et révocation de session vérifiés.
- [ ] Google / Microsoft / Apple activés uniquement si leurs credentials sont configurés et leurs parcours testés.
- [ ] Aucun rôle ni droit d'accès accordé sur la base de `user_metadata`.

## 7. Références

- Supabase Auth : https://supabase.com/docs/guides/auth
- Supabase SMTP : https://supabase.com/docs/guides/auth/auth-smtp
- Google OAuth : https://developers.google.com/identity/protocols/oauth2
- Microsoft identity platform : https://learn.microsoft.com/entra/identity-platform/
- Sign in with Apple : https://developer.apple.com/sign-in-with-apple/


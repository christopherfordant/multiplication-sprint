# Multiplication Sprint - Document Maitre

## 1. Resume Executif

`Multiplication Sprint` est un jeu educatif web/mobile qui transforme la revision des multiplications en aventure de progression par niveaux. Le projet combine aujourd'hui :

- un front principal en `HTML/CSS/JavaScript`
- une logique de jeu solo/duo avec profils enfants, badges, score et progression
- une carte du monde premium en transition vers un rendu plus immersif
- une couche serveur `Node.js / Express`
- une persistance locale `localStorage`, avec une base SQL et des API en cours d'exploitation
- une distribution web via Render et une base compatible PWA

Etat reel du projet au `22 avril 2026` :

- la boucle de jeu est jouable
- la carte du monde existe et sert de hub de progression
- la direction artistique cible est claire, mais l'execution visuelle reste partiellement hybride
- le projet a accumule plusieurs couches successives, donc il faut maintenant prioriser la stabilite et la coherence avant de continuer a empiler

Enjeu principal :

- stabiliser la colonne vertebrale du projet pour que chaque future iteration ameliore l'application sans casser la navigation, la progression, le cache PWA ou la coherence visuelle

## 2. Vision Produit

### Promesse Utilisateur

Permettre a un enfant de reviser les multiplications dans une experience qui ressemble davantage a un jeu d'aventure mobile qu'a un exercice scolaire classique.

### Public Cible

- enfants en apprentissage ou revision des tables
- parents qui veulent suivre une progression
- usage principal sur mobile et navigateur desktop

### Experience Visee

- entree simple avec profil enfant
- progression par carte du monde
- niveaux courts, clairs et rejouables
- recompenses visibles
- sensation de progression et de voyage
- presentation premium de type jeu mobile cartoon-fantasy

### Ambition Moyen Terme

- rendre la carte du monde vraiment premium et stable
- consolider les flux profils / progression / score / recompenses
- garder une architecture PWA compatible avec une future publication Android via `Trusted Web Activity` ou `Bubblewrap`

## 3. Perimetre Fonctionnel Actuel

### Ce qui fonctionne reellement aujourd'hui

- ecran d'accueil / hub
- saisie et sauvegarde de profil enfant
- modes `Enfant` et `Expert`
- modes `Solo` et `2 joueurs local`
- logique de questions a 5 reponses cliquables
- systeme de chrono
- systeme de score
- bonus de serie
- checkpoint de fin de niveau
- validation / echec de niveau selon un score seuil
- sauvegarde locale du meilleur score
- badges debloquables
- tableau de bord parent
- carte du monde comme hub de progression
- PWA avec manifest et service worker
- deploiement Render

### Ce qui est present mais encore partiellement abouti

- rendu premium de la carte du monde
- integration harmonieuse de la couche `Three.js`
- articulation claire entre carte 2D interactive et ambiance WebGL
- synchronisation serveur/base par rapport a la logique locale front

### Ce qui est souhaite mais pas encore officiellement stabilise

- carte de monde type jeu mobile haut de gamme
- rendu isometrique vraiment abouti
- hiérarchie definitive entre front local, API, base et persistance
- chaine de production propre pour assets premium

## 4. Perimetre Visuel Actuel

### Direction deja en place

- univers cartoon-fantasy
- couleurs vives et premium
- usage de `Fredoka` / `Comic Neue`
- interface ludique et arrondie
- mascotte / heros mis en avant

### Elements deja forts

- accueil plus riche qu'une simple page web
- identite generale reconnaissable
- presence d'une vraie carte du monde
- progression lisible
- checkpoints et ecrans de resultat clairs

### Elements encore faibles

- la carte reste un hybride entre fond illustre, overlays HTML et couche WebGL
- certaines surcouches visuelles peuvent nuire a la lisibilite
- la qualite percue de la carte n'est pas encore au niveau d'une vraie world map premium de jeu mobile
- la direction backend / base / API n'est pas encore visuellement ni fonctionnellement integree a l'experience produit

### Ecart ambition / execution

Ambition cible :

- carte isometrique premium, immersive, quasi "jeu mobile"

Etat reel :

- bonne base, mais encore une transition entre prototype enrichi et vraie experience premium

## 5. Architecture de l'Application

### Front principal

- [index.html](C:/Users/cashe/Documents/multiplication/index.html)
  - structure des ecrans et des panneaux principaux
- [style.css](C:/Users/cashe/Documents/multiplication/style.css)
  - habillage global, ecrans, carte, hero, overlays
- [script.js](C:/Users/cashe/Documents/multiplication/script.js)
  - logique de jeu, profils, progression, score, carte, transitions, PWA, bindings UI
- [map-scene.js](C:/Users/cashe/Documents/multiplication/map-scene.js)
  - scene Three.js pour la carte du monde et son ambiance
- [animations-enhanced.css](C:/Users/cashe/Documents/multiplication/animations-enhanced.css)
  - animations complementaires

### PWA

- [manifest.webmanifest](C:/Users/cashe/Documents/multiplication/manifest.webmanifest)
- [sw.js](C:/Users/cashe/Documents/multiplication/sw.js)

### Assets

- `assets/world/*`
- `assets/characters/*`
- icones PWA et favicon

### Backend / Base / Setup

- [server.js](C:/Users/cashe/Documents/multiplication/server.js)
  - serveur Express, securite, API REST, static files
- [database.js](C:/Users/cashe/Documents/multiplication/database.js)
  - configuration Sequelize
  - `SQLite` en local, `PostgreSQL` possible si `DATABASE_URL`
- [setup.js](C:/Users/cashe/Documents/multiplication/setup.js)
  - script d'initialisation `.env`
- [database.sqlite](C:/Users/cashe/Documents/multiplication/database.sqlite)
  - base locale

### Lancement

- [package.json](C:/Users/cashe/Documents/multiplication/package.json)
- [Lancer_Jeu.bat](C:/Users/cashe/Documents/multiplication/Lancer_Jeu.bat)

### Deploiement

- [render.yaml](C:/Users/cashe/Documents/multiplication/render.yaml)

## 6. Flux Critiques Utilisateur

### Accueil vers carte

1. l'utilisateur ouvre l'accueil
2. il saisit ou choisit un profil
3. il choisit mode et session
4. il clique sur `Entrer sur la carte`
5. la carte du monde s'ouvre

### Carte vers niveau

1. l'utilisateur selectionne un niveau debloque
2. il lit le resume de la case selectionnee
3. il clique sur `Entrer dans le niveau`

### Niveau vers checkpoint

1. 10 questions maximum par niveau
2. score / precision / bonus accumules
3. checkpoint affiche score de niveau, seuil, etoiles, message

### Checkpoint vers suite

- retour a la carte
- ou retenter le niveau
- ou fin de partie si boss final / fin d'aventure

### Profils / scores / badges

- profils charges depuis `localStorage`
- meilleur score global garde localement
- badges et etoiles lies au profil actif

### PWA

- service worker actif
- installation possible selon navigateur
- attention forte aux problemes de cache

## 7. Etat des Donnees

### Persistance front

Stockage local principal via `localStorage` :

- meilleur score
- profils enfants
- profil actif
- badges
- niveaux debloques
- etoiles par niveau

### Persistance serveur

Le projet contient aussi une couche SQL via Sequelize :

- table `Profile`
- table `Score`
- API REST pour profils, scores, leaderboard et stats admin

### Etat reel de la source de verite

Source de verite fonctionnelle aujourd'hui :

- majoritairement le front et `localStorage`

Source de verite technique en transition :

- backend / base / API existent, mais ne sont pas encore le centre officiel du produit

Decision de stabilite :

- tant que la synchronisation front/API n'est pas explicitement finalisee, il faut considerer `localStorage + logique front` comme reference produit principale

## 8. Contraintes de Stabilite

### Non-regressions obligatoires

Ne pas casser :

- creation / sauvegarde de profils
- selection du mode enfant / expert
- solo / duo local
- score et meilleur score
- progression de niveau
- checkpoint
- badges
- dashboard parent
- carte du monde
- PWA
- deploiement Render
- compatibilite mobile

### Regles de stabilite

- ne pas modifier la logique de progression sans verifier le checkpoint
- ne pas modifier la carte sans tester `selection niveau -> entree niveau -> retour carte`
- ne pas modifier `sw.js` sans rebump de cache
- ne pas empiler de nouvelles couches visuelles contradictoires
- ne pas faire diverger front local et backend sans decision explicite

## 9. Dette Technique et Fragilites

### Fragilites actuelles

- la carte melange plusieurs logiques visuelles
- le service worker peut facilement masquer une nouvelle version
- la pile front est devenue dense dans `script.js`
- l'architecture backend existe mais n'est pas encore totalement raccordee au produit reel
- plusieurs iterations graphiques successives ont pu laisser des couches historiques

### Risques

- regression sur les boutons et flux si une refonte visuelle oublie les bindings
- regression de cache PWA
- incoherence entre base locale, API et `localStorage`
- dette de lisibilite dans la carte si on continue a empiler sans epurer

### Dette technique claire

- `script.js` concentre trop de responsabilites
- separation partielle seulement entre logique de jeu, logique carte et logique plateforme
- manque d'une couche de config stable pour les assets premium

## 10. Direction Artistique Cible

Direction officielle a retenir :

- `cartoon fantasy premium`
- `storybook adventure`
- `isometrique stylise`
- `mobile-first`

### Incontournables visuels

- vraie carte de progression attractive
- biomes nettement differencies
- landmarks memorables
- heros premium visible
- lisibilite des cases et du chemin
- interface premium mais simple a comprendre

### A eviter

- patchwork de styles
- surcouches decoratives qui nuisent a la lecture
- CSS-only flat look quand l'ambition vise un rendu premium
- surcharge d'effets au detriment du mobile

## 11. Regles de Gouvernance pour la Suite

### Regle 1

Toujours partir de l'etat reel du code, pas de l'etat imagine du projet.

### Regle 2

Avant toute grosse refonte carte :

- clarifier si l'on renforce le mix `illustration + WebGL`
- ou si l'on bascule vers une scene plus unifiee

### Regle 3

Ne jamais lancer une grosse evolution simultanement sur :

- gameplay
- carte
- backend
- PWA

Maximum une zone critique a la fois.

### Regle 4

Toute evolution visuelle doit laisser la logique metier intacte tant qu'aucune refonte fonctionnelle n'a ete decidee.

### Regle 5

Le backend ne devient reference officielle qu'apres une vraie decision de migration produit.

## 12. Roadmap Stable Recommandee

### Court terme

1. stabiliser la carte premium et son rendu reel
2. epurer les couches historiques de la carte
3. consolider les tests manuels des flux critiques

### Moyen terme

1. separer davantage la logique de carte du reste de `script.js`
2. definir la vraie strategie de persistance : local only, sync hybride, ou backend prioritaire
3. preparer une version Android PWA/TWA propre

### Apres stabilisation

1. enrichir la carte avec animations camera et effets contextuels
2. renforcer la collection de recompenses et la boucle meta
3. ouvrir la voie a une publication plus “store-ready”

## 13. Checklist Avant Toute Modification Importante

### Avant

- identifier la zone fonctionnelle touchee
- verifier si `sw.js` ou versions de fichiers doivent changer
- verifier l'impact mobile
- verifier si la modification touche les flux critiques

### Apres

Tester au minimum :

- accueil
- sauvegarde profil
- ouverture carte
- selection niveau
- entree niveau
- reponse correcte / incorrecte
- fin de niveau
- retour a la carte
- retente
- fin de partie
- refresh dur / cache PWA

## 14. Annexe de Verite Projet

### Fichiers prioritaires a inspecter en premier

- [index.html](C:/Users/cashe/Documents/multiplication/index.html)
- [script.js](C:/Users/cashe/Documents/multiplication/script.js)
- [style.css](C:/Users/cashe/Documents/multiplication/style.css)
- [map-scene.js](C:/Users/cashe/Documents/multiplication/map-scene.js)
- [sw.js](C:/Users/cashe/Documents/multiplication/sw.js)
- [server.js](C:/Users/cashe/Documents/multiplication/server.js)
- [database.js](C:/Users/cashe/Documents/multiplication/database.js)
- [render.yaml](C:/Users/cashe/Documents/multiplication/render.yaml)

### Distinction officielle a garder

#### Existant reel

- jeu jouable
- carte fonctionnelle
- profils, badges, etoiles, score
- PWA
- Render
- backend et base presents

#### Partiellement implemente

- experience carte premium totalement coherente
- synchronisation claire front/API/base
- pipeline artistique stable

#### Souhaite mais non stabilise

- world map premium vraiment au niveau jeu mobile haut de gamme
- architecture definitive de persistance
- trajectoire Android / Play Store finalisee

## 15. Decision Structurante a Retenir

Pour la suite du projet, la priorite n'est pas d'ajouter toujours plus de nouveautes.  
La priorite est :

- d'unifier la carte
- de clarifier la source de verite des donnees
- de proteger les flux critiques
- de faire converger le projet vers une experience premium stable

Ce document doit etre considere comme la reference principale de pilotage jusqu'a sa prochaine mise a jour explicite.

## 16. Audit Branche Locale en Cours

Cette section documente les risques observes dans les modifications locales non encore stabilisees.

### Blocages critiques detectes

1. La carte HTML a ete retiree de `index.html`, mais `script.js` contient encore des references actives a `mapMascot`.
   - Si `elements.mapMascot` est nul, `positionMascotOnMap()` peut casser l'ouverture de la carte.
   - Tant que la migration 100% Three.js n'est pas complete, toute suppression de noeuds DOM doit etre accompagnee d'une purge complete de leurs usages JS.

2. `map-scene.js` importe des modules `unpkg.com`, alors que la CSP du serveur n'autorise actuellement pas `unpkg`.
   - En environnement serveur Express, la carte 3D peut etre bloquee par la politique de securite.
   - Toute dependance distante de type module doit etre alignee avec `helmet` ou rematérialisée localement.

3. Les nouveaux sprites `nova-idle.png`, `nova-walk.png` et `nova-victory.png` sont references par le front mais ne font pas partie des assets actuellement presents dans `assets/characters`.
   - Cela degrade immediatement le rendu de la mascotte et peut casser des etats visuels attendus.

### Implications de stabilite

- la branche locale contient des travaux de transition, pas encore un etat proprement publiable
- il ne faut pas pousser cette branche telle quelle sans corriger les blocages critiques
- le `MASTER_GUIDE.md` reste la reference, mais la branche de travail doit etre traitee comme une branche d'integration en cours

### Regle immediate

Avant tout prochain push structurel sur la carte ou l'infrastructure front :

- verifier que le HTML, le CSS et le JS pointent vers les memes composants
- verifier que tous les assets references existent physiquement
- verifier que la CSP autorise les ressources chargees

### Correctif de stabilisation applique le 23 avril 2026

Une passe de stabilisation a ensuite ete appliquee pour remettre la carte dans un etat publiable plus robuste :

- le fallback DOM de la carte a ete restaure comme source de verite de selection
- la couche `Three.js` a ete simplifiee pour devenir une couche d'ambiance locale, et non plus un remplacement fragile de l'UI
- les imports distants ont ete supprimes au profit d'un chargement local de `three`
- les references aux sprites `nova-*` ont ete remplacees par des assets reellement presents
- le service worker a ete realigne avec les vrais fichiers servis

Decision structurante :

- tant que la carte 3D premium n'a pas une integration totalement aboutie, la navigation de progression doit rester pilotee par le DOM interactif
- la 3D enrichit, mais ne doit jamais devenir un point de rupture pour l'ouverture de la carte ou la selection de niveau

### Passe visuelle premium appliquee ensuite

Audit visuel de la carte stabilisee :

- le fond illustre etait plus qualitatif, mais les niveaux semblaient encore poses par-dessus au lieu d'appartenir au monde
- le chemin manquait de presence et de lisibilite narrative
- les biomes etaient presents dans l'intention, mais pas assez incarnes dans le DOM
- la scene `Three.js` apportait une ambiance, mais pas encore assez de profondeur percue

Correctif applique :

- restauration d'elements decoratifs DOM non interactifs : biomes, nuages, atlas, chateau final, landmarks
- renforcement de la hierarchie des cases de niveau, des labels de biome, des etoiles et de l'etat selectionne
- ajout de halos de biomes et d'un leger effet de parallaxe dans `map-scene.js`
- maintien du principe de stabilite : la carte DOM reste la couche interactive principale, la 3D reste une couche d'ambiance

### Nouvelle direction : progression paysage 3D immersive

Decision produit du 23 avril 2026 :

- la progression ne doit plus etre pensee comme une carte plate a terme
- l'interface principale cible devient une vue de paysage 3D/360 par niveau
- le personnage doit etre represente comme un heros cartoon-fantasy plus expressif, pas comme un pion simplifie
- chaque niveau doit correspondre a un biome jouable visuellement : prairie, foret, desert, falaises, iles, chateau final
- la carte DOM doit rester disponible comme fallback si WebGL, assets ou performances mobiles posent probleme

Premiere implementation robuste :

- `map-scene.js` construit maintenant une scene de paysage 3D par niveau selectionne
- le heros est un personnage 3D procedural local, avec cape, visage, cheveux, couronne, bras et jambes animes
- les paysages sont generes localement avec sol, chemin, sky dome, portails, landmarks et ambiance
- les niveaux verrouilles restent visuellement distincts dans les portails
- la progression reste pilotee par la logique existante, sans casser les profils, scores, badges, PWA ou Render

Limite assumee :

- cette premiere version ne remplace pas encore des assets d'artiste professionnels ou des skyboxes 360 generes
- pour un rendu vraiment commercial, il faudra ensuite integrer des skyboxes/panoramas 360 ou des packs 3D stylises coherents

### Passe UX : progression 3D explicite

Probleme observe apres la premiere version immersive :

- le clic dans le paysage etait trop implicite
- l'utilisateur ne savait pas clairement ou appuyer pour faire avancer le heros
- le decor pouvait changer sans intention suffisamment lisible

Correctif applique le 23 avril 2026 :

- ajout d'un panneau flottant `Chemin d'aventure` au-dessus de la scene
- ajout d'un bouton explicite `Avancer vers le niveau X`
- apres validation d'un niveau, le joueur reste sur le paysage du niveau termine jusqu'a ce qu'il choisisse d'avancer
- le portail du niveau suivant pulse dans Three.js quand il est debloque
- le personnage joue une animation de voyage avant le changement de decor
- les clics sur la scene appellent maintenant la meme action que le bouton visible, au lieu de cacher une logique dans des zones invisibles

Decision de game design :

- une scene 3D peut enrichir la progression, mais l'action principale doit toujours etre visible, nommee et facile a toucher sur mobile
- la technologie actuelle `Three.js + DOM overlay` reste suffisante pour cette passe, car le probleme etait d'abord UX et integration, pas moteur 3D
- pour viser un rendu reellement commercial, la prochaine marche doit etre l'integration d'assets externes coherents : personnage GLB anime, skyboxes 360, decors stylises et effets optimises mobile

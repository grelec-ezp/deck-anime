# Le moteur

Trois fichiers, plus le contenu. Aucune dépendance, aucun build.

```
index.html    les <section> des écrans, l'habillage, le sommaire
styles.css    jetons de couleur, squelette, composants
data.js       ← LE SEUL FICHIER DE CONTENU
scenes.js     outils de dessin et hooks d'écran
app.js        le lecteur : navigation, pas, notes, minuteur
```

## La scène fixe

`#scene` fait 1600 × 900 pixels, toujours. `app.js` calcule un facteur et
applique un `transform: scale()`. Tout le reste se mesure en pixels de scène.

```js
var k = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
scene.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
```

Le centrage passe par `position:absolute; left:50%; top:50%` puis
`translate(-50%,-50%)`. **Ni grid ni flex** : un enfant de 1600 px dans un
conteneur plus étroit déborde au lieu de se centrer, et le deck se retrouve
décalé dans les petites fenêtres.

Conséquence pratique : on ne teste qu'une seule largeur. Ce qui est juste en
1600 × 900 est juste partout.

## Le cycle d'un écran

```js
HOOKS.monEcran = {
  construit: function (s) { /* une fois, à la première arrivée */ },
  entre:     function (s) { /* à chaque arrivée : remise à zéro */ },
  pas:       function (s, n, direct) { /* à chaque étape */ },
  sort:      function (s) { /* en quittant */ }
};
```

`construit()` crée le DOM coûteux : SVG, grilles, listes. Il ne tourne qu'une
fois, la construction est mise en cache.

`entre()` **remet l'écran dans son état de départ.** C'est le point le plus
important du moteur. Vider les compteurs, replier les tracés, éteindre les
points. Tout ce qui doit repartir de zéro va ici, jamais dans `construit()`.

`pas(s, n, direct)` reçoit le numéro d'étape. `direct` vaut `true` en marche
arrière : l'écran rejoue jusqu'à l'étape voulue, et les hooks posent alors la
valeur finale sans animer.

Le moteur pose aussi une classe `pas-N` sur la `<section>` à chaque étape. Pour
tout ce que le CSS sait faire, le hook `pas()` est inutile.

## Les pas

Dans `data.js` :

```js
{ id: 'marche', titre: 'Le marché', chapitre: 'Introduction',
  pas: [600, 2000, 3400], duree: 18,
  notes: 'Le 96 % est le chiffre qui compte.' }
```

`pas` est un tableau de délais en millisecondes. Sa **longueur** donne le nombre
d'étapes ; ses **valeurs** ne servent qu'en mode auto. Un écran à une seule
étape déclare `pas: [400]`.

Arriver sur un écran applique déjà l'étape 1. Un écran n'est jamais affiché vide
en attendant un clic.

**Le maximum est six étapes** : le CSS ne déclare les règles `.pas-N .a[data-pas="N"]`
que jusqu'à 6. Au-delà, couper l'écran en deux — ce qui est de toute façon le
bon réflexe.

## Les deux modes

`var MODE = 'presentateur'` ou `'auto'`, dans `data.js`.

**presentateur** — `→` avance d'une étape, puis d'un écran une fois les étapes
épuisées. `←` recule. Pas d'horloge.

**auto** — les étapes partent sur leurs délais, l'écran change après `duree`.
C'est le mode d'un écran sans personne devant : hall, stand, boucle entre deux
sessions. Le même code sert les deux.

## Le tempo

`var TEMPO = 1.4` ralentit tout de 40 % : durées d'écran, délais d'étape,
animations CSS. Deux chemins :

- en JS, `facteurTempo()` multiplie les `setTimeout` et les durées ;
- en CSS, `app.js` pose `--tempo` sur `:root`, et les règles écrivent
  `animation-delay: calc(var(--d,0s) * var(--tempo,1))`.

Un délai écrit en dur quelque part échappe au tempo et désynchronise le reste.
Il n'y a pas d'exception acceptable.

## Mouvement réduit

`?static=1` dans l'URL, ou le réglage système. Chaque écran s'affiche
directement dans son état final. Utile pour un écran de hall, pour les personnes
sensibles au mouvement, et pour relire tout un deck d'un coup : un chiffre vide
ou un texte qui déborde saute aux yeux.

Les outils de dessin gèrent déjà ce cas via `REDUIT`. Une animation écrite à la
main doit le gérer aussi.

## L'habillage

Barre de progression cliquable en haut, boutons au survol en bas, minuteur en
bas à droite, sommaire par chapitre, panneau de notes. Tout est `position:fixed`,
donc hors de la scène mise à l'échelle : l'habillage garde sa taille réelle
quelle que soit la fenêtre.

## Le lecteur

`window.Lecteur` expose `va(i, pas)`, `suivant()`, `precedent()`, `ou()`,
`ecrans` et `mode`. C'est par là que passent les vérifications automatisées.

Un écran déclaré dans `data.js` sans `<section>` correspondante est signalé en
console au chargement. Ne pas ignorer cet avertissement.

## Les touches, en salle

| Touche | Effet |
|---|---|
| `→` `espace` `entrée` | Étape suivante, puis écran suivant |
| `←` `retour arrière` | Étape précédente |
| `N` | Notes de l'orateur |
| `S` | Sommaire, par chapitre |
| `B` ou `.` | **Écran noir** — pour reprendre la salle |
| `F` | Plein écran |
| `R` | Recommencer, minuteur à zéro |
| `Début` `Fin` | Premier, dernier écran |

Une télécommande de présentation envoie `PageUp`/`PageDown` : c'est câblé.

**L'écran noir est la commande la plus utile** et celle qu'on oublie de prévoir.
Quand une question arrive, on veut que la salle regarde l'orateur, pas l'écran.

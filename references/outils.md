# La boîte à outils de dessin

Tout est exporté sur `MoteurEcrans` et disponible dans la portée des hooks.
Aucune dépendance : du DOM et du SVG écrits à la main.

## Le cycle d'un écran

```js
HOOKS.monEcran = {
  construit: function (s) { /* une fois, à la première arrivée */ },
  entre:     function (s) { /* à chaque arrivée : remise à zéro */ },
  pas:       function (s, n, direct) { /* à chaque étape */ },
  sort:      function (s) { /* en quittant */ }
};
```

Trois règles, et elles coûtent cher quand on les oublie :

1. **Ce qui est coûteux va dans `construit()`** — il ne tourne qu'une fois.
2. **Ce qui repart de zéro va dans `entre()`** — il tourne à chaque arrivée.
3. **`direct` vaut `true` en marche arrière** : poser la valeur finale, ne pas
   animer.

Et une quatrième, moins évidente : **ne jamais mesurer dans `construit()`**.
`offsetWidth` et `clientHeight` valent 0 tant que l'écran est en `display:none`.
Toute mesure se prend depuis `pas()`, quand l'écran est affiché.

## Les compteurs

```js
compteJusqua(node, cible, duree, suffixe, format, dec)
tweenNombre(node, de, vers, duree, suffixe, format, dec)
```

`compteJusqua` part toujours de zéro. `tweenNombre` part d'où on veut — c'est
celui qu'il faut pour passer de 45 % à 35 % sans repasser par 0.

`format: 'fr'` sépare les milliers par une espace fine. `dec` donne le nombre de
décimales, avec une virgule.

**Réserver la largeur du chiffre** (`min-width`) quand un libellé le suit :
sinon le libellé se déplace à chaque incrément pendant tout le décompte.

## `barres(hote, items, options)`

Histogramme vertical, deux à cinq barres.

```js
barres(q('.barres', s), [
  { nom: 'juin',     valeur: 10000, texte: nbsp(10000) },
  { nom: 'décembre', valeur: 30000, texte: nbsp(30000), creuse: true },
  { nom: 'cible',    valeur: 35000, texte: nbsp(35000), creuse: true, ton: 'electrique' }
], { max: 50000, repere: { valeur: 50000, texte: 'objectif initial' } });
```

Rend `{ leve(i, direct), baisse(), montreRepere() }`.

- `creuse` : contour en pointillés au lieu d'un aplat — pour une projection.
- `ton` : `appui`, `tension`, `electrique`. Par défaut le lime.
- `options.max` : **à poser explicitement** quand le rapport entre les barres
  est le propos. Sans lui, la plus haute remplit toute la hauteur et exagère
  l'écart ; avec `max: 100`, un 75 contre 25 se lit bien comme un rapport de 3.
- `options.repere` : une ligne horizontale en pointillés, révélée à part.

Une barre pas encore levée ne montre rien — ni son contour ni son nom.

Classes CSS : `.barres.haute` (plus haut), `.barres.quatre`, `.barres.cinq`
(espacement resserré ; l'espacement par défaut est prévu pour deux ou trois).

## `anneau(hote, canaux, options)`

Anneau de répartition qui se déforme d'un état à l'autre.

```js
var g = anneau(q('.anneau', s), [
  { nom: 'Direct',    ton: 's-1' },
  { nom: 'Recherche', ton: 's-2' }
], { H: 640, cy: 320, R: 200, EP: 40, RL: 275 });

g.pose([45, 55], direct);          // place les arcs et les étiquettes
g.tourne([45, 55], direct, { tours: 4, duree: 1700 });   // roue qui se cale
g.efface();                        // depuis entre()
```

Géométrie : `H` hauteur de la boîte, `cx`/`cy` centre, `R` rayon, `EP` épaisseur
du tracé, `RL` rayon des étiquettes. Un anneau large et fin laisse plus de place
au chiffre central — l'intérieur vaut `R − EP/2`.

Tons : `s-1` à `s-5`, pris sur la rampe catégorielle du thème. Au-delà de cinq
parts, regrouper — un camembert à huit quartiers ne se lit plus.

**Trois choses à ne pas défaire :**

- Chaque quartier est un cercle entier dont `stroke-dashoffset` donne la
  longueur de l'arc et une rotation CSS son point de départ. Les deux sont
  animables, donc le passage d'un état à l'autre ne reconstruit rien.
- Les tailles d'étiquettes se mesurent dans `pose()`, pas dans `construit()`.
- Le rayon d'une étiquette dépend de son angle : une étiquette posée à
  l'horizontale s'approche du tracé de sa demi-largeur, bien plus que de sa
  demi-hauteur. On projette la demi-boîte sur la direction de l'angle.
  L'écartement entre étiquettes voisines est symétrique — ne pousser que vers
  l'avant fait dériver la dernière sur tout le tour. Une ligne de rappel relie
  l'étiquette à son quartier dès qu'elle a dû s'en écarter.

`tourne()` fait tourner la roue avant de la caler : les arcs ont d'emblée leur
longueur définitive — ce qui tourne est un camembert juste, pas des proportions
qui s'agitent — et les étiquettes n'arrivent qu'une fois la roue arrêtée.

## `histo(hote, cfg)`

Série longue qu'on lit comme une forme, pas comme des valeurs.

```js
histo(q('.histo', s), {
  reel:    [31, 38, 35, 44],
  projete: [118, 131, 144],
  reperes: [{ i: 0, texte: 'Janvier' }, { i: 3, texte: 'Aujourd’hui' }]
});
```

Rend `{ monte(de, à, direct), efface(), montreSep() }`. Cyan pour le réalisé,
lime pour l'engagement, un séparateur en pointillés entre les deux. Trente ou
cinquante barres se lisent très bien : c'est la silhouette qui parle.

## Les autres

| Outil | Ce qu'il fait |
|---|---|
| `courbe(hote, serie, options)` | Courbe pleine largeur avec aire dégradée, rend le tracé |
| `cachePath(p)` / `tracePath(p, duree)` | Replie puis déroule un tracé SVG |
| `grillePoints(hote, n, colonnes)` | Grille de points, rend le tableau |
| `allumeRatio(points, ratio, classe)` | Allume une part des points, par vagues |
| `colonnes(hote, groupes)` | Colonnes de roadmap |
| `chips(hote, liste)` | Pastilles |
| `cartes(hote, equipes)` | Cartes avec compteur d'effectif |
| `nbsp(n)` | Espace fine insécable tous les trois chiffres |
| `el`, `svgEl`, `q`, `qa` | Raccourcis DOM et SVG |

## Les composants de texte

Classes posées directement en HTML, sans hook.

`.titre` · `.titre.geant` · `.sous-titre` · `.surtitre` · `.legende` ·
`.legende.large` · `.souligne` · `.heros` · `.heros.immense` · `.bloc-heros` ·
`.jalons` (liste numérotée, `<em>` pour la ligne de précision en retrait) ·
`.rangee` · `.campagnes` (bande de créas, voir le gabarit).

## Les couleurs ont un sens, un seul

| Jeton | Sens |
|---|---|
| `--accent` | le sujet, la série dont on parle, l'engagement pris |
| `--second` | la seconde série, le réalisé passé |
| `--cible` | ce qu'il reste à atteindre |
| `--alerte` | ce qui inquiète |
| `--encre-3` | la référence, mise en retrait |

Ces quatre-là portent un **sens**. Pour un graphique à plusieurs parts, où une
couleur ne désigne qu'une catégorie, utiliser la rampe `--serie-1` à
`--serie-5` : c'est un autre métier.

Deux teintes voisines sont indiscernables sur un vidéoprojecteur : il faut un
écart de teinte, pas un écart de clarté. Ne pas ajouter une cinquième couleur de
sens sans mettre ce tableau à jour — la troisième personne qui touchera le
fichier cassera la convention sinon.

Toutes les valeurs vivent dans `theme.css`. Voir `references/theme.md`.

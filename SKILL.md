---
name: deck-anime
description: |
  Construire une présentation web animée qui se comporte comme des diapositives :
  scène fixe mise à l'échelle, écrans en HTML/CSS/JS sans aucune dépendance,
  animations pas à pas au clic ou à l'horloge, notes de l'orateur, sommaire,
  minuteur, écran noir. L'identité visuelle tient dans un seul fichier de thème
  — couleurs, typographie, ombres — donc le même moteur s'habille aux couleurs
  de n'importe quelle marque. Livre une boîte à outils de dessin déjà écrite
  (histogrammes, anneau de répartition qui se déforme, série longue, compteurs,
  grilles), trois thèmes prêts, les limites éditoriales avec l'outil qui les
  mesure, et la méthode de vérification en navigateur.
  À utiliser quand on demande un deck « pas un PowerPoint », une présentation
  animée, un motion design de slides, ou un deck qui accompagne une prise de
  parole plutôt qu'un document à lire.
---

# Présentation animée

Un deck avec le fini d'un motion design et la souplesse des diapositives. Pas de
dépendance, pas de build, un fichier qu'on ouvre. On le pilote au clavier
pendant une prise de parole, ou on le laisse tourner seul sur un écran de hall.

> **Lire `references/ecrire.md` avant d'écrire quoi que ce soit.**
> Un deck qui accompagne une prise de parole est **très léger** : une idée par
> écran, quinze mots au plus, un seul objet visuel, pas de listes à puces.
> L'écran ne dit pas ce que dit l'orateur — il montre ce que la parole ne peut
> pas montrer. C'est la contrainte que tout le monde lâche en premier et celle
> que la salle remarque le plus. `outils/audit.sh` la mesure, écran par écran.

## Démarrer

```sh
cp -r <ce-skill>/gabarit mon-deck && cd mon-deck && open index.html
```

Le gabarit tourne tel quel : six écrans qui exercent chacun un outil de dessin —
un chapitre, un chiffre héros, un histogramme, un anneau qui se déforme, une
série longue, une liste. C'est une base, pas un exemple à recopier : on remplace
le contenu, on garde le moteur.

**Tout le contenu vit dans `data.js`.** C'est le seul fichier qu'une personne
non technique devrait avoir à ouvrir. Chiffres, ordre de passage, notes.

**Toute l'identité vit dans `theme.css`.** Couleurs, typographie, ombres. Trois
thèmes sont fournis dans `themes/` et s'échangent par une copie de fichier.
Pour habiller un deck aux couleurs d'une marque, voir `references/theme.md`.

## Les cinq décisions sur lesquelles tout repose

**Une scène fixe de 1600 × 900, mise à l'échelle en JavaScript.** Rien ne se
recompose : la mise en page est identique sur un portable, un vidéoprojecteur et
un écran de hall. On place les choses une fois, à une seule taille — et on ne
teste qu'une seule largeur.

**Des scripts classiques, pas de modules ES.** C'est ce qui permet d'ouvrir le
fichier depuis `file://` en double-cliquant, sans serveur. Sur la machine d'un
orateur qui n'a ni Node ni réseau, ça compte.

**Un seul fichier de contenu.** `data.js` porte les chiffres, le déroulé et les
notes. Aucune valeur en dur dans le HTML : sinon deux chiffres divergent et
personne ne le voit avant la salle.

**Un seul fichier d'identité.** `styles.css` ne contient que de la structure et
ne connaît que des jetons. Si un composant casse en changeant de thème, c'est
qu'une valeur d'identité a fui dans la structure.

**Des pas, pas une timeline.** Chaque écran déclare ses pas. En mode
présentateur ils avancent au clic, en mode auto ils suivent une horloge. Le même
code sert les deux, donc un deck peut tourner sans orateur sans être réécrit.

## La marche à suivre

1. **Écrire le déroulé dans `data.js`** avant une ligne de CSS : les écrans, les
   chapitres, le nombre de pas, les notes. Le contenu d'abord.
   Ce qui se dit va dans les notes, ce qui se montre va sur l'écran.
2. **Choisir ou construire le thème.** `references/theme.md`.
3. **Poser les écrans en HTML**, une `<section class="ecran" id="…">` par
   entrée. Trois blocs par écran : une affirmation courte, un objet visuel, une
   légende.
4. **Animer par pas.** Un élément porte `class="a" data-pas="2"` : il apparaît
   au pas 2. Pour ce que le CSS ne sait pas faire, un hook `pas(s, n, direct)`.
5. **Passer l'audit de charge** : `outils/audit.sh`. Un écran signalé se coupe
   en deux, il ne se rétrécit pas.
6. **Vérifier en navigateur, jamais en relisant le code.** Voir
   `references/verifier.md`. C'est l'étape qu'on saute et qu'on regrette.

## Les références

| Fichier | Quand le lire |
|---|---|
| `references/ecrire.md` | **En premier.** Ce qui va sur un écran, et ce qui n'y va pas |
| `references/theme.md` | Habiller le deck : couleurs, typographie, contraintes de projection |
| `references/moteur.md` | Comprendre le moteur avant de le modifier |
| `references/outils.md` | La boîte à outils de dessin, avec les signatures |
| `references/verifier.md` | **Avant de livrer quoi que ce soit** |

## Ce qui coûte cher quand on l'ignore

Chacun de ces points vient d'un vrai bug, trouvé tard.

**Ce qui repart de zéro va dans `entre()`, jamais dans `construit()`.**
`construit()` ne tourne qu'une fois. Au retour sur l'écran, l'élément est encore
dans son état final et s'affiche en entier avant de se réanimer.

**Mesurer une taille dans `construit()` donne zéro.** `offsetWidth` et
`clientHeight` valent 0 tant que l'écran est en `display:none`. Toute mesure —
largeur d'étiquette, hauteur de piste — se prend au moment de dessiner, depuis
`pas()`, quand l'écran est affiché.

**Les cibles d'animation se posent en pixels, pas en pourcentage.** Une
transition qui part d'une longueur et vise un pourcentage repose sur une
interpolation mal supportée. La scène est fixe, donc les pixels ne varient pas.

**La spécificité l'emporte sur l'ordre d'écriture.** Une règle à quatre classes
bat une règle à trois, même écrite plus haut. Un liseré qui refuse de
disparaître vient presque toujours de là.

**Une capture au repos ne prouve rien.** Les bugs vivent pendant l'animation. Il
faut échantillonner à des instants précis — et suivre le vrai parcours, à la
flèche depuis l'écran précédent, pas en sautant d'un `va(i, n)` à l'autre. Deux
faux bugs ont déjà été « trouvés » de cette façon avant d'être rendus à ce
qu'ils étaient : des artefacts du harnais de test.

**Un deck dense passe inaperçu à l'écriture et se paie dans la salle.** La
tendance est de remplir : trois chiffres au lieu d'un, une liste au lieu d'une
phrase. Lancer `outils/audit.sh` avant de livrer, et couper les écrans signalés
plutôt que réduire le corps.

**L'audit a ses faux positifs.** Il compte les libellés d'axe et les noms de
catégories comme de la prose. Un écran de graphique signalé à 18 mots dont 8
sont des noms de mois n'est pas un écran chargé. Juger, ne pas obéir.
Le gabarit lui-même ne passe que 2 écrans sur 6, et c'est normal : son texte de
démonstration explique les outils au lieu de porter un propos. Un vrai deck doit
faire mieux.

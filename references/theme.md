# Habiller un deck

Toute l'identité visuelle tient dans un seul fichier : `gabarit/theme.css`.
`styles.css` ne contient que de la structure et ne connaît que des jetons. C'est
ce qui permet de rhabiller un deck entier sans toucher à un seul composant.

## Changer de thème

Trois thèmes sont fournis dans `themes/`. Pour en adopter un :

```sh
cp themes/papier.css mon-deck/theme.css
```

| Thème | Pour quoi |
|---|---|
| `ardoise` | Sombre et sobre, accent ambre. Le défaut |
| `papier` | Clair, encre sombre. Salle très éclairée |
| `contraste` | Noir pur, couleurs saturées. Vidéoprojecteur faible ou mal réglé |

Les trois tournent sur les mêmes composants, sans aucune adaptation. C'est le
test qui prouve que la séparation tient : si un composant casse en changeant de
thème, c'est qu'une valeur d'identité a fui dans la structure.

## Partir d'une marque

Pour construire un thème aux couleurs d'une organisation, remplir `theme.css`
dans cet ordre — chaque étape dépend de la précédente.

### 1. Les fonds et l'encre

```css
--fond-0:#0E1116;   /* la page */
--fond-1:#151A21;   /* dégradé de la scène, bas */
--fond-2:#1F262F;   /* dégradé de la scène, haut */
--fond-3:#2A323D;   /* lueur du haut des écrans de chapitre */
--encre:#FFFFFF;
```

Les trois niveaux d'encre atténuée se calculent par `color-mix` : **ne pas les
écrire à la main.** Un thème clair n'a ainsi qu'à inverser `--encre`, et tout
suit — bordures, légendes, pistes de graphique.

Pour un thème clair, inverser aussi l'échelle des fonds : `--fond-0` reste le
plus « neutre », les autres s'en écartent.

### 2. Les quatre couleurs de sens

```css
--accent:#FFC247;   /* le sujet, la série dont on parle, l'engagement pris */
--second:#5BC8E8;   /* la seconde série, le réalisé passé                  */
--cible:#A78BFA;    /* ce qu'il reste à atteindre                          */
--alerte:#FF6B8A;   /* ce qui inquiète                                     */
```

**Chacune ne veut dire qu'une chose dans tout le deck.** C'est la règle qui rend
un graphique lisible sans légende, et c'est celle qu'on casse sans s'en
apercevoir en réutilisant l'accent pour « faire joli ».

Contrainte de projection : **deux teintes voisines sont indiscernables sur un
vidéoprojecteur.** Il faut un écart de teinte, pas un écart de clarté. Les
valeurs par défaut sont espacées d'au moins 54° sur la roue chromatique.
Vérifier l'écart avant d'adopter une palette de marque — une charte conçue pour
l'écran n'est pas conçue pour une salle.

Si la marque n'offre qu'une couleur forte, la donner à `--accent` et construire
les trois autres par écart de teinte plutôt que par variation de la même.

### 3. La rampe catégorielle

```css
--serie-1 … --serie-5
```

Pour un graphique à plusieurs parts, où une couleur ne désigne qu'une catégorie
et non un sens. Par défaut elle réutilise accent, second et cible, plus un vert
et un gris. Au-delà de cinq parts, regrouper.

### 4. La typographie

```css
--police:"Inter", …;
--t-titre:56px;  --t-heros:184px;  /* etc. */
```

Pour une police de marque, la charger dans `index.html` — `@font-face` sur un
fichier local, ou un `<link>` — puis la nommer en tête de `--police`.

**Garder une police système en fin de pile.** Sur la machine d'un orateur qui
n'a ni réseau ni la fonte installée, c'est elle qui sauve la séance. Et préférer
un fichier local à un lien vers un service en ligne : un deck ne doit dépendre
de rien.

Les tailles sont en pixels de scène (1600 × 900). **Le plancher est 24 px** :
ne jamais descendre un corps en dessous pour faire tenir un texte — couper le
texte. Si une police de marque rend plus petit à taille égale, remonter les
jetons plutôt que serrer les écrans.

### 5. Ombres et cadres

```css
--ombre-haute / --ombre-basse   /* portées des images */
--cadre-image                   /* fond derrière un QR code ou une vignette */
```

Sur un thème clair, alléger franchement les ombres : une ombre calibrée pour du
sombre vire au sale sur du papier.

## Vérifier un thème

Trois contrôles, dans cet ordre :

1. **Aucun jeton manquant.** Un `var()` non défini se résout en vide, et le
   composant disparaît sans erreur en console.

   ```js
   getComputedStyle(document.documentElement).getPropertyValue('--accent')
   ```

2. **Tous les écrans, dans le nouveau thème.** Parcourir en `?static=1` : un
   texte sombre resté sur un fond sombre saute aux yeux.

3. **En conditions réelles.** Un écart de teinte suffisant sur un portable peut
   disparaître sur le vidéoprojecteur de la salle. Si l'enjeu est important,
   projeter avant.

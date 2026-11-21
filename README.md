# deck-anime

Un skill pour construire une présentation web animée — scène fixe, animations
pas à pas, notes de l'orateur, sommaire, minuteur. Sans dépendance, sans build :
un fichier qu'on ouvre.

L'identité visuelle tient dans un seul fichier de thème, donc le même moteur
s'habille aux couleurs de n'importe quelle marque.

```sh
cp -r deck-anime/gabarit mon-deck && cd mon-deck && open index.html
```

## Ce qu'il contient

| | |
|---|---|
| `SKILL.md` | Le point d'entrée : principes, marche à suivre, pièges |
| `references/ecrire.md` | Ce qui va sur un écran. **À lire en premier** |
| `references/theme.md` | Habiller le deck : couleurs, typo, contraintes de projection |
| `references/moteur.md` | Le moteur : scène fixe, pas, modes, cycle d'écran |
| `references/outils.md` | La boîte à outils de dessin, signatures comprises |
| `references/verifier.md` | La méthode de vérification en navigateur |
| `gabarit/` | Un deck de démonstration qui tourne |
| `themes/` | Trois thèmes prêts : ardoise, papier, contraste |
| `outils/audit.sh` | Mesure la charge éditoriale, écran par écran |

## La boîte à outils

`barres()` histogramme vertical, avec repère et barres creuses · `anneau()`
répartition qui tourne puis se déforme d'un état à l'autre, étiquettes placées
automatiquement et lignes de rappel · `histo()` série longue lue comme une forme
· `courbe()` · `compteJusqua()` et `tweenNombre()` compteurs animés ·
`grillePoints()` · `chips()`, `cartes()`, `colonnes()`.

Aucune couleur n'est écrite dans le JavaScript : tout passe par les jetons du
thème.

## Installer

```sh
git clone <url-du-depot> ~/.claude/skills/deck-anime
```

Puis ouvrir une nouvelle session Claude Code — les skills locaux sont lus au
démarrage.

## Avec un autre agent que Claude

Le contenu est portable : `SKILL.md` et les références sont du Markdown
ordinaire, le gabarit est du HTML/CSS/JS sans dépendance. Rien n'est propre à
Claude.

Ce qui ne se transporte pas automatiquement, c'est le mécanisme de découverte —
le dossier `~/.claude/skills/` et le déclenchement par la `description`. Pour un
autre agent, il faut le lui désigner : renommer `SKILL.md` selon la convention
de l'outil, ou simplement pointer l'agent sur le dossier.

La frontière qui compte n'est pas la marque du modèle, c'est **ce dont l'agent
dispose** :

- **Avec un système de fichiers et un shell** (agent de code) : tout marche —
  copier le gabarit, écrire les écrans, piloter le navigateur, lancer l'audit.
- **En conversation seule** (assistant de chat) : on garde la méthode et le
  code, on perd la boucle de vérification. Or c'est elle qui fait la qualité.

## Origine et licence

Le moteur et la méthode éditoriale dérivent de
[deck-motion](https://github.com/simonparisot/deck-motion) (MIT). Les outils de
dessin, le système de thème et les références ont été écrits par-dessus.

MIT.

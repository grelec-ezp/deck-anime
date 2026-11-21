# Ce qui va sur un écran

**À lire avant d'écrire une ligne.** C'est la partie qu'on rate le plus souvent,
et la seule que la salle remarque.

## La règle dont tout le reste découle

**L'écran ne dit pas ce que dit l'orateur.** Il montre ce que la parole ne peut
pas montrer : un ordre de grandeur, une forme, une comparaison, un rapport.
Tout ce qui peut se dire doit se dire, pas s'écrire.

Un écran qu'on peut lire à voix haute est un écran raté. Si la salle lit, elle
n'écoute pas — et elle lit toujours plus vite qu'on ne parle.

## Les limites

Ce ne sont pas des suggestions. Un écran au-dessus se coupe en deux.

| Limite | Valeur |
|---|---|
| Idées par écran | **une** |
| Mots visibles, chiffre héros mis à part | **15 au plus**, 25 pour une citation |
| Objets visuels par écran | **un** : un chiffre, ou un graphique, ou une image |
| Puces dans une liste | **3 au plus**, et zéro vaut mieux |
| Taille de corps minimale | **24 px** sur la scène de 1600 × 900 |
| Temps sur un écran | 30 à 60 secondes |

La taille minimale est une contrainte déguisée : **si le texte doit rétrécir
pour tenir, c'est qu'il y en a trop.** On ne réduit jamais le corps, on coupe.

## La forme d'un écran qui marche

Trois blocs, jamais plus :

1. **Une affirmation courte**, en haut. Elle énonce la conclusion, pas le sujet.
2. **Un objet visuel**, au milieu. Le chiffre, la courbe, la grille.
3. **Une légende**, sous l'objet. Ce que le chiffre veut dire, en une ligne.

## Les titres

**Le titre porte la conclusion.** « Évolution des ouvertures » ne dit rien.
« Le rythme ne monte plus » dit tout, et la courbe le prouve.

Écrire le titre en dernier, une fois le graphique construit : on sait alors ce
qu'il montre.

Pas de titres d'intendance à l'écran — « Sommaire », « Introduction »,
« Conclusion », « Merci ». La structure appartient au sommaire et à l'orateur.

## Les chiffres

**Un chiffre héros par écran.** Grand, seul, avec son unité. La légende dit ce
qu'il signifie, pas comment il a été calculé.

Trois chiffres côte à côte, c'est déjà un tableau : la salle compare au lieu
d'écouter. Si les trois comptent, ils méritent trois écrans, ou une révélation
en trois pas.

**Arrondir.** « 4 783 » est exact, « près de cinq mille » est ce qu'on retient.
Garder la précision pour les notes et pour la question qui viendra.

**Ne jamais afficher un chiffre dont on ne parle pas.** S'il est à l'écran, la
salle le lit et attend l'explication.

## Les graphiques

**Un graphique, un message.** Si deux choses de la même série sont
intéressantes, faire deux écrans avec deux mises en avant.

Retirer tout ce qui ne sert pas le propos : les lignes de grille, l'axe des
ordonnées, les valeurs sur chaque barre, une légende qui répète les couleurs.
Ce qui reste doit se lire en deux secondes.

**Mettre en avant plutôt que tout montrer.** Griser la série de référence,
colorer celle dont on parle. C'est à ça que servent les pas : la courbe entière
d'abord, puis la partie qui compte.

**Poser `max` explicitement** quand le rapport entre les barres est le propos :
sans lui la plus haute remplit toute la hauteur et exagère l'écart.

Jamais de camembert à plus de cinq parts, jamais deux axes verticaux.

## Le texte

**Pas de listes à puces.** Une liste est un plan, pas un écran. Si trois points
comptent vraiment, en faire trois pas qui arrivent au fil de la parole — la
salle suit alors l'exposé au lieu de lire en avance.

**Pas de phrases complètes dans le corps.** Une affirmation courte, sans verbe
si possible. La grammaire appartient à l'orateur.

**Pas de sources à l'écran.** Elles vont dans les notes. On les donne à voix
haute si on les demande.

**Pas de logo sur chaque écran**, pas de numéro de page, pas de bandeau. Ça
mange l'attention et ne rend rien.

## Le rythme sur quarante minutes

**Alterner les densités.** Un écran chargé — un graphique qu'on commente — se
paie avec deux écrans légers : un chiffre seul, une affirmation seule. Une série
de graphiques épuise la salle en dix minutes.

**Un écran de chapitre entre les parties.** Un titre seul sur un fond nu. Il ne
dit rien de neuf, il donne le repère que la barre de progression ne donne pas,
et il offre à l'orateur le temps de changer de sujet.

**Finir sur une image, pas sur un tableau récapitulatif.** Le dernier écran
reste affiché pendant les questions ; qu'il porte le message, pas le résumé de
ce qu'on vient de dire.

## Vérifier

`outils/audit.sh` mesure ces limites sur un vrai deck : mots visibles par écran,
nombre de blocs de texte, plus petit corps rendu, débordement hors de la scène.

```sh
./outils/audit.sh http://127.0.0.1:8790/index.html
```

Il ne remplace pas le jugement. Un écran de citation dépasse légitimement les
quinze mots, et l'audit compte les libellés d'axe et les noms de canaux comme de
la prose — un écran de graphique signalé à 18 mots dont 8 sont des noms de mois
n'est pas un écran chargé. Mais un deck dont la moitié des écrans est signalée
est un deck que la salle lira au lieu de l'écouter.

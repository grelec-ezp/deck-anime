# Vérifier

Une règle : **ne jamais livrer ce qu'on n'a pas regardé tourner dans un
navigateur.** Relire le code ne prouve rien. Les bugs de ce genre de deck vivent
pendant l'animation, entre deux états stables.

## Servir en local

Ouvrir depuis `file://` suffit pour regarder. Pour toute mesure, servir en HTTP.

```sh
cd mon-deck && python3 -m http.server 8790
```

## Le tour de contrôle, à chaque livraison

Avec n'importe quel pilote de navigateur headless — `$B` ci-dessous.

```sh
$B goto "http://127.0.0.1:8790/index.html"
$B viewport 1600x900
$B js "JSON.stringify(Lecteur.ou())"      # on est sur le premier écran
$B console --errors                        # aucune erreur
$B js "Array.prototype.filter.call(document.images,function(i){return i.complete&&i.naturalWidth===0}).length"
```

La dernière ligne compte les images cassées. Elle doit valoir zéro.

## Parcourir tous les écrans

```js
(function () {
  var b = [];
  Lecteur.ecrans.forEach(function (id, i) {
    Lecteur.va(i, 99);
    var a = document.querySelector('.ecran.est-actif');
    if (!a || a.id !== id) b.push(id);
  });
  return b.length ? b.join(',') : 'tous appariés';
})()
```

Vérifier aussi l'inverse — une `<section>` sans entrée dans `ECRANS` :

```js
[].filter.call(document.querySelectorAll('.ecran'),
  function (e) { return Lecteur.ecrans.indexOf(e.id) < 0; }).map(function (e) { return e.id; })
```

## Le piège des captures au repos

Une capture prise après trois secondes montre l'état final. Elle ne montre pas
que le graphique s'est affiché en entier avant de s'animer, ni que deux éléments
se sont chevauchés pendant une demi-seconde.

**Échantillonner à des instants précis**, ou mieux, **interroger l'état** :

```js
Lecteur.va(2, 1);                                   // arrivée
document.querySelector('#courbe .trait').style.strokeDashoffset   // = longueur
// 3 s plus tard
document.querySelector('#courbe .trait').style.strokeDashoffset   // = 0
```

## Tester le retour sur un écran

C'est le test qui trouve la plus grosse famille de bugs. Un écran correct à la
première visite peut être cassé à la seconde, parce que `construit()` ne rejoue
pas.

```js
Lecteur.va(2, 99);   // première visite, animation complète
Lecteur.va(5, 1);    // on va ailleurs
Lecteur.va(2, 1);    // on revient : tout doit être revenu à zéro
```

## Suivre le vrai parcours

Ne pas conclure d'un enchaînement de `va(i, n)` rapprochés : le moteur laisse
220 ms d'animation de sortie, et y revenir pendant ce délai donne des mesures
fausses. Pour juger d'une animation, suivre le chemin réel :

```js
Lecteur.va(ecranPrecedent, 99);   // on épuise l'écran d'avant
Lecteur.suivant();                // puis on avance à la flèche
```

Deux faux bugs ont déjà été « trouvés » de cette manière avant d'être rendus à
ce qu'ils étaient : des artefacts du harnais de test.

## Vérifier ce qui est visible, pas ce qui est déclaré

`element.hidden = true` ne cache rien si une règle CSS impose un `display`.

```js
getComputedStyle(document.getElementById('sommaire')).display   // 'none' attendu
```

Toujours interroger `getComputedStyle`. La propriété `hidden` dit ce qu'on a
demandé, pas ce qui se passe.

Attention aussi à la **spécificité** : une règle à quatre classes l'emporte sur
une règle à trois, quel que soit l'ordre d'écriture. Un liseré qui refuse de
disparaître vient presque toujours de là.

## Éditer un fichier sans se tromper

Tout script de remplacement doit vérifier son ancre. Sans ça, un `replace` qui
ne correspond à rien échoue en silence, et on débogue une modification qui n'a
jamais été écrite.

```python
def patch(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    for old, new in pairs:
        assert s.count(old) == 1, (path, s.count(old), old[:70])
        s = s.replace(old, new)
    io.open(path, 'w', encoding='utf-8').write(s)
```

`count == 1` attrape les deux échecs : l'ancre absente et l'ancre ambiguë.
Attention aux apostrophes : `'` et `’` ne sont pas le même caractère, et le
texte de présentation en est plein.

## L'audit de charge

```sh
./outils/audit.sh http://127.0.0.1:8790/index.html
```

Il mesure mots visibles, blocs de texte, plus petit corps rendu, débordements.
Il connaît `Lecteur` et `.ecran.est-actif`.

**Il a ses faux positifs** et il faut les connaître : il compte les libellés
d'axe et les noms de canaux comme de la prose. Un écran de graphique signalé à
18 mots dont 8 sont des noms de mois n'est pas un écran chargé. De même, deux
grands chiffres côte à côte sont signalés alors qu'une comparaison avant/après
les justifie.

Avant de faire confiance à une mesure, la passer sur un cas dont on connaît déjà
la réponse. Une métrique qui signale quelque chose qu'on sait bon parle d'elle,
pas du deck.

## Avant d'entrer dans la salle

- Ouvrir depuis `file://` **sur la machine qui présentera**, pas sur la sienne.
- Passer en plein écran et regarder les bords : les bandes noires doivent être
  symétriques, jamais l'image décalée.
- Parcourir tout le deck en `?static=1` : un chiffre vide ou un texte qui
  déborde saute aux yeux.
- Les notes s'affichent dans la même fenêtre, donc aussi sur le vidéoprojecteur.
  Notes sur papier, deck en plein écran : c'est ce qui ne rate jamais.

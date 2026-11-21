/* LE SEUL FICHIER À OUVRIR pour changer le contenu.
   Chiffres, déroulé, notes de l'orateur, rythme.

   Ce gabarit est un deck de démonstration : six écrans qui exercent chacun un
   outil de dessin. Les chiffres sont fictifs et n'ont d'autre rôle que de
   montrer la forme — les remplacer avant toute chose. */

/* 'presentateur' : on avance au clic, chaque pas révèle un élément.
   'auto'         : tout se déroule seul, comme une vidéo. */
var MODE = 'presentateur';

/* Multiplie toutes les durées et tous les délais. 1.3 ralentit de 30 %. */
var TEMPO = 1;

/* Notes de l'orateur ouvertes au démarrage. Mettre true pour répéter. */
var NOTES_AU_DEPART = false;

/* Durée visée, en minutes. Pilote le minuteur, rien d'autre. */
var DUREE_VISEE = 10;

/* Les chiffres. Un seul endroit, pour que rien ne diverge. */
var DATA = {

  /* Un chiffre héros. */
  total: { valeur: 4800 },

  /* barres() — des valeurs comparables, avec un repère et deux barres creuses
     pour ce qui n'est pas encore acquis. */
  etapes: {
    items: [
      { nom: 'au départ',  valeur: 1200 },
      { nom: 'aujourd’hui', valeur: 2400 },
      { nom: 'prévu',       valeur: 4800, creuse: true },
      { nom: 'visé',        valeur: 6000, creuse: true, ton: 'cible' }
    ],
    max: 8000,
    repere: { valeur: 8000, texte: 'ambition initiale' }
  },

  /* anneau() — une répartition, et son état d'arrivée. Les séries gardent leur
     ordre et leur couleur d'un état à l'autre : c'est ce qui rend le
     glissement lisible. */
  repartition: {
    series: [
      { nom: 'Direct',      ton: 's-1' },
      { nom: 'Recherche',   ton: 's-2' },
      { nom: 'Social',      ton: 's-3' },
      { nom: 'Partenaires', ton: 's-4' },
      { nom: 'Autres',      ton: 's-5' }
    ],
    avant:  { total: 2400, parts: [40, 30, 20, 7, 3] },
    apres:  { total: 6000, parts: [28, 30, 24, 12, 6] }
  },

  /* histo() — une série longue qu'on lit comme une forme, pas comme des
     valeurs. Le réalisé, puis l'engagement. */
  serie: {
    reel: [31, 38, 35, 44, 52, 49, 61, 58, 72, 69, 80, 77, 91, 88, 96],
    projete: [118, 131, 144, 152, 167, 175, 188, 196, 190, 171, 148],
    reperes: [{ i: 0, texte: 'Début' }, { i: 14, texte: 'Aujourd’hui' },
              { i: 25, texte: 'Fin' }]
  }
};

/* Le déroulé. L'ordre ici est l'ordre de lecture.
     id       identifiant de la <section> dans index.html
     titre    ce qu'affiche le sommaire
     chapitre regroupe les écrans dans le sommaire
     pas      un délai en ms par étape, en mode auto ; sa longueur
              donne le nombre de clics en mode présentateur
     duree    secondes à l'écran en mode auto
     notes    ce que dit l'orateur, et ce que l'écran ne dit pas */
var ECRANS = [

  { id: 'ouverture', titre: 'Ouverture', chapitre: 'Démonstration',
    pas: [400], duree: 8,
    notes: 'Écran de chapitre : un titre seul sur un fond nu.\n'
         + 'Ne pas le lire à voix haute.' },

  { id: 'chiffre', titre: 'Un chiffre', chapitre: 'Démonstration',
    pas: [400, 1200], duree: 16,
    notes: 'compteJusqua() anime le compteur. Annoncer le chiffre avant que\n'
         + 'l’animation finisse, sinon la salle attend au lieu d’écouter.' },

  { id: 'etapes', titre: 'Des barres', chapitre: 'Démonstration',
    pas: [500, 2000, 3400, 4800], duree: 32,
    notes: 'barres() : quatre valeurs, deux pleines et deux creuses, plus un\n'
         + 'repère en pointillés. Une barre pas encore levée ne montre rien —\n'
         + 'ni son contour ni son nom.' },

  { id: 'repartition', titre: 'Un anneau', chapitre: 'Démonstration',
    pas: [400, 1400, 4200, 5600], duree: 40,
    notes: 'anneau() : la roue tourne avant de se caler, puis se déforme vers\n'
         + 'le second état. Les étiquettes se placent toutes seules et une ligne\n'
         + 'de rappel relie celles qui ont dû s’écarter de leur quartier.' },

  { id: 'serie', titre: 'Un histogramme', chapitre: 'Démonstration',
    pas: [400, 1400, 3000, 4600], duree: 30,
    notes: 'histo() : une série longue qu’on lit comme une forme. Une couleur\n'
         + 'pour le réalisé, une autre pour l’engagement, un séparateur entre.' },

  { id: 'jalons', titre: 'Une liste', chapitre: 'Démonstration',
    pas: [400, 1500, 2600, 3700], duree: 28,
    notes: 'Trois points, un par clic. Au-delà de trois, couper en deux écrans.\n'
         + 'Dernier écran : y rester pendant les questions.' }
];

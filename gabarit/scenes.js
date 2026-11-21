/* Moteur d'écrans et outils de dessin.
   construit() une fois, entre() à chaque arrivée, pas(n) à chaque étape.

   Règle du moteur, apprise à la dure : tout ce qui doit repartir de zéro va
   dans entre(), jamais dans construit(). Sinon l'élément reste dans son état
   final au retour sur l'écran et s'affiche en entier avant de se réanimer. */
(function (global) {
'use strict';

/* Mouvement réduit : réglage système ou ?statique=1. */
var FORCE = /[?&]statique=1/.test(global.location.search);
var REDUIT = FORCE || (global.matchMedia &&
             global.matchMedia('(prefers-reduced-motion: reduce)').matches);
if (FORCE) document.documentElement.classList.add('reduit');

function q(sel, root) { return (root || document).querySelector(sel); }
function qa(sel, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}
function el(tag, cls, html) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
function svgEl(tag, attrs) {
  var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  return n;
}
/* Espace fine insécable tous les trois chiffres. */
function nbsp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

function facteurTempo() {
  return (typeof TEMPO === 'number' && TEMPO > 0) ? TEMPO : 1;
}

/* ---- Outils de dessin ---- */

/* Compteur animé. dec = nombre de décimales, virgule française.
   En mouvement réduit, pose directement la valeur finale. */
function compteJusqua(node, cible, duree, suffixe, format, dec) {
  suffixe = suffixe || '';
  dec = dec || 0;
  duree = duree * facteurTempo();
  var pose = function (v) {
    var t = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
    if (format === 'fr') t = nbsp(t);
    node.textContent = t + suffixe;
  };
  if (REDUIT || !duree) { pose(cible); return; }
  var t0 = null;
  function image(t) {
    if (t0 === null) t0 = t;
    var p = Math.min(1, (t - t0) / duree);
    pose(cible * (1 - Math.pow(1 - p, 3)));            /* décélère */
    if (p < 1) requestAnimationFrame(image);
  }
  requestAnimationFrame(image);
}

/* Cache un tracé SVG. À appeler dans entre(), jamais dans construit(). */
function cachePath(path) {
  var L = path.getTotalLength() || 3000;
  path.style.transition = 'none';
  path.style.strokeDasharray = L;
  path.style.strokeDashoffset = L;
}

function tracePath(path, duree, delai) {
  cachePath(path);
  void path.getBoundingClientRect();                      /* force le reflow */
  path.style.transition = 'stroke-dashoffset ' +
    (REDUIT ? 0.14 : duree * facteurTempo() / 1000) + 's ' +
    (REDUIT ? 0 : (delai || 0) / 1000) + 's cubic-bezier(.16,1,.3,1)';
  path.style.strokeDashoffset = 0;
}

/* Grille de points. Rend le tableau, pour l'allumer ensuite. */
function grillePoints(hote, nombre, colonnes) {
  hote.style.gridTemplateColumns = 'repeat(' + colonnes + ', 1fr)';
  var points = [];
  for (var i = 0; i < nombre; i++) {
    var d = el('i', 'point');
    hote.appendChild(d);
    points.push(d);
  }
  return points;
}

/* Allume une part des points, en les répartissant au hasard. */
function allumeRatio(points, ratio, classe, parImage) {
  classe = classe || 'vif';
  var cible = Math.round(points.length * ratio), i = 0;
  var ordre = points.map(function (p, k) { return k; });
  for (var k = ordre.length - 1; k > 0; k--) {
    var j = Math.floor(Math.random() * (k + 1));
    var t = ordre[k]; ordre[k] = ordre[j]; ordre[j] = t;
  }
  if (REDUIT) {
    ordre.slice(0, cible).forEach(function (k) { points[k].classList.add(classe); });
    return;
  }
  var pas = Math.max(1, parImage || 12);
  (function vague() {
    for (var n = 0; n < pas && i < cible; n++, i++) points[ordre[i]].classList.add(classe);
    if (i < cible) requestAnimationFrame(vague);
  })();
}

/* Courbe pleine largeur, avec aire dégradée. Rend le tracé. */
function courbe(hote, serie, options) {
  options = options || {};
  var n = serie.length, W = 1000, H = 300, x0 = 8, x1 = 992, yB = 258;
  var max = options.max || Math.max.apply(null, serie);
  var pts = serie.map(function (v, i) {
    return [x0 + i / (n - 1) * (x1 - x0), yB - v / max * (yB - 20)];
  });
  var d = pts.map(function (p, i) {
    return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  }).join(' ');

  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' });
  var defs = svgEl('defs');
  var grad = svgEl('linearGradient', { id: 'aireCourbe', x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': 'currentColor', 'stop-opacity': .26 }));
  grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': 'currentColor', 'stop-opacity': 0 }));
  defs.appendChild(grad); svg.appendChild(defs);

  svg.appendChild(svgEl('path', { class: 'courbe-aire',
    d: d + ' L' + x1 + ' ' + yB + ' L' + x0 + ' ' + yB + ' Z' }));
  var trace = svgEl('path', { class: 'courbe-trait', d: d });
  svg.appendChild(trace);
  svg.appendChild(svgEl('line', { class: 'courbe-axe', x1: x0, y1: yB, x2: x1, y2: yB }));
  hote.appendChild(svg);
  return trace;
}

/* Diagramme en barres.
   items   [{ nom, valeur, texte, ton, creuse }]
   options { max, repere:{ valeur, texte } }
   Rend { leve(i), baisse(), montreRepere(on) }. */
function barres(hote, items, options) {
  options = options || {};
  var max = options.max || Math.max.apply(null, items.map(function (b) { return b.valeur; }));
  /* Hauteur utile : la boîte moins la place réservée à l'étiquette du haut. */
  var HAUT = 60;
  var noeuds = items.map(function (b) {
    var n = el('div', 'barre' + (b.ton ? ' ' + b.ton : '') + (b.creuse ? ' creuse' : ''));
    var tige = el('div', 'tige');
    var val = el('div', 'val', b.texte);
    var nom = el('div', 'nom', b.nom);
    n.appendChild(val); n.appendChild(tige); n.appendChild(nom);
    hote.appendChild(n);
    return { hote: n, tige: tige, val: val, ratio: b.valeur / max };
  });

  var repere = null;
  if (options.repere) {
    repere = el('div', 'repere', '<b>' + options.repere.texte + '</b>');
    repere.dataset.ratio = options.repere.valeur / max;
    hote.appendChild(repere);
  }

  function utile() { return hote.clientHeight - parseFloat(getComputedStyle(hote).paddingBottom) - HAUT; }

  return {
    baisse: function () {
      noeuds.forEach(function (n) {
        /* « vide » masque le liseré des barres creuses et leur libellé : sinon
           une barre à zéro laisse un trait pointillé écrasé sur l'axe et son
           nom, et se voit avant d'être levée. */
        n.hote.classList.add('vide');
        n.tige.style.transition = 'none';
        n.tige.style.height = '0px';
        n.val.style.opacity = 0;
        n.val.style.bottom = '0px';
      });
      if (repere) { repere.style.opacity = 0; repere.style.bottom = '0px'; }
      void hote.getBoundingClientRect();
      noeuds.forEach(function (n) { n.tige.style.transition = ''; });
    },
    leve: function (i, direct) {
      var n = noeuds[i]; if (!n) return;
      n.hote.classList.remove('vide');
      var h = Math.round(n.ratio * utile());
      if (direct || REDUIT) n.tige.style.transition = 'none';
      n.tige.style.height = h + 'px';
      n.val.style.bottom = (h + 14) + 'px';
      n.val.style.opacity = 1;
      if (direct || REDUIT) { void n.tige.getBoundingClientRect(); n.tige.style.transition = ''; }
    },
    montreRepere: function () {
      if (!repere) return;
      var pad = parseFloat(getComputedStyle(hote).paddingBottom);
      repere.style.bottom = (pad + repere.dataset.ratio * utile()) + 'px';
      repere.style.opacity = 1;
    }
  };
}

/* Tween d'un nombre entre deux valeurs. compteJusqua part toujours de zéro ;
   ici il faut passer de 45 % à 35 % sans repasser par 0. */
function tweenNombre(node, de, vers, duree, suffixe, format, dec) {
  duree = duree * facteurTempo();
  var pose = function (v) {
    var t = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
    if (format === 'fr') t = nbsp(t);
    node.textContent = t + (suffixe || '');
  };
  if (REDUIT || !duree) { pose(vers); return; }
  var t0 = null;
  requestAnimationFrame(function image(t) {
    if (t0 === null) t0 = t;
    var p = Math.min(1, (t - t0) / duree);
    pose(de + (vers - de) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(image);
  });
}

/* Anneau de répartition qui se déforme d'un mix à l'autre.
   canaux [{ nom, ton }] — les valeurs arrivent par pose().
   Rend { pose(parts, direct), efface() }.

   Chaque quartier est un cercle entier dont on ne montre qu'un arc :
   stroke-dashoffset donne sa longueur, une rotation CSS son point de départ.
   Les deux sont animables, donc le passage d'un mix à l'autre se fait sans
   reconstruire quoi que ce soit — c'est ce glissement qui porte le propos.

   Les étiquettes sont posées à l'angle médian de leur quartier. Deux quartiers
   minuscules qui se suivent donnent deux étiquettes qui se chevauchent — et un
   écart exprimé en degrés ne suffit pas : en haut de l'anneau les étiquettes se
   gênent horizontalement, sur une largeur qui dépend du mot. On résout donc les
   collisions sur les boîtes réellement mesurées, et une ligne de rappel relie
   l'étiquette à son quartier dès qu'elle a dû s'en écarter. */
function anneau(hote, canaux, o) {
  o = o || {};
  /* Géométrie paramétrable : le même outil sert l'anneau principal, au centre
     et large, et les petits anneaux posés à gauche. */
  var W = 1408, H = o.H || 556, cx = o.cx || 704, cy = o.cy || 268,
      R = o.R || 148, EP = o.EP || 46, RL = o.RL || 244;
  var C = 2 * Math.PI * R;
  hote.style.height = H + 'px';
  var centre = q('.anneau-centre', hote);
  if (centre) { centre.style.left = cx + 'px'; centre.style.top = cy + 'px'; }

  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'anneau-svg' });
  svg.appendChild(svgEl('circle', { class: 'anneau-piste', cx: cx, cy: cy, r: R,
                                    fill: 'none', 'stroke-width': EP }));

  var quartiers = canaux.map(function (c) {
    var n = svgEl('circle', { class: 'anneau-part ' + c.ton, cx: cx, cy: cy, r: R,
                              fill: 'none', 'stroke-width': EP, 'stroke-dasharray': C });
    n.style.transformOrigin = cx + 'px ' + cy + 'px';
    n.style.strokeDashoffset = C;
    svg.appendChild(n);
    return n;
  });
  hote.insertBefore(svg, hote.firstChild);

  var rappels = canaux.map(function () {
    var l = svgEl('polyline', { class: 'anneau-rappel', points: '' });
    svg.appendChild(l);
    return l;
  });

  var etiquettes = canaux.map(function (c) {
    var e = el('div', 'anneau-etiquette ' + c.ton,
               '<b>' + c.nom + '</b><span data-pc>00 %</span>');
    hote.appendChild(e);
    return e;
  });
  etiquettes.forEach(function (e) { q('[data-pc]', e).textContent = ''; });

  function point(a, r) {
    var t = a * Math.PI / 180;
    return { x: cx + r * Math.sin(t), y: cy - r * Math.cos(t) };
  }

  /* Rayon d'une étiquette : assez loin pour que sa boîte ne morde pas sur
     l'anneau. Un rayon fixe ne suffit pas — une étiquette posée à l'horizontale
     s'approche du tracé de sa demi-largeur, bien plus que de sa demi-hauteur.
     On projette donc la demi-boîte sur la direction de l'angle. */
  function rayon(i, a, T) {
    var t = a * Math.PI / 180;
    return Math.max(RL, R + EP / 2 + 20
      + T[i].w / 2 * Math.abs(Math.sin(t)) + T[i].h / 2 * Math.abs(Math.cos(t)));
  }
  function pointEtiq(i, a, T) { return point(a, rayon(i, a, T)); }

  /* Écarte les étiquettes qui se recouvrent. Deux points importants :
     — on mesure au moment de poser, pas à la construction : offsetWidth vaut 0
       tant que l'écran est en display:none, et aucune collision ne serait vue ;
     — on écarte symétriquement, chaque voisine reculant d'un demi-pas. Pousser
       toujours vers l'avant fait dériver la dernière sur tout le tour. */
  function tailles() {
    return etiquettes.map(function (e) {
      return { w: e.offsetWidth || 170, h: e.offsetHeight || 74 };
    });
  }
  function ecarte(poses, T) {
    var MARGE = 18, INCR = 1.2;
    function seChevauchent(i, j, ai, aj) {
      var A = pointEtiq(i, ai, T), B = pointEtiq(j, aj, T);
      return Math.abs(A.x - B.x) < (T[i].w + T[j].w) / 2 + MARGE &&
             Math.abs(A.y - B.y) < (T[i].h + T[j].h) / 2 + MARGE;
    }
    for (var tour = 0; tour < 500; tour++) {
      var bouge = false;
      for (var i = 1; i < poses.length; i++) {
        if (seChevauchent(i - 1, i, poses[i - 1], poses[i])) {
          poses[i - 1] -= INCR / 2; poses[i] += INCR / 2; bouge = true;
        }
      }
      /* le tour se referme : la dernière peut recouvrir la première */
      var d = poses.length - 1;
      if (d > 0 && seChevauchent(d, 0, poses[d], poses[0] + 360)) {
        poses[d] -= INCR / 2; poses[0] += INCR / 2; bouge = true;
      }
      if (!bouge) break;
    }
    return poses;
  }

  var courant = null;
  var minuteurs = [];

  var api = {
    efface: function () {
      minuteurs.forEach(clearTimeout); minuteurs = [];
      quartiers.forEach(function (n) {
        n.style.transition = 'none';
        n.style.strokeDashoffset = C;
        n.style.transform = 'rotate(-90deg)';
      });
      etiquettes.forEach(function (e) {
        e.style.transition = 'none';
        e.classList.remove('est-on');
        q('[data-pc]', e).textContent = '';
      });
      rappels.forEach(function (l) { l.setAttribute('points', ''); });
      void svg.getBoundingClientRect();
      quartiers.forEach(function (n) { n.style.transition = ''; });
      etiquettes.forEach(function (e) { e.style.transition = ''; });
      courant = null;
    },

    /* etiquettesSeules : ne replace que les étiquettes, sans toucher aux arcs.
       C'est ce dont tourne() a besoin pour les faire arriver une fois la roue
       calée, sans interrompre la rotation en cours. */
    pose: function (parts, direct, etiquettesSeules) {
      var total = parts.reduce(function (t, p) { return t + p; }, 0);

      /* angles médians, puis écartement des étiquettes trop proches */
      var depart = 0, milieux = [], departs = [];
      parts.forEach(function (p) {
        departs.push(depart / total);
        milieux.push((depart + p / 2) / total * 360);
        depart += p;
      });
      /* La largeur dépend du texte affiché : on pose la valeur finale avant de
         mesurer, le tween la rejouera juste après. */
      etiquettes.forEach(function (e, i) {
        q('[data-pc]', e).textContent = parts[i] + ' %';
      });
      var poses = ecarte(milieux.slice(), tailles());


      if (!etiquettesSeules) quartiers.forEach(function (n, i) {
        if (direct || REDUIT) n.style.transition = 'none';
        n.style.strokeDashoffset = C - (parts[i] / total) * C;
        n.style.transform = 'rotate(' + (-90 + departs[i] * 360) + 'deg)';
        if (direct || REDUIT) { void n.getBoundingClientRect(); n.style.transition = ''; }
      });

      var T = tailles();
      etiquettes.forEach(function (e, i) {
        var p = pointEtiq(i, poses[i], T);
        e.style.left = p.x + 'px';
        e.style.top  = p.y + 'px';
        e.classList.add('est-on');
        var pc = q('[data-pc]', e);
        tweenNombre(pc, courant ? courant[i] : 0, parts[i], direct ? 0 : 900, ' %');

        /* Ligne de rappel dès que l'étiquette a été écartée de son quartier. */
        var derive = Math.abs(poses[i] - milieux[i]);
        if (derive < 4) { rappels[i].setAttribute('points', ''); return; }
        var rInt = R + EP / 2 + 8, rExt = rayon(i, poses[i], T) - T[i].h / 2 - 10;
        var a = point(milieux[i], rInt);
        var b = point(milieux[i], rExt);
        var c = point(poses[i], rExt);
        rappels[i].setAttribute('points',
          a.x + ',' + a.y + ' ' + b.x + ',' + b.y + ' ' + c.x + ',' + c.y);
      });

      courant = parts.slice();
    },

    /* Fait tourner la roue plusieurs tours avant de la caler sur ses parts.
       Les arcs ont d'emblée leur longueur définitive : ce qui tourne est un
       camembert juste, pas des proportions qui s'agitent. Seule la rotation est
       animée, et la courbe décélère en fin de course — d'où l'effet de roue qui
       s'arrête. Les étiquettes n'arrivent qu'ensuite, sinon elles clignotent
       pendant que les couleurs défilent derrière. */
    tourne: function (parts, direct, o) {
      if (direct || REDUIT) { api.pose(parts, true); return; }
      o = o || {};
      var tours = o.tours || 4, duree = (o.duree || 1700) * facteurTempo();
      var total = parts.reduce(function (t, p) { return t + p; }, 0);
      var depart = 0;
      var angles = parts.map(function (p) {
        var a = -90 + depart / total * 360; depart += p; return a;
      });

      quartiers.forEach(function (n, i) {
        n.style.transition = 'none';
        n.style.strokeDashoffset = C - (parts[i] / total) * C;
        n.style.transform = 'rotate(' + (angles[i] - tours * 360) + 'deg)';
      });
      void svg.getBoundingClientRect();
      quartiers.forEach(function (n, i) {
        n.style.transition = 'transform ' + (duree / 1000) + 's cubic-bezier(.16,.72,.26,1)';
        n.style.transform = 'rotate(' + angles[i] + 'deg)';
      });

      minuteurs.push(setTimeout(function () {
        api.pose(parts, false, true);
      }, duree * 0.68));
    }
  };
  return api;
}

/* Histogramme fin, pour une série longue qu'on lit comme une forme.
   cfg { reel:[], projete:[], reperes:[{i, texte}] }
   Rend { monte(de, a, direct), efface() }. Hauteurs en pixels, comme barres(). */
function histo(hote, cfg) {
  var serie = cfg.reel.concat(cfg.projete);
  var max = Math.max.apply(null, serie);
  var piste = el('div', 'histo-piste');

  var tiges = serie.map(function (v, i) {
    var b = el('div', 'histo-barre ' + (i < cfg.reel.length ? 'passe' : 'futur'));
    var t = el('i');
    b.appendChild(t);
    piste.appendChild(b);
    return { tige: t, ratio: v / max };
  });

  var sep = el('div', 'histo-sep');
  sep.style.left = (cfg.reel.length / serie.length * 100) + '%';
  piste.appendChild(sep);
  hote.appendChild(piste);

  var axe = el('div', 'histo-axe');
  cfg.reperes.forEach(function (r) {
    var s = el('span', 'histo-repere', r.texte);
    s.style.left = (r.i / (serie.length - 1) * 100) + '%';
    /* Les repères des extrémités débordent si on les centre. */
    if (r.i === 0) s.style.transform = 'translateX(0)';
    else if (r.i >= serie.length - 1) s.style.transform = 'translateX(-100%)';
    axe.appendChild(s);
  });
  hote.appendChild(axe);

  return {
    efface: function () {
      tiges.forEach(function (b) {
        b.tige.style.transition = 'none';
        b.tige.style.transitionDelay = '0ms';
        b.tige.style.height = '0px';
      });
      sep.classList.remove('est-on');
      void piste.getBoundingClientRect();
      tiges.forEach(function (b) { b.tige.style.transition = ''; });
    },
    montreSep: function () { sep.classList.add('est-on'); },
    monte: function (de, a, direct) {
      var H = piste.clientHeight;
      tiges.slice(de, a).forEach(function (b, i) {
        if (direct || REDUIT) b.tige.style.transition = 'none';
        else b.tige.style.transitionDelay = (i * 26 * facteurTempo()) + 'ms';
        b.tige.style.height = Math.round(b.ratio * H) + 'px';
        if (direct || REDUIT) { void b.tige.getBoundingClientRect(); b.tige.style.transition = ''; }
      });
    }
  };
}

/* Colonnes de roadmap. groupes = [{ titre, items, futur }] */
function colonnes(hote, groupes) {
  return groupes.map(function (g) {
    var c = el('div', 'col' + (g.futur ? ' futur' : ''));
    c.appendChild(el('h3', null, g.titre));
    g.items.forEach(function (t) { c.appendChild(el('div', 'item', t)); });
    hote.appendChild(c);
    return c;
  });
}

/* Pastilles. */
function chips(hote, liste) {
  return liste.map(function (t) {
    var c = el('span', 'chip', t);
    hote.appendChild(c);
    return c;
  });
}

/* Cartes d'équipe, avec compteur d'effectif. */
function cartes(hote, equipes) {
  return equipes.map(function (e) {
    var c = el('div', 'carte ' + e.ton);
    c.appendChild(el('i', 'l'));
    c.appendChild(el('h3', null, e.nom));
    var n = el('div', 'n');
    c.appendChild(n);
    c.appendChild(el('div', 'u', 'personnes'));
    hote.appendChild(c);
    return { hote: c, n: n, effectif: e.effectif };
  });
}

/* ---- Les écrans ----
   Chaque entrée reçoit sa <section>. Sans hook pas(), le moteur pose
   simplement la classe pas-1, pas-2 … et le CSS fait le reste. */
var HOOKS = {};

/* ══════════════ LES ÉCRANS ══════════════

   Un hook par écran qui doit dessiner ou compter. Sans hook, la classe .a et
   l'attribut data-pas suffisent à révéler un élément.

     construit(s)      une seule fois, à la première arrivée
     entre(s)          à chaque arrivée — tout ce qui repart de zéro va ICI
     pas(s, n, direct) à chaque étape ; direct vaut true en marche arrière
     sort(s)           en quittant l'écran

   La règle qui coûte le plus cher quand on l'oublie : ce qui doit repartir de
   zéro va dans entre(), jamais dans construit(). Sinon l'élément reste dans son
   état final au retour sur l'écran, et s'affiche en entier avant de se réanimer. */

HOOKS.ouverture = {};

HOOKS.chiffre = {
  entre: function (s) { q('[data-compteur]', s).textContent = ''; },
  pas: function (s, n, direct) {
    if (n === 2) compteJusqua(q('[data-compteur]', s), DATA.total.valeur,
                              direct ? 0 : 1800, '', 'fr');
  }
};

HOOKS.etapes = {
  construit: function (s) {
    var t = DATA.etapes;
    this.g = barres(q('.barres', s), t.items.map(function (b) {
      return { nom: b.nom, valeur: b.valeur, texte: nbsp(b.valeur),
               creuse: b.creuse, ton: b.ton };
    }), { max: t.max, repere: t.repere });
  },
  entre: function () { this.g.baisse(); },
  pas: function (s, n, direct) {
    if (n >= 1) { this.g.leve(0, direct && n > 1); this.g.leve(1, direct && n > 1); }
    if (n >= 2) this.g.leve(2, direct && n > 2);
    /* le repère et la dernière barre arrivent ensemble : la cible ne se lit
       que par rapport à la ligne */
    if (n >= 3) { this.g.montreRepere(); this.g.leve(3, direct && n > 3); }
  }
};

HOOKS.repartition = {
  construit: function (s) {
    this.g = anneau(q('.anneau', s), DATA.repartition.series,
                    { H: 640, cy: 320, R: 200, EP: 40, RL: 275 });
  },
  entre: function (s) {
    this.g.efface();
    q('[data-compteur]', s).textContent = '';
  },
  pas: function (s, n, direct) {
    var m = DATA.repartition, tot = q('[data-compteur]', s);
    if (n === 2) {
      this.g.tourne(m.avant.parts, direct, { tours: 4, duree: 1700 });
      tweenNombre(tot, 0, m.avant.total, direct ? 0 : 1600, '', 'fr');
    }
    if (n === 3) {
      this.g.pose(m.apres.parts, direct);
      tweenNombre(tot, direct ? m.apres.total : m.avant.total,
                  m.apres.total, direct ? 0 : 1400, '', 'fr');
    }
  }
};

HOOKS.serie = {
  construit: function (s) { this.g = histo(q('.histo', s), DATA.serie); },
  entre: function () { this.g.efface(); },
  pas: function (s, n, direct) {
    var b = DATA.serie;
    if (n >= 2) this.g.monte(0, b.reel.length, direct && n > 2);
    if (n >= 3) {
      this.g.monte(b.reel.length, b.reel.length + b.projete.length, direct && n > 3);
      this.g.montreSep();
    }
  }
};

HOOKS.jalons = {};

global.MoteurEcrans = {
  HOOKS: HOOKS, REDUIT: REDUIT, facteurTempo: facteurTempo,
  q: q, qa: qa, el: el, svgEl: svgEl, nbsp: nbsp,
  compteJusqua: compteJusqua, cachePath: cachePath, tracePath: tracePath,
  grillePoints: grillePoints, allumeRatio: allumeRatio, courbe: courbe,
  barres: barres, colonnes: colonnes, chips: chips, cartes: cartes,
  anneau: anneau, histo: histo, tweenNombre: tweenNombre
};

})(window);

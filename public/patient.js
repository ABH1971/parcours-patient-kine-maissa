(function () {
  const token = window.location.pathname.split('/').filter(Boolean).pop();
  const form = document.getElementById('form-patient');
  const zoneInvalide = document.getElementById('zone-invalide');
  const zoneMerci = document.getElementById('zone-merci');
  const etapes = Array.from(document.querySelectorAll('.etape'));
  const progression = document.getElementById('progression');
  const btnPrecedent = document.getElementById('btn-precedent');
  const btnSuivant = document.getElementById('btn-suivant');
  const btnEnvoyer = document.getElementById('btn-envoyer');
  const erreurBox = document.getElementById('erreur');
  const inputRepos = document.getElementById('douleurRepos');
  const valeurRepos = document.getElementById('valeur-repos');
  const inputMouvement = document.getElementById('douleurMouvement');
  const valeurMouvement = document.getElementById('valeur-mouvement');
  const selectCategorie = document.getElementById('categorieMotif');
  const questionsSpecifiquesDiv = document.getElementById('questions-specifiques');
  const etapeSpecifique = document.getElementById('etape-specifique');
  const inputDocuments = document.getElementById('documents');
  const listeFichiers = document.getElementById('liste-fichiers');

  let etapeActuelle = 0;
  let fichiersChoisis = [];

  // Construit la barre de progression
  etapes.forEach(() => {
    const segment = document.createElement('div');
    segment.className = 'segment';
    progression.appendChild(segment);
  });

  function majProgression() {
    const segments = progression.querySelectorAll('.segment');
    segments.forEach((s, i) => s.classList.toggle('fait', i <= etapeActuelle));
  }

  function afficherEtape(index) {
    etapes.forEach((el, i) => el.classList.toggle('masque', i !== index));
    btnPrecedent.classList.toggle('masque', index === 0);
    const estDerniere = index === etapes.length - 1;
    btnSuivant.classList.toggle('masque', estDerniere);
    btnEnvoyer.classList.toggle('masque', !estDerniere);
    erreurBox.classList.add('masque');
    majProgression();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function champsRequisRemplis(index) {
    const section = etapes[index];
    const requis = section.querySelectorAll('[required]');
    for (const champ of requis) {
      if (!champ.value) return false;
    }
    return true;
  }

  btnSuivant.addEventListener('click', () => {
    if (!champsRequisRemplis(etapeActuelle)) {
      erreurBox.textContent = 'Merci de compléter les champs obligatoires avant de continuer.';
      erreurBox.classList.remove('masque');
      return;
    }
    if (etapeActuelle < etapes.length - 1) {
      etapeActuelle++;
      afficherEtape(etapeActuelle);
    }
  });

  btnPrecedent.addEventListener('click', () => {
    if (etapeActuelle > 0) {
      etapeActuelle--;
      afficherEtape(etapeActuelle);
    }
  });

  inputRepos.addEventListener('input', () => {
    valeurRepos.textContent = inputRepos.value;
  });
  inputMouvement.addEventListener('input', () => {
    valeurMouvement.textContent = inputMouvement.value;
  });

  function construireQuestionsSpecifiques() {
    const categorie = selectCategorie.value;
    const questions = (window.QUESTIONNAIRES && window.QUESTIONNAIRES[categorie]) || [];
    questionsSpecifiquesDiv.innerHTML = '';

    if (questions.length === 0) {
      questionsSpecifiquesDiv.innerHTML = '<p class="aide">Pas de question complémentaire pour cette catégorie.</p>';
      return;
    }

    questions.forEach((q) => {
      const bloc = document.createElement('div');
      const label = document.createElement('label');
      label.textContent = q.label;
      label.className = 'premier';
      bloc.appendChild(label);

      if (q.type === 'oui-non') {
        const ligne = document.createElement('div');
        ligne.className = 'ligne-oui-non';
        ligne.innerHTML = `
          <label><input type="radio" name="${q.id}" value="oui"><span>Oui</span></label>
          <label><input type="radio" name="${q.id}" value="non" checked><span>Non</span></label>
        `;
        bloc.appendChild(ligne);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = q.id;
        bloc.appendChild(input);
      }
      questionsSpecifiquesDiv.appendChild(bloc);
    });
  }

  selectCategorie.addEventListener('change', construireQuestionsSpecifiques);

  inputDocuments.addEventListener('change', () => {
    fichiersChoisis = fichiersChoisis.concat(Array.from(inputDocuments.files));
    inputDocuments.value = '';
    afficherListeFichiers();
  });

  function afficherListeFichiers() {
    listeFichiers.innerHTML = '';
    fichiersChoisis.forEach((f, i) => {
      const ligne = document.createElement('div');
      ligne.className = 'fichier';
      ligne.innerHTML = `<span>${f.name}</span><a href="#" data-index="${i}">supprimer</a>`;
      listeFichiers.appendChild(ligne);
    });
    listeFichiers.querySelectorAll('a').forEach((lien) => {
      lien.addEventListener('click', (e) => {
        e.preventDefault();
        fichiersChoisis.splice(Number(lien.dataset.index), 1);
        afficherListeFichiers();
      });
    });
  }

  function collecterQuestionsSpecifiques() {
    const categorie = selectCategorie.value;
    const questions = (window.QUESTIONNAIRES && window.QUESTIONNAIRES[categorie]) || [];
    return questions.map((q) => {
      let reponse;
      if (q.type === 'oui-non') {
        const coche = document.querySelector(`input[name="${q.id}"]:checked`);
        reponse = coche ? coche.value : '';
      } else {
        const input = document.querySelector(`input[name="${q.id}"]`);
        reponse = input ? input.value : '';
      }
      return { question: q.label, reponse };
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnEnvoyer.disabled = true;
    btnEnvoyer.textContent = 'Envoi en cours...';

    const donnees = {
      identite: {
        civilite: document.getElementById('civilite').value,
        prenom: document.getElementById('prenom').value,
        nom: document.getElementById('nom').value,
      },
      categorieMotif: selectCategorie.value,
      motif: document.getElementById('motif').value,
      medecinPrescripteur: document.getElementById('medecinPrescripteur').value,
      antecedents: document.getElementById('antecedents').value,
      traitementsEnCours: document.getElementById('traitementsEnCours').value,
      operationsAnterieures: document.getElementById('operationsAnterieures').value,
      zoneDouloureuse: document.getElementById('zoneDouloureuse').value,
      ancienneteDouleur: document.getElementById('ancienneteDouleur').value,
      circonstancesApparition: document.getElementById('circonstancesApparition').value,
      circonstancesDetail: document.getElementById('circonstancesDetail').value,
      douleurRepos: Number(inputRepos.value),
      douleurMouvement: Number(inputMouvement.value),
      douleurNocturne: document.querySelector('input[name="douleurNocturne"]:checked')?.value === 'oui',
      limitationsQuotidien: document.getElementById('limitationsQuotidien').value,
      activiteProfessionnelle: document.getElementById('activiteProfessionnelle').value,
      sportPratique: document.getElementById('sportPratique').value,
      objectifs: document.getElementById('objectifs').value,
      questionnaireSpecifique: collecterQuestionsSpecifiques(),
    };

    try {
      if (fichiersChoisis.length > 0) {
        const formData = new FormData();
        fichiersChoisis.forEach((f) => formData.append('documents', f));
        await fetch(`/api/patient/${token}/upload`, { method: 'POST', body: formData });
      }

      const reponse = await fetch(`/api/patient/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });

      if (!reponse.ok) throw new Error('Echec envoi');

      form.classList.add('masque');
      zoneMerci.classList.remove('masque');
    } catch (err) {
      erreurBox.textContent = "L'envoi a échoué. Vérifiez votre connexion et réessayez.";
      erreurBox.classList.remove('masque');
      btnEnvoyer.disabled = false;
      btnEnvoyer.textContent = 'Envoyer au cabinet';
    }
  });

  async function init() {
    try {
      const res = await fetch(`/api/patient/${token}`);
      if (!res.ok) throw new Error('invalide');
      const data = await res.json();
      if (data.status === 'rempli') {
        zoneMerci.classList.remove('masque');
        return;
      }
      form.classList.remove('masque');
      construireQuestionsSpecifiques();
      afficherEtape(0);
    } catch (err) {
      zoneInvalide.classList.remove('masque');
    }
  }

  init();
})();

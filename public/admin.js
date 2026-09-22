(function () {
  const zoneLogin = document.getElementById('zone-login');
  const zoneDashboard = document.getElementById('zone-dashboard');
  const zoneFiche = document.getElementById('zone-fiche');
  const erreurLogin = document.getElementById('erreur-login');

  function motDePasse() {
    return sessionStorage.getItem('mdp-cabinet') || '';
  }

  async function appelApi(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'x-admin-password': motDePasse(),
      },
    });
    if (res.status === 401) {
      sessionStorage.removeItem('mdp-cabinet');
      afficherLogin();
      throw new Error('Non authentifié');
    }
    return res;
  }

  function afficherLogin() {
    zoneLogin.classList.remove('masque');
    zoneDashboard.classList.add('masque');
    zoneFiche.classList.add('masque');
  }

  function afficherDashboard() {
    zoneLogin.classList.add('masque');
    zoneDashboard.classList.remove('masque');
    zoneFiche.classList.add('masque');
    chargerPatients();
  }

  document.getElementById('btn-connexion').addEventListener('click', async () => {
    const mdp = document.getElementById('mot-de-passe').value;
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: mdp }),
    });
    if (res.ok) {
      sessionStorage.setItem('mdp-cabinet', mdp);
      afficherDashboard();
    } else {
      erreurLogin.textContent = 'Mot de passe incorrect';
      erreurLogin.classList.remove('masque');
    }
  });

  // ---------- Création d'un nouveau lien patient ----------
  document.getElementById('btn-creer').addEventListener('click', async () => {
    const label = document.getElementById('nouveau-label').value;
    const rdvDate = document.getElementById('nouveau-rdv').value;
    if (!label.trim()) return;

    const res = await appelApi('/api/admin/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, rdvDate }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const lienComplet = `${window.location.origin}${data.lien}`;

    document.getElementById('lien-genere').value = lienComplet;
    document.getElementById('texte-sms').textContent =
      `Bonjour, avant votre séance de kiné, merci de remplir ce court formulaire : ${lienComplet}`;
    document.getElementById('resultat-creation').classList.remove('masque');

    document.getElementById('nouveau-label').value = '';
    document.getElementById('nouveau-rdv').value = '';

    chargerPatients();
  });

  document.getElementById('btn-copier').addEventListener('click', () => {
    const champ = document.getElementById('lien-genere');
    champ.select();
    navigator.clipboard?.writeText(champ.value);
  });

  // ---------- Liste des patients ----------
  async function chargerPatients() {
    const res = await appelApi('/api/admin/patients');
    if (!res.ok) return;
    const patients = await res.json();

    const corps = document.getElementById('corps-table');
    corps.innerHTML = '';
    document.getElementById('aucun-patient').classList.toggle('masque', patients.length > 0);

    patients.forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(p.label)}</td>
        <td>${p.rdv_date || '—'}</td>
        <td><span class="badge ${p.status}">${p.status === 'rempli' ? 'Rempli' : 'En attente'}</span></td>
        <td>${new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
      `;
      tr.addEventListener('click', () => ouvrirFiche(p.token));
      corps.appendChild(tr);
    });
  }

  function escapeHtml(texte) {
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
  }

  // ---------- Fiche patient ----------
  let tokenCourant = null;

  async function ouvrirFiche(token) {
    const res = await appelApi(`/api/admin/patients/${token}`);
    if (!res.ok) return;
    const p = await res.json();
    tokenCourant = token;

    zoneDashboard.classList.add('masque');
    zoneFiche.classList.remove('masque');

    document.getElementById('fiche-titre').textContent = p.label;

    const enAttente = p.status !== 'rempli';
    document.getElementById('fiche-en-attente').classList.toggle('masque', !enAttente);
    document.getElementById('fiche-contenu').classList.toggle('masque', enAttente);

    if (enAttente) {
      document.getElementById('fiche-lien').value = `${window.location.origin}/patient/${token}`;
      return;
    }

    const s = p.synthese;
    document.getElementById('fiche-resume').textContent = s.resume;
    document.getElementById('f-motif').textContent = s.motif || '—';
    document.getElementById('f-medecin').textContent = s.medecinPrescripteur || '—';
    document.getElementById('f-antecedents').textContent = s.antecedents || '—';
    document.getElementById('f-traitements').textContent = s.traitementsEnCours || '—';
    document.getElementById('f-operations').textContent = s.operationsAnterieures || '—';
    document.getElementById('f-objectifs').textContent = s.objectifs || '—';

    const listeQuestions = document.getElementById('f-questionnaire');
    listeQuestions.innerHTML = '';
    if (!s.questionnaireSpecifique || s.questionnaireSpecifique.length === 0) {
      listeQuestions.innerHTML = '<li>Aucune</li>';
    } else {
      s.questionnaireSpecifique.forEach((q) => {
        const li = document.createElement('li');
        li.textContent = `${q.question} → ${q.reponse || 'non renseigné'}`;
        listeQuestions.appendChild(li);
      });
    }

    const listeDocs = document.getElementById('f-documents');
    listeDocs.innerHTML = '';
    if (!p.documents || p.documents.length === 0) {
      listeDocs.innerHTML = '<li>Aucun document</li>';
    } else {
      p.documents.forEach((d) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = d.nom;
        a.addEventListener('click', async (e) => {
          e.preventDefault();
          const reponse = await appelApi(d.url);
          const blob = await reponse.blob();
          const urlBlob = URL.createObjectURL(blob);
          window.open(urlBlob, '_blank');
        });
        li.appendChild(a);
        listeDocs.appendChild(li);
      });
    }
  }

  document.getElementById('fiche-btn-copier').addEventListener('click', () => {
    const champ = document.getElementById('fiche-lien');
    champ.select();
    navigator.clipboard?.writeText(champ.value);
  });

  document.getElementById('btn-retour').addEventListener('click', () => {
    zoneFiche.classList.add('masque');
    zoneDashboard.classList.remove('masque');
    chargerPatients();
  });

  document.getElementById('btn-supprimer').addEventListener('click', async () => {
    if (!tokenCourant) return;
    if (!confirm('Supprimer définitivement ce dossier et ses documents ?')) return;
    await appelApi(`/api/admin/patients/${tokenCourant}`, { method: 'DELETE' });
    zoneFiche.classList.add('masque');
    zoneDashboard.classList.remove('masque');
    chargerPatients();
  });

  // ---------- Démarrage ----------
  if (motDePasse()) {
    appelApi('/api/admin/patients').then((res) => {
      if (res.ok) afficherDashboard();
      else afficherLogin();
    }).catch(() => afficherLogin());
  } else {
    afficherLogin();
  }
})();

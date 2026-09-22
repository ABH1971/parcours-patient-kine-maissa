const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');

const db = require('./db');
const { genererSynthese } = require('./synthese');
const { seedDemoData } = require('./seed-demo');

if (process.env.SEED_DEMO !== 'false') {
  seedDemoData(db);
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-moi';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const uploadsRoot = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

// --- Auth admin (mot de passe simple, a usage interne cabinet) ---
function requireAdmin(req, res, next) {
  const password = req.header('x-admin-password');
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ erreur: 'Mot de passe incorrect' });
  }
  next();
}

// --- Verifie qu'un token patient existe et est valide ---
function getPatientOr404(req, res) {
  const patient = db.prepare('SELECT * FROM patients WHERE token = ?').get(req.params.token);
  if (!patient) {
    res.status(404).json({ erreur: 'Lien invalide ou expire' });
    return null;
  }
  return patient;
}

// ---------- Upload documents ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsRoot, req.params.token);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const autorises = ['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
    if (autorises.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Type de fichier non autorise'));
  },
});

// ================= ADMIN (cote kine) =================

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ erreur: 'Mot de passe incorrect' });
});

// Cree un nouveau lien patient a envoyer par SMS
app.post('/api/admin/patients', requireAdmin, (req, res) => {
  const { label, rdvDate } = req.body || {};
  if (!label || !label.trim()) {
    return res.status(400).json({ erreur: 'Merci de renseigner un nom ou repere pour ce patient' });
  }
  const token = crypto.randomBytes(12).toString('hex');
  db.prepare(
    'INSERT INTO patients (token, label, rdv_date, status) VALUES (?, ?, ?, ?)'
  ).run(token, label.trim(), rdvDate || null, 'en_attente');

  res.json({ token, lien: `/patient/${token}` });
});

// Liste des patients (dossiers en attente / remplis)
app.get('/api/admin/patients', requireAdmin, (req, res) => {
  const patients = db
    .prepare('SELECT token, label, rdv_date, status, created_at, submitted_at FROM patients ORDER BY created_at DESC')
    .all();
  res.json(patients);
});

// Fiche complete d'un patient (pour le kine avant le rendez-vous)
app.get('/api/admin/patients/:token', requireAdmin, (req, res) => {
  const patient = getPatientOr404(req, res);
  if (!patient) return;

  const documents = db.prepare('SELECT * FROM documents WHERE token = ?').all(patient.token);

  res.json({
    token: patient.token,
    label: patient.label,
    rdvDate: patient.rdv_date,
    status: patient.status,
    createdAt: patient.created_at,
    submittedAt: patient.submitted_at,
    synthese: patient.synthese ? JSON.parse(patient.synthese) : null,
    formData: patient.form_data ? JSON.parse(patient.form_data) : null,
    documents: documents.map((d) => ({ id: d.id, nom: d.original_name, url: `/uploads/${patient.token}/${d.filename}` })),
  });
});

app.delete('/api/admin/patients/:token', requireAdmin, (req, res) => {
  const patient = getPatientOr404(req, res);
  if (!patient) return;
  db.prepare('DELETE FROM documents WHERE token = ?').run(patient.token);
  db.prepare('DELETE FROM patients WHERE token = ?').run(patient.token);
  const dir = path.join(uploadsRoot, patient.token);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  res.json({ ok: true });
});

// Fichiers uploades, servis uniquement avec le mot de passe admin
app.get('/uploads/:token/:filename', requireAdmin, (req, res) => {
  const filePath = path.join(uploadsRoot, req.params.token, req.params.filename);
  if (!filePath.startsWith(uploadsRoot) || !fs.existsSync(filePath)) {
    return res.status(404).end();
  }
  res.sendFile(filePath);
});

// ================= PATIENT (formulaire public via lien SMS) =================

// Verifie que le lien est valide et renvoie le strict necessaire (pas de donnees d'autres patients)
app.get('/api/patient/:token', (req, res) => {
  const patient = getPatientOr404(req, res);
  if (!patient) return;
  res.json({ label: patient.label, status: patient.status });
});

app.post('/api/patient/:token/submit', (req, res) => {
  const patient = getPatientOr404(req, res);
  if (!patient) return;

  const formData = req.body || {};
  const documents = db.prepare('SELECT * FROM documents WHERE token = ?').all(patient.token);
  const fiche = genererSynthese(formData, documents);

  db.prepare(
    "UPDATE patients SET form_data = ?, synthese = ?, status = 'rempli', submitted_at = datetime('now') WHERE token = ?"
  ).run(JSON.stringify(formData), JSON.stringify(fiche), patient.token);

  res.json({ ok: true });
});

app.post('/api/patient/:token/upload', (req, res, next) => {
  const patient = getPatientOr404(req, res);
  if (!patient) return;
  next();
}, upload.array('documents', 10), (req, res) => {
  const insert = db.prepare(
    'INSERT INTO documents (token, filename, original_name, mimetype) VALUES (?, ?, ?, ?)'
  );
  for (const file of req.files || []) {
    insert.run(req.params.token, file.filename, file.originalname, file.mimetype);
  }
  res.json({ ok: true, nombreFichiers: (req.files || []).length });
});

// Recalcule la synthese si des documents arrivent apres l'envoi du formulaire
app.post('/api/patient/:token/recalculer-synthese', (req, res) => {
  const patient = getPatientOr404(req, res);
  if (!patient) return;
  if (!patient.form_data) return res.status(400).json({ erreur: 'Formulaire pas encore rempli' });

  const documents = db.prepare('SELECT * FROM documents WHERE token = ?').all(patient.token);
  const fiche = genererSynthese(JSON.parse(patient.form_data), documents);
  db.prepare('UPDATE patients SET synthese = ? WHERE token = ?').run(JSON.stringify(fiche), patient.token);
  res.json({ ok: true });
});

// ================= Pages =================

app.get('/', (req, res) => res.redirect('/admin.html'));
app.get('/patient/:token', (req, res) => res.sendFile(path.join(__dirname, 'public', 'patient.html')));

app.listen(PORT, () => {
  console.log(`Parcours patient kine lance sur http://localhost:${PORT}`);
  if (ADMIN_PASSWORD === 'change-moi') {
    console.warn('ATTENTION : mot de passe admin par defaut. Definir ADMIN_PASSWORD avant tout usage reel.');
  }
});

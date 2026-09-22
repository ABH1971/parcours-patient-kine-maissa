const PDFDocument = require('pdfkit');

function nomFichierBilan(fiche) {
  const nom = (fiche.identite?.nom || 'patient').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const date = new Date().toISOString().slice(0, 10);
  return `Bilan-preconsultation-${nom}-${date}.pdf`;
}

// Genere le PDF de bilan pre-consultation dans un flux (stream), a la fois
// pour le telechargement direct et pour le depot dans un dossier synchronise Doctolib.
function genererPdfBilan(fiche, streamSortie) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(streamSortie);

  doc.fontSize(16).text(`Préparation séance – ${fiche.identite?.nomAffiche || 'Patient'}`, { underline: true });
  doc.moveDown();

  doc.fontSize(10).fillColor('#666').text(`Généré le ${new Date().toLocaleDateString('fr-FR')} — document de préparation clinique, à intégrer au dossier patient`);
  doc.moveDown();
  doc.fillColor('#000');

  const lignes = (fiche.resumeProse || '').split('\n').slice(1); // on saute le titre deja affiche
  doc.fontSize(11);
  lignes.forEach((ligne) => {
    doc.text(ligne, { paragraphGap: 4 });
  });

  if (fiche.questionnaireSpecifique && fiche.questionnaireSpecifique.length > 0) {
    doc.moveDown();
    doc.fontSize(12).text('Questionnaire spécifique', { underline: true });
    doc.fontSize(11);
    fiche.questionnaireSpecifique.forEach((q) => {
      doc.text(`- ${q.question} ${q.reponse || 'non renseigné'}`);
    });
  }

  doc.end();
}

module.exports = { genererPdfBilan, nomFichierBilan };

// Questions complémentaires selon la zone concernée.
// Ce ne sont pas des échelles cliniques validées : juste des points utiles
// à faire remonter au kiné avant le premier rendez-vous.
window.QUESTIONNAIRES = {
  epaule: [
    { id: 'epaule_lever_bras', label: "La douleur augmente-t-elle quand vous levez le bras au-dessus de la tête ?", type: 'oui-non' },
    { id: 'epaule_nuit_cote', label: "Douleur la nuit quand vous êtes allongé sur ce côté ?", type: 'oui-non' },
    { id: 'epaule_blocage', label: "Sensation de blocage ou d'accrochage dans l'épaule ?", type: 'oui-non' },
    { id: 'epaule_dos', label: "Difficulté à attraper un objet placé dans le dos ?", type: 'oui-non' },
  ],
  genou: [
    { id: 'genou_gonflement', label: "Le genou est-il gonflé actuellement ?", type: 'oui-non' },
    { id: 'genou_instabilite', label: "Avez-vous une sensation d'instabilité, comme si le genou allait lâcher ?", type: 'oui-non' },
    { id: 'genou_escaliers', label: "Douleur en montant ou descendant les escaliers ?", type: 'oui-non' },
    { id: 'genou_accroupi', label: "Douleur en position accroupie ?", type: 'oui-non' },
  ],
  lombalgie: [
    { id: 'lombalgie_sciatique', label: "La douleur descend-elle dans la jambe ?", type: 'oui-non' },
    { id: 'lombalgie_assis', label: "Douleur augmentée après une position assise prolongée ?", type: 'oui-non' },
    { id: 'lombalgie_raideur', label: "Raideur au réveil de plus de 30 minutes ?", type: 'oui-non' },
    { id: 'lombalgie_fourmillements', label: "Fourmillements ou engourdissement dans les jambes ou les pieds ?", type: 'oui-non' },
  ],
  cheville: [
    { id: 'cheville_entorse', label: "Avez-vous déjà eu une entorse à cette cheville ?", type: 'oui-non' },
    { id: 'cheville_instabilite', label: "Sensation d'instabilité en marchant ?", type: 'oui-non' },
    { id: 'cheville_gonflement', label: "Gonflement actuel ?", type: 'oui-non' },
    { id: 'cheville_appui', label: "Douleur quand vous prenez appui complet dessus ?", type: 'oui-non' },
  ],
  cervicalgie: [
    { id: 'cervicalgie_irradiation', label: "La douleur irradie-t-elle dans le bras ou l'épaule ?", type: 'oui-non' },
    { id: 'cervicalgie_maux_tete', label: "Maux de tête associés ?", type: 'oui-non' },
    { id: 'cervicalgie_ecran', label: "Travail prolongé sur écran ou position figée de la tête ?", type: 'oui-non' },
    { id: 'cervicalgie_fourmillements', label: "Fourmillements ou engourdissement dans les bras ou les mains ?", type: 'oui-non' },
  ],
  'post-operatoire': [
    { id: 'postop_date', label: "Date de l'opération", type: 'texte' },
    { id: 'postop_intervention', label: "Type d'intervention (si vous le savez)", type: 'texte' },
    { id: 'postop_chirurgien', label: "Chirurgien / clinique", type: 'texte' },
    { id: 'postop_consignes', label: "Consignes particulières données par le chirurgien", type: 'texte' },
  ],
  sport: [
    { id: 'sport_discipline', label: "Quel sport pratiquez-vous ?", type: 'texte' },
    { id: 'sport_niveau', label: "À quel niveau (loisir, compétition...) ?", type: 'texte' },
    { id: 'sport_moment_apparition', label: "La douleur est-elle apparue pendant un entraînement ou une compétition précise ?", type: 'oui-non' },
    { id: 'sport_arret', label: "Avez-vous dû arrêter le sport à cause de la douleur ?", type: 'oui-non' },
  ],
  neurologie: [
    { id: 'neuro_faiblesse', label: "Sensation de faiblesse musculaire ?", type: 'oui-non' },
    { id: 'neuro_equilibre', label: "Troubles de l'équilibre ou de la coordination ?", type: 'oui-non' },
    { id: 'neuro_sensibilite', label: "Perte de sensibilité quelque part ?", type: 'oui-non' },
    { id: 'neuro_diagnostic', label: "Diagnostic neurologique déjà posé (si connu) ?", type: 'texte' },
  ],
  autre: [],
};

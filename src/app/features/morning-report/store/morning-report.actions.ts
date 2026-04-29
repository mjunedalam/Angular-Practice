export const MorningReportActions = {
    loadReport:      '[MorningReport] Load Report',
    setDate:         '[MorningReport] Set Date',
    updateRigStatus: '[MorningReport] Update Rig Status',
} as const;

export const MorningReportEvents = {
    wellListLoaded:    '[MorningReport] Well List Loaded',
    allDetailsLoaded:  '[MorningReport] All Details Loaded',
    loadFailed:        '[MorningReport] Load Failed',
} as const;

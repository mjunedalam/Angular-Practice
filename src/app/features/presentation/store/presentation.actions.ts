export const PresentationActions = {
    initialize: '[Presentation] Initialize',
    selectWell: '[Presentation] Select Well',
    setDate:    '[Presentation] Set Date',
    nextPage:   '[Presentation] Next Page',
    prevPage:   '[Presentation] Prev Page',
} as const;

export const PresentationEvents = {
    wellListLoaded:   '[Presentation] Well List Loaded',
    wellDetailLoaded: '[Presentation] Well Detail Loaded',
    loadFailed:       '[Presentation] Load Failed',
} as const;

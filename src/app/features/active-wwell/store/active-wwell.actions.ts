export const ActiveWwellActions = {
    loadWellList: '[ActiveWwell] Load Well List',
    selectWell:   '[ActiveWwell] Select Well',
    setDate:      '[ActiveWwell] Set Date',
    nextPage:     '[ActiveWwell] Next Page',
    prevPage:     '[ActiveWwell] Prev Page',
} as const;

export const ActiveWwellEvents = {
    wellListLoaded:   '[ActiveWwell] Well List Loaded',
    wellDetailLoaded: '[ActiveWwell] Well Detail Loaded',
    loadFailed:       '[ActiveWwell] Load Failed',
} as const;

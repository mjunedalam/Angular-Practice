export interface IMudCirculation {
    W_PRSNT_DPTH: string;   // depth of measurement (string from API, parse to number)
    W_MUD_CIRC_PC: string;  // mud circulation percentage at that depth
    W_DPTH_CHG_DIS: string; // footage from previous measurement
}
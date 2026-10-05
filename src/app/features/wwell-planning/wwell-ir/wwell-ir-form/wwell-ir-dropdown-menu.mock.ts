import { WWELL_IR_DROPDOWN_MENU_BY_FIELD } from './wwell-ir-dropdown-menu.config';

/**
 * Stand-in dropdown options, keyed by EXAD_DHUB_LKUP_DATA `LKUP_NAME` (see
 * WWELL_IR_DROPDOWN_MENU_BY_FIELD for which form field uses which menu). Used only while the real
 * GET /dropdown-menus can't supply a menu — the request failed (e.g. the app DB user can't read the
 * table yet) or that menu came back empty. Edit here to change the fallback; delete this file (and
 * its use in WwellIrStore.loadDropdownMenus) once the table is reliably readable everywhere.
 */
export const WWELL_IR_DROPDOWN_MENU_MOCK: Readonly<Record<string, readonly string[]>> = {
  completion_menu: ['Open Hole', 'Screened', 'Screened + Gravel Pack', 'Liner + Perforated'],
  acidization_menu: ['HCl Acid Wash', 'Mud Acid', 'None'],
  transmission_menu: ['Gravity Flow', 'Pumped Transmission', 'Pipeline', 'Tanker'],
  logging_menu: ['Caliper', 'Gamma Ray', 'Resistivity', 'SP'],
  mud_logging_menu: ['Full Mud Logging', 'Cuttings Sample Only', 'None'],
  sampling_menu: ['Bailer Sample', 'Pump Sample', 'Composite Sample'],
  flow_test_menu: ['Step-Rate Test', 'Constant-Rate Test', 'Recovery Test'],
  dev_testing_menu: [
    'Step Drawdown Test',
    'Constant Rate Test',
    'Recovery Test',
    'Aquifer Performance Test (APT)',
    'Slug Test',
    'Bailer Test',
    'Air Lift Development',
    'Surge Block Development',
  ],
};

/** Master switch for the mock fallback. `false` = dropdowns show only what EXAD_DHUB_LKUP_DATA holds
 *  (an empty table or a failed request means empty dropdowns). */
export const WWELL_IR_DROPDOWN_MENU_MOCK_ENABLED = false;

/** Real (database) options win per menu; with the mock enabled, any menu the database didn't supply
 *  falls back to the mock. Disabled: the database result is returned untouched. */
export function withDropdownMenuMockFallback(
  loaded: Readonly<Record<string, readonly string[]>>,
): Readonly<Record<string, readonly string[]>> {
  if (!WWELL_IR_DROPDOWN_MENU_MOCK_ENABLED) return loaded;
  const menus = Object.values(WWELL_IR_DROPDOWN_MENU_BY_FIELD);
  return Object.fromEntries(menus.map(menu => [menu, loaded[menu]?.length ? loaded[menu] : WWELL_IR_DROPDOWN_MENU_MOCK[menu] ?? []]));
}

/** EXAD_DHUB_LKUP_DATA `LKUP_NAME` of the Casing table's Type dropdown (a repeatable row field, so not in the map below). */
export const WWELL_IR_CASING_TYPE_MENU = 'ir_casing_type_menu';

/** EXAD_DHUB_LKUP_DATA `LKUP_NAME` for each Program Details dropdown, keyed by the form field's key. */
export const WWELL_IR_DROPDOWN_MENU_BY_FIELD: Readonly<Record<string, string>> = {
  completionType: 'ir_completion_type_menu',
  completion: 'ir_completion_menu',
  acidization: 'ir_acidization_menu',
  transmission: 'ir_transmission_menu',
  logging: 'ir_logging_menu',
  mudLogging: 'ir_mud_logging_menu',
  sampling: 'ir_sampling_menu',
  flowTest: 'ir_flow_test_menu',
  remarks: 'ir_dev_testing_menu',
};

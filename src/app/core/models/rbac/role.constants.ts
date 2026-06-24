export const ACTIONS = {
  READ:   'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EMAIL:  'email',
  ACTIVE_WWELL_FILE_UPLOAD: 'active-wwell-file-upload',
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

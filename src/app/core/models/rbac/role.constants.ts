export const ROLES = {
  ADMIN:  'GWD_admin',
  MEMBER: 'GWD_member',
  CLIENT: 'GWD_client',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export const ROLE_PRIORITY: Record<RoleName, number> = {
  [ROLES.ADMIN]:  100,
  [ROLES.MEMBER]: 50,
  [ROLES.CLIENT]: 10,
};

export const ACTIONS = {
  READ:   'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EMAIL:  'email',
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

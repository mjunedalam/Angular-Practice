import { Action } from './role.constants';

export interface RbacState {
  readonly userPermissions: Record<string, Action[]>;
  readonly isLoaded: boolean;
  readonly error: string | null;
}

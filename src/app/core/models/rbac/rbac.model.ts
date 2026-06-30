import { Action } from './role.constants';

export interface RbacState {
  readonly userPermissions: Record<string, Action[]>;
  readonly isLoaded: boolean;
  readonly error: string | null;
  readonly lastLoadedAt: number | null;
  // Token the cached permissions were fetched for. Lets guards detect a
  // token swap (role change, manual tampering) and force a refetch even
  // within the TTL window — see RbacStore.needsRefresh().
  readonly loadedForToken: string | null;
}

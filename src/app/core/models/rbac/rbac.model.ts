export interface RoleDefinition {
  readonly name: string;
  readonly label: string;
  readonly routes: string[];
  readonly canUpdate: string[];
}

export interface RbacConfig {
  readonly roles: RoleDefinition[];
}

export interface RbacState {
  readonly roleDefinitions: RoleDefinition[];
  readonly isLoaded: boolean;
  readonly error: string | null;
}

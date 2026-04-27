export interface AgwaConfig {
  tokenUrl: string;
  dailyOperationServiceUrl: string;
  drillingEyeServiceUrl?: string;
  presDocsServiceUrl?: string;
  emailServiceUrl: string;
  mapServerUrl: string;
  appId: string;

  esriUrl: string;
  webMapItemId: string;

  mockWebMapItemId: string;

  useMockMap: boolean;
}

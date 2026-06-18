import { inject, Injectable } from '@angular/core';
import esriConfig from "@arcgis/core/config.js";
import esriId from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

@Injectable({
    providedIn: 'root'
})
export class EsriMapService {

    private extAppConfigService = inject(ExternalConfigService);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async authenticateUserForMapAccess(_popup = false): Promise<null> {
        return null;
    }

    destroyEsriMapCredentials() {
        esriId.destroyCredentials();
    }
}

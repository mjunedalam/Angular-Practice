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

    async authenticateUserForMapAccess(popup = false) {

        const portalUrl = this.extAppConfigService.settings.esriUrl;
        esriConfig.portalUrl = portalUrl;
        const info = new OAuthInfo({
            appId: `${this.extAppConfigService.settings.appId}`,
            portalUrl,
            popup
        });

        esriId.registerOAuthInfos([info]);
        const url = `${portalUrl}/sharing`;

        try {
            const credentials = await esriId.checkSignInStatus(url);
            return credentials;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Commented to prevent redirecting local report pages to ArcGIS OAuth authorize URL.
            // const credential = await esriId.getCredential(url);
            // return credential;
            return null;
        }
    }

    destroyEsriMapCredentials() {
        esriId.destroyCredentials();
    }
}

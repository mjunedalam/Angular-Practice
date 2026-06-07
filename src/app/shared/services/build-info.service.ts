import { Injectable } from '@angular/core';
import { BuildInfo } from '@shared/models/config/build-info.model';
import buildInfo from '../../application-properties.json';

const SHORT_HASH_LENGTH = 7;

@Injectable({ providedIn: 'root' })
export class BuildInfoService {
  readonly info: BuildInfo = buildInfo;
  readonly shortHash: string = buildInfo.commitHash.slice(0, SHORT_HASH_LENGTH);
}

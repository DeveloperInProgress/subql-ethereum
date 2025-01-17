// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {ProjectManifestBaseImpl} from '@subql/common';
import {SubqlCustomDatasource, SubqlCustomHandler, SubqlMapping, SubqlRuntimeHandler} from '@subql/types-ethereum';
import {plainToClass, Transform, TransformFnParams, Type} from 'class-transformer';
import {
  Equals,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator';
import {CustomDataSourceBase, RuntimeDataSourceBase, EthereumMapping} from '../../models';
import {
  CustomDatasourceV0_3_0,
  EthereumProjectManifestV0_3_0,
  RuntimeDataSourceV0_3_0,
  SubqlMappingV0_3_0,
} from './types';

export class FileType {
  @IsString()
  file: string;
}

export class ProjectNetworkDeploymentV0_3_0 {
  @IsString()
  @IsNotEmpty()
  @Transform(({value}: TransformFnParams) => value.trim())
  genesisHash: string;
}

export class ProjectNetworkV0_3_0 extends ProjectNetworkDeploymentV0_3_0 {
  @IsString()
  @IsOptional()
  endpoint?: string;
  @IsString()
  @IsOptional()
  dictionary?: string;
}

export class FileTypeV0_3_0 {
  @IsString()
  file: string;
}

export class EthereumProjectMappingV0_3_0 extends EthereumMapping {
  @IsString()
  file: string;
}

export class EthereumRuntimeDataSourceV0_3_0Impl
  extends RuntimeDataSourceBase<SubqlMappingV0_3_0<SubqlRuntimeHandler>>
  implements RuntimeDataSourceV0_3_0
{
  @Type(() => EthereumProjectMappingV0_3_0)
  @ValidateNested()
  mapping: SubqlMappingV0_3_0<SubqlRuntimeHandler>;
}

export class EthereumCustomDataSourceV0_3_0Impl<
    K extends string = string,
    M extends SubqlMapping = SubqlMapping<SubqlCustomHandler>
  >
  extends CustomDataSourceBase<K, M>
  implements SubqlCustomDatasource<K, M> {}

export class DeploymentV0_3_0 {
  @Equals('0.3.0')
  @IsString()
  specVersion: string;
  @ValidateNested()
  @Type(() => FileType)
  schema: FileType;
  @IsArray()
  @ValidateNested()
  @Type(() => EthereumCustomDataSourceV0_3_0Impl, {
    discriminator: {
      property: 'kind',
      subTypes: [
        {value: EthereumRuntimeDataSourceV0_3_0Impl, name: 'flare/Runtime'},
        {value: EthereumRuntimeDataSourceV0_3_0Impl, name: 'ethereum/Runtime'},
      ],
    },
    keepDiscriminatorProperty: true,
  })
  dataSources: (RuntimeDataSourceV0_3_0 | CustomDatasourceV0_3_0)[];
  @ValidateNested()
  @Type(() => ProjectNetworkDeploymentV0_3_0)
  network: ProjectNetworkDeploymentV0_3_0;
}

export class ProjectManifestV0_3_0Impl
  extends ProjectManifestBaseImpl<DeploymentV0_3_0>
  implements EthereumProjectManifestV0_3_0
{
  @Equals('0.3.0')
  specVersion: string;
  @IsString()
  name: string;
  @IsString()
  version: string;
  @IsObject()
  @ValidateNested()
  @Type(() => ProjectNetworkV0_3_0)
  network: ProjectNetworkV0_3_0;
  @ValidateNested()
  @Type(() => FileType)
  schema: FileType;
  @IsArray()
  @ValidateNested()
  @Type(() => EthereumCustomDataSourceV0_3_0Impl, {
    discriminator: {
      property: 'kind',
      subTypes: [
        {value: EthereumCustomDataSourceV0_3_0Impl, name: 'flare/Runtime'},
        {value: EthereumCustomDataSourceV0_3_0Impl, name: 'ethereum/Runtime'},
      ],
    },
    keepDiscriminatorProperty: true,
  })
  dataSources: (RuntimeDataSourceV0_3_0 | CustomDatasourceV0_3_0)[];
  protected _deployment: DeploymentV0_3_0;

  get deployment(): DeploymentV0_3_0 {
    if (!this._deployment) {
      this._deployment = plainToClass(DeploymentV0_3_0, this);
      validateSync(this._deployment, {whitelist: true});
    }
    return this._deployment;
  }
}

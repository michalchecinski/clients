import { AuthenticationStatus } from "../../enums/authenticationStatus";
import { KdfType } from "../../enums/kdfType";
import { UriMatchType } from "../../enums/uriMatchType";
import { CipherData } from "../data/cipherData";
import { CollectionData } from "../data/collectionData";
import { EncryptedOrganizationKeyData } from "../data/encryptedOrganizationKeyData";
import { EventData } from "../data/eventData";
import { FolderData } from "../data/folderData";
import { OrganizationData } from "../data/organizationData";
import { PolicyData } from "../data/policyData";
import { ProviderData } from "../data/providerData";
import { SendData } from "../data/sendData";
import { CipherView } from "../view/cipherView";
import { CollectionView } from "../view/collectionView";
import { SendView } from "../view/sendView";

import { EncString } from "./encString";
import { EnvironmentUrls } from "./environmentUrls";
import { GeneratedPasswordHistory } from "./generatedPasswordHistory";
import { Policy } from "./policy";
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

export class EncryptionPair<TEncrypted, TDecrypted> {
  encrypted?: TEncrypted;
  decrypted?: TDecrypted;
  decryptedSerialized?: string;
}

export class DataEncryptionPair<TEncrypted, TDecrypted> {
  encrypted?: { [id: string]: TEncrypted };
  decrypted?: TDecrypted[];
}

// This is a temporary structure to handle migrated `DataEncryptionPair` to
//  avoid needing a data migration at this stage. It should be replaced with
//  proper data migrations when `DataEncryptionPair` is deprecated.
export class TemporaryDataEncryption<TEncrypted> {
  encrypted?: { [id: string]: TEncrypted };
}

export class AccountData {
  ciphers?: DataEncryptionPair<CipherData, CipherView> = new DataEncryptionPair<
    CipherData,
    CipherView
  >();
  folders? = new TemporaryDataEncryption<FolderData>();
  localData?: any;
  sends?: DataEncryptionPair<SendData, SendView> = new DataEncryptionPair<SendData, SendView>();
  collections?: DataEncryptionPair<CollectionData, CollectionView> = new DataEncryptionPair<
    CollectionData,
    CollectionView
  >();
  policies?: DataEncryptionPair<PolicyData, Policy> = new DataEncryptionPair<PolicyData, Policy>();
  passwordGenerationHistory?: EncryptionPair<
    GeneratedPasswordHistory[],
    GeneratedPasswordHistory[]
  > = new EncryptionPair<GeneratedPasswordHistory[], GeneratedPasswordHistory[]>();
  addEditCipherInfo?: any;
  eventCollection?: EventData[];
  organizations?: { [id: string]: OrganizationData };
  providers?: { [id: string]: ProviderData };
}

export class AccountKeys {
  cryptoMasterKey?: SymmetricCryptoKey;
  cryptoMasterKeyAuto?: string;
  cryptoMasterKeyB64?: string;
  cryptoMasterKeyBiometric?: string;
  cryptoSymmetricKey?: EncryptionPair<string, SymmetricCryptoKey> = new EncryptionPair<
    string,
    SymmetricCryptoKey
  >();
  organizationKeys?: EncryptionPair<
    { [orgId: string]: EncryptedOrganizationKeyData },
    Map<string, SymmetricCryptoKey>
  > = new EncryptionPair<
    { [orgId: string]: EncryptedOrganizationKeyData },
    Map<string, SymmetricCryptoKey>
  >();
  providerKeys?: EncryptionPair<any, Map<string, SymmetricCryptoKey>> = new EncryptionPair<
    any,
    Map<string, SymmetricCryptoKey>
  >();
  privateKey?: EncryptionPair<string, ArrayBuffer> = new EncryptionPair<string, ArrayBuffer>();
  publicKey?: ArrayBuffer;
  publicKeySerialized?: string;
  apiKeyClientSecret?: string;
}

export class AccountProfile {
  apiKeyClientId?: string;
  authenticationStatus?: AuthenticationStatus;
  convertAccountToKeyConnector?: boolean;
  email?: string;
  emailVerified?: boolean;
  entityId?: string;
  entityType?: string;
  everBeenUnlocked?: boolean;
  forcePasswordReset?: boolean;
  hasPremiumPersonally?: boolean;
  hasPremiumFromOrganization?: boolean;
  lastSync?: string;
  userId?: string;
  usesKeyConnector?: boolean;
  keyHash?: string;
  kdfIterations?: number;
  kdfType?: KdfType;
}

export class AccountSettings {
  autoConfirmFingerPrints?: boolean;
  autoFillOnPageLoadDefault?: boolean;
  biometricUnlock?: boolean;
  clearClipboard?: number;
  collapsedGroupings?: string[];
  defaultUriMatch?: UriMatchType;
  disableAddLoginNotification?: boolean;
  disableAutoBiometricsPrompt?: boolean;
  disableAutoTotpCopy?: boolean;
  disableBadgeCounter?: boolean;
  disableChangedPasswordNotification?: boolean;
  disableContextMenuItem?: boolean;
  disableGa?: boolean;
  dontShowCardsCurrentTab?: boolean;
  dontShowIdentitiesCurrentTab?: boolean;
  enableAlwaysOnTop?: boolean;
  enableAutoFillOnPageLoad?: boolean;
  enableBiometric?: boolean;
  enableFullWidth?: boolean;
  enableGravitars?: boolean;
  environmentUrls: EnvironmentUrls = new EnvironmentUrls();
  equivalentDomains?: any;
  minimizeOnCopyToClipboard?: boolean;
  neverDomains?: { [id: string]: any };
  passwordGenerationOptions?: any;
  usernameGenerationOptions?: any;
  generatorOptions?: any;
  pinProtected?: EncryptionPair<string, EncString> = new EncryptionPair<string, EncString>();
  protectedPin?: string;
  settings?: any; // TODO: Merge whatever is going on here into the AccountSettings model properly
  vaultTimeout?: number;
  vaultTimeoutAction?: string = "lock";
}

export class AccountTokens {
  accessToken?: string;
  decodedToken?: any;
  refreshToken?: string;
  securityStamp?: string;
}

export class Account {
  data?: AccountData = new AccountData();
  keys?: AccountKeys = new AccountKeys();
  profile?: AccountProfile = new AccountProfile();
  settings?: AccountSettings = new AccountSettings();
  tokens?: AccountTokens = new AccountTokens();

  constructor(init: Partial<Account>) {
    Object.assign(this, {
      data: {
        ...new AccountData(),
        ...init?.data,
      },
      keys: {
        ...new AccountKeys(),
        ...init?.keys,
      },
      profile: {
        ...new AccountProfile(),
        ...init?.profile,
      },
      settings: {
        ...new AccountSettings(),
        ...init?.settings,
      },
      tokens: {
        ...new AccountTokens(),
        ...init?.tokens,
      },
    });
  }
}

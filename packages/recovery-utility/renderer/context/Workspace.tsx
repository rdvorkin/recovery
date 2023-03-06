import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/router";
import {
  getAssetInfo,
  assetsInfo,
  AssetInfo,
  AssetId,
} from "@fireblocks/recovery-shared";
import { csvImport, ParsedRow } from "../lib/csv";
import { deriveWallet } from "../lib/deriveWallet";
import { ExtendedKeysResponse } from "../lib/pythonClient";
import { initIdleDetector } from "../lib/idleDetector";
import { useSettings } from "./Settings";

export type Derivation = {
  pathParts: number[];
  address: string;
  type: "Permanent" | "Deposit";
  description?: string;
  tag?: string;
  publicKey?: string;
  privateKey?: string;
  wif?: string;
};

export type Wallet = {
  assetId: AssetId;
  isTestnet: boolean;
  balance?: number;
  balanceUsd?: number;
  derivations: Derivation[];
};

export type VaultAccount = {
  id: number;
  name: string;
  wallets: Map<AssetId, Wallet>;
};

const splitPath = (path: string) => path.split(",").map((p) => parseInt(p));

interface IWorkspaceContext {
  extendedKeys?: ExtendedKeysResponse;
  asset?: AssetInfo;
  pathParts: number[];
  address?: string;
  publicKey?: string;
  privateKey?: string;
  wif?: string;
  isTestnet?: boolean;
  vaultAccounts: Map<number, VaultAccount>;
  restoreVaultAccounts: (
    csvFile: File,
    extendedKeys: ExtendedKeysResponse
  ) => Promise<void>;
  restoreVaultAccount: (name: string) => number;
  restoreWallet: (accountId: number, assetId: string) => void;
  setExtendedKeys: Dispatch<SetStateAction<ExtendedKeysResponse | undefined>>;
  reset: () => void;
}

const defaultValue: IWorkspaceContext = {
  extendedKeys: undefined,
  asset: undefined,
  pathParts: [],
  address: undefined,
  publicKey: undefined,
  privateKey: undefined,
  wif: undefined,
  isTestnet: undefined,
  vaultAccounts: new Map(),
  restoreVaultAccounts: async () => undefined,
  restoreVaultAccount: () => 0,
  restoreWallet: () => undefined,
  setExtendedKeys: () => undefined,
  reset: () => undefined,
};

const Context = createContext(defaultValue);

type Props = {
  children: ReactNode;
};

// const orderAddresses = (a: Address, b: Address) => {
//   const aPath = deserializePath(a.pathParts);
//   const bPath = deserializePath(b.pathParts);

//   // Keep wallets with the same path together
//   if (aPath.accountId === bPath.accountId && aPath.index === bPath.index) {
//     const aIsLegacy = a.address[0] === "1";
//     const bIsLegacy = b.address[0] === "1";

//     if (aIsLegacy && !bIsLegacy) {
//       return -1;
//     }

//     if (!aIsLegacy && bIsLegacy) {
//       return 1;
//     }

//     return 0;
//   }

//   if (aPath.accountId > bPath.accountId) {
//     return 1;
//   }

//   if (aPath.accountId < bPath.accountId) {
//     return -1;
//   }

//   if (aPath.index > bPath.index) {
//     return 1;
//   }

//   if (aPath.index < bPath.index) {
//     return -1;
//   }

//   return 0;
// };

// const formatWallets = (wallets: Wallet[]): Wallet[] => {
//   const uniqueWallets = [
//     ...new Map(wallets.map((wallet) => [wallet.address, wallet])).values(),
//   ];

//   const sortedWallets = uniqueWallets.sort(orderWallets);

//   return sortedWallets;
// };

export const WorkspaceProvider = ({ children }: Props) => {
  const {
    push,
    query: {
      assetId: _assetId,
      path: _path,
      address: _address,
      publicKey: _publicKey,
      privateKey: _privateKey,
      wif: _wif,
      isTestnet: _isTestnet,
    },
  } = useRouter();

  const { idleMinutes } = useSettings();

  const assetId =
    typeof _assetId === "string" ? (_assetId as AssetId) : undefined;

  const asset = assetId ? getAssetInfo(assetId) : undefined;

  const [extendedKeys, setExtendedKeys] = useState<
    ExtendedKeysResponse | undefined
  >();

  const [vaultAccounts, setVaultAccounts] = useState(
    defaultValue.vaultAccounts
  );

  const restoreVaultAccounts = async (
    csvFile: File,
    extendedKeys?: ExtendedKeysResponse
  ) => {
    const tmpAccounts = new Map<number, VaultAccount>();

    const handleRow = (parsedRow: ParsedRow) => {
      const assetId = parsedRow.assetId as AssetId;

      const isTestnet = assetId.includes("TEST");

      const derivation: Derivation = {
        pathParts: parsedRow.pathParts,
        address: parsedRow.address,
        type: parsedRow.addressType,
        description: parsedRow.addressDescription,
        tag: parsedRow.tag,
        publicKey: parsedRow.publicKey,
        privateKey: parsedRow.privateKey,
        wif: parsedRow.privateKeyWif,
      };

      const wallet: Wallet = {
        assetId,
        isTestnet,
        derivations: [derivation],
      };

      const account = tmpAccounts.get(parsedRow.accountId);

      if (account) {
        const existingWallet = account.wallets.get(assetId);

        if (existingWallet) {
          existingWallet.derivations.push(derivation);

          existingWallet.derivations.sort((a, b) => {
            if (a.pathParts[4] > b.pathParts[4]) {
              return 1;
            }

            if (a.pathParts[4] < b.pathParts[4]) {
              return -1;
            }

            return 0;
          });

          account.wallets.set(assetId, existingWallet);
        } else {
          account.wallets.set(assetId, wallet);
        }
      } else {
        tmpAccounts.set(parsedRow.accountId, {
          id: parsedRow.accountId,
          name: parsedRow.accountName ?? `Account ${parsedRow.accountId}`,
          wallets: new Map<AssetId, Wallet>([[assetId, wallet]]),
        });
      }
    };

    setVaultAccounts(defaultValue.vaultAccounts);

    await csvImport(csvFile, handleRow);

    for (const [accountId, account] of tmpAccounts) {
      for (const [assetId, wallet] of account.wallets) {
        if (!assetsInfo[assetId]) {
          continue;
        }

        const indexStart = wallet.derivations[0].pathParts[4];
        const indexEnd =
          wallet.derivations[wallet.derivations.length - 1].pathParts[4];

        wallet.derivations = await deriveWallet({
          xprv: extendedKeys?.xprv,
          fprv: extendedKeys?.fprv,
          assetId,
          accountId,
          indexStart,
          indexEnd,
        });

        account.wallets.set(assetId, wallet);

        tmpAccounts.set(accountId, account);
      }
    }

    setVaultAccounts(tmpAccounts);
  };

  const restoreVaultAccount = (name: string) => {
    let accountId = vaultAccounts.size;

    setVaultAccounts((prev) => {
      const _vaultAccounts = new Map(prev);

      if (accountId > 0) {
        const accountIds = Array.from(_vaultAccounts.keys());

        accountId = Math.max(...accountIds) + 1;
      }

      _vaultAccounts.set(accountId, {
        id: accountId,
        name,
        wallets: new Map<AssetId, Wallet>(),
      });

      return _vaultAccounts;
    });

    return accountId;
  };

  const restoreWallet = async (accountId: number, assetId: string) => {
    const derivations = await deriveWallet({
      xprv: extendedKeys?.xprv,
      fprv: extendedKeys?.fprv,
      assetId: assetId as AssetId,
      accountId,
      indexStart: 0,
      indexEnd: 0,
    });

    setVaultAccounts((prev) => {
      const _vaultAccounts = new Map(prev);

      const account = _vaultAccounts.get(accountId);

      if (account) {
        const wallet = account.wallets.get(assetId as AssetId);

        // if (!wallet) {
        account.wallets.set(assetId as AssetId, {
          assetId: assetId as AssetId,
          isTestnet: assetId.includes("_TEST"),
          derivations,
        });

        _vaultAccounts.set(accountId, account);
        // }
      }

      return _vaultAccounts;
    });
  };

  const pathParts = typeof _path === "string" ? splitPath(_path) : [];
  const address = typeof _address === "string" ? _address : undefined;
  const publicKey = typeof _publicKey === "string" ? _publicKey : undefined;
  const privateKey = typeof _privateKey === "string" ? _privateKey : undefined;
  const wif = typeof _wif === "string" ? _wif : undefined;
  const isTestnet =
    typeof _isTestnet === "string"
      ? !["false", "0"].includes(_isTestnet.toLowerCase())
      : undefined;

  const reset = () => {
    setExtendedKeys(undefined);
    setVaultAccounts(defaultValue.vaultAccounts);
    push("/");
  };

  useEffect(() => {
    let abortController: AbortController | undefined;

    const _initIdleDetector = async () => {
      abortController = await initIdleDetector(reset, idleMinutes);
    };

    _initIdleDetector();

    return () => abortController?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleMinutes]);

  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    console.info("Vault Accounts", vaultAccounts);
  }

  const value: IWorkspaceContext = {
    extendedKeys,
    asset,
    pathParts,
    address,
    publicKey,
    privateKey,
    wif,
    isTestnet,
    vaultAccounts,
    restoreVaultAccounts,
    restoreVaultAccount,
    restoreWallet,
    setExtendedKeys,
    reset,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useWorkspace = () => useContext(Context);
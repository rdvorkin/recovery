import { ipcMain } from "electron";
import type { Wallet } from "../../renderer/context/Workspace";
import { getAssetInfo } from "../../../shared/lib/assetInfo";
import { SigningAlgorithm } from "../../../shared/types";
import { win, pythonServer } from "../background";

type AddWalletsVariables = {
  assetId: string;
  isTestnet: boolean;
  accountIdStart: number;
  accountIdEnd: number;
  indexStart: number;
  indexEnd: number;
};

type AddWalletInput = {
  assetId: string;
  isTestnet: boolean;
  accountId: number;
  indexStart: number;
  indexEnd: number;
  legacy: boolean;
};

type GetWifInput = {
  assetId: string;
  accountId: number;
  index: number;
};

type DeriveKeysResponse = {
  prv: string;
  pub: string;
  address: string;
  path: string;
};

const getWif = async ({ assetId, accountId, index }: GetWifInput) => {
  const params = new URLSearchParams({
    asset: assetId,
    account: String(accountId),
    change: "0",
    index: String(index),
  });

  const wif = await pythonServer.request<string>({ url: "/get-wif", params });

  return wif;
};

const getAccountWallets = async ({
  assetId,
  isTestnet,
  accountId,
  indexStart,
  indexEnd,
  legacy,
}: AddWalletInput) => {
  const params = new URLSearchParams({
    asset: assetId,
    account: String(accountId),
    change: "0",
    index_start: String(indexStart),
    index_end: String(indexEnd),
    xpub: "false",
    testnet: String(isTestnet),
    legacy: String(legacy),
  });

  const derivations = await pythonServer.request<DeriveKeysResponse[]>({
    url: `/derive-keys`,
    params,
  });

  const accountWallets = await Promise.all(
    derivations.map<Promise<Wallet>>(async (data) => {
      const pathParts = data.path.split(",").map((p) => parseInt(p));
      const [purpose, coinType, accountId, change, index] = pathParts;

      let wif: string | undefined;

      if (
        getAssetInfo(assetId).algorithm !== SigningAlgorithm.MPC_EDDSA_ED25519
      ) {
        wif = await getWif({ assetId, accountId, index });
      }

      return {
        assetId: assetId as Wallet["assetId"],
        pathParts,
        address: data.address,
        addressType: index > 0 ? "Deposit" : "Permanent",
        publicKey: data.pub,
        privateKey: data.prv,
        wif,
      };
    })
  );

  return accountWallets;
};

const getWallets = async ({
  assetId,
  accountIdStart,
  accountIdEnd,
  indexStart,
  indexEnd,
}: AddWalletsVariables) => {
  const wallets = [];

  const isTestnet = assetId.includes("_TEST");

  for (
    let accountId = accountIdStart;
    accountId <= accountIdEnd;
    accountId += 1
  ) {
    const input: AddWalletInput = {
      assetId,
      isTestnet,
      accountId,
      indexStart,
      indexEnd,
      legacy: false,
    };

    const accountWallets = await getAccountWallets(input);

    // Get additional legacy addresses for Bitcoin
    if (assetId === "BTC") {
      const legacyWallets = await getAccountWallets({
        ...input,
        legacy: true,
      });

      accountWallets.push(...legacyWallets);
    }

    wallets.push(...accountWallets);
  }

  return wallets;
};

ipcMain.on("add-wallets", async (event, args: AddWalletsVariables) => {
  const wallets = await getWallets(args);

  win?.webContents.send("wallets/add", wallets);
});

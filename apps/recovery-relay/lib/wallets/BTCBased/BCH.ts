import { BitcoinCash as BCHBase, Input } from '@fireblocks/wallet-derivation';
import { Address, Networks, Transaction, Script, PrivateKey } from 'bitcore-lib-cash';
import { AccountData, TxPayload, BaseUTXOType, UTXO } from '../types';
import { LateInitConnectedWallet } from '../LateInitConnectedWallet';
import { BCHUTXO } from './types';

export class BitcoinCash extends BCHBase implements LateInitConnectedWallet {
  private endpoint: string;

  private network: Networks.Network;

  constructor(input: Input) {
    super(input);
    this.endpoint = input.isTestnet ? '' : 'https://rest.bch.actorforth.org/v2';
    this.network = input.isTestnet ? Networks.testnet : Networks.mainnet;
  }

  // eslint-disable-next-line class-methods-use-this
  public getLateInitLabel() {
    return '';
  }

  public isLateInit(): boolean {
    return this.isTestnet;
  }

  public updateDataEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  public async getBalance(): Promise<number> {
    if (this.isLateInit() && this.endpoint === '') {
      throw new Error('Endpoint not initialized yet');
    }
    return (await this.prepare()).balance;
  }

  public async prepare(): Promise<AccountData> {
    if (this.isLateInit() && this.endpoint === '') {
      throw new Error('Endpoint not initialized yet');
    }

    const utxos = (await this._getBCHUTXOs()).map((bchutxo) => ({
      hash: bchutxo.txid,
      value: bchutxo.amount,
      index: bchutxo.vout,
      confirmed: bchutxo.confirmations > 0,
    }));

    const balance = utxos.map((utxo) => utxo.value as number).reduce((p, c) => p + c);

    return {
      utxoType: BaseUTXOType,
      utxos,
      balance,
    };
  }

  public async generateTx(to: string, amount: number, utxos?: UTXO[] | undefined): Promise<TxPayload> {
    const bchUTXOs = new Map((await this._getBCHUTXOs()).map((utxo) => [utxo.txid, utxo]));
    const allowedUTXOs = utxos!.filter((utxo) => bchUTXOs.get(utxo.hash) !== undefined);
    let currentSum = 0;
    let utxoCount = 0;
    allowedUTXOs.forEach((utxo) => {
      if (currentSum / 10 ** 8 > amount) {
        return;
      }
      currentSum += utxo.value as number;
      utxoCount += 1;
    });
    if (currentSum / 10 ** 8 < amount) {
      throw new Error('Insufficient amount selected.');
    }

    const utxosToUse: Transaction.UnspentOutput[] = allowedUTXOs.slice(0, utxoCount).map((utxo) => {
      const bchUTXO = bchUTXOs.get(utxo.hash)!;
      return Transaction.UnspentOutput.fromObject({
        address: Address.fromScript(Script.fromString(bchUTXO.scriptPubKey), this.network),
        txId: bchUTXO.txid,
        outputIndex: bchUTXO.vout,
        script: Script.fromString(bchUTXO.scriptPubKey),
        satoshis: bchUTXO.satoshis,
      });
    });

    const signedTx = new Transaction()
      .from(utxosToUse)
      .to(to, amount * 10 ** 8)
      .sign(PrivateKey.fromString(this.privateKey as string))
      .serialize();

    return {
      derivationPath: this.pathParts,
      tx: signedTx,
    };
  }

  public async broadcastTx(txHex: string): Promise<string> {
    const tx = Transaction.fromString(txHex);

    const path = `/rawtransactions/sendRawTransaction/${tx.serialize()}`;
    const res = await this._post(path);
    if (res === true) {
      return tx.id;
    }
    throw Error('Failed to send transaction.');
  }

  private async _get<T>(path: string) {
    const res = await fetch(`${this.endpoint}${path}`);

    const data: Promise<T> = res.json();

    return data;
  }

  private async _post(path: string) {
    const res = await fetch(`${this.endpoint}${path}`, {
      method: 'POST',
    });

    return res.status === 200;
  }

  private async _getBCHUTXOs(): Promise<BCHUTXO[]> {
    return this._get<BCHUTXO[]>(`/address/utxo/${this.address}`);
  }
}

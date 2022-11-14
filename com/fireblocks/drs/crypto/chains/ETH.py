from com.fireblocks.drs.crypto.basic import DERIVATION_PURPOSE
from com.fireblocks.drs.crypto.derivation import Derivation
from com.fireblocks.drs.crypto.ecdsa_basic import EcDSARecovery
from com.fireblocks.drs.infra.dynamic_loader import get_dep

PrivateKey = get_dep("eth_keys.datatypes").PrivateKey
PublicKey = get_dep("eth_keys.datatypes").PublicKey
BIP32 = get_dep("bip32").BIP32


class EthereumRecovery(EcDSARecovery):
    def __init__(self,
                 xprv: str,
                 account: int = 0,
                 change: int = 0,
                 address_index: int = 0):
        super().__init__(xprv=xprv, coin_type=Derivation.Ethereum, account=account, change=change,
                         address_index=address_index)

    def to_address(self, checksum=False) -> str:
        if not checksum:
            return PrivateKey(bytes.fromhex(self.prv_hex)).public_key.to_address()
        else:
            return PrivateKey(bytes.fromhex(self.prv_hex)).public_key.to_checksum_address()

    @staticmethod
    def public_key_verification(extended_pub: str,
                                account: int = 0,
                                change: int = 0,
                                address_index: int = 0,
                                testnet: bool = False,
                                checksum: bool = False) -> (str, str):
        pub = BIP32.from_xpub(extended_pub).get_pubkey_from_path([
            DERIVATION_PURPOSE,
            Derivation.Ethereum.value if not testnet else Derivation.Testnet.value,
            account,
            change,
            address_index
        ])
        pub_key = PublicKey.from_compressed_bytes(pub)
        return pub.hex(), pub_key.to_address() if not checksum else pub_key.to_checksum_address()
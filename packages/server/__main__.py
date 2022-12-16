"""

Fireblocks Recovery Utility Server

Recovers xprv, fprv, xpub, fpub from Fireblocks.
Derives private keys for supported assets.

"""

import json
import traceback
import argparse
from waitress import serve
from flask import Flask, request
from flask_cors import CORS
from com.fireblocks.drs.crypto.basic import DerivationDetails
from com.fireblocks.drs.infra.global_state import (
    setup_global_state,
    get_data,
    set_data,
    ASSET_TYPE,
    ASSET_TYPE_ECDSA,
    ASSET_TYPE_EDDSA,
    ASSET_HELPER,
    XPRV,
    FPUB,
    XPUB,
    FPRV,
)
from com.fireblocks.drs.infra.recovery.recover_keys import RecoveryException, recover


app = Flask(__name__)
CORS(app)


def get_parameter(k, default=None):
    param = request.args.get(k)
    if not param and default is None:
        raise Exception(f"No parameter named {k} in request")
    elif not param and default:
        return default
    return param


def unpack_request():
    asset = get_parameter("asset")
    account = int(
        get_parameter(
            "account",
            None,
        )
    )
    change = int(get_parameter("change", "0"))
    index = int(get_parameter("index", "0"))
    testnet = get_parameter("testnet", "False") in ["True", "true"]
    use_xpub = get_parameter("xpub", "False") in ["True", "true"]
    legacy = get_parameter("legacy", "False") in ["True", "true"]

    if account < 0:
        raise Exception(f"Invalid account: {account}")
    if change < 0:
        raise Exception(f"Invalid change: {change}")
    if index < 0:
        raise Exception(f"Invalid index: {index}")

    # Obtain the asset information
    asset_info = get_data(asset)
    if asset_info is None:
        raise Exception(f"Unknown asset: {asset}")
    asset_type = asset_info[ASSET_TYPE]
    if asset_type == ASSET_TYPE_ECDSA:
        data_key = XPRV
    elif asset_type == ASSET_TYPE_EDDSA:
        data_key = FPRV
    else:
        raise KeyError(f"Unknown key type - {asset_type}.")

    key_to_use = get_data(data_key)
    if key_to_use is None:
        raise KeyError(f"Missing the {data_key} - make sure you finished setup")

    helper_class = asset_info[ASSET_HELPER]
    helper = helper_class(key_to_use, account, change, index, testnet)
    return (
        helper,
        helper_class,
        key_to_use,
        asset,
        account,
        change,
        index,
        testnet,
        use_xpub,
        legacy,
    )


# ======================================= Derive Keys API


@app.route("/derive-keys", methods=["GET"])
def derive_keys():
    try:
        res = derive_keys_impl()
    except Exception as e:
        traceback.print_exc()
        res = app.response_class(response=json.dumps({"reason": str(e)}), status=500)

    return res


def derive_keys_impl():
    (
        _,
        helper_class,
        key_to_use,
        _,
        account,
        change,
        index,
        testnet,
        use_xpub,
        legacy,
    ) = unpack_request()
    index_start = int(get_parameter("index_start", "0"))
    index_end = int(get_parameter("index_end", "0"))
    kwargs = {"testnet": testnet, "legacy": legacy}
    res = []
    for index in range(index_start, index_end + 1):
        if use_xpub:
            pub_hex, address = helper_class.public_key_verification(
                key_to_use, account, change, index, **kwargs
            )
            res.append(
                DerivationDetails(
                    None,
                    "",
                    pub_hex,
                    address,
                    f"44,{helper_class.get_coin_id() if not testnet else '1'},"
                    f"{account},"
                    f"{change},"
                    f"{index}",
                )
            )
        else:
            helper = helper_class(key_to_use, account, change, index, testnet)
            res.append(helper.get_derivation_details(**kwargs))
    return res


# ======================================= Recover keys API


@app.route("/recover-keys", methods=["POST"])
def recover_keys():
    recover_prv = get_parameter("recover-prv", "False") in ["True", "true"]
    data = request.json
    try:
        rsa_key_passphrase = (
            data["rsa-key-passphrase"] if "rsa-key-passphrase" in data.keys() else None
        )
        res = recover_keys_impl(
            data["zip"],
            data["passphrase"],
            data["rsa-key"],
            rsa_key_passphrase,
            recover_prv,
        )
    except KeyError as e:
        res = app.response_class(
            response=json.dumps({"reason": f"Missing value for key: {str(e)}"}),
            status=500,
        )
    except Exception as e1:
        res = app.response_class(response=json.dumps({"reason": str(e1)}), status=500)
    return res


def recover_keys_impl(
    zip_file: str,
    mobile_pass: str,
    zip_prv_key: str,
    zip_prv_key_pass: str,
    recover_prv: bool,
):
    """
    Retrieves XPRV, FPRV, XPUB, FPUB.
    :param zip_file: Base64 encoded string representation of the zip file.
    :param mobile_pass: Mobile passphrase string.
    :param zip_prv_key: Base64 encoded string representation of the RSA key file.
    :param zip_prv_key_pass: RSA key passphrase string.
    :param recover_prv: Recover the private key as well
    :return:
    """
    try:
        res = recover(zip_file, zip_prv_key, mobile_pass, zip_prv_key_pass)
        set_data(XPRV, res[XPRV])
        set_data(FPRV, res[FPRV])
        set_data(XPUB, res[XPUB])
        set_data(FPUB, res[FPUB])
        if not recover_prv:
            del res[XPRV]
            del res[FPRV]
        return res
    except RecoveryException as e:
        raise e
    except Exception as e1:
        traceback.print_exc()
        raise Exception(f"Internal error during recovery process: {e1}")


# ======================================= Show Extended Private Keys API


@app.route("/show-extended-keys", methods=["GET"])
def show_extended_keys():
    try:
        res = show_extended_keys_impl()
    except Exception as e:
        res = app.response_class(response=json.dumps({"reason": str(e)}), status=500)

    return res


def show_extended_keys_impl():
    xprv = get_data(XPRV)
    fprv = get_data(FPRV)
    xpub = get_data(XPUB)
    fpub = get_data(FPUB)

    if xprv and fprv and xpub and fpub:
        return {XPRV: xprv, FPRV: fprv, XPUB: xpub, FPUB: fpub}

    raise Exception(
        "No extended key entries. Make sure to recover the addresses first."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="Recovery Utility", description="Fireblocks workspace recovery utility"
    )
    parser.add_argument("-p", "--port", help="HTTP server port", type=int, default=5000)
    args = parser.parse_args()
    setup_global_state()
    print(f"Server started on port {args.port}")
    serve(app, host="localhost", port=args.port)
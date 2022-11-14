import json

from com.fireblocks.drs.infra.dynamic_loader import get_dep
from com.fireblocks.drs.infra.global_state import setup_global_state, get_data, ASSET_TYPE, ASSET_TYPE_ECDSA, \
    ASSET_TYPE_EDDSA, ASSET_HELPER

Flask = get_dep("flask").Flask
request = get_dep("flask").request
serve = get_dep("waitress").serve

app = Flask(__name__)


def get_parameter(k, default=None):
    try:
        return request.args.get(k)
    except KeyError as e:
        if default is None:
            raise Exception(f"No parameter named {k} in request")
        else:
            return default


@app.route("/derive-keys", methods=['GET'])
def derive_keys():
    try:
        res = derive_keys_impl()
    except Exception as e:
        res = app.response_class(
            response=json.dumps({
                "reason": e
            }),
            status=500
        )

    return res


@app.route("/recover-keys", methods=['GET'])
def recover_keys():
    data = request.form
    try:
        res = recover_keys_impl()
        xprv, fprv, xpub, fpub = res['xprv'], res['fprv'], res['xpub'], res['fpub']
        return xprv, fprv, xpub, fpub
    except Exception as e:
        res = app.response_class(
            response=json.dumps({
                "reason": e
            }),
            status=500
        )


def derive_keys_impl():
    asset = get_parameter("asset")
    account = int(get_parameter("account"))
    change = int(get_parameter("change"))
    index_start = int(get_parameter("index_start"))
    index_end = int(get_parameter("index_end"))
    use_xpub = bool(get_parameter("xpub", False))
    legacy = bool(get_parameter("legacy", False))
    checksum = bool(get_parameter("checksum", True))

    asset_info = get_data(asset)
    asset_type = asset_info[ASSET_TYPE]
    if asset_type == ASSET_TYPE_ECDSA:
        data_key = "xpub" if use_xpub else "xprv"
    elif asset_type == ASSET_TYPE_EDDSA:
        data_key = "fprv" if use_xpub else "fprv"
    else:
        raise KeyError("Unknown key type")

    key_to_use = get_data(data_key)
    if key_to_use is None:
        raise KeyError(f"Missing the {data_key} - make sure you finished setup")

    helper_class = asset_info[ASSET_HELPER]
    res = []
    for index in range(index_start, index_end):
        helper = helper_class(key_to_use,
                              account,
                              change,
                              index)


def recover_keys_impl(zip_file: str, passphrase: str, rsa_key: str, rsa_key_passphrase: str):
    """
    Retrieves XPRV, FPRV, XPUB, FPUB.
    :param zip_file: Base64 encoded string representation of the zip file.
    :param passphrase: Base64 encoded string representation of the passphrase.
    :param rsa_key: Base64 encoded string representation of the RSA key file.
    :param rsa_key_passphrase: Base64 encoded string representation of the RSA key passphrase.
    :return:
    """
    # TODO - copy existing recovery code from Github (Fireblocks Recovery) and use it in here.
    return {"xprv": "",
            "fprv": "",
            "xpub": "",
            "fpub": ""}


if __name__ == '__main__':
    setup_global_state()
    print("Server started")
    serve(app, host="localhost", port=8080)
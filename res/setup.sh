#!/bin/bash
pip3 install --target=./dependencies -r requirements.txt
pip3 install --target=./dependencies eth-utils eth-keys bitcoin-utils bip32 bip32utils pynacl flask jinja2 markupsafe waitress toolz
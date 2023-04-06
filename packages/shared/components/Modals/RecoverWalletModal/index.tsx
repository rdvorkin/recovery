import React, { useState } from 'react';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { assets } from '@fireblocks/asset-config';
import { VaultAccount } from '../../../types';
import { BaseModal } from '../../BaseModal';
import { Button } from '../../Button';
import { AssetIcon } from '../../Icons';

type Props = {
  assets?: { id: string; name: string; type: string }[];
  account?: VaultAccount;
  open: boolean;
  onClose: VoidFunction;
  addWallet: (assetId: string, accountId: number) => void;
};

export const RecoverWalletModal = ({ assets: _assets = assets, account, open, onClose: _onClose, addWallet }: Props) => {
  const [assetId, setAssetId] = useState<string | null>(null);

  const onClose = () => {
    _onClose();

    setAssetId(null);
  };

  const onClickAsset = (_assetId: string) => setAssetId(_assetId);

  const onClickRecover = () => {
    if (typeof account?.id === 'number' && assetId) {
      addWallet(assetId, account.id);
    }

    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={
        (
          <Box>
            {!!account?.name && (
              <Typography component='h2' variant='h3' marginTop='1em' color={(theme) => theme.palette.text.disabled}>
                {account.name}
              </Typography>
            )}
            <Typography variant='h1' marginTop='0.5em'>
              Recover Asset Wallet
            </Typography>
          </Box>
        ) as unknown as string
      }
      actions={
        <>
          <Button variant='text' onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!assetId} onClick={onClickRecover}>
            Recover
          </Button>
        </>
      }
    >
      <List component='nav' aria-label='main mailbox folders'>
        {_assets.map((asset) => (
          <ListItemButton
            key={asset.id}
            selected={assetId === asset.id}
            dense
            divider
            onClick={() => onClickAsset(asset.id)}
            sx={{
              transition: 'none',
              '&:hover': {
                background: 'transparent',
                boxShadow: '0px 3px 10px 0 rgb(41 51 155 / 15%)',
                borderRadius: '8px',
              },
            }}
          >
            <ListItemIcon>
              <Box
                width={40}
                height={40}
                display='flex'
                alignItems='center'
                justifyContent='center'
                borderRadius={40}
                border={(theme) => `solid 1px ${theme.palette.grey[300]}`}
                sx={{ background: '#FFF' }}
              >
                <AssetIcon assetId={asset.id} />
              </Box>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'h2' }} primary={asset.id} secondary={asset.name} />
          </ListItemButton>
        ))}
      </List>
    </BaseModal>
  );
};
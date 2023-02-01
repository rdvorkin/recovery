import type { NextPageWithLayout } from "./_app";
import type { ReactElement } from "react";
import { LogoHero, Button, NextLinkComposed } from "shared";
import { Grid } from "@mui/material";
import { Layout } from "../components/Layout";
import { pythonServerUrlParams } from "../lib/pythonClient";

const Index: NextPageWithLayout = () => {
  return (
    <Grid container spacing={2} alignItems="center" height="100%" padding="rem">
      <Grid item xs={6}>
        <LogoHero
          title="Recovery Utility"
          description="Recover Fireblocks assets and keys in a disaster, verify a Recovery Kit, or generate keys to set up a new Recovery Kit."
        />
      </Grid>
      <Grid item xs={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              size="large"
              variant="outlined"
              fullWidth
              component={NextLinkComposed}
              to={{
                pathname: "/setup",
                query: pythonServerUrlParams,
              }}
            >
              Set Up Recovery Kit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              size="large"
              variant="outlined"
              fullWidth
              component={NextLinkComposed}
              to={{
                pathname: "/recover",
                query: {
                  ...pythonServerUrlParams,
                  verifyOnly: true,
                },
              }}
            >
              Verify Recovery Kit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              size="large"
              color="primary"
              fullWidth
              component={NextLinkComposed}
              to={{
                pathname: "/recover",
                query: pythonServerUrlParams,
              }}
            >
              Recover Private Keys
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

Index.getLayout = (page: ReactElement) => <Layout hideHeader>{page}</Layout>;

export default Index;

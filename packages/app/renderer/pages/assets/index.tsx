import type { NextPageWithLayout } from "../_app";
import { Layout } from "../../components/Layout";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { pythonServerUrlParams } from "../../lib/pythonClient";

const Wallets: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.push({
      pathname: "/assets/[assetId]",
      query: {
        ...pythonServerUrlParams,
        assetId: "BTC",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

Wallets.getLayout = (page) => <Layout>{page}</Layout>;

export default Wallets;

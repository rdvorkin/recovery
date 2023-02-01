import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recoverAccountInput } from "../../../lib/schemas";
import { Button, TextField } from "shared";
import { useWorkspace } from "../../../context/Workspace";
import { BaseModal } from "../BaseModal";
import { pythonServerUrlParams } from "../../../lib/pythonClient";

type Props = {
  open: boolean;
  onClose: VoidFunction;
};

type FormData = z.infer<typeof recoverAccountInput>;

const defaultValues: FormData = { name: "" };

export const RecoverAccountModal = ({ open, onClose: _onClose }: Props) => {
  const router = useRouter();

  const { restoreVaultAccount } = useWorkspace();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(recoverAccountInput),
    defaultValues,
  });

  const onClose = () => {
    _onClose();

    reset(defaultValues);
  };

  const onSubmit = (formData: FormData) => {
    const accountId = restoreVaultAccount(formData.name);

    router.push({
      pathname: "/accounts/vault/[accountId]",
      query: { ...pythonServerUrlParams, accountId },
    });
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Recover Vault Account"
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Recover</Button>
        </>
      }
      WrapperComponent={(props) => (
        <form onSubmit={handleSubmit(onSubmit)} {...props} />
      )}
    >
      <TextField
        id="accountName"
        label="Account Name"
        placeholder="e.g. Funding"
        error={errors.name?.message}
        autoFocus
        {...register("name")}
      />
    </BaseModal>
  );
};

import { ref } from "vue";

export default () => {
  const showBackdrop = ref(false);
  const isBackdropClosable = ref(true);
  const showShareTip = ref(false);
  const showFollowDialog = ref(false);
  const showRuleDialog = ref(false);
  const showCustomDialog = ref(false);
  const showLightCompleteDialog = ref(false);
  const showLightSuccessDialog = ref(false);
  const showLightHelpDialog = ref(false);
  const showLightNoChanceDialog = ref(false);
  const showWriteOffDialog = ref(false);
  const showNoStockDialog = ref(false);
  const showAlreadySuccessDialog = ref(false);

  const closeAllDialog = () => {
    showBackdrop.value = false;
    showShareTip.value = false;
    showFollowDialog.value = false;
    showRuleDialog.value = false;
    showCustomDialog.value = false;
    showLightCompleteDialog.value = false;
    showLightSuccessDialog.value = false;
    showLightHelpDialog.value = false;
    showLightNoChanceDialog.value = false;
    showWriteOffDialog.value = false;
    showNoStockDialog.value = false;
    showAlreadySuccessDialog.value = false;
  };

  const openDialog = (fn: Function, closable = true) => () => {
    closeAllDialog();
    showBackdrop.value = true;
    isBackdropClosable.value = closable;
    fn();
  };

  const clickCloseDialog = () => {
    if (!isBackdropClosable.value) {
      return;
    }
    closeAllDialog();
  };

  const openShareTip = openDialog(() => {
    showShareTip.value = true;
  });

  const openFollowDialog = openDialog(() => {
    showFollowDialog.value = true;
  });

  const openRuleDialog = openDialog(() => {
    showRuleDialog.value = true;
  });

  const openCustomDialog = openDialog(() => {
    showCustomDialog.value = true;
  }, false);

  const openLightCompleteDialog = openDialog(() => {
    showLightCompleteDialog.value = true;
  }, false);

  const openLightSuccessDialog = openDialog(() => {
    showLightSuccessDialog.value = true;
  });

  const openLightHelpDialog = openDialog(() => {
    showLightHelpDialog.value = true;
  }, false);

  const openLightNoChanceDialog = openDialog(() => {
    showLightNoChanceDialog.value = true;
  });

  const openWriteOffDialog = openDialog(() => {
    showWriteOffDialog.value = true;
  });

  const openNoStockDialog = openDialog(() => {
    showNoStockDialog.value = true;
  });

  const openAlreadySuccessDialog = openDialog(() => {
    showAlreadySuccessDialog.value = true;
  });

  return {
    showBackdrop,
    isBackdropClosable,
    closeAllDialog,
    clickCloseDialog,
    showShareTip,
    openShareTip,
    showFollowDialog,
    openFollowDialog,
    showRuleDialog,
    openRuleDialog,
    showCustomDialog,
    openCustomDialog,
    showLightCompleteDialog,
    openLightCompleteDialog,
    showLightSuccessDialog,
    openLightSuccessDialog,
    showLightNoChanceDialog,
    openLightNoChanceDialog,
    showWriteOffDialog,
    openWriteOffDialog,
    showLightHelpDialog,
    openLightHelpDialog,
    showNoStockDialog,
    openNoStockDialog,
    showAlreadySuccessDialog,
    openAlreadySuccessDialog,
  };
};

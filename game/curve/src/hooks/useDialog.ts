import { ref } from "vue";

export default () => {
  const showBackdrop = ref(false);
  const isBackdropClosable = ref(true);
  const showShareTip = ref(false);
  const showFollowDialog = ref(false);
  const showRuleDialog = ref(false);
  const showCustomDialog = ref(false);
  const showBindDialog = ref(false);
  const showGameNoChanceDialog = ref(false);
  const showRankDialog = ref(false);
  const showGameFinishDialog = ref(false);
  const showPrizeUnopenDialog = ref(false);
  const showGameRankDialog = ref(false);
  const showAppDownloadDialog = ref(false);

  const closeAllDialog = () => {
    showBackdrop.value = false;
    showShareTip.value = false;
    showFollowDialog.value = false;
    showRuleDialog.value = false;
    showCustomDialog.value = false;
    showBindDialog.value = false;
    showGameNoChanceDialog.value = false;
    showRankDialog.value = false;
    showGameFinishDialog.value = false;
    showPrizeUnopenDialog.value = false;
    showGameRankDialog.value = false;
    showAppDownloadDialog.value = false;
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
  });

  const openBindDialog = openDialog(() => {
    showBindDialog.value = true;
  });

  const openGameNoChanceDialog = openDialog(() => {
    showGameNoChanceDialog.value = true;
  });

  const openRankDialog = openDialog(() => {
    showRankDialog.value = true;
  });

  const openGameFinishDialog = openDialog(() => {
    showGameFinishDialog.value = true;
  }, false);

  const openPrizeUnopenDialog = openDialog(() => {
    showPrizeUnopenDialog.value = true;
  });

  const openGameRankDialog = openDialog(() => {
    showGameRankDialog.value = true;
  }, false);

  const openAppDownloadDialog = openDialog(() => {
    showAppDownloadDialog.value = true;
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
    showBindDialog,
    openBindDialog,
    showGameNoChanceDialog,
    openGameNoChanceDialog,
    showRankDialog,
    openRankDialog,
    showGameFinishDialog,
    openGameFinishDialog,
    showPrizeUnopenDialog,
    openPrizeUnopenDialog,
    showGameRankDialog,
    openGameRankDialog,
    showAppDownloadDialog,
    openAppDownloadDialog,
  };
};

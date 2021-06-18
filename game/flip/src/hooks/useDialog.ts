import { ref } from "vue";

export default () => {
  const showBackdrop = ref(false);
  const isBackdropClosable = ref(true);
  const showShareTip = ref(false);
  const showFollowDialog = ref(false);
  const showRuleDialog = ref(false);
  const showCustomDialog = ref(false);
  const showLotteryWinDialog = ref(false);
  const showLotteryLoseDialog = ref(false);
  const showLotteryNoChanceDialog = ref(false);
  const showLotteryExchangeDialog = ref(false);
  const showGameWinDialog = ref(false);
  const showGameLoseDialog = ref(false);
  const showGameNoChanceDialog = ref(false);

  const closeAllDialog = () => {
    showBackdrop.value = false;
    showShareTip.value = false;
    showFollowDialog.value = false;
    showRuleDialog.value = false;
    showCustomDialog.value = false;
    showLotteryWinDialog.value = false;
    showLotteryLoseDialog.value = false;
    showLotteryNoChanceDialog.value = false;
    showLotteryExchangeDialog.value = false;
    showGameWinDialog.value = false;
    showGameLoseDialog.value = false;
    showGameNoChanceDialog.value = false;
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

  const openLotteryWinDialog = openDialog(() => {
    showLotteryWinDialog.value = true;
  });

  const openLotteryLoseDialog = openDialog(() => {
    showLotteryLoseDialog.value = true;
  });

  const openLotteryNoChanceDialog = openDialog(() => {
    showLotteryNoChanceDialog.value = true;
  });

  const openLotteryExchangeDialog = openDialog(() => {
    showLotteryExchangeDialog.value = true;
  });

  const openGameWinDialog = openDialog(() => {
    showGameWinDialog.value = true;
  }, false);

  const openGameLoseDialog = openDialog(() => {
    showGameLoseDialog.value = true;
  }, false);

  const openGameNoChanceDialog = openDialog(() => {
    showGameNoChanceDialog.value = true;
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
    showLotteryWinDialog,
    openLotteryWinDialog,
    showLotteryLoseDialog,
    openLotteryLoseDialog,
    showLotteryNoChanceDialog,
    openLotteryNoChanceDialog,
    showLotteryExchangeDialog,
    openLotteryExchangeDialog,
    showGameWinDialog,
    openGameWinDialog,
    showGameLoseDialog,
    openGameLoseDialog,
    showGameNoChanceDialog,
    openGameNoChanceDialog,
  };
};

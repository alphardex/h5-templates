import { ref } from "vue";

export default () => {
  const showBackdrop = ref(false);
  const isBackdropClosable = ref(true);
  const showShareTip = ref(false);
  const showFollowDialog = ref(false);
  const showRuleDialog = ref(false);
  const showLotteryWinDialog = ref(false);
  const showLotteryLoseDialog = ref(false);
  const showLotteryExchangeDialog = ref(false);
  const showLotteryNoChanceDialog = ref(false);
  const showQuizWinDialog = ref(false);
  const showQuizLoseDialog = ref(false);
  const showQuizNoChanceDialog = ref(false);
  const showHelpDialog = ref(false);
  const showHelpedDialog = ref(false);
  const showFillInfoDialog = ref(false);

  const closeAllDialog = () => {
    showBackdrop.value = false;
    showShareTip.value = false;
    showFollowDialog.value = false;
    showRuleDialog.value = false;
    showLotteryWinDialog.value = false;
    showLotteryLoseDialog.value = false;
    showLotteryExchangeDialog.value = false;
    showLotteryNoChanceDialog.value = false;
    showQuizWinDialog.value = false;
    showQuizLoseDialog.value = false;
    showQuizNoChanceDialog.value = false;
    showHelpDialog.value = false;
    showHelpedDialog.value = false;
    showFillInfoDialog.value = false;
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

  const openLotteryWinDialog = openDialog(() => {
    showLotteryWinDialog.value = true;
  });

  const openLotteryLoseDialog = openDialog(() => {
    showLotteryLoseDialog.value = true;
  });

  const openLotteryExchangeDialog = openDialog(() => {
    showLotteryExchangeDialog.value = true;
  });

  const openQuizWinDialog = openDialog(() => {
    showQuizWinDialog.value = true;
  }, false);

  const openQuizLoseDialog = openDialog(() => {
    showQuizLoseDialog.value = true;
  }, false);

  const openQuizNoChanceDialog = openDialog(() => {
    showQuizNoChanceDialog.value = true;
  });

  const openLotteryNoChanceDialog = openDialog(() => {
    showLotteryNoChanceDialog.value = true;
  });

  const openHelpDialog = openDialog(() => {
    showHelpDialog.value = true;
  });

  const openHelpedDialog = openDialog(() => {
    showHelpedDialog.value = true;
  });

  const openFillInfoDialog = openDialog(() => {
    showFillInfoDialog.value = true;
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
    showLotteryWinDialog,
    openLotteryWinDialog,
    showLotteryLoseDialog,
    openLotteryLoseDialog,
    showQuizWinDialog,
    openQuizWinDialog,
    showQuizLoseDialog,
    openQuizLoseDialog,
    showLotteryExchangeDialog,
    openLotteryExchangeDialog,
    showQuizNoChanceDialog,
    openQuizNoChanceDialog,
    showLotteryNoChanceDialog,
    openLotteryNoChanceDialog,
    showHelpDialog,
    openHelpDialog,
    showHelpedDialog,
    openHelpedDialog,
    showFillInfoDialog,
    openFillInfoDialog,
  };
};

const DIALOG_ID = "battle-data-confirmation-dialog";

function getDialogElements(dialog) {
  return {
    title: dialog.querySelector("[data-dialog-title]"),
    message: dialog.querySelector("[data-dialog-message]"),
    context: dialog.querySelector("[data-dialog-context]"),
    note: dialog.querySelector("[data-dialog-note]"),
    cancel: dialog.querySelector('[data-dialog-action="cancel"]'),
    replace: dialog.querySelector('[data-dialog-action="replace"]'),
    newTab: dialog.querySelector('[data-dialog-action="new-tab"]'),
    overwrite: dialog.querySelector('[data-dialog-action="overwrite"]')
  };
}

function formatContext(context) {
  if (!context) return "";

  return [
    context.world ? "ワールド " + context.world : "",
    context.groupId ? "グループ " + context.groupId : "",
    context.battleClass ? "クラス " + context.battleClass : "",
    context.block ? "ブロック " + context.block : ""
  ].filter(Boolean).join(" / ");
}

let activeDialogPromise = null;

export function showBattleDataConfirmation({ mode, reason = "", context = null } = {}) {
  if (activeDialogPromise) return activeDialogPromise;

  const dialog = document.getElementById(DIALOG_ID);
  if (!dialog || typeof dialog.showModal !== "function") {
    return Promise.resolve("cancel");
  }

  const elements = getDialogElements(dialog);
  const contextText = formatContext(context);
  const isReplacement = mode === "replace";
  const previousFocus = document.activeElement;

  elements.title.textContent = isReplacement
    ? "別のバトルデータを反映しますか？"
    : "編集したMAPへデータを反映しますか？";
  elements.message.textContent = isReplacement
    ? reason === "context"
      ? "別の反映元のデータです。現在の全タブとMAP編集履歴を初期化して反映します。"
      : "ギルド構成が変わっています。現在の全タブとMAP編集履歴を初期化して反映します。"
    : "現在のタブには、データ反映後の編集があります。";
  elements.context.textContent = contextText ? "反映元: " + contextText : "";
  elements.context.hidden = !contextText;
  elements.note.textContent = "上書き直後は、MAP左上のUndoで反映前に戻せます。";
  elements.note.hidden = isReplacement;

  elements.cancel.hidden = false;
  elements.replace.hidden = !isReplacement;
  elements.newTab.hidden = isReplacement;
  elements.overwrite.hidden = isReplacement;
  dialog.dataset.mode = mode;

  activeDialogPromise = new Promise(resolve => {
    const actionButtons = [
      elements.cancel,
      elements.replace,
      elements.newTab,
      elements.overwrite
    ].filter(Boolean);

    const cleanup = () => {
      actionButtons.forEach(button => button.removeEventListener("click", handleAction));
      dialog.removeEventListener("click", handleBackdrop);
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      dialog.dataset.mode = "";
      activeDialogPromise = null;
    };

    const finish = action => {
      if (dialog.open) {
        dialog.returnValue = action;
        dialog.close();
      }
    };

    const handleAction = event => finish(event.currentTarget.dataset.dialogAction);
    const handleBackdrop = event => {
      if (event.target === dialog) finish("cancel");
    };
    const handleCancel = event => {
      event.preventDefault();
      finish("cancel");
    };
    const handleClose = () => {
      const action = dialog.returnValue || "cancel";
      cleanup();
      if (previousFocus && typeof previousFocus.focus === "function" && previousFocus.isConnected) {
        previousFocus.focus();
      }
      resolve(action);
    };

    actionButtons.forEach(button => button.addEventListener("click", handleAction));
    dialog.addEventListener("click", handleBackdrop);
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);

    dialog.showModal();
    elements.cancel.focus();
  });

  return activeDialogPromise;
}

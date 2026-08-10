const DIALOG_ID = "battle-data-confirmation-dialog";
const BATTLE_BLOCK_LABELS = ["A", "B", "C", "D"];

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

  const blockIndex = Number(context.block);
  const blockLabel = Number.isInteger(blockIndex) && BATTLE_BLOCK_LABELS[blockIndex]
    ? BATTLE_BLOCK_LABELS[blockIndex]
    : context.block;
  const hasBlock = blockLabel !== undefined && blockLabel !== null && blockLabel !== "";

  return [
    context.world ? "ワールド " + context.world : "",
    context.groupId ? "グループ " + context.groupId : "",
    context.battleClass ? "クラス " + context.battleClass : "",
    hasBlock ? "ブロック" + blockLabel : ""
  ].filter(Boolean).join(" / ");
}

let activeDialogPromise = null;

function showConfirmationDialog({
  title,
  message,
  contextText = "",
  noteText = "",
  noteTone = "info",
  mode = "",
  confirmLabel = "上書き",
  confirmClass = "dialog-primary-button",
  showNewTab = false,
  showOverwrite = true,
  showReplace = false
} = {}) {
  if (activeDialogPromise) return activeDialogPromise;

  const dialog = document.getElementById(DIALOG_ID);
  if (!dialog || typeof dialog.showModal !== "function") {
    return Promise.resolve("cancel");
  }

  const elements = getDialogElements(dialog);
  const previousFocus = document.activeElement;
  elements.title.textContent = title;
  elements.message.textContent = message;
  elements.context.textContent = contextText ? "反映元: " + contextText : "";
  elements.context.hidden = !contextText;
  elements.note.textContent = noteText;
  elements.note.hidden = !noteText;
  elements.note.dataset.tone = noteTone;

  elements.cancel.hidden = false;
  elements.newTab.hidden = !showNewTab;
  elements.overwrite.hidden = !showOverwrite;
  elements.replace.hidden = !showReplace;
  elements.newTab.textContent = "新しいタブ";
  elements.overwrite.textContent = showOverwrite ? confirmLabel : "上書き";
  elements.replace.textContent = showReplace ? confirmLabel : "データを反映";
  elements.overwrite.className = showOverwrite ? confirmClass : "dialog-primary-button";
  elements.replace.className = showReplace ? confirmClass : "dialog-danger-button";
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

export function showBattleDataConfirmation({ mode, reason = "", context = null } = {}) {
  const isReplacement = mode === "replace";

  return showConfirmationDialog({
    title: isReplacement
      ? "別のバトルデータを反映しますか？"
      : "編集したMAPへデータを反映しますか？",
    message: isReplacement
      ? reason === "context"
        ? "別の反映元のデータです。"
        : "ギルド構成が変わっています。"
      : "現在のタブには、データ反映後の編集があります。",
    contextText: formatContext(context),
    noteText: isReplacement
      ? "現在の全タブとMAP編集履歴は初期化されます。"
      : "上書き直後は、MAP左上のUndoで反映前に戻せます。",
    noteTone: isReplacement ? "danger" : "info",
    mode,
    confirmLabel: isReplacement ? "データを反映" : "上書き",
    confirmClass: isReplacement ? "dialog-danger-button" : "dialog-primary-button",
    showNewTab: !isReplacement,
    showOverwrite: !isReplacement,
    showReplace: isReplacement
  });
}

export function showDestructiveConfirmation({ title, message, noteText = "この操作はUndoでは戻せません。", confirmLabel } = {}) {
  return showConfirmationDialog({
    title,
    message,
    noteText,
    noteTone: "danger",
    confirmLabel,
    mode: "destructive",
    confirmClass: "dialog-danger-button",
    showOverwrite: true
  }).then(action => action === "overwrite");
}

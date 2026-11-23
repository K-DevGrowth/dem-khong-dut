import { TOTAL_LOOPS, LOOP_STORY } from "../config/storyData.js";

export function createKeypadController(els, state, audio, callbacks) {
  let keypadCode = "";

  function renderKeypad() {
    els.keypadDisplay.textContent = keypadCode.padEnd(4, "-");
    els.keypadDisplay.classList.remove("error");
  }

  function openKeypad() {
    if (!state.running || state.ended) return;
    keypadCode = "";
    renderKeypad();
    els.keypadMsg.textContent = "Gõ phím số hoặc bấm trực tiếp bên dưới.";
    els.keypadMsg.classList.remove("err");
    state.paused = true;
    if (document.pointerLockElement) document.exitPointerLock();
    if (callbacks.clearKeys) callbacks.clearKeys();
    els.keypadScreen.classList.remove("hidden");
  }

  function closeKeypad() {
    els.keypadScreen.classList.add("hidden");
    if (
      state.running &&
      !state.ended &&
      els.settingsScreen.classList.contains("hidden") &&
      els.journalScreen.classList.contains("hidden")
    ) {
      state.paused = false;
    }
  }

  function submitKeypad() {
    if (keypadCode === "0214" || keypadCode === "1411") {
      state.codeUnlocked = true;
      closeKeypad();
      state.loopClueFound = true;
      if (callbacks.onCodeSuccess) callbacks.onCodeSuccess();
    } else {
      audio.playDoorSlam();
      els.keypadDisplay.classList.remove("error");
      void els.keypadDisplay.offsetWidth;
      els.keypadDisplay.classList.add("error");
      els.keypadMsg.textContent =
        "Sai mật mã! Gợi ý: nhìn đồng hồ đầu giường hoặc gương phòng tắm.";
      els.keypadMsg.classList.add("err");
      keypadCode = "";
      setTimeout(renderKeypad, 420);
    }
  }

  function pushKeypadDigit(d) {
    if (d === "backspace") {
      if (keypadCode.length === 0) return;
      audio.playClockTick();
      keypadCode = keypadCode.slice(0, -1);
      renderKeypad();
      return;
    }
    if (!/^[0-9]$/.test(String(d)) || keypadCode.length >= 4) return;
    audio.playClockTick();
    keypadCode += String(d);
    renderKeypad();
    if (keypadCode.length === 4) {
      setTimeout(submitKeypad, 180);
    }
  }

  document
    .querySelectorAll("#keypad-screen .keypad-btn[data-digit]")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        pushKeypadDigit(btn.getAttribute("data-digit")),
      );
    });
  const btnClear = document.getElementById("btn-keypad-clear");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      keypadCode = "";
      renderKeypad();
      els.keypadMsg.textContent = "Gõ phím số hoặc bấm trực tiếp bên dưới.";
      els.keypadMsg.classList.remove("err");
    });
  }
  const btnEnter = document.getElementById("btn-keypad-enter");
  if (btnEnter) btnEnter.addEventListener("click", submitKeypad);
  const btnClose = document.getElementById("btn-close-keypad");
  if (btnClose) btnClose.addEventListener("click", closeKeypad);

  return {
    openKeypad,
    closeKeypad,
    submitKeypad,
    pushKeypadDigit,
    clearCode: () => {
      keypadCode = "";
      renderKeypad();
    },
  };
}

import { parseSessionInput, SUPPORTED_SESSION_COOKIE_NAMES } from "./token.mjs";

const CHATGPT_URL = "https://chatgpt.com/";

const loginForm = document.querySelector("#loginForm");
const tokenInput = document.querySelector("#sessionToken");
const cookieType = document.querySelector("#cookieType");
const toggleToken = document.querySelector("#toggleToken");
const loginButton = document.querySelector("#loginButton");
const statusMessage = document.querySelector("#statusMessage");
const sessionBadge = document.querySelector("#sessionBadge");

function setStatus(message, tone) {
  statusMessage.textContent = message;
  statusMessage.dataset.tone = tone;
  statusMessage.hidden = false;
}

function setBusy(isBusy) {
  loginButton.disabled = isBusy;
  loginButton.querySelector("span").textContent = isBusy
    ? "正在写入安全会话…"
    : "写入会话并打开 ChatGPT";
}

async function refreshSessionBadge() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: "chatgpt.com" });
    const hasSession = cookies.some((cookie) =>
      SUPPORTED_SESSION_COOKIE_NAMES.includes(cookie.name)
    );

    sessionBadge.textContent = hasSession ? "已有会话" : "未登录";
    sessionBadge.dataset.active = String(hasSession);
  } catch {
    sessionBadge.textContent = "状态未知";
  }
}

async function writeSessionCookie(name, value) {
  const cookieDetails = {
    url: CHATGPT_URL,
    name,
    value,
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax"
  };

  if (!name.startsWith("__Host-")) {
    cookieDetails.domain = ".chatgpt.com";
  }

  const savedCookie = await chrome.cookies.set(cookieDetails);

  if (!savedCookie || savedCookie.value !== value) {
    throw new Error("浏览器未能保存会话 Cookie。");
  }
}

toggleToken.addEventListener("click", () => {
  const isVisible = toggleToken.getAttribute("aria-pressed") === "true";
  toggleToken.setAttribute("aria-pressed", String(!isVisible));
  toggleToken.setAttribute("aria-label", isVisible ? "显示令牌" : "隐藏令牌");
  tokenInput.dataset.masked = String(isVisible);
  tokenInput.focus();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.hidden = true;

  try {
    const { name, value } = parseSessionInput(tokenInput.value, cookieType.value);
    setBusy(true);
    await writeSessionCookie(name, value);

    tokenInput.value = "";
    setStatus("会话已写入，正在打开 ChatGPT。", "success");
    await refreshSessionBadge();
    await chrome.tabs.create({ url: CHATGPT_URL });
    window.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : "写入失败，请重试。";
    setStatus(message, "error");
    tokenInput.focus();
  } finally {
    setBusy(false);
  }
});

refreshSessionBadge();
tokenInput.dataset.masked = "true";
tokenInput.focus();

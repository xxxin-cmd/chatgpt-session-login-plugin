import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SESSION_COOKIE_NAME,
  parseSessionInput
} from "../token.mjs";

const VALID_TOKEN = "eyJhbGciOiJIUzI1NiJ9.example-session-token-value";

test("原始令牌使用默认 Cookie 名称", () => {
  assert.deepEqual(parseSessionInput(VALID_TOKEN), {
    name: DEFAULT_SESSION_COOKIE_NAME,
    value: VALID_TOKEN
  });
});

test("识别完整的 next-auth Cookie", () => {
  assert.deepEqual(
    parseSessionInput(`__Secure-next-auth.session-token=${VALID_TOKEN}`),
    {
      name: "__Secure-next-auth.session-token",
      value: VALID_TOKEN
    }
  );
});

test("从 Cookie 串中识别 authjs Session", () => {
  assert.deepEqual(
    parseSessionInput(`theme=light; __Secure-authjs.session-token=${VALID_TOKEN}; locale=zh-CN`),
    {
      name: "__Secure-authjs.session-token",
      value: VALID_TOKEN
    }
  );
});

test("手动选择的会话类型优先", () => {
  assert.equal(
    parseSessionInput(VALID_TOKEN, "__Secure-authjs.session-token").name,
    "__Secure-authjs.session-token"
  );
});

test("自动清除令牌中的空格、制表符和换行", () => {
  const formattedToken = `  eyJhbGciOiJIUzI1NiJ9.\nexample-session\t-token-value  `;
  assert.equal(
    parseSessionInput(formattedToken).value,
    "eyJhbGciOiJIUzI1NiJ9.example-session-token-value"
  );
});

test("自动清除零宽空格等隐藏格式字符", () => {
  const formattedToken = "eyJhbGciOiJIUzI1NiJ9.\u200Bexample-session\u2060-token-value";
  assert.equal(
    parseSessionInput(formattedToken).value,
    "eyJhbGciOiJIUzI1NiJ9.example-session-token-value"
  );
});

test("自动清除复制多行文本带入的反斜杠续行符", () => {
  const formattedToken = "eyJhbGciOiJIUzI1NiJ9.example-session\\-token-value";
  assert.equal(
    parseSessionInput(formattedToken).value,
    "eyJhbGciOiJIUzI1NiJ9.example-session-token-value"
  );
});

test("从完整 JSON 中只提取 sessionToken", () => {
  const sessionJson = JSON.stringify({
    WARNING_BANNER: "DO NOT SHARE",
    accessToken: "eyJ.access-token-must-not-be-used",
    sessionToken: VALID_TOKEN,
    authProvider: "auth0"
  });

  assert.deepEqual(parseSessionInput(sessionJson), {
    name: DEFAULT_SESSION_COOKIE_NAME,
    value: VALID_TOKEN
  });
});

test("JSON 缺少 sessionToken 时给出明确提示", () => {
  assert.throws(
    () => parseSessionInput(JSON.stringify({ accessToken: VALID_TOKEN })),
    /sessionToken/
  );
});

test("拒绝 API Key", () => {
  assert.throws(() => parseSessionInput("sk-example12345678901234567890"), /API Key/);
});

test("拒绝过短令牌", () => {
  assert.throws(() => parseSessionInput("too-short"), /过短/);
});

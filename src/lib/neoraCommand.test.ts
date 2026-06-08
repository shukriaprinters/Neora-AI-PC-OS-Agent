import assert from "node:assert/strict";
import { buildNeoraActions, isLikelyOsCommand } from "./neoraCommand";

const browserCommand = buildNeoraActions("open YouTube and search soft jazz");
assert.equal(browserCommand[0]?.action, "open_browser");
assert.equal(browserCommand[0]?.param, "https://www.youtube.com");

const chromeCommand = buildNeoraActions("open chrome and go to github");
assert.ok(chromeCommand.some((item) => item.action === "execute_cmd" && item.param === "chrome"));
assert.ok(chromeCommand.some((item) => item.action === "open_browser" && item.param === "https://github.com"));

const notepadCommand = buildNeoraActions("open notepad write memo");
assert.ok(notepadCommand.some((item) => item.action === "execute_cmd" && item.param === "notepad"));
assert.ok(notepadCommand.some((item) => item.action === "type_text"));
assert.ok(notepadCommand.some((item) => item.action === "press_key" && item.param === "enter"));

const calcCommand = buildNeoraActions("open calculator");
assert.ok(calcCommand.some((item) => item.action === "execute_cmd" && item.param === "calc"));

const paintCommand = buildNeoraActions("open paint");
assert.ok(paintCommand.some((item) => item.action === "execute_cmd" && item.param === "mspaint"));

const explorerCommand = buildNeoraActions("open file explorer");
assert.ok(explorerCommand.some((item) => item.action === "execute_cmd" && item.param === "explorer"));

const cmdCommand = buildNeoraActions("launch cmd");
assert.ok(cmdCommand.some((item) => item.action === "execute_cmd" && item.param === "cmd"));

const powershellCommand = buildNeoraActions("run powershell");
assert.ok(powershellCommand.some((item) => item.action === "execute_cmd" && item.param === "powershell"));

const bengaliCommand = buildNeoraActions("নোটপ্যাড খুলে মেমো লিখো");
assert.ok(bengaliCommand.some((item) => item.action === "execute_cmd" && item.param === "notepad"));
assert.ok(bengaliCommand.some((item) => item.action === "type_text"));

const directUrlCommand = buildNeoraActions("open https://example.com");
assert.equal(directUrlCommand[0]?.action, "open_browser");
assert.equal(directUrlCommand[0]?.param, "https://example.com");

const mixedCommand = buildNeoraActions("open chrome and then open notepad");
assert.ok(mixedCommand.some((item) => item.action === "execute_cmd" && item.param === "chrome"));
assert.ok(mixedCommand.some((item) => item.action === "execute_cmd" && item.param === "notepad"));

const browserOnlyFallback = buildNeoraActions("open browser");
assert.ok(browserOnlyFallback.some((item) => item.action === "execute_cmd" && item.param === "chrome"));

const screenshotCommand = buildNeoraActions("take a screenshot");
assert.ok(screenshotCommand.some((item) => item.action === "take_screenshot"));

assert.equal(isLikelyOsCommand("open calculator"), true);
assert.equal(isLikelyOsCommand("tell me a joke"), false);
assert.equal(isLikelyOsCommand("what is the weather today?"), false);
assert.equal(isLikelyOsCommand("please open https://openai.com"), true);

console.log("neoraCommand tests passed");

#!/usr/bin/env node

// src/cli.tsx
import { render } from "ink";

// src/app.tsx
import { useEffect as useEffect7, useState as useState8 } from "react";
import { Text as Text13, useApp, useInput as useInput4 } from "ink";

// src/components/Layout.tsx
import { Box, Text } from "ink";

// src/utils/platform.ts
import os from "os";
function isWsl() {
  return process.platform === "linux" && os.release().toLowerCase().includes("microsoft");
}
function detectPlatform() {
  if (isWsl()) {
    return "WSL";
  }
  if (process.platform === "darwin") {
    return "macOS";
  }
  if (process.platform === "win32") {
    return "Windows";
  }
  return "Linux";
}
function getArchLabel() {
  return process.arch;
}
function getPlatformLabel() {
  return `${detectPlatform()} ${getArchLabel()}`;
}

// src/components/Layout.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function Layout({
  title,
  subtitle,
  children,
  footer
}) {
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", paddingX: 1, children: [
    /* @__PURE__ */ jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "#58a6ff", paddingX: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: "#58a6ff", children: `\u{1F6E0}  ${title}` }),
      /* @__PURE__ */ jsx(Text, { color: "#6e7681", children: `v0.1.0         ${getPlatformLabel()}` })
    ] }),
    subtitle ? /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "#f0f6fc", children: subtitle }) }) : null,
    /* @__PURE__ */ jsx(Box, { flexDirection: "column", marginTop: 1, children }),
    /* @__PURE__ */ jsx(Box, { marginTop: 1, children: footer ?? /* @__PURE__ */ jsx(Text, { color: "#6e7681", children: "q \u9000\u51FA  Esc \u8FD4\u56DE  Ctrl+C \u5F3A\u5236\u9000\u51FA" }) })
  ] });
}

// src/components/MenuList.tsx
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Box as Box2, Text as Text2, useInput } from "ink";
import { TextInput } from "@inkjs/ui";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function MenuList({
  items,
  onSelect
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const filteredItems = useMemo(() => {
    if (!query) {
      return items;
    }
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) => `${item.label} ${item.description ?? ""}`.toLowerCase().includes(lowerQuery)
    );
  }, [items, query]);
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(filteredItems.length > 0 ? filteredItems.length - 1 : 0);
    }
  }, [filteredItems.length, selectedIndex]);
  useInput((input, key) => {
    if (isSearching) {
      if (key.escape) {
        setIsSearching(false);
        setQuery("");
        setSelectedIndex(0);
      }
      return;
    }
    if (input === "/") {
      setIsSearching(true);
      setSelectedIndex(0);
      return;
    }
    if ((key.downArrow || input === "j") && filteredItems.length > 0) {
      setSelectedIndex((current) => (current + 1) % filteredItems.length);
      return;
    }
    if ((key.upArrow || input === "k") && filteredItems.length > 0) {
      setSelectedIndex((current) => (current - 1 + filteredItems.length) % filteredItems.length);
      return;
    }
    if (key.return && filteredItems[selectedIndex]) {
      onSelect(filteredItems[selectedIndex].value);
    }
  });
  return /* @__PURE__ */ jsxs2(Box2, { flexDirection: "column", children: [
    isSearching ? /* @__PURE__ */ jsxs2(Box2, { marginBottom: 1, children: [
      /* @__PURE__ */ jsx2(Text2, { color: "#58a6ff", children: "\u641C\u7D22: " }),
      /* @__PURE__ */ jsx2(TextInput, { defaultValue: query, onChange: setQuery, onSubmit: () => setIsSearching(false) })
    ] }) : null,
    filteredItems.map((item, index) => {
      const selected = index === selectedIndex;
      return /* @__PURE__ */ jsxs2(Box2, { children: [
        /* @__PURE__ */ jsx2(Text2, { color: selected ? "#bc8cff" : "#f0f6fc", children: selected ? "\u276F " : "  " }),
        /* @__PURE__ */ jsx2(Text2, { color: selected ? "#bc8cff" : "#f0f6fc", children: item.label }),
        item.description ? /* @__PURE__ */ jsx2(Text2, { color: "#6e7681", children: `  ${item.description}` }) : null
      ] }, `${item.value}-${index}`);
    }),
    filteredItems.length === 0 ? /* @__PURE__ */ jsx2(Text2, { color: "#6e7681", children: "\u65E0\u5339\u914D\u9879" }) : null,
    /* @__PURE__ */ jsx2(Box2, { marginTop: 1, children: /* @__PURE__ */ jsx2(Text2, { color: "#6e7681", children: "\u2191\u2193 / j k \u5BFC\u822A  Enter \u8FDB\u5165  / \u641C\u7D22" }) })
  ] });
}

// src/modules/git/GitModule.tsx
import { useEffect as useEffect3, useMemo as useMemo2, useState as useState3 } from "react";
import { Box as Box6, Text as Text8 } from "ink";

// src/components/KeyValue.tsx
import { Box as Box3, Text as Text3 } from "ink";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function KeyValue({
  label,
  value,
  muted
}) {
  return /* @__PURE__ */ jsxs3(Box3, { children: [
    /* @__PURE__ */ jsx3(Box3, { width: 18, children: /* @__PURE__ */ jsx3(Text3, { color: "#c9d1d9", children: label }) }),
    /* @__PURE__ */ jsx3(Text3, { color: muted ? "#6e7681" : "#f0f6fc", children: value })
  ] });
}

// src/components/StatusBadge.tsx
import { Text as Text4 } from "ink";
import { jsx as jsx4 } from "react/jsx-runtime";
var COLORS = {
  ok: "#3fb950",
  warn: "#d29922",
  error: "#f85149",
  info: "#58a6ff"
};
var LABELS = {
  ok: "\u2713",
  warn: "\u26A0",
  error: "\u2717",
  info: "\u2022"
};
function StatusBadge({ variant, label }) {
  return /* @__PURE__ */ jsx4(Text4, { color: COLORS[variant], children: label ?? LABELS[variant] });
}

// src/components/ConfirmDialog.tsx
import { Box as Box4, Text as Text5, useInput as useInput2 } from "ink";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function ConfirmDialog({
  title,
  diff,
  onConfirm,
  onCancel
}) {
  useInput2((input, key) => {
    if (input.toLowerCase() === "y" || key.return) {
      onConfirm();
    }
    if (input.toLowerCase() === "n" || key.escape) {
      onCancel();
    }
  });
  return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", borderStyle: "round", borderColor: "#bc8cff", paddingX: 1, children: [
    /* @__PURE__ */ jsx5(Text5, { color: "#bc8cff", children: title }),
    /* @__PURE__ */ jsx5(Box4, { marginTop: 1, children: /* @__PURE__ */ jsx5(Text5, { children: diff }) }),
    /* @__PURE__ */ jsx5(Box4, { marginTop: 1, children: /* @__PURE__ */ jsx5(Text5, { color: "#d29922", children: "\u6309 `y` / `Enter` \u786E\u8BA4\uFF0C\u6309 `n` / `Esc` \u53D6\u6D88" }) })
  ] });
}

// src/components/EditableField.tsx
import { useEffect as useEffect2, useState as useState2 } from "react";
import { Box as Box5, Text as Text6 } from "ink";
import { TextInput as TextInput2 } from "@inkjs/ui";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function EditableField({
  label,
  defaultValue,
  placeholder,
  onSubmit
}) {
  const [value, setValue] = useState2(defaultValue ?? "");
  useEffect2(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);
  return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx6(Text6, { color: "#58a6ff", children: label }),
    /* @__PURE__ */ jsx6(
      TextInput2,
      {
        defaultValue: value,
        placeholder,
        onChange: setValue,
        onSubmit: (nextValue) => onSubmit(nextValue)
      }
    )
  ] });
}

// src/components/BackButton.tsx
import { Text as Text7 } from "ink";
import { jsx as jsx7 } from "react/jsx-runtime";
function BackButton() {
  return /* @__PURE__ */ jsx7(Text7, { color: "#6e7681", children: "`Esc` / `q` \u8FD4\u56DE\u4E0A\u7EA7" });
}

// src/utils/file.ts
import fs from "fs/promises";
import { accessSync, constants as fsConstants } from "fs";
import os2 from "os";
import path from "path";
function expandHome(inputPath) {
  if (inputPath === "~") {
    return os2.homedir();
  }
  if (inputPath.startsWith("~/")) {
    return path.join(os2.homedir(), inputPath.slice(2));
  }
  return inputPath;
}
async function pathExists(targetPath) {
  try {
    await fs.access(expandHome(targetPath));
    return true;
  } catch {
    return false;
  }
}
async function readTextFile(targetPath) {
  try {
    return await fs.readFile(expandHome(targetPath), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
async function assertWritable(targetPath) {
  const resolved = expandHome(targetPath);
  accessSync(resolved, fsConstants.R_OK | fsConstants.W_OK);
}
async function writeTextFile(targetPath, content) {
  const resolved = expandHome(targetPath);
  const parentDir = path.dirname(resolved);
  try {
    await assertWritable(resolved);
  } catch {
    accessSync(parentDir, fsConstants.R_OK | fsConstants.W_OK);
  }
  await fs.writeFile(resolved, content, "utf8");
}
function createDiffPreview(before, after) {
  return [`--- before`, before || "(empty)", `+++ after`, after || "(empty)"].join("\n");
}
function toOctalMode(mode) {
  if (typeof mode !== "number") {
    return "unknown";
  }
  return `0${(mode & 511).toString(8)}`;
}

// src/utils/shell.ts
import { execFile } from "child_process";
import { promisify } from "util";
var execFileAsync = promisify(execFile);
function sanitizeInput(value) {
  return value.replace(/\0/g, "").replace(/[\r\n]+/g, " ").trim();
}
async function runCommand(command, args = [], timeoutMs = 5e3) {
  const safeCommand = sanitizeInput(command);
  const safeArgs = args.map((arg) => sanitizeInput(arg));
  try {
    const result = await execFileAsync(safeCommand, safeArgs, {
      timeout: timeoutMs,
      encoding: "utf8",
      env: process.env
    });
    return {
      ok: true,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
      code: 0,
      command: [safeCommand, ...safeArgs].join(" ")
    };
  } catch (error) {
    const commandError = error;
    return {
      ok: false,
      stdout: commandError.stdout?.trim() ?? "",
      stderr: commandError.stderr?.trim() ?? commandError.message,
      code: typeof commandError.code === "number" ? commandError.code : null,
      command: [safeCommand, ...safeArgs].join(" ")
    };
  }
}

// src/modules/git/git-actions.ts
async function prepareGitConfigChange(key, currentValue, nextValue) {
  const safeKey = sanitizeInput(key);
  const safeValue = sanitizeInput(nextValue);
  return {
    title: `\u786E\u8BA4\u66F4\u65B0 ${safeKey}`,
    command: ["config", "--global", safeKey, safeValue],
    diff: createDiffPreview(`${safeKey}=${currentValue}`, `${safeKey}=${safeValue}`)
  };
}
function prepareGitAliasChange() {
  const before = "[alias]\n# no standard aliases detected";
  const after = ["[alias]", "  st = status -sb", "  co = checkout", "  br = branch", "  lg = log --oneline --graph --decorate"].join("\n");
  return {
    title: "\u786E\u8BA4\u914D\u7F6E\u5E38\u7528 alias",
    command: ["alias-batch"],
    diff: createDiffPreview(before, after)
  };
}
async function executeGitChange(change) {
  if (change.command[0] === "alias-batch") {
    const commands = [
      ["config", "--global", "alias.st", "status -sb"],
      ["config", "--global", "alias.co", "checkout"],
      ["config", "--global", "alias.br", "branch"],
      ["config", "--global", "alias.lg", "log --oneline --graph --decorate"]
    ];
    for (const command of commands) {
      const result = await runCommand("git", command);
      if (!result.ok) {
        return result;
      }
    }
    return { ok: true, stdout: "Git aliases updated.", stderr: "", code: 0, command: "git alias batch" };
  }
  return runCommand("git", change.command);
}
async function getGitRawConfig(targetPath) {
  return await readTextFile(targetPath) ?? "(file not found)";
}

// src/modules/git/git-parser.ts
import path2 from "path";
import ini from "ini";
import { z } from "zod";
var GitConfigSchema = z.object({
  user: z.record(z.string(), z.string()).optional(),
  core: z.record(z.string(), z.string()).optional(),
  init: z.record(z.string(), z.string()).optional(),
  pull: z.record(z.string(), z.string()).optional(),
  credential: z.record(z.string(), z.string()).optional(),
  commit: z.record(z.string(), z.string()).optional(),
  gpg: z.record(z.string(), z.string()).optional()
});
function parseGitConfig(raw) {
  const parsed = ini.parse(raw);
  return GitConfigSchema.parse(parsed);
}
async function loadGitConfig(cwd = process.cwd()) {
  const globalPath = expandHome("~/.gitconfig");
  const localPath = path2.join(cwd, ".git", "config");
  const globalRaw = await readTextFile(globalPath) ?? "";
  const localRaw = await readTextFile(localPath);
  const globalConfig = parseGitConfig(globalRaw);
  const localConfig = localRaw ? parseGitConfig(localRaw) : null;
  const platform = detectPlatform();
  const preview = {
    userName: globalConfig.user?.name ?? "(\u672A\u8BBE\u7F6E)",
    userEmail: globalConfig.user?.email ?? "(\u672A\u8BBE\u7F6E)",
    defaultEditor: globalConfig.core?.editor ?? "(\u672A\u8BBE\u7F6E)",
    defaultBranch: globalConfig.init?.defaultBranch ?? "(\u672A\u8BBE\u7F6E)",
    pullStrategy: globalConfig.pull?.rebase ?? "(\u672A\u8BBE\u7F6E)",
    credentialHelper: globalConfig.credential?.helper ?? "(\u672A\u8BBE\u7F6E)"
  };
  const health = [
    globalConfig.user?.name ? { status: "ok", message: "user.name \u5DF2\u914D\u7F6E" } : { status: "error", message: "user.name \u672A\u914D\u7F6E" },
    globalConfig.user?.email ? { status: "ok", message: "user.email \u5DF2\u914D\u7F6E" } : { status: "error", message: "user.email \u672A\u914D\u7F6E" },
    globalConfig.init?.defaultBranch === "main" ? { status: "ok", message: "init.defaultBranch = main" } : { status: "warn", message: "init.defaultBranch \u5EFA\u8BAE\u8BBE\u7F6E\u4E3A main" },
    globalConfig.core?.autocrlf ? { status: "ok", message: `core.autocrlf = ${globalConfig.core.autocrlf}` } : {
      status: "warn",
      message: `core.autocrlf \u672A\u8BBE\u7F6E\uFF08\u5EFA\u8BAE ${platform === "Windows" ? "true" : "input"}\uFF09`
    },
    globalConfig.pull?.rebase ? { status: "ok", message: `pull.rebase = ${globalConfig.pull.rebase}` } : { status: "warn", message: "pull.rebase \u672A\u8BBE\u7F6E" },
    globalConfig.commit?.gpgsign || globalConfig.gpg?.format || globalConfig.user?.signingkey ? { status: "ok", message: "\u68C0\u6D4B\u5230 signing \u76F8\u5173\u914D\u7F6E" } : { status: "warn", message: "\u672A\u68C0\u6D4B\u5230 GPG/SSH signing \u914D\u7F6E" }
  ];
  if (await pathExists(localPath)) {
    health.push({ status: "info", message: `\u68C0\u6D4B\u5230 local config: ${localPath}` });
  }
  return {
    globalPath,
    localPath,
    globalRaw,
    localRaw,
    globalConfig,
    localConfig,
    preview,
    health
  };
}

// src/modules/git/GitModule.tsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
function GitModule({ onBack }) {
  const [summary, setSummary] = useState3(null);
  const [view, setView] = useState3("menu");
  const [loading, setLoading] = useState3(true);
  const [error, setError] = useState3(null);
  const [pending, setPending] = useState3(null);
  const [selectedAction, setSelectedAction] = useState3("identity");
  const [message, setMessage] = useState3("");
  const [rawText, setRawText] = useState3("");
  const refresh = async () => {
    setLoading(true);
    setError(null);
    const nextSummary = await loadGitConfig();
    setSummary(nextSummary);
    setLoading(false);
  };
  useEffect3(() => {
    void refresh();
  }, []);
  const overview = useMemo2(() => summary?.preview, [summary]);
  if (loading || !summary || !overview) {
    return /* @__PURE__ */ jsx8(Layout, { title: "DevHub \u2014 Git \u914D\u7F6E", subtitle: "\u{1F4E6} Git \u914D\u7F6E    ~/.gitconfig", children: /* @__PURE__ */ jsx8(Text8, { color: "#58a6ff", children: "\u52A0\u8F7D Git \u914D\u7F6E\u4E2D..." }) });
  }
  const actions = [
    { label: "\u4FEE\u6539\u7528\u6237\u540D/\u90AE\u7BB1", value: "identity" },
    { label: "\u4FEE\u6539\u9ED8\u8BA4\u7F16\u8F91\u5668", value: "editor" },
    { label: "\u4FEE\u6539\u9ED8\u8BA4\u5206\u652F\u540D", value: "branch" },
    { label: "\u914D\u7F6E\u5E38\u7528 alias", value: "alias" },
    { label: "\u914D\u7F6E pull \u7B56\u7565", value: "pull" },
    { label: "\u67E5\u770B\u5B8C\u6574\u914D\u7F6E\uFF08raw\uFF09", value: "raw" },
    { label: "\u2190 \u8FD4\u56DE\u4E3B\u83DC\u5355", value: "back" }
  ];
  const submitSingleChange = async (key, currentValue, nextValue) => {
    setPending(await prepareGitConfigChange(key, currentValue, nextValue));
    setView("confirm");
  };
  return /* @__PURE__ */ jsxs6(Layout, { title: "DevHub \u2014 Git \u914D\u7F6E", subtitle: "\u{1F4E6} Git \u914D\u7F6E    ~/.gitconfig", children: [
    /* @__PURE__ */ jsx8(Text8, { color: "#6e7681", children: "\u2500\u2500 \u5F53\u524D\u914D\u7F6E\u9884\u89C8 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
    /* @__PURE__ */ jsx8(KeyValue, { label: "\u7528\u6237\u540D", value: overview.userName, muted: overview.userName === "(\u672A\u8BBE\u7F6E)" }),
    /* @__PURE__ */ jsx8(KeyValue, { label: "\u90AE\u7BB1", value: overview.userEmail, muted: overview.userEmail === "(\u672A\u8BBE\u7F6E)" }),
    /* @__PURE__ */ jsx8(KeyValue, { label: "\u9ED8\u8BA4\u7F16\u8F91\u5668", value: overview.defaultEditor, muted: overview.defaultEditor === "(\u672A\u8BBE\u7F6E)" }),
    /* @__PURE__ */ jsx8(KeyValue, { label: "\u9ED8\u8BA4\u5206\u652F", value: overview.defaultBranch, muted: overview.defaultBranch === "(\u672A\u8BBE\u7F6E)" }),
    /* @__PURE__ */ jsx8(KeyValue, { label: "pull \u7B56\u7565", value: overview.pullStrategy, muted: overview.pullStrategy === "(\u672A\u8BBE\u7F6E)" }),
    /* @__PURE__ */ jsx8(KeyValue, { label: "\u51ED\u8BC1\u5B58\u50A8", value: overview.credentialHelper, muted: overview.credentialHelper === "(\u672A\u8BBE\u7F6E)" }),
    /* @__PURE__ */ jsxs6(Box6, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx8(Text8, { color: "#6e7681", children: "\u2500\u2500 \u5065\u5EB7\u68C0\u67E5 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      summary.health.map((item, index) => /* @__PURE__ */ jsxs6(Box6, { children: [
        /* @__PURE__ */ jsx8(StatusBadge, { variant: item.status }),
        /* @__PURE__ */ jsx8(Text8, { children: ` ${item.message}` })
      ] }, `${item.status}-${item.message}-${index}`))
    ] }),
    /* @__PURE__ */ jsxs6(Box6, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx8(Text8, { color: "#6e7681", children: "\u2500\u2500 \u64CD\u4F5C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      view === "menu" ? /* @__PURE__ */ jsx8(
        MenuList,
        {
          items: actions,
          onSelect: async (value) => {
            if (value === "back") {
              onBack();
              return;
            }
            if (value === "alias") {
              setPending(prepareGitAliasChange());
              setSelectedAction("alias");
              setView("confirm");
              return;
            }
            if (value === "raw") {
              setRawText(
                [`# Global: ${summary.globalPath}`, await getGitRawConfig(summary.globalPath), "", summary.localRaw ? `# Local: ${summary.localPath}
${summary.localRaw}` : "# Local: not found"].join("\n")
              );
              setView("raw");
              return;
            }
            setSelectedAction(value);
            setView("edit");
          }
        }
      ) : null,
      view === "edit" && selectedAction === "identity" ? /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx8(
          EditableField,
          {
            label: `\u5F53\u524D\u7528\u6237\u540D: ${overview.userName}`,
            defaultValue: summary.globalConfig.user?.name,
            placeholder: "\u65B0\u7684 Git \u7528\u6237\u540D",
            onSubmit: (value) => void submitSingleChange("user.name", summary.globalConfig.user?.name ?? "", value)
          }
        ),
        /* @__PURE__ */ jsx8(
          EditableField,
          {
            label: `\u5F53\u524D\u90AE\u7BB1: ${overview.userEmail}`,
            defaultValue: summary.globalConfig.user?.email,
            placeholder: "\u65B0\u7684 Git \u90AE\u7BB1",
            onSubmit: (value) => void submitSingleChange("user.email", summary.globalConfig.user?.email ?? "", value)
          }
        ),
        /* @__PURE__ */ jsx8(BackButton, {})
      ] }) : null,
      view === "edit" && selectedAction === "editor" ? /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx8(
          EditableField,
          {
            label: `\u5F53\u524D\u9ED8\u8BA4\u7F16\u8F91\u5668: ${overview.defaultEditor}`,
            defaultValue: summary.globalConfig.core?.editor,
            placeholder: "\u4F8B\u5982 code --wait",
            onSubmit: (value) => void submitSingleChange("core.editor", summary.globalConfig.core?.editor ?? "", value)
          }
        ),
        /* @__PURE__ */ jsx8(BackButton, {})
      ] }) : null,
      view === "edit" && selectedAction === "branch" ? /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx8(
          EditableField,
          {
            label: `\u5F53\u524D\u9ED8\u8BA4\u5206\u652F: ${overview.defaultBranch}`,
            defaultValue: summary.globalConfig.init?.defaultBranch ?? "main",
            placeholder: "main",
            onSubmit: (value) => void submitSingleChange("init.defaultBranch", summary.globalConfig.init?.defaultBranch ?? "", value)
          }
        ),
        /* @__PURE__ */ jsx8(BackButton, {})
      ] }) : null,
      view === "edit" && selectedAction === "pull" ? /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx8(
          EditableField,
          {
            label: `\u5F53\u524D pull \u7B56\u7565: ${overview.pullStrategy}`,
            defaultValue: summary.globalConfig.pull?.rebase ?? "true",
            placeholder: "true / false / merges",
            onSubmit: (value) => void submitSingleChange("pull.rebase", summary.globalConfig.pull?.rebase ?? "", value)
          }
        ),
        /* @__PURE__ */ jsx8(BackButton, {})
      ] }) : null,
      view === "confirm" && pending ? /* @__PURE__ */ jsx8(
        ConfirmDialog,
        {
          title: pending.title,
          diff: pending.diff,
          onCancel: () => {
            setPending(null);
            setView("menu");
          },
          onConfirm: async () => {
            const result = await executeGitChange(pending);
            setMessage(result.ok ? result.stdout || "\u66F4\u65B0\u6210\u529F\u3002" : `\u6267\u884C\u5931\u8D25: ${result.stderr}`);
            setPending(null);
            setView("menu");
            await refresh();
          }
        }
      ) : null,
      view === "raw" ? /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", children: [
        /* @__PURE__ */ jsx8(Text8, { children: rawText }),
        /* @__PURE__ */ jsx8(BackButton, {})
      ] }) : null,
      message ? /* @__PURE__ */ jsx8(Box6, { marginTop: 1, children: /* @__PURE__ */ jsx8(Text8, { color: message.startsWith("\u6267\u884C\u5931\u8D25") ? "#f85149" : "#3fb950", children: message }) }) : null,
      error ? /* @__PURE__ */ jsx8(Text8, { color: "#f85149", children: error }) : null
    ] })
  ] });
}

// src/modules/ssh/SSHModule.tsx
import { useEffect as useEffect4, useState as useState4 } from "react";
import { Box as Box7, Text as Text9 } from "ink";

// src/modules/ssh/ssh-actions.ts
import path3 from "path";
async function prepareHostConfigAppend(hostAlias, hostName, user, identityFile) {
  const configPath = expandHome("~/.ssh/config");
  const current = await readTextFile(configPath) ?? "";
  const block = ["", `Host ${sanitizeInput(hostAlias)}`, `  HostName ${sanitizeInput(hostName)}`, `  User ${sanitizeInput(user)}`, "  Port 22", `  IdentityFile ${sanitizeInput(identityFile)}`, ""].join("\n");
  const next = current.endsWith("\n") || current.length === 0 ? `${current}${block}` : `${current}
${block}`;
  return {
    title: "\u786E\u8BA4\u66F4\u65B0 SSH \u4E3B\u673A\u914D\u7F6E",
    diff: createDiffPreview(current, next),
    execute: async () => {
      await writeTextFile(configPath, next);
      return { ok: true, stdout: "SSH config \u5DF2\u66F4\u65B0\u3002", stderr: "" };
    }
  };
}
async function addKeyToAgent(keyName) {
  return runCommand("ssh-add", [path3.join(expandHome("~/.ssh"), sanitizeInput(keyName))], 1e4);
}
async function testSSHHost(host) {
  return runCommand("ssh", ["-T", sanitizeInput(host)], 1e4);
}
async function generateSSHKey(email, fileName) {
  const target = path3.join(expandHome("~/.ssh"), sanitizeInput(fileName));
  return runCommand("ssh-keygen", ["-t", "ed25519", "-C", sanitizeInput(email), "-f", target, "-N", ""], 2e4);
}
async function fixSshPermissions(keyFiles) {
  const results = [await runCommand("chmod", ["700", expandHome("~/.ssh")]), await runCommand("chmod", ["600", expandHome("~/.ssh/config")])];
  for (const keyFile of keyFiles) {
    const privatePath = path3.join(expandHome("~/.ssh"), keyFile);
    const publicPath = `${privatePath}.pub`;
    if (await pathExists(privatePath)) {
      results.push(await runCommand("chmod", ["600", privatePath]));
    }
    if (await pathExists(publicPath)) {
      results.push(await runCommand("chmod", ["644", publicPath]));
    }
  }
  const failed = results.find((result) => !result.ok);
  if (failed) {
    return failed;
  }
  return { ok: true, stdout: "SSH permissions repaired.", stderr: "", code: 0, command: "chmod batch" };
}

// src/modules/ssh/ssh-parser.ts
import fs2 from "fs/promises";
import path4 from "path";
import SSHConfig from "ssh-config";
import { z as z2 } from "zod";
var SshKeySchema = z2.object({
  name: z2.string(),
  path: z2.string(),
  publicKeyPath: z2.string().nullable(),
  type: z2.string(),
  agentLoaded: z2.boolean(),
  privateMode: z2.string(),
  publicMode: z2.string().nullable()
});
var SshHostSchema = z2.object({
  host: z2.string(),
  hostname: z2.string(),
  user: z2.string(),
  port: z2.string(),
  identityFile: z2.string().nullable()
});
async function detectKeyType(filePath) {
  const result = await runCommand("ssh-keygen", ["-lf", filePath]);
  if (result.ok && result.stdout) {
    const match = result.stdout.match(/\(([^)]+)\)$/);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  if (filePath.includes("ed25519")) {
    return "ED25519";
  }
  if (filePath.includes("rsa")) {
    return "RSA";
  }
  return "Unknown";
}
function parseHosts(configText) {
  if (!configText.trim()) {
    return [];
  }
  const config = SSHConfig.parse(configText);
  const hosts = [];
  for (const line of config) {
    if (line.type !== SSHConfig.DIRECTIVE) {
      continue;
    }
    const directive = line;
    if (directive.param.toLowerCase() !== "host") {
      continue;
    }
    const section = line;
    const hostValue = typeof directive.value === "string" ? directive.value : directive.value.map((entry) => entry.val).join(", ");
    const resolved = section.config.reduce((accumulator, item) => {
      if (item.type === SSHConfig.DIRECTIVE && typeof item.value === "string") {
        accumulator[item.param.toLowerCase()] = item.value;
      }
      return accumulator;
    }, {});
    hosts.push(
      SshHostSchema.parse({
        host: hostValue,
        hostname: resolved.hostname ?? hostValue,
        user: resolved.user ?? "git",
        port: resolved.port ?? "22",
        identityFile: resolved.identityfile ?? null
      })
    );
  }
  return hosts;
}
async function loadSSHSummary() {
  const sshDir = expandHome("~/.ssh");
  const configPath = path4.join(sshDir, "config");
  const configRaw = await readTextFile(configPath) ?? "";
  const entries = await pathExists(sshDir) ? await fs2.readdir(sshDir) : [];
  const agentList = await runCommand("ssh-add", ["-l"]);
  const agentOutput = `${agentList.stdout}
${agentList.stderr}`;
  const keyFiles = entries.filter((entry) => {
    if (["config", "known_hosts", "authorized_keys"].includes(entry) || entry.endsWith(".pub")) {
      return false;
    }
    return !entry.includes(".");
  });
  const keys = await Promise.all(
    keyFiles.map(async (entry) => {
      const privatePath = path4.join(sshDir, entry);
      const publicKeyPath = await pathExists(`${privatePath}.pub`) ? `${privatePath}.pub` : null;
      const privateStat = await fs2.stat(privatePath);
      const publicStat = publicKeyPath ? await fs2.stat(publicKeyPath) : null;
      const key = SshKeySchema.parse({
        name: entry,
        path: privatePath,
        publicKeyPath,
        type: await detectKeyType(privatePath),
        agentLoaded: agentOutput.includes(entry),
        privateMode: toOctalMode(privateStat.mode),
        publicMode: publicStat ? toOctalMode(publicStat.mode) : null
      });
      return key;
    })
  );
  const hosts = parseHosts(configRaw);
  const sshDirMode = await pathExists(sshDir) ? toOctalMode((await fs2.stat(sshDir)).mode) : "missing";
  const configMode = await pathExists(configPath) ? toOctalMode((await fs2.stat(configPath)).mode) : "missing";
  const health = [
    sshDirMode === "0700" ? { status: "ok", message: "~/.ssh \u76EE\u5F55\u6743\u9650 700" } : { status: "warn", message: `~/.ssh \u76EE\u5F55\u6743\u9650\u5EFA\u8BAE 700\uFF0C\u5F53\u524D ${sshDirMode}` },
    configMode === "0600" ? { status: "ok", message: "config \u6587\u4EF6\u6743\u9650 600" } : { status: "warn", message: `config \u6587\u4EF6\u6743\u9650\u5EFA\u8BAE 600\uFF0C\u5F53\u524D ${configMode}` }
  ];
  for (const key of keys) {
    if (key.privateMode !== "0600") {
      health.push({ status: "error", message: `${key.name} \u79C1\u94A5\u6743\u9650\u5E94\u4E3A 600\uFF0C\u5F53\u524D ${key.privateMode}` });
    }
    if (!key.agentLoaded) {
      health.push({ status: "warn", message: `${key.name} \u672A\u52A0\u8F7D\u5230 ssh-agent` });
    }
  }
  for (const host of hosts) {
    if (!host.identityFile) {
      continue;
    }
    const resolvedIdentity = host.identityFile.startsWith("~/") ? expandHome(host.identityFile) : host.identityFile;
    if (!await pathExists(resolvedIdentity)) {
      health.push({ status: "warn", message: `config \u4E2D\u5F15\u7528\u4E86 ${host.identityFile}\uFF0C\u4F46\u8BE5\u6587\u4EF6\u4E0D\u5B58\u5728` });
    }
  }
  return { sshDir, configPath, configRaw, keys, hosts, health };
}

// src/modules/ssh/SSHModule.tsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function SSHModule({ onBack }) {
  const [summary, setSummary] = useState4(null);
  const [view, setView] = useState4("menu");
  const [message, setMessage] = useState4("");
  const [pending, setPending] = useState4(null);
  const [loading, setLoading] = useState4(true);
  const [selectedKey, setSelectedKey] = useState4("");
  const refresh = async () => {
    setLoading(true);
    setSummary(await loadSSHSummary());
    setLoading(false);
  };
  useEffect4(() => {
    void refresh();
  }, []);
  if (loading || !summary) {
    return /* @__PURE__ */ jsx9(Layout, { title: "DevHub \u2014 SSH \u914D\u7F6E", subtitle: "\u{1F510} SSH \u914D\u7F6E    ~/.ssh/", children: /* @__PURE__ */ jsx9(Text9, { color: "#58a6ff", children: "\u52A0\u8F7D SSH \u914D\u7F6E\u4E2D..." }) });
  }
  return /* @__PURE__ */ jsxs7(Layout, { title: "DevHub \u2014 SSH \u914D\u7F6E", subtitle: "\u{1F510} SSH \u914D\u7F6E    ~/.ssh/", children: [
    /* @__PURE__ */ jsx9(Text9, { color: "#6e7681", children: "\u2500\u2500 \u5BC6\u94A5\u5217\u8868 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
    summary.keys.length === 0 ? /* @__PURE__ */ jsx9(Text9, { color: "#6e7681", children: "\u672A\u68C0\u6D4B\u5230\u5BC6\u94A5\u6587\u4EF6" }) : null,
    summary.keys.map((key, index) => /* @__PURE__ */ jsx9(Text9, { children: `\u{1F511} ${key.name}    ${key.type}  ${key.agentLoaded ? "\u2713 agent\u5DF2\u52A0\u8F7D" : "\u2717 agent\u672A\u52A0\u8F7D"}  ${key.privateMode === "0600" ? "\u2713 \u6743\u9650600" : `\u26A0 \u6743\u9650${key.privateMode}`}` }, `${key.name}-${key.path}-${index}`)),
    /* @__PURE__ */ jsxs7(Box7, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx9(Text9, { color: "#6e7681", children: "\u2500\u2500 \u4E3B\u673A\u914D\u7F6E \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      summary.hosts.length === 0 ? /* @__PURE__ */ jsx9(Text9, { color: "#6e7681", children: "\u672A\u68C0\u6D4B\u5230 Host \u914D\u7F6E" }) : null,
      summary.hosts.map((host, index) => /* @__PURE__ */ jsx9(Text9, { children: `${host.host}     \u2192 ${host.user}@${host.hostname}:${host.port} (${host.identityFile ?? "no IdentityFile"})` }, `${host.host}-${host.hostname}-${index}`))
    ] }),
    /* @__PURE__ */ jsxs7(Box7, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx9(Text9, { color: "#6e7681", children: "\u2500\u2500 \u5065\u5EB7\u68C0\u67E5 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      summary.health.map((item, index) => /* @__PURE__ */ jsxs7(Box7, { children: [
        /* @__PURE__ */ jsx9(StatusBadge, { variant: item.status }),
        /* @__PURE__ */ jsx9(Text9, { children: ` ${item.message}` })
      ] }, `${item.status}-${item.message}-${index}`))
    ] }),
    /* @__PURE__ */ jsxs7(Box7, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx9(Text9, { color: "#6e7681", children: "\u2500\u2500 \u64CD\u4F5C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      view === "menu" ? /* @__PURE__ */ jsx9(
        MenuList,
        {
          items: [
            { label: "\u751F\u6210\u65B0\u5BC6\u94A5\u5BF9", value: "generate" },
            { label: "\u6DFB\u52A0\u5BC6\u94A5\u5230 ssh-agent", value: "add-agent" },
            { label: "\u7F16\u8F91\u4E3B\u673A\u914D\u7F6E", value: "edit-host" },
            { label: "\u6D4B\u8BD5\u4E3B\u673A\u8FDE\u63A5", value: "test" },
            { label: "\u4FEE\u590D\u6587\u4EF6\u6743\u9650", value: "fix" },
            { label: "\u67E5\u770B\u5B8C\u6574 config\uFF08raw\uFF09", value: "raw" },
            { label: "\u2190 \u8FD4\u56DE\u4E3B\u83DC\u5355", value: "back" }
          ],
          onSelect: async (value) => {
            if (value === "back") {
              onBack();
              return;
            }
            if (value === "fix") {
              const result = await fixSshPermissions(summary.keys.map((key) => key.name));
              setMessage(result.ok ? result.stdout : result.stderr);
              await refresh();
              return;
            }
            if (value === "raw") {
              setView("raw");
              return;
            }
            setView(value);
          }
        }
      ) : null,
      view === "generate" ? /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx9(
          EditableField,
          {
            label: "\u8F93\u5165\u90AE\u7BB1\u4E0E\u65B0\u5BC6\u94A5\u6587\u4EF6\u540D\uFF0C\u683C\u5F0F\uFF1Aemail,fileName",
            placeholder: "name@example.com,id_work",
            onSubmit: async (value) => {
              const [email, fileName] = value.split(",").map((part) => part.trim());
              if (!email || !fileName) {
                setMessage("\u8BF7\u8F93\u5165\u90AE\u7BB1\u548C\u5BC6\u94A5\u6587\u4EF6\u540D\u3002");
                return;
              }
              const result = await generateSSHKey(email, fileName);
              setMessage(result.ok ? result.stdout || "\u5BC6\u94A5\u5DF2\u751F\u6210\u3002" : result.stderr);
              setView("menu");
              await refresh();
            }
          }
        ),
        /* @__PURE__ */ jsx9(BackButton, {})
      ] }) : null,
      view === "add-agent" ? /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx9(
          EditableField,
          {
            label: "\u8F93\u5165\u8981\u6DFB\u52A0\u5230 agent \u7684\u5BC6\u94A5\u6587\u4EF6\u540D",
            placeholder: "id_ed25519",
            defaultValue: selectedKey,
            onSubmit: async (value) => {
              if (!value.trim()) {
                setMessage("\u8BF7\u8F93\u5165\u5BC6\u94A5\u6587\u4EF6\u540D\u3002");
                return;
              }
              const result = await addKeyToAgent(value);
              setMessage(result.ok ? result.stdout || "\u5DF2\u6DFB\u52A0\u5230 ssh-agent\u3002" : result.stderr);
              setView("menu");
              await refresh();
            }
          }
        ),
        /* @__PURE__ */ jsx9(BackButton, {})
      ] }) : null,
      view === "edit-host" ? /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx9(
          EditableField,
          {
            label: "\u8F93\u5165\u4E3B\u673A\u914D\u7F6E\uFF0C\u683C\u5F0F\uFF1Aalias,hostname,user,identityFile",
            placeholder: "github-work,github.com,git,~/.ssh/id_work",
            onSubmit: async (value) => {
              const [alias, hostName, user, identityFile] = value.split(",").map((part) => part.trim());
              if (!alias || !hostName || !user || !identityFile) {
                setMessage("\u8BF7\u8F93\u5165 alias\u3001hostname\u3001user \u548C identityFile\u3002");
                return;
              }
              setPending(await prepareHostConfigAppend(alias, hostName, user, identityFile));
              setView("confirm");
            }
          }
        ),
        /* @__PURE__ */ jsx9(BackButton, {})
      ] }) : null,
      view === "test" ? /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx9(
          EditableField,
          {
            label: "\u8F93\u5165\u8981\u6D4B\u8BD5\u7684 Host \u522B\u540D",
            placeholder: "github.com",
            onSubmit: async (value) => {
              if (!value.trim()) {
                setMessage("\u8BF7\u8F93\u5165\u8981\u6D4B\u8BD5\u7684 Host \u522B\u540D\u3002");
                return;
              }
              const result = await testSSHHost(value);
              setMessage(result.ok ? result.stdout || result.stderr || "\u8FDE\u63A5\u6D4B\u8BD5\u5B8C\u6210\u3002" : result.stderr);
              setView("menu");
            }
          }
        ),
        /* @__PURE__ */ jsx9(BackButton, {})
      ] }) : null,
      view === "confirm" && pending ? /* @__PURE__ */ jsx9(
        ConfirmDialog,
        {
          title: pending.title,
          diff: pending.diff,
          onCancel: () => {
            setPending(null);
            setView("menu");
          },
          onConfirm: async () => {
            const result = await pending.execute();
            setMessage(result.ok ? result.stdout : result.stderr);
            setPending(null);
            setView("menu");
            await refresh();
          }
        }
      ) : null,
      view === "raw" ? /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", children: [
        /* @__PURE__ */ jsx9(Text9, { children: summary.configRaw || "(config not found)" }),
        /* @__PURE__ */ jsx9(BackButton, {})
      ] }) : null
    ] }),
    message ? /* @__PURE__ */ jsx9(Box7, { marginTop: 1, children: /* @__PURE__ */ jsx9(Text9, { color: message.toLowerCase().includes("error") ? "#f85149" : "#3fb950", children: message }) }) : null
  ] });
}

// src/modules/env/EnvModule.tsx
import { useEffect as useEffect5, useMemo as useMemo3, useState as useState5 } from "react";
import { Box as Box8, Text as Text10, useInput as useInput3 } from "ink";

// src/modules/env/env-actions.ts
async function prepareEnvChange(filePath, key, value) {
  const current = await readTextFile(filePath) ?? "";
  const safeKey = sanitizeInput(key);
  const safeValue = sanitizeInput(value);
  const nextLine = `export ${safeKey}="${safeValue}"`;
  const lines = current.split("\n");
  const existingIndex = lines.findIndex((line) => line.trim().startsWith(`export ${safeKey}=`));
  let next = current;
  if (existingIndex >= 0) {
    lines[existingIndex] = nextLine;
    next = lines.join("\n");
  } else {
    next = `${current}${current.endsWith("\n") || current.length === 0 ? "" : "\n"}${nextLine}
`;
  }
  return {
    title: `\u786E\u8BA4\u66F4\u65B0\u73AF\u5883\u53D8\u91CF ${safeKey}`,
    diff: createDiffPreview(current, next),
    execute: async () => {
      await writeTextFile(filePath, next);
    }
  };
}

// src/modules/env/env-parser.ts
import fs3 from "fs/promises";
import path5 from "path";
import { z as z3 } from "zod";
var EnvEntrySchema = z3.object({
  key: z3.string(),
  value: z3.string(),
  file: z3.string(),
  line: z3.number().int().positive()
});
var EXPORT_PATTERN = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/;
function getShellFiles(shellPath, cwd = process.cwd()) {
  const shellName = shellPath.split("/").pop() ?? "zsh";
  const files = shellName === "bash" ? ["~/.bash_profile", "~/.bashrc", "~/.profile"] : shellName === "fish" ? ["~/.config/fish/config.fish"] : ["~/.zshenv", "~/.zprofile", "~/.zshrc", "~/.zlogin"];
  return [
    ...files.map((filePath) => ({
      path: filePath,
      exists: false,
      current: filePath.includes(shellName),
      note: filePath.includes(shellName) ? "(\u5F53\u524D shell)" : void 0
    })),
    { path: path5.join(cwd, ".env"), exists: false, current: false, note: "(\u5F53\u524D\u76EE\u5F55)" }
  ];
}
async function parseEnvFile(filePath) {
  const raw = await readTextFile(filePath);
  if (!raw) {
    return [];
  }
  return raw.split("\n").flatMap((line, index) => {
    const match = line.match(EXPORT_PATTERN);
    if (!match) {
      return [];
    }
    const [, key, rawValue] = match;
    const trimmedValue = rawValue.trim().replace(/^['"]|['"]$/g, "");
    return [
      EnvEntrySchema.parse({
        key,
        value: trimmedValue,
        file: filePath,
        line: index + 1
      })
    ];
  });
}
async function loadEnvSummary() {
  const shell = process.env.SHELL ?? "/bin/zsh";
  const files = await Promise.all(
    getShellFiles(shell).map(async (file) => ({
      ...file,
      exists: await pathExists(file.path)
    }))
  );
  const parsedLists = await Promise.all(files.filter((file) => file.exists).map(async (file) => parseEnvFile(file.path)));
  const entries = parsedLists.flat();
  const grouped = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const current = grouped.get(entry.key) ?? [];
    current.push(entry);
    grouped.set(entry.key, current);
  }
  const effectiveMap = /* @__PURE__ */ new Map();
  for (const [key, values] of grouped) {
    effectiveMap.set(key, values[values.length - 1]);
  }
  const duplicates = Array.from(grouped.entries()).filter(([, values]) => values.length > 1).map(([key]) => key);
  const pathValue = effectiveMap.get("PATH")?.value ?? process.env.PATH ?? "";
  const pathSegments = pathValue.split(":").map((segment) => segment.trim()).filter(Boolean);
  const pathChecks = await Promise.all(
    pathSegments.map(async (segment) => {
      try {
        await fs3.access(expandHome(segment));
        return { segment, missing: false };
      } catch {
        return { segment, missing: true };
      }
    })
  );
  const missingPathEntries = pathChecks.filter((item) => item.missing).map((item) => item.segment);
  return {
    shell,
    files,
    entries,
    effectiveMap,
    duplicates,
    missingPathEntries
  };
}

// src/modules/env/EnvModule.tsx
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function maskValue(key, value) {
  if (!/(key|token|secret)/i.test(key)) {
    return value;
  }
  if (value.length <= 10) {
    return `${value.slice(0, 3)}***`;
  }
  return `${value.slice(0, 6)}***${value.slice(-3)}`;
}
function EnvModule({ onBack }) {
  const [summary, setSummary] = useState5(null);
  const [view, setView] = useState5("menu");
  const [pending, setPending] = useState5(null);
  const [message, setMessage] = useState5("");
  const [query, setQuery] = useState5("");
  const [showSecrets, setShowSecrets] = useState5(false);
  const [loading, setLoading] = useState5(true);
  useInput3((input, key) => {
    if (key.tab) {
      setShowSecrets((current) => !current);
    }
  });
  const refresh = async () => {
    setLoading(true);
    setSummary(await loadEnvSummary());
    setLoading(false);
  };
  useEffect5(() => {
    void refresh();
  }, []);
  const effectiveEntries = useMemo3(
    () => summary ? Array.from(summary.effectiveMap.values()).sort((left, right) => left.key.localeCompare(right.key)) : [],
    [summary]
  );
  const searchMatches = useMemo3(() => {
    if (!summary || !query) {
      return [];
    }
    return summary.entries.filter((entry) => entry.key.toLowerCase().includes(query.toLowerCase()));
  }, [summary, query]);
  if (loading || !summary) {
    return /* @__PURE__ */ jsx10(Layout, { title: "DevHub \u2014 \u73AF\u5883\u53D8\u91CF", subtitle: "\u{1F511} \u73AF\u5883\u53D8\u91CF\u7BA1\u7406", children: /* @__PURE__ */ jsx10(Text10, { color: "#58a6ff", children: "\u52A0\u8F7D\u73AF\u5883\u53D8\u91CF\u914D\u7F6E\u4E2D..." }) });
  }
  return /* @__PURE__ */ jsxs8(Layout, { title: "DevHub \u2014 \u73AF\u5883\u53D8\u91CF", subtitle: "\u{1F511} \u73AF\u5883\u53D8\u91CF\u7BA1\u7406", children: [
    /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "\u2500\u2500 \u68C0\u6D4B\u5230\u7684 Shell \u914D\u7F6E\u6587\u4EF6 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
    summary.files.map((file) => /* @__PURE__ */ jsx10(Text10, { color: file.exists ? "#f0f6fc" : "#6e7681", children: `${file.exists ? "\u2713" : " "} ${file.path}${file.note ? `  ${file.note}` : ""}` }, file.path)),
    /* @__PURE__ */ jsxs8(Box8, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "\u2500\u2500 \u73AF\u5883\u53D8\u91CF\u6982\u89C8 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      effectiveEntries.slice(0, 8).map((entry) => /* @__PURE__ */ jsx10(Text10, { children: `${entry.key.padEnd(20)} = ${showSecrets ? entry.value : maskValue(entry.key, entry.value)}  \u2190 ${entry.file}:${entry.line}` }, `${entry.key}-${entry.file}-${entry.line}`))
    ] }),
    /* @__PURE__ */ jsxs8(Box8, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "\u2500\u2500 \u5065\u5EB7\u68C0\u67E5 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      summary.duplicates.map((key) => /* @__PURE__ */ jsxs8(Box8, { children: [
        /* @__PURE__ */ jsx10(StatusBadge, { variant: "warn" }),
        /* @__PURE__ */ jsx10(Text10, { children: ` ${key} \u91CD\u590D\u5B9A\u4E49` })
      ] }, `duplicate-${key}`)),
      summary.missingPathEntries.map((entry) => /* @__PURE__ */ jsxs8(Box8, { children: [
        /* @__PURE__ */ jsx10(StatusBadge, { variant: "warn" }),
        /* @__PURE__ */ jsx10(Text10, { children: ` PATH \u4E2D\u5305\u542B\u4E0D\u5B58\u5728\u7684\u76EE\u5F55: ${entry}` })
      ] }, `missing-path-${entry}`)),
      summary.effectiveMap.get("EDITOR") ? /* @__PURE__ */ jsxs8(Box8, { children: [
        /* @__PURE__ */ jsx10(StatusBadge, { variant: "ok" }),
        /* @__PURE__ */ jsx10(Text10, { children: " EDITOR \u5DF2\u8BBE\u7F6E" })
      ] }) : /* @__PURE__ */ jsxs8(Box8, { children: [
        /* @__PURE__ */ jsx10(StatusBadge, { variant: "warn" }),
        /* @__PURE__ */ jsx10(Text10, { children: " EDITOR \u672A\u8BBE\u7F6E" })
      ] }),
      summary.effectiveMap.get("LANG")?.value === "en_US.UTF-8" ? /* @__PURE__ */ jsxs8(Box8, { children: [
        /* @__PURE__ */ jsx10(StatusBadge, { variant: "ok" }),
        /* @__PURE__ */ jsx10(Text10, { children: " LANG \u5DF2\u8BBE\u7F6E\u4E3A en_US.UTF-8" })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxs8(Box8, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "\u2500\u2500 \u64CD\u4F5C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      view === "menu" ? /* @__PURE__ */ jsx10(
        MenuList,
        {
          items: [
            { label: "\u641C\u7D22\u53D8\u91CF\uFF08\u8F93\u5165\u53D8\u91CF\u540D\u6EAF\u6E90\uFF09", value: "search" },
            { label: "\u67E5\u770B PATH \u8BE6\u60C5", value: "path" },
            { label: "\u6DFB\u52A0\u65B0\u73AF\u5883\u53D8\u91CF", value: "add" },
            { label: "\u4FEE\u6539\u5DF2\u6709\u53D8\u91CF", value: "edit" },
            { label: "\u68C0\u67E5\u91CD\u590D\u5B9A\u4E49", value: "dupes" },
            { label: "\u67E5\u770B\u539F\u59CB\u6587\u4EF6", value: "raw" },
            { label: "\u2190 \u8FD4\u56DE\u4E3B\u83DC\u5355", value: "back" }
          ],
          onSelect: (value) => {
            if (value === "back") {
              onBack();
              return;
            }
            if (value === "dupes") {
              setQuery(summary.duplicates[0] ?? "");
              setView("search");
              return;
            }
            setView(value === "add" || value === "edit" ? "edit" : value);
          }
        }
      ) : null,
      view === "search" ? /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx10(EditableField, { label: "\u8F93\u5165\u53D8\u91CF\u540D", placeholder: "OPENAI_API_KEY", defaultValue: query, onSubmit: setQuery }),
        searchMatches.map((entry) => /* @__PURE__ */ jsx10(Text10, { children: `${entry.key} = ${showSecrets ? entry.value : maskValue(entry.key, entry.value)}  \u2190 ${entry.file}:${entry.line}` }, `${entry.key}-${entry.file}-${entry.line}`)),
        query && searchMatches.length === 0 ? /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "\u672A\u627E\u5230\u5339\u914D\u53D8\u91CF" }) : null,
        /* @__PURE__ */ jsx10(BackButton, {})
      ] }) : null,
      view === "path" ? /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", children: [
        (summary.effectiveMap.get("PATH")?.value ?? process.env.PATH ?? "").split(":").filter(Boolean).map((segment, index) => /* @__PURE__ */ jsx10(Text10, { color: summary.missingPathEntries.includes(segment) ? "#f85149" : "#f0f6fc", children: segment }, `${segment}-${index}`)),
        /* @__PURE__ */ jsx10(BackButton, {})
      ] }) : null,
      view === "edit" ? /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx10(
          EditableField,
          {
            label: "\u8F93\u5165 file,key,value\uFF0C\u4F8B\uFF1A~/.zshrc,OPENAI_API_KEY,sk-...",
            placeholder: "~/.zshrc,EDITOR,code",
            onSubmit: async (value) => {
              const [filePath, key, nextValue] = value.split(",").map((part) => part.trim());
              if (!filePath || !key || !nextValue) {
                setMessage("\u8BF7\u8F93\u5165 file\u3001key \u548C value\u3002");
                return;
              }
              setPending(await prepareEnvChange(filePath, key, nextValue));
              setView("confirm");
            }
          }
        ),
        /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "\u4FEE\u6539\u540E\u8BF7\u91CD\u65B0 source \u5BF9\u5E94 shell \u6587\u4EF6\u6216\u91CD\u5F00\u7EC8\u7AEF\u3002" }),
        /* @__PURE__ */ jsx10(BackButton, {})
      ] }) : null,
      view === "confirm" && pending ? /* @__PURE__ */ jsx10(
        ConfirmDialog,
        {
          title: pending.title,
          diff: pending.diff,
          onCancel: () => {
            setPending(null);
            setView("menu");
          },
          onConfirm: async () => {
            await pending.execute();
            setMessage("\u73AF\u5883\u53D8\u91CF\u6587\u4EF6\u5DF2\u66F4\u65B0\u3002\u8BF7\u6267\u884C source \u6216\u91CD\u65B0\u6253\u5F00\u7EC8\u7AEF\u3002");
            setPending(null);
            setView("menu");
            await refresh();
          }
        }
      ) : null,
      view === "raw" ? /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", children: [
        summary.files.filter((file) => file.exists).map((file) => /* @__PURE__ */ jsx10(Text10, { children: file.path }, file.path)),
        /* @__PURE__ */ jsx10(BackButton, {})
      ] }) : null
    ] }),
    message ? /* @__PURE__ */ jsx10(Box8, { marginTop: 1, children: /* @__PURE__ */ jsx10(Text10, { color: "#3fb950", children: message }) }) : null,
    /* @__PURE__ */ jsx10(Text10, { color: "#6e7681", children: "Tab \u5207\u6362\u654F\u611F\u503C\u663E\u793A/\u9690\u85CF" })
  ] });
}

// src/modules/node/NodeModule.tsx
import { useEffect as useEffect6, useState as useState6 } from "react";
import { Box as Box9, Text as Text11 } from "ink";

// src/utils/china-mirror.ts
var CHINA_MIRRORS = {
  nvm: {
    official: "https://github.com/nvm-sh/nvm",
    mirror: "https://gitee.com/mirrors/nvm",
    deprecated: false
  },
  homebrew: {
    official: "https://brew.sh",
    mirror: "https://mirrors.tuna.tsinghua.edu.cn/git/homebrew",
    deprecated: false
  },
  npm: {
    official: "https://registry.npmjs.org/",
    mirror: "https://registry.npmmirror.com/",
    deprecated: false
  },
  pip: {
    official: "https://pypi.org/simple",
    mirror: "https://pypi.tuna.tsinghua.edu.cn/simple",
    deprecated: false
  },
  rustup: {
    official: "https://rustup.rs",
    mirror: "https://rsproxy.cn",
    deprecated: false
  },
  go: {
    official: "https://go.dev/dl/",
    mirror: "https://golang.google.cn/dl/",
    alternateMirror: "https://goproxy.cn",
    deprecated: false
  },
  docker: {
    official: "https://www.docker.com/",
    mirror: "Vendor-specific registry mirrors are commonly required; configure by cloud vendor or local daemon mirror.",
    deprecated: false
  },
  githubRelease: {
    official: "https://github.com/",
    mirror: "https://ghproxy.com",
    alternateMirror: "https://mirror.ghproxy.com",
    deprecated: false
  }
};

// src/modules/node/node-checker.ts
async function detectBinary(name, args) {
  const result = await runCommand(name, args);
  if (!result.ok) {
    return { name, version: "\u672A\u5B89\u88C5", installed: false };
  }
  const version = (result.stdout || result.stderr).split("\n")[0];
  return { name, version, installed: true };
}
async function loadNodeSummary() {
  const [node, npm, pnpm, yarn, nvm, fnm, bun, whichNode, registryResult, npmrc] = await Promise.all([
    detectBinary("node", ["-v"]),
    detectBinary("npm", ["-v"]),
    detectBinary("pnpm", ["-v"]),
    detectBinary("yarn", ["-v"]),
    detectBinary("nvm", ["--version"]),
    detectBinary("fnm", ["--version"]),
    detectBinary("bun", ["-v"]),
    runCommand("which", ["node"]),
    runCommand("npm", ["config", "get", "registry"]),
    readTextFile("~/.npmrc")
  ]);
  const registry = registryResult.ok ? registryResult.stdout : CHINA_MIRRORS.npm.official;
  const nodeSource = whichNode.ok && whichNode.stdout.includes(".nvm") ? "via nvm" : "system";
  const majorMatch = node.version.match(/^v(\d+)\./);
  const nodeMajor = majorMatch ? Number(majorMatch[1]) : null;
  const health = [
    node.installed && nodeMajor !== null && nodeMajor >= 18 ? { status: "ok", message: "Node.js LTS \u7248\u672C" } : { status: "error", message: "Node.js \u672A\u5B89\u88C5\u6216\u7248\u672C\u8FC7\u4F4E" },
    nvm.installed ? { status: "ok", message: "nvm \u5DF2\u5B89\u88C5\uFF0C\u7BA1\u7406 Node \u7248\u672C" } : { status: "warn", message: "nvm \u672A\u5B89\u88C5" },
    registry === CHINA_MIRRORS.npm.mirror ? { status: "warn", message: "npm registry \u4E3A\u4E2D\u56FD\u955C\u50CF\uFF08\u56FD\u9645\u9879\u76EE\u53EF\u80FD\u9700\u8981\u5207\u6362\uFF09" } : { status: "ok", message: "npm registry \u4F7F\u7528\u5B98\u65B9\u6E90" },
    yarn.installed ? { status: "ok", message: "yarn \u5DF2\u5B89\u88C5" } : { status: "error", message: "yarn \u672A\u5B89\u88C5" }
  ];
  return {
    binaries: [
      { ...node, detail: nodeSource },
      npm,
      pnpm,
      yarn,
      nvm,
      fnm,
      bun
    ],
    nodeSource,
    registry,
    npmrc: npmrc ?? "",
    health
  };
}

// src/modules/node/NodeModule.tsx
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
function NodeModule({ onBack }) {
  const [summary, setSummary] = useState6(null);
  const [view, setView] = useState6("menu");
  const [message, setMessage] = useState6("");
  const [loading, setLoading] = useState6(true);
  const [globalPackages, setGlobalPackages] = useState6("");
  const refresh = async () => {
    setLoading(true);
    setSummary(await loadNodeSummary());
    setLoading(false);
  };
  useEffect6(() => {
    void refresh();
  }, []);
  if (loading || !summary) {
    return /* @__PURE__ */ jsx11(Layout, { title: "DevHub \u2014 Node.js \u751F\u6001", subtitle: "\u{1F49A} Node.js \u751F\u6001", children: /* @__PURE__ */ jsx11(Text11, { color: "#58a6ff", children: "\u68C0\u6D4B Node.js \u751F\u6001\u4E2D..." }) });
  }
  return /* @__PURE__ */ jsxs9(Layout, { title: "DevHub \u2014 Node.js \u751F\u6001", subtitle: "\u{1F49A} Node.js \u751F\u6001", children: [
    /* @__PURE__ */ jsx11(Text11, { color: "#6e7681", children: "\u2500\u2500 \u73AF\u5883\u68C0\u6D4B \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
    summary.binaries.map((binary, index) => /* @__PURE__ */ jsx11(Text11, { children: `${binary.name.padEnd(12)} ${binary.version.padEnd(12)} ${binary.installed ? "\u2713" : "\u2717"}${binary.detail ? ` (${binary.detail})` : ""}` }, `${binary.name}-${index}`)),
    /* @__PURE__ */ jsxs9(Box9, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx11(Text11, { color: "#6e7681", children: "\u2500\u2500 npm \u914D\u7F6E \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      /* @__PURE__ */ jsx11(Text11, { children: `registry    ${summary.registry}` }),
      /* @__PURE__ */ jsx11(Text11, { children: `prefix      ${process.env.npm_config_prefix ?? "~/.npm-global"}` }),
      /* @__PURE__ */ jsx11(Text11, { children: `cache       ${process.env.npm_config_cache ?? "~/.npm"}` })
    ] }),
    /* @__PURE__ */ jsxs9(Box9, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx11(Text11, { color: "#6e7681", children: "\u2500\u2500 \u5065\u5EB7\u68C0\u67E5 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      summary.health.map((item, index) => /* @__PURE__ */ jsxs9(Box9, { children: [
        /* @__PURE__ */ jsx11(StatusBadge, { variant: item.status }),
        /* @__PURE__ */ jsx11(Text11, { children: ` ${item.message}` })
      ] }, `${item.status}-${item.message}-${index}`))
    ] }),
    /* @__PURE__ */ jsxs9(Box9, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx11(Text11, { color: "#6e7681", children: "\u2500\u2500 \u64CD\u4F5C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
      view === "menu" ? /* @__PURE__ */ jsx11(
        MenuList,
        {
          items: [
            { label: "\u5207\u6362 npm registry\uFF08\u5B98\u65B9/\u6DD8\u5B9D\u955C\u50CF\u4E00\u952E\u5207\u6362\uFF09", value: "registry" },
            { label: "\u5B89\u88C5/\u66F4\u65B0 Node.js\uFF08\u901A\u8FC7 nvm\uFF09", value: "install" },
            { label: "\u5B89\u88C5\u5305\u7BA1\u7406\u5668\uFF08pnpm/yarn/bun\uFF09", value: "pkg-manager" },
            { label: "\u67E5\u770B\u5168\u5C40\u5B89\u88C5\u7684\u5305", value: "packages" },
            { label: "\u6E05\u7406 npm \u7F13\u5B58", value: "cache" },
            { label: "\u2190 \u8FD4\u56DE\u4E3B\u83DC\u5355", value: "back" }
          ],
          onSelect: async (value) => {
            if (value === "back") {
              onBack();
              return;
            }
            if (value === "cache") {
              const result = await runCommand("npm", ["cache", "clean", "--force"], 15e3);
              setMessage(result.ok ? result.stdout || "npm cache \u5DF2\u6E05\u7406\u3002" : result.stderr);
              await refresh();
              return;
            }
            if (value === "packages") {
              const result = await runCommand("npm", ["ls", "-g", "--depth=0"], 15e3);
              setGlobalPackages(result.ok ? result.stdout : result.stderr);
              setView("packages");
              return;
            }
            setView(value === "pkg-manager" ? "install" : value);
          }
        }
      ) : null,
      view === "registry" ? /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx11(
          EditableField,
          {
            label: "\u8F93\u5165 official \u6216 china",
            placeholder: "official",
            onSubmit: async (value) => {
              const registry = value.trim() === "china" ? CHINA_MIRRORS.npm.mirror : CHINA_MIRRORS.npm.official;
              const result = await runCommand("npm", ["config", "set", "registry", registry], 1e4);
              setMessage(result.ok ? `npm registry \u5DF2\u5207\u6362\u5230 ${registry}` : result.stderr);
              setView("menu");
              await refresh();
            }
          }
        ),
        /* @__PURE__ */ jsx11(BackButton, {})
      ] }) : null,
      view === "install" ? /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", gap: 1, children: [
        /* @__PURE__ */ jsx11(
          EditableField,
          {
            label: "\u8F93\u5165\u547D\u4EE4\u7C7B\u578B\uFF1Alts / pnpm / yarn / bun",
            placeholder: "lts",
            onSubmit: async (value) => {
              let result;
              switch (value.trim()) {
                case "lts":
                  result = await runCommand("bash", ["-lc", "source ~/.nvm/nvm.sh && nvm install --lts"], 12e4);
                  break;
                case "pnpm":
                  result = await runCommand("npm", ["install", "-g", "pnpm"], 12e4);
                  break;
                case "yarn":
                  result = await runCommand("npm", ["install", "-g", "yarn"], 12e4);
                  break;
                case "bun":
                  result = await runCommand("npm", ["install", "-g", "bun"], 12e4);
                  break;
                default:
                  result = { ok: false, stdout: "", stderr: "\u4E0D\u652F\u6301\u7684\u5B89\u88C5\u76EE\u6807\u3002", code: 1, command: value };
              }
              setMessage(result.ok ? result.stdout || "\u64CD\u4F5C\u5B8C\u6210\u3002" : result.stderr);
              setView("menu");
              await refresh();
            }
          }
        ),
        /* @__PURE__ */ jsx11(BackButton, {})
      ] }) : null,
      view === "packages" ? /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", children: [
        /* @__PURE__ */ jsx11(Text11, { children: globalPackages || "(\u65E0\u8F93\u51FA)" }),
        /* @__PURE__ */ jsx11(BackButton, {})
      ] }) : null
    ] }),
    message ? /* @__PURE__ */ jsx11(Box9, { marginTop: 1, children: /* @__PURE__ */ jsx11(Text11, { color: message === "\u4E0D\u652F\u6301\u7684\u5B89\u88C5\u76EE\u6807\u3002" ? "#f85149" : "#3fb950", children: message }) }) : null
  ] });
}

// src/modules/tools/ToolsModule.tsx
import { useMemo as useMemo4, useState as useState7 } from "react";
import { Box as Box10, Text as Text12 } from "ink";

// src/modules/tools/tool-registry.ts
var TOOL_REGISTRY = [
  {
    id: "nvm",
    name: "nvm",
    description: "Node \u7248\u672C\u7BA1\u7406\u5668",
    category: "version-manager",
    detect: { command: "nvm --version" },
    install: {
      official: {
        script: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash",
        brew: "brew install nvm"
      },
      china: {
        script: 'NVM_SOURCE=https://gitee.com/mirrors/nvm.git bash -c "$(curl -fsSL https://gitee.com/mirrors/nvm/raw/master/install.sh)"',
        mirror: CHINA_MIRRORS.nvm.mirror
      }
    },
    postInstall: ["\u91CD\u5F00\u7EC8\u7AEF\u6216 source shell rc \u6587\u4EF6\u540E\u518D\u4F7F\u7528 nvm\u3002"]
  },
  {
    id: "fnm",
    name: "fnm",
    description: "\u5FEB\u901F Node \u7248\u672C\u7BA1\u7406\u5668\uFF08Rust\uFF09",
    category: "version-manager",
    detect: { command: "fnm --version" },
    install: {
      official: { brew: "brew install fnm" },
      china: { mirror: CHINA_MIRRORS.githubRelease.mirror, note: "\u5982 GitHub Release \u8F83\u6162\uFF0C\u53EF\u901A\u8FC7 ghproxy \u52A0\u901F\u3002" }
    }
  },
  {
    id: "pyenv",
    name: "pyenv",
    description: "Python \u7248\u672C\u7BA1\u7406\u5668",
    category: "version-manager",
    detect: { command: "pyenv --version" },
    install: { official: { brew: "brew install pyenv" } }
  },
  {
    id: "rbenv",
    name: "rbenv",
    description: "Ruby \u7248\u672C\u7BA1\u7406\u5668",
    category: "version-manager",
    detect: { command: "rbenv --version" },
    install: { official: { brew: "brew install rbenv" } }
  },
  {
    id: "homebrew",
    name: "Homebrew",
    description: "macOS/Linux \u5305\u7BA1\u7406\u5668",
    category: "package-manager",
    detect: { command: "brew --version" },
    install: {
      official: { script: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' },
      china: { mirror: CHINA_MIRRORS.homebrew.mirror, note: "\u5EFA\u8BAE\u7ED3\u5408\u6E05\u534E\u955C\u50CF\u914D\u7F6E HOMEBREW_BREW_GIT_REMOTE\u3002" }
    }
  },
  {
    id: "pnpm",
    name: "pnpm",
    description: "\u9AD8\u6548\u7684 Node \u5305\u7BA1\u7406\u5668",
    category: "package-manager",
    detect: { command: "pnpm -v" },
    install: { official: { brew: "brew install pnpm", script: "npm install -g pnpm" } }
  },
  {
    id: "bun",
    name: "bun",
    description: "All-in-one JS \u8FD0\u884C\u65F6",
    category: "package-manager",
    detect: { command: "bun --version" },
    install: { official: { brew: "brew install bun" } }
  },
  ...[
    ["git", "\u7248\u672C\u63A7\u5236"],
    ["curl", "HTTP \u5BA2\u6237\u7AEF"],
    ["wget", "\u6587\u4EF6\u4E0B\u8F7D\u5DE5\u5177"],
    ["jq", "JSON \u5904\u7406\u5668"],
    ["fzf", "\u6A21\u7CCA\u641C\u7D22"],
    ["ripgrep", "\u9AD8\u901F\u6587\u672C\u641C\u7D22"],
    ["bat", "\u589E\u5F3A\u7248 cat"],
    ["eza", "\u589E\u5F3A\u7248 ls"],
    ["zoxide", "\u667A\u80FD cd"],
    ["starship", "\u7EC8\u7AEF\u63D0\u793A\u7B26"],
    ["tmux", "\u7EC8\u7AEF\u590D\u7528\u5668"],
    ["neovim", "\u7F16\u8F91\u5668"],
    ["lazygit", "Git TUI"],
    ["lazydocker", "Docker TUI"],
    ["claude-code", "AI \u7F16\u7A0B\u52A9\u624B"]
  ].map(
    ([id, description]) => ({
      id,
      name: id === "claude-code" ? "Claude Code" : id,
      description,
      category: "dev-tool",
      detect: { command: `${id === "claude-code" ? "claude" : id} --version` },
      install: { official: { brew: `brew install ${id}` } }
    })
  )
];

// src/modules/tools/ToolsModule.tsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function ToolsModule({ onBack }) {
  const [selectedTool, setSelectedTool] = useState7(null);
  const [view, setView] = useState7("list");
  const [message, setMessage] = useState7("");
  const items = useMemo4(
    () => TOOL_REGISTRY.map((tool) => ({
      label: `${tool.name}          ${tool.description}`,
      value: tool.id
    })),
    []
  );
  return /* @__PURE__ */ jsxs10(Layout, { title: "DevHub \u2014 \u5DE5\u5177\u5B89\u88C5", subtitle: "\u{1F4E5} \u5E38\u7528\u5F00\u53D1\u5DE5\u5177\u5B89\u88C5", children: [
    view === "list" ? /* @__PURE__ */ jsx12(
      MenuList,
      {
        items: [...items, { label: "\u2190 \u8FD4\u56DE\u4E3B\u83DC\u5355", value: "back" }],
        onSelect: (value) => {
          if (value === "back") {
            onBack();
            return;
          }
          const nextTool = TOOL_REGISTRY.find((tool) => tool.id === value) ?? null;
          setSelectedTool(nextTool);
          setView("detail");
        }
      }
    ) : null,
    view === "detail" && selectedTool ? /* @__PURE__ */ jsxs10(Box10, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx12(Text12, { children: `\u{1F4E5} ${selectedTool.name} \u2014 ${selectedTool.description}` }),
      /* @__PURE__ */ jsxs10(Box10, { marginTop: 1, flexDirection: "column", children: [
        /* @__PURE__ */ jsxs10(Text12, { children: [
          "\u72B6\u6001: \u68C0\u6D4B\u547D\u4EE4 ` ",
          selectedTool.detect.command,
          " `"
        ] }),
        /* @__PURE__ */ jsx12(Text12, { color: "#6e7681", children: "\u2500\u2500 \u5B89\u88C5\u65B9\u5F0F \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
        selectedTool.install.official.script ? /* @__PURE__ */ jsx12(Text12, { children: `\u5B98\u65B9\u5B89\u88C5\u811A\u672C: ${selectedTool.install.official.script}` }) : null,
        selectedTool.install.official.brew ? /* @__PURE__ */ jsx12(Text12, { children: `Homebrew: ${selectedTool.install.official.brew}` }) : null,
        selectedTool.install.official.apt ? /* @__PURE__ */ jsx12(Text12, { children: `apt: ${selectedTool.install.official.apt}` }) : null,
        selectedTool.install.china?.script ? /* @__PURE__ */ jsx12(Text12, { children: `\u4E2D\u56FD\u955C\u50CF: ${selectedTool.install.china.script}` }) : null,
        selectedTool.install.china?.mirror ? /* @__PURE__ */ jsx12(Text12, { children: `\u955C\u50CF\u5730\u5740: ${selectedTool.install.china.mirror}` }) : null,
        selectedTool.install.china?.note ? /* @__PURE__ */ jsx12(Text12, { color: "#d29922", children: selectedTool.install.china.note }) : null
      ] }),
      /* @__PURE__ */ jsxs10(Box10, { marginTop: 1, flexDirection: "column", children: [
        /* @__PURE__ */ jsx12(Text12, { color: "#6e7681", children: "\u2500\u2500 \u64CD\u4F5C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
        /* @__PURE__ */ jsx12(
          MenuList,
          {
            items: [
              { label: "\u590D\u5236\u5B89\u88C5\u547D\u4EE4\u5230\u526A\u8D34\u677F", value: "copy" },
              { label: "\u76F4\u63A5\u6267\u884C\u5B89\u88C5\uFF08\u5B98\u65B9\uFF09", value: "official" },
              { label: "\u76F4\u63A5\u6267\u884C\u5B89\u88C5\uFF08\u4E2D\u56FD\u955C\u50CF\uFF09", value: "china" },
              { label: "\u2190 \u8FD4\u56DE\u5DE5\u5177\u5217\u8868", value: "back" }
            ],
            onSelect: async (value) => {
              if (value === "back") {
                setView("list");
                return;
              }
              const officialCommand = selectedTool.install.official.script ?? selectedTool.install.official.brew ?? selectedTool.install.official.apt ?? "";
              const chinaCommand = selectedTool.install.china?.script ?? selectedTool.install.china?.mirror ?? "";
              const command = value === "china" ? chinaCommand : officialCommand || chinaCommand;
              if (!command) {
                setMessage("\u8BE5\u5DE5\u5177\u7F3A\u5C11\u5BF9\u5E94\u5B89\u88C5\u547D\u4EE4\u3002");
                return;
              }
              if (value === "copy") {
                const copyShell = process.platform === "darwin" ? `printf %s ${JSON.stringify(command)} | pbcopy` : `printf %s ${JSON.stringify(command)} | (xclip -selection clipboard || wl-copy)`;
                const copyResult = await runCommand("bash", ["-lc", copyShell], 4e3);
                setMessage(copyResult.ok ? "\u5B89\u88C5\u547D\u4EE4\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002" : `\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u590D\u5236: ${command}`);
                return;
              }
              const result = await runCommand("bash", ["-lc", command], 12e4);
              setMessage(result.ok ? result.stdout || "\u5B89\u88C5\u547D\u4EE4\u6267\u884C\u5B8C\u6210\u3002" : result.stderr);
              setView("execute");
            }
          }
        )
      ] })
    ] }) : null,
    view === "execute" ? /* @__PURE__ */ jsxs10(Box10, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx12(Text12, { children: message || "(\u65E0\u8F93\u51FA)" }),
      /* @__PURE__ */ jsx12(BackButton, {})
    ] }) : null,
    message && view !== "execute" ? /* @__PURE__ */ jsx12(Box10, { marginTop: 1, children: /* @__PURE__ */ jsx12(Text12, { color: message.includes("\u5931\u8D25") ? "#f85149" : "#3fb950", children: message }) }) : null
  ] });
}

// src/app.tsx
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
function App() {
  const [route, setRoute] = useState8("main");
  const { exit } = useApp();
  useInput4((input, key) => {
    if (route === "main" && (input === "q" || key.escape)) {
      exit();
      return;
    }
    if (route !== "main" && (input === "q" || key.escape)) {
      setRoute("main");
    }
  });
  useEffect7(() => {
    process.stdout.write("\x1Bc");
  }, [route]);
  if (route === "git") {
    return /* @__PURE__ */ jsx13(GitModule, { onBack: () => setRoute("main") });
  }
  if (route === "ssh") {
    return /* @__PURE__ */ jsx13(SSHModule, { onBack: () => setRoute("main") });
  }
  if (route === "env") {
    return /* @__PURE__ */ jsx13(EnvModule, { onBack: () => setRoute("main") });
  }
  if (route === "node") {
    return /* @__PURE__ */ jsx13(NodeModule, { onBack: () => setRoute("main") });
  }
  if (route === "tools") {
    return /* @__PURE__ */ jsx13(ToolsModule, { onBack: () => setRoute("main") });
  }
  return /* @__PURE__ */ jsxs11(Layout, { title: "DevHub \u2014 \u5F00\u53D1\u73AF\u5883\u914D\u7F6E\u7BA1\u7406", subtitle: "\u8BF7\u9009\u62E9\u8981\u7BA1\u7406\u7684\u914D\u7F6E\uFF1A", children: [
    /* @__PURE__ */ jsx13(
      MenuList,
      {
        items: [
          { label: "\u{1F4E6} Git \u914D\u7F6E", value: "git", description: "~/.gitconfig \u7BA1\u7406" },
          { label: "\u{1F510} SSH \u914D\u7F6E", value: "ssh", description: "\u5BC6\u94A5\u4E0E\u4E3B\u673A\u7BA1\u7406" },
          { label: "\u{1F511} \u73AF\u5883\u53D8\u91CF", value: "env", description: "Shell \u53D8\u91CF\u6EAF\u6E90" },
          { label: "\u{1F49A} Node.js \u751F\u6001", value: "node", description: "Node/npm/nvm/pnpm" },
          { label: "\u{1F4E5} \u5DE5\u5177\u5B89\u88C5", value: "tools", description: "\u5E38\u7528\u5F00\u53D1\u5DE5\u5177 + \u4E2D\u56FD\u955C\u50CF" }
        ],
        onSelect: (value) => setRoute(value)
      }
    ),
    /* @__PURE__ */ jsx13(Text13, { color: "#6e7681", children: "\u2191\u2193 \u5BFC\u822A  \u23CE \u8FDB\u5165  q \u9000\u51FA" })
  ] });
}

// src/cli.tsx
import { jsx as jsx14 } from "react/jsx-runtime";
render(/* @__PURE__ */ jsx14(App, {}));

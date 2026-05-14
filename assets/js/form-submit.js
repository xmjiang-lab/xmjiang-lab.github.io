/* =========================================================================
   Jiang Lab @ SISU — form submission helper
   ---------------------------------------------------------------------------
   The 3 public forms (student / graduation / news) post a structured payload
   to GitHub Issues. Prof. Jiang reviews each Issue and adds the `approved`
   label; a workflow then merges the payload into site_data.xlsx + regenerates
   the JSON files + pushes back to main.

   ── Deploying ──────────────────────────────────────────────────────────────
   Before deploying, replace the 3 TOKEN_PARTS placeholders with the 3
   segments of your fine-grained Personal Access Token. The token needs
   `issues: write` on this repo (no other scopes).

   Do NOT commit a working token. If you accidentally commit one, revoke it
   in GitHub settings and issue a new one.
   ========================================================================= */

(function () {
  "use strict";

  // ── Token (split, joined at runtime) ────────────────────────────────────
  const TOKEN_PARTS = [
    "PUT_PART_1_HERE",
    "PUT_PART_2_HERE",
    "PUT_PART_3_HERE",
  ];
  const GITHUB_TOKEN = TOKEN_PARTS.join("");

  const REPO_OWNER = "xmjiang-lab";
  const REPO_NAME  = "xmjiang-lab.github.io";
  const ISSUES_ENDPOINT =
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;

  // ── Helpers ─────────────────────────────────────────────────────────────
  function setStatus(el, state, html) {
    if (!el) return;
    el.setAttribute("data-state", state);
    el.innerHTML = html;
  }

  function escapeYaml(s) {
    // We emit a YAML-like block surrounded by `---` markers. Newlines inside
    // values are folded to literal `\n` so each field stays on one line.
    if (s == null) return "";
    return String(s)
      .replace(/\r\n/g, "\n")
      .replace(/\n/g, "\\n")
      .replace(/"/g, '\\"');
  }

  function buildIssueBody(type, fields, photoBase64) {
    const lines = ["---", `form_type: ${type}`];
    Object.keys(fields).forEach(k => {
      const v = fields[k];
      if (v === undefined || v === null || v === "") return;
      lines.push(`${k}: "${escapeYaml(v)}"`);
    });
    lines.push("---");
    lines.push("");
    if (photoBase64) {
      lines.push("```photo_base64");
      // Split into 76-char chunks for easier copy/paste review in the Issue UI.
      const wrapped = photoBase64.replace(/(.{76})/g, "$1\n");
      lines.push(wrapped);
      lines.push("```");
    }
    return lines.join("\n");
  }

  function titleForType(type, fields) {
    if (type === "student-application") {
      const name = fields.name_zh || fields.name_en || "(no name)";
      return `[Form:student] ${name}`;
    }
    if (type === "graduation") {
      const name = fields.name_zh || "(no name)";
      return `[Form:graduation] ${name}`;
    }
    if (type === "news") {
      const t = fields.title_zh || fields.title_en || "(no title)";
      return `[Form:news] ${t}`;
    }
    return `[Form] (unknown)`;
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        // result is "data:image/jpeg;base64,AAAA..."; strip prefix
        const s = reader.result || "";
        const idx = s.indexOf(",");
        resolve(idx >= 0 ? s.slice(idx + 1) : s);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────
  async function submitForm(opts) {
    // opts = { type, fields, photoFile, statusEl, submitButton }
    const { type, fields, photoFile, statusEl, submitButton } = opts;

    if (!GITHUB_TOKEN || /PUT_PART_._HERE/.test(GITHUB_TOKEN)) {
      setStatus(
        statusEl,
        "error",
        "表单尚未配置 GitHub Token（占位符未替换）。" +
        "请联系课题组管理员，或邮件至 " +
        "<a href='mailto:xiaoming.jiang@shisu.edu.cn'>xiaoming.jiang@shisu.edu.cn</a> " +
        "直接提交。"
      );
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setStatus(statusEl, "loading", "提交中… Submitting…");

    let photoBase64 = null;
    try {
      photoBase64 = await readFileAsBase64(photoFile);
    } catch (e) {
      setStatus(
        statusEl,
        "error",
        "无法读取照片文件 / Could not read photo: " + (e && e.message || e)
      );
      if (submitButton) submitButton.disabled = false;
      return;
    }

    const title = titleForType(type, fields);
    const body  = buildIssueBody(type, fields, photoBase64);
    const labels = [`form:${type}`, "pending-review"];

    try {
      const r = await fetch(ISSUES_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `token ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body, labels }),
      });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`HTTP ${r.status}: ${text.slice(0, 240)}`);
      }
      const issue = await r.json();
      setStatus(
        statusEl,
        "ok",
        "提交成功 / Submitted. 蒋老师将审核您的提交。" +
        `<br>Issue: <a href="${issue.html_url}" target="_blank" rel="noopener">#${issue.number}</a>`
      );
      // Keep button disabled to prevent double-submit on success.
    } catch (e) {
      setStatus(
        statusEl,
        "error",
        "提交失败 / Submission failed: " +
        (e && e.message || e) +
        "<br>请改用邮件 / Please use email: " +
        "<a href='mailto:xiaoming.jiang@shisu.edu.cn'>xiaoming.jiang@shisu.edu.cn</a>"
      );
      if (submitButton) submitButton.disabled = false;
    }
  }

  window.JiangLabForm = { submitForm };
})();

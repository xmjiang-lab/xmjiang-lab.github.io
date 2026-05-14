# 蒋老师 · 课题组主页表单审核指南

本指南介绍如何审核网站三类表单提交（学生申请 / 毕业离任 / 新闻投稿）。
所有审核操作都在 GitHub 上完成，无需安装额外软件。

---

## 一、登录 GitHub

1. 在浏览器中打开 <https://github.com>。
2. 用您的账号登录。如果忘记密码，可点击 **Forgot password?** 重置。
3. 登录后，访问课题组仓库：
   <https://github.com/xmjiang-lab/xmjiang-lab.github.io>

> 第一次访问课题组仓库时，可能会让您接受 organization 邀请，按提示同意即可。

---

## 二、打开 Issues 列表

1. 进入仓库页面后，点击页面顶部的 **Issues** 标签（位置在 `<> Code` 和 `Pull requests` 之间）。
2. 您会看到所有待审核的表单提交，标题以
   `[Form:student]`、`[Form:graduation]` 或 `[Form:news]` 开头。
3. 每条提交带有两个标签：
   - `form:student-application` / `form:graduation` / `form:news`（提交类型）
   - `pending-review`（待审核）

*（截图占位：列表页中的 Issue 视图）*

---

## 三、查看一条提交

1. 点击想要审核的 Issue 标题，打开详情页。
2. 详情页中部是一个 YAML 格式的代码块，包含申请者填写的所有字段。例如：

   ```text
   ---
   form_type: student-application
   name_zh: "张三"
   name_en: "Zhang San"
   layer: "phd"
   cohort_year: "2026"
   bio_zh: "本科毕业于..."
   education: "BA, X University (2019–2023) | ..."
   research_areas: "vocal emotion, ERP"
   email: "zhangsan@example.com"
   ---
   ```

3. 如果是学生申请且申请者上传了头像，下面会有一个 `photo_base64` 代码块（一长串字符），系统会自动解码并保存。

*（截图占位：详情页的 YAML 块）*

---

## 四、批准 / 拒绝

### 批准（自动并入）

在详情页右侧 **Labels** 一栏，点击设置图标，勾选 **approved** 标签。

只要 `approved` 标签被添加，系统将自动：

1. 将申请字段写入 `site_data.xlsx` 对应表（People / News）；
2. 学生申请会自动保存头像到 `assets/images/people/`；
3. 重新生成对应 JSON；
4. 提交并推送到主分支；
5. 触发网站重新部署；
6. 在 Issue 下评论「Processed and deployed」并关闭 Issue。

整个过程约需 1–2 分钟。完成后您会在该 Issue 中看到一条评论。

### 拒绝 / 需要修改

如果提交内容不合适，**直接在 Issue 下评论说明原因**，然后点击页面底部的
**Close issue** 按钮。无需添加 `approved` 标签即可关闭。

> 注意：只要不加 `approved` 标签，系统什么也不做。所以不打算通过的提交直接关闭即可。

*（截图占位：Labels 面板，勾选 approved）*

---

## 五、出错怎么办

如果系统在自动处理时出错（例如毕业表单中的姓名在 People 表里找不到），
Issue 不会被关闭，会出现一条以「Processing failed」开头的评论，并附上错误日志。

常见错误：

| 错误信息 | 含义 | 处理 |
|---|---|---|
| `no current member found with name_zh=...` | 毕业表单中的中文姓名与 People 表中的姓名不完全一致 | 与申请者确认正确姓名后，**在 Issue 中评论新的姓名**，并联系 Wenjun 手工修复 |
| `could not decode photo` | 申请者上传的照片格式异常 | 联系申请者重新上传 |
| 其他 | 一般是表单提交时格式问题 | 联系 Wenjun |

修好后再次点击 `approved` 标签（先移除再勾选）即可重试。

---

## 六、查看课题组主页

主页地址：<https://xmjiang-lab.github.io/>

每次自动并入完成后约 1–2 分钟，主页会自动更新。

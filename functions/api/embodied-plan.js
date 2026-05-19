const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const ALLOWED_OPTIONS = {
  team: ["lab", "startup", "factory", "ai-product"],
  scenario: ["dexterous-hand", "mobile-manipulation", "warehouse", "service", "inspection"],
  hardware: ["none", "sim-only", "arm", "humanoid"],
  data: ["none", "sim", "teleop", "real-mixed"],
  goal: ["diagnosis", "simulation", "dataset", "training", "demo"],
};

const LABELS = {
  team: {
    lab: "高校/科研实验室",
    startup: "机器人创业团队",
    factory: "制造/仓储企业",
    "ai-product": "AI 产品团队",
  },
  scenario: {
    "dexterous-hand": "灵巧手抓取/操作",
    "mobile-manipulation": "移动操作/双臂协作",
    warehouse: "仓储分拣/上下料",
    service: "服务接待/导览交互",
    inspection: "巡检/质检/异常识别",
  },
  hardware: {
    none: "暂无硬件",
    "sim-only": "只做仿真验证",
    arm: "已有机械臂/夹爪",
    humanoid: "已有双臂/人形平台",
  },
  data: {
    none: "暂无数据",
    sim: "已有仿真数据",
    teleop: "已有遥操作轨迹",
    "real-mixed": "已有真实多模态数据",
  },
  goal: {
    diagnosis: "先做可行性诊断",
    simulation: "搭建仿真环境",
    dataset: "建立数据采集流水线",
    training: "训练可部署策略",
    demo: "做可演示 Demo",
  },
};

const MODULES = {
  diagnosis: "任务定义与技术路线诊断",
  simulation: "仿真环境与数字孪生搭建",
  data: "多模态数据采集与清洗规范",
  teleop: "遥操作示教系统与采集 SOP",
  training: "策略模型训练与评测闭环",
  deploy: "实机部署、演示与交付文档",
};

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const payload = await readJson(context.request);
    const input = normalizeInput(payload);
    const plan = buildPlan(input);

    return json({ ok: true, plan });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "请求格式不正确",
      },
      400
    );
  }
}

export async function onRequestGet() {
  return json({
    ok: true,
    message: "POST 项目条件到此接口，可获得具身智能项目路线建议。",
    fields: ALLOWED_OPTIONS,
  });
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("请使用 application/json 提交项目条件");
  }

  const text = await request.text();
  if (text.length > 4096) {
    throw new Error("项目条件过长，请压缩到 4096 字符以内");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("JSON 解析失败");
  }
}

function normalizeInput(payload) {
  const input = {
    team: String(payload.team || ""),
    scenario: String(payload.scenario || ""),
    hardware: String(payload.hardware || ""),
    data: String(payload.data || ""),
    goal: String(payload.goal || ""),
  };

  for (const [field, allowed] of Object.entries(ALLOWED_OPTIONS)) {
    if (!allowed.includes(input[field])) {
      throw new Error(`字段 ${field} 的取值不在支持范围内`);
    }
  }

  return input;
}

function buildPlan(input) {
  const score = scoreProject(input);
  const packageName = choosePackage(input, score);
  const modules = chooseModules(input);
  const timeline = chooseTimeline(packageName, modules);
  const risks = chooseRisks(input);
  const nextActions = chooseNextActions(input);

  return {
    summary: `${LABELS.team[input.team]}适合从“${LABELS.goal[input.goal]}”切入，围绕“${LABELS.scenario[input.scenario]}”建立可复测的项目闭环。`,
    packageName,
    readiness: score,
    labels: {
      team: LABELS.team[input.team],
      scenario: LABELS.scenario[input.scenario],
      hardware: LABELS.hardware[input.hardware],
      data: LABELS.data[input.data],
      goal: LABELS.goal[input.goal],
    },
    modules,
    timeline,
    risks,
    nextActions,
  };
}

function scoreProject(input) {
  let score = 35;

  if (input.hardware === "arm") score += 18;
  if (input.hardware === "humanoid") score += 24;
  if (input.hardware === "sim-only") score += 10;

  if (input.data === "sim") score += 12;
  if (input.data === "teleop") score += 18;
  if (input.data === "real-mixed") score += 24;

  if (input.goal === "diagnosis") score -= 5;
  if (input.goal === "demo") score += 8;
  if (input.scenario === "dexterous-hand") score -= 4;

  return Math.max(20, Math.min(score, 95));
}

function choosePackage(input, score) {
  if (input.goal === "diagnosis" || score < 45) return "诊断版";
  if (input.goal === "simulation" || input.hardware === "sim-only") return "仿真版";
  if (input.goal === "dataset" || input.data === "none") return "数据版";
  if (input.goal === "training" || input.goal === "demo") return "全链路陪跑";
  return "模块组合版";
}

function chooseModules(input) {
  const modules = [MODULES.diagnosis];

  if (["none", "sim-only"].includes(input.hardware) || input.goal === "simulation") {
    modules.push(MODULES.simulation);
  }

  if (["none", "sim"].includes(input.data) || input.goal === "dataset") {
    modules.push(MODULES.data);
  }

  if (["teleop", "real-mixed"].includes(input.data) || input.scenario === "dexterous-hand") {
    modules.push(MODULES.teleop);
  }

  if (["training", "demo"].includes(input.goal)) {
    modules.push(MODULES.training);
  }

  if (input.goal === "demo" || input.hardware === "humanoid") {
    modules.push(MODULES.deploy);
  }

  return [...new Set(modules)];
}

function chooseTimeline(packageName, modules) {
  if (packageName === "诊断版") return "3-5 天输出路线图和预算边界";
  if (packageName === "仿真版") return "1-3 周跑通仿真任务和评测脚本";
  if (packageName === "数据版") return "2-4 周建立采集 SOP、数据格式和首批样本";
  if (modules.length >= 5) return "6-10 周完成仿真、数据、训练和实机演示闭环";
  return "3-6 周完成核心模块交付";
}

function chooseRisks(input) {
  const risks = [];

  if (input.hardware === "none") {
    risks.push("硬件未定会影响动作空间和传感器方案，建议先做选型表。");
  }

  if (input.data === "none") {
    risks.push("缺少真实数据时，不建议直接承诺端到端效果，先从仿真和遥操作采集开始。");
  }

  if (input.scenario === "dexterous-hand") {
    risks.push("灵巧手任务对标定、接触稳定性和样本质量要求高，需要单独设计失败样本复盘。");
  }

  if (input.goal === "demo") {
    risks.push("Demo 需要固定任务边界和验收指标，避免范围过大导致周期失控。");
  }

  return risks.length ? risks : ["当前条件较适合分阶段推进，主要风险在任务边界和验收指标是否足够清晰。"];
}

function chooseNextActions(input) {
  const actions = [
    "整理机器人型号、机械手/夹爪型号、相机和算力配置。",
    "准备目标任务视频或参考动作，标出成功标准和失败案例。",
  ];

  if (input.hardware === "none") {
    actions.push("先列出 2-3 套硬件预算区间，比较机械臂、灵巧手、移动底盘和传感器组合。");
  }

  if (input.data === "none") {
    actions.push("设计首批 50-100 条示教样本的采集字段、命名规则和质检表。");
  }

  if (["training", "demo"].includes(input.goal)) {
    actions.push("固定一个最小任务版本，用成功率、任务时长、碰撞率作为第一轮验收指标。");
  }

  return actions;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

export const profile = {
 "name": "theater",
 "tagline": "视觉与交互实验",
 "siteType": "个人博客与作品集",
 "github": "https://github.com/Theater-ahyeon",
 "metaSummary": "个人博客首页，记录 AI 应用、开发工具、交互模拟与视觉实验。",
 "intro": [
  "用代码连接构想，用交互展开体验。",
  "这里记录我的公开作品与视觉探索。"
 ],
 "summary": [
  "从 AI 工作台、记忆应用到交互模拟，",
  "这里收录我的公开 GitHub 项目，以及参与上游项目的贡献。"
 ]
};
export const chapters = {
 home: {label:'序章', en:'INTRODUCTION', title:`${profile.name} · ${profile.tagline}`},
 works: {label:'作品', en:'PUBLIC PROJECTS', title:`公开作品 · ${profile.name}`},
 studies: {label:'观测', en:'VISUAL STUDIES', title:`观测 · ${profile.name}`},
 about: {label:'关于', en:'PROFILE', title:`关于 · ${profile.name}`}
};
export const projects = [
  {
    "id": "midnight-contract",
    "no": "01",
    "title": "MIDNIGHT",
    "subtitle": "零点契约",
    "category": "AI AGENT WORKBENCH",
    "status": "公开仓库",
    "description": "自托管多模型 AI 智能体工作台，将工作区、会话、长期记忆、工具、消息渠道与自动化任务集中管理。",
    "detail": "自托管多模型 AI 智能体工作台，将工作区、会话、长期记忆、工具、消息渠道与自动化任务集中管理。 配置、运行方法与实现细节见仓库 README。",
    "tags": [
      "TypeScript",
      "React",
      "Hono"
    ],
    "stack": [
      "TypeScript",
      "React",
      "Hono",
      "SQLite",
      "Pi Runtime"
    ],
    "url": "https://github.com/Theater-ahyeon/midnight-contract",
    "urlLabel": "查看源码",
    "reference": {
      "label": "midnight-contract / README",
      "url": "https://github.com/Theater-ahyeon/midnight-contract/blob/main/README.md",
      "prefix": "项目说明"
    },
    "artKind": "image",
    "repoName": "midnight-contract",
    "fork": false,
    "isTemplate": false,
    "verifiedAt": "2026-10-10T16:34:00Z",
    "facts": [
      [
        "类型",
        "AI 工作台"
      ],
      [
        "主要技术",
        "TypeScript / React / Hono"
      ],
      [
        "仓库",
        "非 Fork · 非模板"
      ]
    ],
    "showcase": {
      "kind": "readme",
      "lines": [
        "多模型 AI 智能体工作台",
        "工作区 · 会话 · 长期记忆",
        "工具 · 渠道 · 自动化任务"
      ],
      "commit": "70fc60e7b6c58ab70cd0695e796cdd0aed0ed62a",
      "source": "https://github.com/Theater-ahyeon/midnight-contract/blob/70fc60e7b6c58ab70cd0695e796cdd0aed0ed62a/README.md",
      "notice": "实机截图见原仓库",
      "links": [
        {
          "label": "工作台实机截图",
          "url": "https://github.com/Theater-ahyeon/midnight-contract/blob/70fc60e7b6c58ab70cd0695e796cdd0aed0ed62a/docs/screenshots/midnight-workbench.png",
          "kind": "原仓库截图"
        },
        {
          "label": "智能体实机截图",
          "url": "https://github.com/Theater-ahyeon/midnight-contract/blob/70fc60e7b6c58ab70cd0695e796cdd0aed0ed62a/docs/screenshots/midnight-agents.png",
          "kind": "原仓库截图"
        },
        {
          "label": "模型实机截图",
          "url": "https://github.com/Theater-ahyeon/midnight-contract/blob/70fc60e7b6c58ab70cd0695e796cdd0aed0ed62a/docs/screenshots/midnight-models.png",
          "kind": "原仓库截图"
        }
      ]
    }
  },
  {
    "id": "subtext",
    "no": "02",
    "title": "SUBTEXT",
    "subtitle": "知微 · Subtext",
    "category": "LOCAL-FIRST CONVERSATION",
    "status": "公开仓库",
    "description": "本地优先的重要对话演练工具：整理证据与理解卡，模拟沟通场景，再用现实反馈修正理解。",
    "detail": "本地优先的重要对话演练工具：整理证据与理解卡，模拟沟通场景，再用现实反馈修正理解。 配置、运行方法与实现细节见仓库 README。",
    "tags": [
      "JavaScript",
      "Electron",
      "Node.js"
    ],
    "stack": [
      "JavaScript",
      "Electron",
      "Node.js",
      "本地存储"
    ],
    "url": "https://github.com/Theater-ahyeon/subtext",
    "urlLabel": "查看源码",
    "reference": {
      "label": "subtext / README",
      "url": "https://github.com/Theater-ahyeon/subtext/blob/main/README.md",
      "prefix": "项目说明"
    },
    "artKind": "dialogue",
    "repoName": "subtext",
    "fork": false,
    "isTemplate": false,
    "verifiedAt": "2026-10-10T16:34:00Z",
    "facts": [
      [
        "类型",
        "AI 应用"
      ],
      [
        "主要技术",
        "JavaScript / Electron / Node.js"
      ],
      [
        "仓库",
        "非 Fork · 非模板"
      ]
    ],
    "showcase": {
      "kind": "readme",
      "lines": [
        "理解卡 → 场景演练",
        "预判 → 现实对照",
        "本地优先 · 可溯源修正"
      ],
      "commit": "61a2c80c7b7c96b2e11f4214ae27a14d0e7ed753",
      "source": "https://github.com/Theater-ahyeon/subtext/blob/61a2c80c7b7c96b2e11f4214ae27a14d0e7ed753/README.md",
      "notice": "暂无公开实机截图 · 展示 README 摘要",
      "links": []
    }
  },
  {
    "id": "airp",
    "no": "03",
    "title": "AIRP",
    "subtitle": "本地叙事与长期记忆",
    "category": "MEMORY & NARRATIVE",
    "status": "公开仓库",
    "description": "本地叙事应用与长期记忆引擎，支持角色卡与世界书导入、事件日志、分支回退及流式生成恢复。",
    "detail": "本地叙事应用与长期记忆引擎，支持角色卡与世界书导入、事件日志、分支回退及流式生成恢复。 配置、运行方法与实现细节见仓库 README。",
    "tags": [
      "TypeScript",
      "React",
      "Hono"
    ],
    "stack": [
      "TypeScript",
      "React",
      "Hono",
      "TanStack Virtual"
    ],
    "url": "https://github.com/Theater-ahyeon/airp",
    "urlLabel": "查看源码",
    "reference": {
      "label": "airp / README",
      "url": "https://github.com/Theater-ahyeon/airp/blob/main/README.md",
      "prefix": "项目说明"
    },
    "artKind": "dialogue",
    "repoName": "airp",
    "fork": false,
    "isTemplate": false,
    "verifiedAt": "2026-10-10T16:34:00Z",
    "facts": [
      [
        "类型",
        "记忆与叙事"
      ],
      [
        "主要技术",
        "TypeScript / React / Hono"
      ],
      [
        "仓库",
        "非 Fork · 非模板"
      ]
    ],
    "showcase": {
      "kind": "readme",
      "lines": [
        "角色卡 · 预设 · 世界书",
        "JSONL 事件日志与快照",
        "分支回退 · 流式输出恢复"
      ],
      "commit": "56087a133110fd13e04f7669f18e162624db151f",
      "source": "https://github.com/Theater-ahyeon/airp/blob/56087a133110fd13e04f7669f18e162624db151f/README.md",
      "notice": "暂无公开实机截图 · 展示 README 摘要",
      "links": []
    }
  },
  {
    "id": "skin-craft",
    "no": "04",
    "title": "SKIN CRAFT",
    "subtitle": "Agent 前端定制技能",
    "category": "REFERENCE TO COMPONENTS",
    "status": "公开仓库",
    "description": "面向 Agent 的前端定制技能，把源码理解、设计方向、定制素材、真实组件实现与浏览器验证串成可复用流程。",
    "detail": "面向 Agent 的前端定制技能，把源码理解、设计方向、定制素材、真实组件实现与浏览器验证串成可复用流程。 配置、运行方法与实现细节见仓库 README。",
    "tags": [
      "Python",
      "Agent Skill",
      "Pillow"
    ],
    "stack": [
      "Python",
      "Agent Skill",
      "Pillow"
    ],
    "url": "https://github.com/Theater-ahyeon/skin-craft",
    "urlLabel": "查看源码",
    "reference": {
      "label": "skin-craft / README",
      "url": "https://github.com/Theater-ahyeon/skin-craft/blob/main/README.md",
      "prefix": "项目说明"
    },
    "artKind": "image",
    "repoName": "skin-craft",
    "fork": false,
    "isTemplate": false,
    "verifiedAt": "2026-10-10T16:34:00Z",
    "facts": [
      [
        "类型",
        "开发工具"
      ],
      [
        "主要技术",
        "Python / Agent Skill / Pillow"
      ],
      [
        "仓库",
        "非 Fork · 非模板"
      ]
    ],
    "showcase": {
      "kind": "readme",
      "lines": [
        "理解项目 → 探索方向",
        "素材 → 真实组件实现",
        "运行验证 → 反馈迭代"
      ],
      "commit": "9f304abd51bef362e2918072c75e0e258a5df5d6",
      "source": "https://github.com/Theater-ahyeon/skin-craft/blob/9f304abd51bef362e2918072c75e0e258a5df5d6/README.md",
      "notice": "文档型项目 · 展示 README 摘要",
      "links": []
    }
  },
  {
    "id": "darkside-simulation",
    "no": "05",
    "title": "DARKSIDE",
    "subtitle": "黑暗森林 · 文明模拟",
    "category": "CIVILIZATION SIMULATION",
    "status": "公开仓库",
    "description": "基于《三体》黑暗森林设定的实时宇宙文明模拟，以不同文明策略、科技发展与博弈机制驱动 Canvas 星图。",
    "detail": "基于《三体》黑暗森林设定的实时宇宙文明模拟，以不同文明策略、科技发展与博弈机制驱动 Canvas 星图。 配置、运行方法与实现细节见仓库 README。",
    "tags": [
      "Python",
      "FastAPI",
      "WebSocket"
    ],
    "stack": [
      "Python",
      "FastAPI",
      "WebSocket",
      "Canvas"
    ],
    "url": "https://github.com/Theater-ahyeon/darkside-simulation",
    "urlLabel": "查看源码",
    "reference": {
      "label": "darkside-simulation / README",
      "url": "https://github.com/Theater-ahyeon/darkside-simulation/blob/master/README.md",
      "prefix": "项目说明"
    },
    "artKind": "archive",
    "repoName": "darkside-simulation",
    "fork": false,
    "isTemplate": false,
    "verifiedAt": "2026-10-10T16:34:00Z",
    "facts": [
      [
        "类型",
        "交互模拟"
      ],
      [
        "主要技术",
        "Python / FastAPI / WebSocket"
      ],
      [
        "仓库",
        "非 Fork · 非模板"
      ]
    ],
    "showcase": {
      "kind": "readme",
      "lines": [
        "实时宇宙文明模拟",
        "策略 · 科技 · 探测 · 攻击",
        "Python + FastAPI + Canvas"
      ],
      "commit": "63c2e9748f257c3d772c929908b5847b63e9396f",
      "source": "https://github.com/Theater-ahyeon/darkside-simulation/blob/63c2e9748f257c3d772c929908b5847b63e9396f/README.md",
      "notice": "暂无公开实机截图 · 展示 README 摘要",
      "links": []
    }
  },
  {
    "id": "PersonalizationTripSystem",
    "no": "06",
    "title": "TRIP SYSTEM",
    "subtitle": "个性化旅游系统",
    "category": "ALGORITHMS & WEB MAPS",
    "status": "公开仓库 · 课程设计",
    "description": "数据结构课程设计：结合 C++ 核心与 Web 地图界面，实现兴趣推荐、路线规划、设施检索、日记与美食推荐。",
    "detail": "数据结构课程设计：结合 C++ 核心与 Web 地图界面，实现兴趣推荐、路线规划、设施检索、日记与美食推荐。 配置、运行方法与实现细节见仓库 README。",
    "tags": [
      "C++17",
      "JavaScript",
      "Leaflet"
    ],
    "stack": [
      "C++17",
      "JavaScript",
      "Leaflet",
      "Dijkstra",
      "A*"
    ],
    "url": "https://github.com/Theater-ahyeon/PersonalizationTripSystem",
    "urlLabel": "查看源码",
    "reference": {
      "label": "PersonalizationTripSystem / README",
      "url": "https://github.com/Theater-ahyeon/PersonalizationTripSystem/blob/main/README.md",
      "prefix": "项目说明"
    },
    "artKind": "image",
    "repoName": "PersonalizationTripSystem",
    "fork": false,
    "isTemplate": false,
    "verifiedAt": "2026-10-10T16:34:00Z",
    "facts": [
      [
        "类型",
        "算法与全栈"
      ],
      [
        "主要技术",
        "C++17 / JavaScript / Leaflet"
      ],
      [
        "仓库",
        "非 Fork · 非模板"
      ]
    ],
    "showcase": {
      "kind": "readme",
      "lines": [
        "C++17 CLI + Web Visualization",
        "Dijkstra · A* · TSP",
        "推荐 · 路线 · 查询 · 日记 · 美食"
      ],
      "commit": "56fb9debdf9332c5222c77fb327820c7e7720a6c",
      "source": "https://github.com/Theater-ahyeon/PersonalizationTripSystem/blob/56fb9debdf9332c5222c77fb327820c7e7720a6c/README.md",
      "notice": "暂无公开实机截图 · 展示 README 摘要",
      "links": [
        {
          "label": "查看仓库设计稿",
          "url": "https://github.com/Theater-ahyeon/PersonalizationTripSystem/blob/56fb9debdf9332c5222c77fb327820c7e7720a6c/stitch_extracted/stitch_smart_personalized_travel_system/_1/screen.png",
          "kind": "设计稿，非实机截图"
        }
      ]
    }
  }
];
export const contributions = [
 {
  "repository": "bytedance/deer-flow",
  "number": 5898,
  "url": "https://github.com/bytedance/deer-flow/pull/5898",
  "title": "fix(agents): scope delegation ledger IDs to parent runs",
  "author": "Theater-ahyeon",
  "merged": true,
  "merged_at": "2026-09-27T01:50:31Z",
  "state": "closed"
 },
 {
  "repository": "bytedance/deer-flow",
  "number": 5897,
  "url": "https://github.com/bytedance/deer-flow/pull/5897",
  "title": "fix(subagents): terminalize batches after exhausted leases expire",
  "author": "Theater-ahyeon",
  "merged": true,
  "merged_at": "2026-09-28T07:29:18Z",
  "state": "closed"
 },
 {
  "repository": "TencentCloud/Octop",
  "number": 918,
  "url": "https://github.com/TencentCloud/Octop/pull/918",
  "title": "fix(update): checkpoint SQLite WAL before desktop process restart",
  "author": "Theater-ahyeon",
  "merged": true,
  "merged_at": "2026-09-23T07:40:44Z",
  "state": "closed"
 },
 {
  "repository": "crewAIInc/crewAI",
  "number": 7435,
  "url": "https://github.com/crewAIInc/crewAI/pull/7435",
  "title": "fix(cli): don't crash the run TUI when streamed output contains a literal [...]",
  "author": "Theater-ahyeon",
  "merged": true,
  "merged_at": "2026-09-14T15:11:34Z",
  "state": "closed"
 },
 {
  "repository": "QwenLM/qwen-code",
  "number": 11129,
  "url": "https://github.com/QwenLM/qwen-code/pull/11129",
  "title": "docs(developers): document CI and release repository variables",
  "author": "Theater-ahyeon",
  "merged": true,
  "merged_at": "2026-09-28T10:36:46Z",
  "state": "closed"
 },
 {
  "repository": "agno-agi/agno",
  "number": 10160,
  "url": "https://github.com/agno-agi/agno/pull/10160",
  "title": "[fix] replace dead links in cookbook knowledge sources and docs references",
  "author": "Theater-ahyeon",
  "merged": true,
  "merged_at": "2026-09-20T21:32:49Z",
  "state": "closed"
 }
];
export const studies = [
 {id:'tide', no:'01', anchor:'Voices / alchemaniac', title:'潮汐与留白', en:'TIDAL COMPOSITION', description:'冷色的大面积空间里，用一道红色建立视线的起点。曲线与碎片形成流向，让静止画面保留运动的余势。', credit:'Gilang Andrian · Voices', url:'https://www.gilangandrian.com/Arknights-EP-Illustration-Voices', className:'tide', keywords:['三角构图','冷暖焦点','弧形流向']},
 {id:'axis', no:'02', anchor:'Countess / Throne2', title:'中轴与仪式感', en:'AXIAL STRUCTURE', description:'高耸的纵向空间围绕单一中轴展开。扇形、尖拱与放射状结构，把目光收束在人物与光的交界。', credit:'Gilang Andrian · Red Countess / WLOP · Throne2', url:'https://www.gilangandrian.com/Iteration-Providence-Red-Countess', secondUrl:'https://wlop.artstation.com/projects/6bDlXn', className:'axis', keywords:['纵向空间','放射骨架','局部高光']},
 {id:'light', no:'03', anchor:'Golden / WLOP', title:'材质与微光', en:'MATERIAL & LIGHT', description:'近黑的底色托起少量金属反光。宽阔柔软的褶皱，与细小坚硬的亮点，形成不同尺度的节奏。', credit:'WLOP · Golden', url:'https://wlop.artstation.com/projects/n08J3r', className:'light', keywords:['反光层次','软硬对比','暗部留白']}
];

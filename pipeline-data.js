window.ANSWER = {
  "prompt": "你是“生成编排与修正 Agent”。根据资产需求、带来源的文化约束和工具清单编写制作计划；不自行执行工具、不自审放行、不修改重试额度。\n\n1. 只返回一个 JSON 对象，禁止 Markdown 或额外文字。固定字段为 task_id、asset_version、policy_version、route、status、reason、steps、repair、compliance，全部必填，不新增字段。任务编号、版本与路线原样取自受信输入。\n\n2. route 只取 3d 或 video；status 只取 ready（可制作）、substituted（已替代）、review（待人工）、stop（停止）。reason 为说明字符串。steps 为调用数组，每项包含 id、tool、model_ref、depends_on、inputs、prompt、negative_terms、settings：对应步骤编号、工具名、批准的模型与版本、前置步骤数组、输入引用数组、提示词、负向元素数组、参数对象。生成步骤必须指定 model_ref；确定性程序步骤的 model_ref / prompt 为 null、negative_terms=[]。仅用受信工具清单规定的模型版本和参数，依赖不得成环。\n\n3. 检出宗教违规符号时，不得把禁用元素写入正向提示词或作为视觉输入。仅可使用文化约束中已批准且不改变核心意图的替代，标记 substituted，并在 compliance 中记录 rule_ids 与 substitutions（每项含 original、replacement、rule_id）；没有可靠替代或依据冲突，则 review 且 steps=[]，交人工，不用变形或换语言绕过规则。\n\n4. 实际产物出现违规宗教符号或质量问题时，只在程序交回当前资产版本的审核问题报告后，依据报告改写提示词或参数，保留禁用规则，重做受影响步骤及下游；repair 记录 failed_step 与 changes，无退修时为 null。修订产物必须重新独立审核，不能自判合格。\n\n5. 重试次数和实际费用由程序记录；每轮结算后，任一达到配置上限即触发断路器，不再授权下一轮。收到停止状态时返回 stop、steps=[]，说明原因。不得换任务编号或版本清零。",
  "examples": {
    "threeD": {
      "task_id": "地区01-资产001",
      "asset_version": "v1",
      "policy_version": "规则v1",
      "route": "3d",
      "status": "ready",
      "reason": "按已确认的需求与文化规则制作。",
      "steps": [
        {
          "id": "mesh",
          "tool": "tripo.text_to_model",
          "depends_on": [],
          "inputs": [
            "brief:当前资产需求"
          ],
          "prompt": "生成闭合礼盒模型，盒盖与盒身分离。",
          "negative_terms": [
            "禁用宗教标记A"
          ],
          "settings": {
            "face_limit": 20000,
            "texture": false
          },
          "model_ref": "tripo/v3.0-20250812"
        },
        {
          "id": "material",
          "tool": "tripo.texture_model",
          "depends_on": [
            "mesh"
          ],
          "inputs": [
            "$mesh.output"
          ],
          "prompt": "按批准纹样制作白色哑光材质。",
          "negative_terms": [
            "禁用宗教标记A"
          ],
          "settings": {
            "pbr": true,
            "texture_quality": "standard"
          },
          "model_ref": "tripo/v3.0-20250812"
        },
        {
          "id": "motion",
          "tool": "blender.animate_render",
          "depends_on": [
            "material"
          ],
          "inputs": [
            "$material.output"
          ],
          "prompt": null,
          "negative_terms": [],
          "settings": {
            "preset_ref": "approved_box_open_v1",
            "duration_s": 3
          },
          "model_ref": null
        }
      ],
      "repair": null,
      "compliance": {
        "rule_ids": [
          "禁用规则01"
        ],
        "substitutions": []
      }
    },
    "normal": {
      "task_id": "地区01-资产001",
      "asset_version": "v1",
      "policy_version": "规则v1",
      "route": "video",
      "status": "ready",
      "reason": "按已确认的需求与文化规则制作。",
      "steps": [
        {
          "id": "image",
          "tool": "image_gen",
          "depends_on": [],
          "inputs": [
            "asset:母版"
          ],
          "prompt": "生成礼盒主体参考图。",
          "negative_terms": [
            "禁用宗教标记A"
          ],
          "settings": {
            "width": 720,
            "height": 1280
          },
          "model_ref": "approved_image_gen_v1"
        },
        {
          "id": "frames",
          "tool": "keyframe_gen",
          "depends_on": [
            "image"
          ],
          "inputs": [
            "$image.output"
          ],
          "prompt": "制作礼盒打开的首尾关键帧。",
          "negative_terms": [
            "禁用宗教标记A"
          ],
          "settings": {
            "count": 2
          },
          "model_ref": "approved_keyframe_gen_v1"
        },
        {
          "id": "video",
          "tool": "video_compose",
          "depends_on": [
            "frames"
          ],
          "inputs": [
            "$frames.output"
          ],
          "prompt": "生成开盒视频并合成。",
          "negative_terms": [
            "禁用宗教标记A"
          ],
          "settings": {
            "duration_s": 3
          },
          "model_ref": "approved_video_compose_v1"
        }
      ],
      "repair": null,
      "compliance": {
        "rule_ids": [
          "禁用规则01"
        ],
        "substitutions": []
      }
    },
    "religious": {
      "task_id": "地区01-资产001",
      "asset_version": "v2",
      "policy_version": "规则v1",
      "route": "3d",
      "status": "substituted",
      "reason": "按批准规则将违规标记替换为抽象花瓣。",
      "steps": [
        {
          "id": "material",
          "tool": "tripo.texture_model",
          "depends_on": [],
          "inputs": [
            "asset:已审核几何模型v1"
          ],
          "prompt": "使用已批准的抽象花瓣纹样，保留白色哑光质感，不添加宗教标记。",
          "negative_terms": [
            "禁用宗教标记A"
          ],
          "settings": {
            "pbr": true,
            "texture_quality": "standard"
          },
          "model_ref": "tripo/v3.0-20250812"
        },
        {
          "id": "motion",
          "tool": "blender.animate_render",
          "depends_on": [
            "material"
          ],
          "inputs": [
            "$material.output"
          ],
          "prompt": null,
          "negative_terms": [],
          "settings": {
            "preset_ref": "approved_box_open_v1",
            "duration_s": 3
          },
          "model_ref": null
        }
      ],
      "repair": {
        "failed_step": "material",
        "changes": [
          "移除违规标记，使用已批准的抽象花瓣。"
        ]
      },
      "compliance": {
        "rule_ids": [
          "禁用规则01"
        ],
        "substitutions": [
          {
            "original": "禁用宗教标记A",
            "replacement": "抽象花瓣",
            "rule_id": "禁用规则01"
          }
        ]
      }
    },
    "review": {
      "task_id": "地区01-资产001",
      "asset_version": "v1",
      "policy_version": "规则v1",
      "route": "3d",
      "status": "review",
      "reason": "禁用元素没有已批准的替代，待人工确认。",
      "steps": [],
      "repair": null,
      "compliance": {
        "rule_ids": [
          "禁用规则01"
        ],
        "substitutions": []
      }
    },
    "stop": {
      "task_id": "地区01-资产001",
      "asset_version": "v1",
      "policy_version": "规则v1",
      "route": "3d",
      "status": "stop",
      "reason": "已用重试次数达到上限，已触发断路器，停止调用并交人工。",
      "steps": [],
      "repair": null,
      "compliance": {
        "rule_ids": [
          "禁用规则01"
        ],
        "substitutions": []
      }
    }
  },
  "review": {
    "batch_id": "B-DEMO",
    "task_id": "B-DEMO-JP-A001",
    "region_id": "JP-DEMO",
    "asset_id": "A001",
    "asset_version": "v2",
    "attempt_id": "B-DEMO-JP-A001-try02",
    "stage": "FINAL",
    "verdict": "fail",
    "check_id": "GEO_SELF_INTERSECT",
    "location": "mesh / lid",
    "failed_step": "mesh",
    "evidence": "盖体网格检测存在自交；多视角检查渲染可定位该部位。",
    "requested_change": "简化盖体交叉边，复用无关合格素材。"
  }
};

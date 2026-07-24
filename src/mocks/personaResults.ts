export interface PersonaResultCard {
  personaId: string;
  title: string;
  author: string;
  achievement: string;
  suitableFor: string;
  boundary: string;
  microAction: string;
  status: string;
  cardId: string;
}

export const personaResults: Record<string, PersonaResultCard> = {
  '01': {
    personaId: '01',
    title: '第一次社团招新：从无人报名到 42 人到场',
    author: '一位大三社团组织者',
    achievement: '在没有任何招新经验的情况下，两天内从零报名变成 42 人到场参加活动',
    suitableFor: '第一次负责招新/拉人/活动推广的学生组织者',
    boundary: '不适用于已有稳定品牌认知的大型社团，或已毕业进入职场的人',
    microAction: '列出 5 位你觉得可能感兴趣的人，分别发一条 3 句话以内的私信，不用群发',
    status: '已验证 · 可试用',
    cardId: 'persona-01',
  },
  '02': {
    personaId: '02',
    title: '第一次跨部门汇报：我如何从"讲不清"到让人愿意配合',
    author: '一位入职 3 个月的产品新人',
    achievement: '从第一次汇报被说"不知道你在讲什么"，到第二次汇报后 3 个部门主动配合推进',
    suitableFor: '职场新人、第一次独立负责跨部门沟通的人',
    boundary: '不适用于已有成熟汇报体系的公司，或不涉及跨部门协作的单人岗位',
    microAction: '先把你要说的内容用一句话写下来，删到只剩这一句话，再从这一句话展开',
    status: '已验证 · 可试用',
    cardId: 'persona-02',
  },
  '03': {
    personaId: '03',
    title: '三天做完第一支 AI 短片：不是效率，而是先砍掉 70% 想法',
    author: '一位独立内容创作者',
    achievement: '从想做一部"完美的 AI 短片"到先做出一支 30 秒可传播的成品，获得第一批观众反馈',
    suitableFor: '想用 AI 做内容但迟迟没动手的独立创作者',
    boundary: '不适用于追求电影级品质或已在制作中的商业项目',
    microAction: '把你最想做的那个创意写下来，然后划掉 70% 的内容，只保留一个核心画面',
    status: '已验证 · v2',
    cardId: 'persona-03',
  },
  '04': {
    personaId: '04',
    title: '零预算办校园活动：我如何找到第一批愿意来的人',
    author: '一位校园社群组织者',
    achievement: '在没有赞助、没有官方推广渠道的情况下，通过"先找 5 个愿意一起转发的人"让 80+ 人到了现场',
    suitableFor: '学生社团/社群组织者、预算有限的活动策划人',
    boundary: '不适用于已有稳定流量渠道和预算的商业活动',
    microAction: '找到 3-5 个跟你关系不错且朋友圈活跃的人，请他们帮你转发一条活动信息',
    status: '已验证 · v2',
    cardId: 'persona-04',
  },
  '05': {
    personaId: '05',
    title: '把一个模糊想法变成可测试页面：我的 48 小时路线',
    author: '一位正在做个人项目的设计师',
    achievement: '从一个"我想做一个帮助 xx 的工具"的模糊想法，到 48 小时内做出一个可以发给朋友测试的页面',
    suitableFor: '有想法但卡在"做不出来"阶段的项目型创作者',
    boundary: '不适用于需要后端或复杂数据系统的产品，或已有明确 PRD 的项目',
    microAction: '用纸笔画出 3 个关键页面，然后用最笨的工具（甚至 PPT）拼出来发给一个人看',
    status: '已验证 · 可试用',
    cardId: 'persona-05',
  },
  '06': {
    personaId: '06',
    title: '低能量期重新建立生活节奏：我只保留了三个动作',
    author: '一位经历低谷后重新开始的人',
    achievement: '从每天连起床都困难的状态，通过只保留三个核心动作，逐步恢复稳定的生活节奏',
    suitableFor: '处于低能量期、被各种建议淹没、不知道从哪里开始的人',
    boundary: '不适用于需要专业心理干预的情况，或处于急性压力环境中的人',
    microAction: '今天只做一件事：写下你明天唯一要做的一个动作，不超过 10 个字',
    status: '已验证 · v2',
    cardId: 'persona-06',
  },
};
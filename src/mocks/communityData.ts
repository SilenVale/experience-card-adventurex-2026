export interface CommunityTabData {
  id: string;
  label: string;
  icon: string;
}

export interface CoCreatingItem {
  id: string;
  title: string;
  v1Summary: string;
  feedback: string[];
  v2Changes: string;
  v2Summary: string;
}

export interface SeekingTrialItem {
  id: string;
  cardTitle: string;
  authorIdentity: string;
  message: string;
  seekingContext: string;
}

export interface SeekingPartnerItem {
  id: string;
  what: string;
  progress: string;
  need: string;
  experienceCard: string;
  authorIdentity: string;
}

export interface NeedHelpItem {
  id: string;
  problem: string;
  constraints: string;
  whatLookingFor: string;
  authorIdentity: string;
}

export const communityTabs: CommunityTabData[] = [
  { id: 'cocreating', label: '共创中的经验', icon: 'ri-loop-left-line' },
  { id: 'seeking-trial', label: '寻求试用者', icon: 'ri-user-search-line' },
  { id: 'seeking-partner', label: '寻找协作伙伴', icon: 'ri-team-line' },
  { id: 'need-help', label: '我需要帮助', icon: 'ri-question-line' },
];

export const coCreatingItems: CoCreatingItem[] = [
  {
    id: 'cc-1',
    title: '零预算办校园活动',
    v1Summary: 'v1：只写了宣传方法，包括海报设计、班级群推广和制造紧迫感',
    feedback: ['没有资源时，第一批人从哪里来？', '如何让收到私信的人不反感？', '朋友圈转发效果不明显时怎么办？'],
    v2Changes: '新增了"先找 5 位愿意一起转发的人"的具体动作，提供了 3 种私信话术模板，补充了"如何筛选高影响力转发者"的方法',
    v2Summary: 'v2：从冷启动策略到具体话术，可复制性大幅提升',
  },
  {
    id: 'cc-2',
    title: '第一次作品集：我删掉了哪些"看似努力"的内容',
    v1Summary: 'v1：列出删掉的内容类型，但缺少"为什么删"的判断框架',
    feedback: ['怎么判断一个项目该不该放？', '如果删完只剩很少的内容怎么办？', '不同行业的作品集标准一样吗？'],
    v2Changes: '新增了"三问判断法"：这个项目展示了我的思考吗？这个项目跟我想做的方向相关吗？如果我是面试官，我会因为这个项目想聊下去吗？',
    v2Summary: 'v2：从"删了什么"进化到"为什么删 + 怎么判断"，提供了可迁移的决策框架',
  },
  {
    id: 'cc-3',
    title: '公开表达拖延：我如何完成第一次分享',
    v1Summary: 'v1：分享了克服拖延的心理技巧和时间管理方法',
    feedback: ['第一次分享选择什么主题？', '如果分享后反馈很差怎么办？', '怎么找到愿意听的人？'],
    v2Changes: '补充了"从你最近踩过的坑开始"的主题选择法，增加了"先发给 3 个信任的人看"的安全试水策略',
    v2Summary: 'v2：从心理建设延伸到具体的第一步行动路线',
  },
];

export const seekingTrialItems: SeekingTrialItem[] = [
  {
    id: 'st-1',
    cardTitle: '第一次做作品集：我删掉了哪些"看似努力"的内容',
    authorIdentity: '一位刚完成作品集迭代的设计师',
    message: '我写了一张关于如何筛选和删减作品集内容的经验卡。正在找正在准备求职作品集的同学试用。你不需要联系我，只要告诉我这张卡是否真的帮你走出了第一步。',
    seekingContext: '适合：正在准备设计/产品/开发作品集的学生或转行者',
  },
  {
    id: 'st-2',
    cardTitle: '第一次跨部门汇报：从"讲不清"到让人愿意配合',
    authorIdentity: '一位入职半年的产品新人',
    message: '我在找即将面临第一次跨部门汇报的职场新人。试用这张经验卡后，只需告诉我：汇报时你说的第一句话，有没有让对方愿意继续听下去。',
    seekingContext: '适合：入职 1-6 个月、即将独立做第一次跨部门沟通的新人',
  },
];

export const seekingPartnerItems: SeekingPartnerItem[] = [
  {
    id: 'sp-1',
    what: '我正在做一个帮助新生融入校园的小项目',
    progress: '已经完成第一次用户访谈，收集了 8 位新生的真实痛点',
    need: '现在想找一位做过社群冷启动的人，一起把招募页做成可测试版本',
    experienceCard: '我愿意提供《零预算办校园活动》经验卡作为协作基础',
    authorIdentity: '一位大三的校园项目发起人',
  },
  {
    id: 'sp-2',
    what: '我在做一个帮独立创作者找到第一批观众的实验',
    progress: '已经梳理了 5 种常见的内容冷启动路线，做了初步的案例分析',
    need: '想找一位做过 AI 内容创作或独立创作的伙伴，一起把路线图做成工具',
    experienceCard: '我可以用《三天做完第一支 AI 短片》的经验卡回应',
    authorIdentity: '一位正在做创作者工具的内容策划人',
  },
];

export const needHelpItems: NeedHelpItem[] = [
  {
    id: 'nh-1',
    problem: '我正在筹备第一次校园活动，但没有社群资源，也不敢直接在群里发招募',
    constraints: '只有一周时间、零预算、社团成员只有 4 个人、没有官方公众号',
    whatLookingFor: '希望找到做过冷启动的人，给我一个今天就能尝试的动作',
    authorIdentity: '一位大二学生社团负责人',
  },
  {
    id: 'nh-2',
    problem: '我想开始做内容输出，但每次打开编辑器就大脑空白。读了 50+ 本书，却感觉自己什么都写不出来',
    constraints: '全职工作、每天最多 1 小时、没有写作经验、担心写出来没人看',
    whatLookingFor: '希望找到把阅读笔记变成可发表内容的具体方法',
    authorIdentity: '一位想开始分享但卡在第一篇的上班族',
  },
];
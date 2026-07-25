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
  phase: string;
  progress: number;
  participantCount: number;
  deadline: string;
  neededRole: string;
  visibility: '公开摘要' | '共创者可见';
}

export interface BuildLogItem {
  id: string;
  day: string;
  date: string;
  title: string;
  summary: string;
  change: string;
  visibility: '公开' | '共创者可见' | '私人草稿';
  xiaohongshuStatus: '已发布' | '待发布';
  xiaohongshuUrl?: string;
}

export interface CommunityActivityItem {
  id: string;
  icon: string;
  text: string;
  time: string;
  accent?: boolean;
}

export const communityStats = [
  { value: '12', label: '张经验正在共创', note: '比昨天 +2' },
  { value: '26', label: '人参与过试用', note: '本周新增 8 人' },
  { value: '05', label: '个版本形成 v2', note: '9 条反馈被采纳' },
  { value: '03', label: '个项目正在招募', note: '均可在 30 分钟内参与' },
];

export const buildLogItems: BuildLogItem[] = [
  {
    id: 'build-01',
    day: '01',
    date: '07.21',
    title: '我们先确认了真正的问题',
    summary: '不是单纯增加报名人数，而是让对 AI 感兴趣但不敢开始的同学，知道活动能给自己一个低门槛实践入口。',
    change: '把活动目标从“传播 AI”改成“现场完成第一个 AI 小工具”。',
    visibility: '公开',
    xiaohongshuStatus: '已发布',
    xiaohongshuUrl: 'https://www.xiaohongshu.com/',
  },
  {
    id: 'build-02',
    day: '02',
    date: '07.22',
    title: '第一版招募文案没有人回应',
    summary: '“欢迎所有对 AI 感兴趣的人”太宽泛，读者无法判断自己是否适合，也不知道现场会发生什么。',
    change: '明确零基础、十分钟完成演示任务，并写出当天可带走的结果。',
    visibility: '公开',
    xiaohongshuStatus: '已发布',
    xiaohongshuUrl: 'https://www.xiaohongshu.com/',
  },
  {
    id: 'build-03',
    day: '03',
    date: '今天',
    title: '社区补上了我们没看到的一步',
    summary: '三位试用者都问：没有社群基础时，第一批愿意转发的人从哪里来？',
    change: '正在补充“先找到 5 位种子参与者”的动作清单与私信边界。',
    visibility: '共创者可见',
    xiaohongshuStatus: '待发布',
  },
];

export const communityActivities: CommunityActivityItem[] = [
  { id: 'activity-01', icon: 'ri-flask-line', text: '小陈完成了《零预算办校园活动》的第一次试用', time: '8 分钟前', accent: true },
  { id: 'activity-02', icon: 'ri-git-commit-line', text: '一条关于“种子参与者”的反馈被采纳进入 v2', time: '21 分钟前' },
  { id: 'activity-03', icon: 'ri-bookmark-3-line', text: '「第一次作品集」新增了 2 位共创者', time: '1 小时前' },
  { id: 'activity-04', icon: 'ri-red-packet-line', text: '新的小红书构建记录已绑定到公开时间线', time: '今天 10:24' },
];

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
  { id: 'build-public', label: '公开构建', icon: 'ri-broadcast-line' },
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
    phase: '收集反馈',
    progress: 72,
    participantCount: 6,
    deadline: '7 月 27 日',
    neededRole: '做过校园活动冷启动的人',
    visibility: '公开摘要',
  },
  {
    id: 'cc-2',
    title: '第一次作品集：我删掉了哪些"看似努力"的内容',
    v1Summary: 'v1：列出删掉的内容类型，但缺少"为什么删"的判断框架',
    feedback: ['怎么判断一个项目该不该放？', '如果删完只剩很少的内容怎么办？', '不同行业的作品集标准一样吗？'],
    v2Changes: '新增了"三问判断法"：这个项目展示了我的思考吗？这个项目跟我想做的方向相关吗？如果我是面试官，我会因为这个项目想聊下去吗？',
    v2Summary: 'v2：从"删了什么"进化到"为什么删 + 怎么判断"，提供了可迁移的决策框架',
    phase: '试用中',
    progress: 48,
    participantCount: 4,
    deadline: '7 月 29 日',
    neededRole: '正在准备作品集的学生或转行者',
    visibility: '共创者可见',
  },
  {
    id: 'cc-3',
    title: '公开表达拖延：我如何完成第一次分享',
    v1Summary: 'v1：分享了克服拖延的心理技巧和时间管理方法',
    feedback: ['第一次分享选择什么主题？', '如果分享后反馈很差怎么办？', '怎么找到愿意听的人？'],
    v2Changes: '补充了"从你最近踩过的坑开始"的主题选择法，增加了"先发给 3 个信任的人看"的安全试水策略',
    v2Summary: 'v2：从心理建设延伸到具体的第一步行动路线',
    phase: '形成 v2',
    progress: 88,
    participantCount: 8,
    deadline: '7 月 25 日',
    neededRole: '完成过第一次公开分享的人',
    visibility: '公开摘要',
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

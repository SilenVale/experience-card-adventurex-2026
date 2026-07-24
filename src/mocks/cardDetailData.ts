export interface CardDetailData {
  id: string;
  title: string;
  author: string;
  authorIdentity: string;
  status: string;
  version: string;
  problem: string;
  keyActions: { step: number; action: string; detail: string }[];
  result: string;
  suitableFor: string;
  boundary: string;
  boundaryNote: string;
  microAction: string;
  versionHistory: {
    v1: string;
    feedback: string[];
    v2: string;
  };
  source: string;
  scope: string;
  personaId: string;
}

export const cardDetails: Record<string, CardDetailData> = {
  'persona-01': {
    id: 'persona-01',
    title: '第一次社团招新：从无人报名到 42 人到场',
    author: '匿名学长',
    authorIdentity: '一位大三社团组织者',
    status: '已验证 · 可试用',
    version: 'v1',
    problem: '社团招新前两天，报名人数为零。海报贴了、班级群发了，但没有任何回应。社团里其他人开始质疑活动是否应该取消。',
    keyActions: [
      { step: 1, action: '停止群发', detail: '不再在群里发海报，而是列出 15 位可能感兴趣的同学，单独私信' },
      { step: 2, action: '改变话术', detail: '从"欢迎大家来参加"改为"我们正在做一个 xxx 的事情，想听听你的看法"' },
      { step: 3, action: '创造紧迫感', detail: '在招募信息中加入"仅剩 12 个名额"，并附上已报名同学的年级分布' },
      { step: 4, action: '降低参与门槛', detail: '把"参加活动"改为"来坐 20 分钟就行，不喜欢随时走"' },
    ],
    result: '两天内报名人数从 0 变成 42 人，实际到场 38 人，其中 12 人后续加入了社团。',
    suitableFor: '第一次负责招新、拉人、活动推广的学生组织者；预算有限、没有品牌认知的校园团队。',
    boundary: '已建立稳定品牌认知的大型社团、已毕业进入职场的人、有专职市场团队的组织',
    boundaryNote: '如果你的社团已经有稳定的招新渠道（如学校官方推荐位），这套方法的边际收益会很低。另外，这个方法依赖个人私信沟通，不适合大规模批量操作。',
    microAction: '列出 5 位你觉得可能感兴趣的人，分别发一条 3 句话以内的私信，不用群发。说清楚：你在做什么、为什么觉得 ta 可能感兴趣、不需要当场回复。',
    versionHistory: {
      v1: '只写了宣传方法的调整',
      feedback: ['没有资源时，第一批人从哪里来？', '如何让收到私信的人不反感？'],
      v2: '补充了"先找 5 位愿意一起转发的人"的具体动作，并增加了私信话术示例',
    },
    source: '作者确认 · 真实项目复盘',
    scope: '公开范围：可匿名试用',
    personaId: '01',
  },
  'persona-02': {
    id: 'persona-02',
    title: '第一次跨部门汇报：我如何从"讲不清"到让人愿意配合',
    author: '匿名产品新人',
    authorIdentity: '一位入职 3 个月的产品新人',
    status: '已验证 · 可试用',
    version: 'v1',
    problem: '第一次独立向 3 个部门做项目汇报，讲了 15 分钟后被一位总监打断说"不知道你在讲什么"。会后没有人主动配合推进。',
    keyActions: [
      { step: 1, action: '用一句话定义问题', detail: '把整个项目浓缩成一句话："我们要解决的是 xx 部门每周花 4 小时手动处理数据的问题"' },
      { step: 2, action: '先讲结果再讲过程', detail: '开场先说"如果我们做了这个，xx 部门每周能省 4 小时"，然后才解释怎么做' },
      { step: 3, action: '明确说出自己需要什么', detail: '在汇报最后明确说"我需要 A 部门提供数据接口权限，B 部门安排一位对接人"' },
    ],
    result: '第二次汇报后，3 个部门都在当周内安排了对接人，项目正式进入推进阶段。',
    suitableFor: '职场新人、第一次独立负责跨部门沟通的人、需要说服多个利益相关方的人。',
    boundary: '已有成熟汇报体系的公司、不涉及跨部门协作的单人岗位、高管级别的战略汇报',
    boundaryNote: '如果你的公司已经有标准化的项目立项流程，这套方法可能过于基础。它更适合"非正式但关键的第一次沟通"。',
    microAction: '把你明天要说的事情用一句话写下来，删到只剩这一句话，然后从这一句话开始准备你的汇报。',
    versionHistory: {
      v1: '聚焦于汇报结构的调整',
      feedback: ['如何判断对方真正关心什么？', '遇到强势的反对意见怎么办？'],
      v2: '补充了"提前了解各部门 KPI"的方法，增加了应对反对意见的示例',
    },
    source: '作者确认 · 真实工作复盘',
    scope: '公开范围：可匿名试用',
    personaId: '02',
  },
  'persona-03': {
    id: 'persona-03',
    title: '三天做完第一支 AI 短片：不是效率，而是先砍掉 70% 想法',
    author: '匿名创作者',
    authorIdentity: '一位独立内容创作者',
    status: '已验证 · v2',
    version: 'v2',
    problem: '想做一支"完美的 AI 短片"，构思了两个月，写了 5 版脚本，但一帧画面都没做出来。越想越觉得不够好，越想越不敢开始。',
    keyActions: [
      { step: 1, action: '砍掉 70%', detail: '把所有想做的创意列出来，只保留一个核心画面和一句旁白' },
      { step: 2, action: '设定硬 deadline', detail: '给自己 48 小时，不管好坏，必须导出第一版' },
      { step: 3, action: '第一版不追求完美', detail: '用最基础的 AI 工具，拼出 30 秒，直接发给 5 个朋友看' },
      { step: 4, action: '根据反馈迭代', detail: '收集朋友反馈后，用 4 小时改了 3 个地方，发布到社交平台' },
    ],
    result: '第一支 30 秒短片在社交平台获得 2000+ 播放和 60+ 条评论，收到了具体的改进建议，也有了继续做第二支的动力。',
    suitableFor: '想用 AI 做内容但迟迟没动手的独立创作者；有创意想法但卡在"不够好"阶段的人。',
    boundary: '追求电影级品质的商业项目、已在制作中的成熟项目、需要团队协作的大型制作',
    boundaryNote: '这个方法故意牺牲了质量以求"先做出来"。如果你的项目需要交付给客户或参加竞赛，不适合用这个方法。',
    microAction: '把你最想做的那个创意写下来，然后划掉 70% 的内容，只保留一个核心画面。用最简单的工具把那个画面做出来，15 分钟内完成。',
    versionHistory: {
      v1: '聚焦于"砍掉想法"和"硬 deadline"两个策略',
      feedback: ['砍掉 70% 后怎么知道剩下的 30% 是对的？', '朋友反馈太客气怎么办？'],
      v2: '补充了"如何选择保留哪 30%"的判断标准，和"找谁看第一版"的建议',
    },
    source: '作者确认 · 真实创作复盘',
    scope: '公开范围：可匿名试用',
    personaId: '03',
  },
  'persona-04': {
    id: 'persona-04',
    title: '零预算办校园活动：我如何找到第一批愿意来的人',
    author: '匿名活动组织者',
    authorIdentity: '一位校园社群组织者',
    status: '已验证 · v2',
    version: 'v2',
    problem: '社团想办一场校园分享活动，但没有赞助、没有官方推广渠道。海报没人看、班级群被忽略，距活动还有 4 天，报名人数为 3。',
    keyActions: [
      { step: 1, action: '先找 5 位愿意一起转发的人', detail: '不是群发，而是找到 5 位平时互动较多且有朋友圈影响力的同学，私信说清楚活动内容，请他们帮转发' },
      { step: 2, action: '让转发者成为"联合发起人"', detail: '在活动海报上写上"联合发起：xxx、xxx"的名字，让转发者感受到参与感' },
      { step: 3, action: '制造 FOMO', detail: '每天在朋友圈更新"已有 xx 人报名，还剩 xx 个名额"，展示活动准备的幕后花絮' },
      { step: 4, action: '降低参与门槛', detail: '强调"不需要准备什么，来就行"，并提供"活动后免费蹭饭"的社交激励' },
    ],
    result: '活动当天到场 80+ 人，超出预期 3 倍。其中 40% 来自朋友圈转发，30% 来自朋友带朋友。',
    suitableFor: '学生社团/社群组织者、预算有限的活动策划人、需要冷启动的社区运营。',
    boundary: '已有稳定流量渠道和预算的商业活动、品牌认知度高的大型活动、正式学术会议',
    boundaryNote: '这套方法高度依赖个人社交网络。如果你刚到一个新环境且没有任何社交基础，先建立基本的社交连接再用这个方法。另外，商业付费活动不适用"免费蹭饭"式激励。',
    microAction: '找到 3-5 个跟你关系不错且朋友圈活跃的人，私信说"我在做 xx 活动，想请你帮转发，不需要你做什么，转发就行"。',
    versionHistory: {
      v1: '只写了宣传方法：海报、群发、制造紧迫感',
      feedback: ['没有资源时，第一批人从哪里来？', '如何找到愿意转发的人？'],
      v2: '补充了"先找 5 位愿意一起转发的人"的具体话术和筛选标准',
    },
    source: '作者确认 · 真实活动复盘',
    scope: '公开范围：可匿名试用',
    personaId: '04',
  },
  'persona-05': {
    id: 'persona-05',
    title: '把一个模糊想法变成可测试页面：我的 48 小时路线',
    author: '匿名设计师',
    authorIdentity: '一位正在做个人项目的设计师',
    status: '已验证 · 可试用',
    version: 'v1',
    problem: '有一个"想做一个帮助新生融入校园的工具"的想法，但两个月过去了，除了在笔记里不断补充功能外，一行代码都没写。',
    keyActions: [
      { step: 1, action: '砍到只剩核心功能', detail: '把 20 个功能需求砍到只有 1 个：让新生看到同专业的学长学姐' },
      { step: 2, action: '用最笨的工具画原型', detail: '不用 Figma 不用 AI，用纸笔画了 3 个关键页面，拍了照' },
      { step: 3, action: '找 1 个人测试', detail: '把照片发给 1 位新生朋友，问"你会用这个东西吗"，获得具体反馈' },
      { step: 4, action: '24 小时内拼出可点击页面', detail: '用无代码工具拼出 3 个页面的可点击版本，发给 10 个人测试' },
    ],
    result: '48 小时内从零想法变成可测试页面，10 位测试者中有 7 位表示"愿意用"，获得第一批真实反馈。',
    suitableFor: '有想法但卡在"做不出来"阶段的项目型创作者、想做产品原型但不会写代码的人。',
    boundary: '需要后端或复杂数据系统的产品、已有明确 PRD 和团队的项目、需要上线的商业产品',
    boundaryNote: '这个方法只适合验证想法，不适合直接上线。如果你的想法需要后端、数据库或复杂交互，这个 48 小时版本只能作为沟通工具，不能作为产品。',
    microAction: '用纸笔画出 3 个关键页面，拍照发给 1 个人，问"你会用这个东西吗"。今天完成。',
    versionHistory: {
      v1: '聚焦于"砍功能"和"快速做可测试版本"的流程',
      feedback: ['怎么判断该保留哪个功能？', '如果测试的人都说不好怎么办？'],
      v2: '待更新',
    },
    source: '作者确认 · 真实项目复盘',
    scope: '公开范围：可匿名试用',
    personaId: '05',
  },
  'persona-06': {
    id: 'persona-06',
    title: '低能量期重新建立生活节奏：我只保留了三个动作',
    author: '匿名',
    authorIdentity: '一位经历低谷后重新开始的人',
    status: '已验证 · v2',
    version: 'v2',
    problem: '经历了一段长时间的低能量期，每天连起床都困难。看过各种"自律""效率"的建议，反而更加焦虑。什么都想做，什么都做不了。',
    keyActions: [
      { step: 1, action: '放弃所有效率建议', detail: '停止看任何"如何变自律""时间管理"的内容，接受自己暂时做不到' },
      { step: 2, action: '只保留三个动作', detail: '从所有应该做的事情中，只保留三个最基础的：起床喝水、出门走 10 分钟、睡前写一句话' },
      { step: 3, action: '不追求"做好"', detail: '只要做了就算数。走了 5 分钟也算。写的句子不完整也算。不给自己打分。' },
    ],
    result: '用三周时间从每天什么都做不了，恢复到可以稳定完成这三个动作。一个月后开始自然增加更多事情。',
    suitableFor: '处于低能量期的人、被各种建议淹没的人、不知道从哪里开始的人、对"自律"感到疲惫的人。',
    boundary: '需要专业心理干预的情况、处于急性压力环境中的人、需要快速恢复工作能力的情况',
    boundaryNote: '这个方法不是治疗，不能替代专业心理帮助。如果你持续两周以上无法完成基本日常活动，请寻求专业支持。这个方法只适合"恢复期"，不适合"冲刺期"。',
    microAction: '今天只做一件事：写下你明天唯一要做的一个动作，不超过 10 个字。比如"出门走 10 分钟"或"给一个人发消息"。',
    versionHistory: {
      v1: '聚焦于"放弃效率建议"和"只保留三个动作"',
      feedback: ['如果连三个动作都做不到怎么办？', '怎么判断自己是否可以增加新动作？'],
      v2: '补充了"做到一半也算数"的原则，和从三个动作自然过渡到更多动作的判断标准',
    },
    source: '作者确认 · 真实个人复盘',
    scope: '公开范围：可匿名试用',
    personaId: '06',
  },
};

// Gallery card → detail ID mapping
export const galleryToDetailMap: Record<string, string> = {
  '1': 'persona-01',
  '2': 'persona-04',
  '3': 'persona-03',
  '4': 'persona-05',
  '5': 'persona-02',
  '6': 'persona-06',
  '7': 'persona-04',
  '8': 'persona-03',
};
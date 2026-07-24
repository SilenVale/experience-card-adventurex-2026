export const personaList = [
  { id: '01', label: '正在探索的学生' },
  { id: '02', label: '刚开始工作的新人' },
  { id: '03', label: '独立创作者' },
  { id: '04', label: '社群 / 活动组织者' },
  { id: '05', label: '正在做个人项目的人' },
  { id: '06', label: '想重新开始的人' },
];

export const categories = [
  { id: 'all', label: '全部' },
  { id: 'learning', label: '学习方法' },
  { id: 'review', label: '项目复盘' },
  { id: 'career', label: '职场成长' },
  { id: 'creation', label: '内容创作' },
  { id: 'community', label: '社群活动' },
  { id: 'personal', label: '个人成长' },
  { id: 'life', label: '生活成长' },
];

export interface ExperienceCard {
  id: string;
  title: string;
  author: string;
  category: string;
  categoryId: string;
  description: string;
  tags: string[];
  boundaryTag: string;
  imageUrl: string;
  status: 'v2' | 'v1';
  cardType: 'gold' | 'ink';
}

export const experienceCards: ExperienceCard[] = [
  {
    id: '1',
    title: '我如何用 AI 整理完半年的课堂笔记，考前不再崩溃',
    author: '@记笔记总是半途而废的人 / 示例',
    category: '学习方法',
    categoryId: 'learning',
    description: '笔记分散在手机备忘录、课本空白处、各种截图里，每次考前都在慌乱地翻找',
    tags: ['笔记分散在多个地方', '考前需要快速抓住重点'],
    boundaryTag: '不适用：已经系统整理过笔记',
    imageUrl: 'https://readdy.ai/api/search-image?query=Warm%20archival%20editorial%20composition%20of%20scattered%20handwritten%20notes%20converging%20into%20an%20illuminated%20knowledge%20card%2C%20deep%20burgundy%20and%20aged%20copper%20tones%2C%20soft%20golden%20light%20tracing%20the%20edges%20of%20layered%20paper%2C%20textured%20parchment%20surface%2C%20minimal%20clean%20aesthetic%2C%20warm%20library%20glow%2C%20fine%20golden%20thread%20connecting%20fragments&width=800&height=1024&seq=gallery-card-01-v6&orientation=portrait&nocache=true',
    status: 'v2',
    cardType: 'gold',
  },
  {
    id: '2',
    title: '我如何在预算很低时办完一场校园活动',
    author: '@第一次做活动预算的人 / 示例',
    category: '项目筹备',
    categoryId: 'review',
    description: '社团给的活动预算非常少，但需要让活动看起来不寒酸，同时保证参与体验',
    tags: ['学生组织和社团', '预算受限的项目'],
    boundaryTag: '不适用：已有稳定赞助商',
    imageUrl: 'https://readdy.ai/api/search-image?query=Editorial%20photography%20style%20composition%20of%20budget%20planning%20papers%20illuminated%20by%20a%20single%20warm%20beam%20of%20light%2C%20dark%20wine%20red%20background%20with%20copper%20accents%2C%20handwritten%20notes%20on%20aged%20paper%2C%20golden%20thread%20marking%20a%20path%20through%20the%20composition%2C%20refined%20minimal%20aesthetic%2C%20soft%20shadows%2C%20warm%20atmospheric%20glow&width=800&height=1024&seq=gallery-card-02-v6&orientation=portrait&nocache=true',
    status: 'v2',
    cardType: 'gold',
  },
  {
    id: '3',
    title: '我如何用下班后的 90 分钟，3 个月从零学会 UI 设计基础',
    author: '@零设计背景的上班族 / 示例',
    category: '技能学习',
    categoryId: 'learning',
    description: '完全没有美术或设计基础，但工作中需要和设计师沟通，想看懂他们的语言',
    tags: ['全职工作但想学新技能', '零设计或美术基础'],
    boundaryTag: '不适用：需要快速入职设计岗位',
    imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20editorial%20composition%20of%20a%20creative%20learning%20journey%2C%20layered%20translucent%20paper%20sheets%20with%20design%20sketches%2C%20deep%20burgundy%20and%20warm%20copper%20color%20palette%2C%20fine%20golden%20light%20tracing%20the%20edges%20of%20each%20paper%20layer%2C%20soft%20book%20page%20texture%2C%20warm%20amber%20glow%20from%20a%20single%20light%20source%2C%20minimal%20clean%20aesthetic&width=1200&height=840&seq=gallery-card-03-v6&orientation=landscape&nocache=true',
    status: 'v1',
    cardType: 'ink',
  },
  {
    id: '4',
    title: '我如何把一次失败的项目复盘成下一次成功的起点',
    author: '@项目第一次失败的人 / 示例',
    category: '项目复盘',
    categoryId: 'review',
    description: '花了一个月做的项目被砍了，所有努力看起来都白费了',
    tags: ['项目未达预期', '希望建立复盘习惯'],
    boundaryTag: '不适用：结果已经很满意的项目',
    imageUrl: 'https://readdy.ai/api/search-image?query=Atmospheric%20editorial%20composition%20symbolizing%20growth%20from%20failure%2C%20torn%20and%20mended%20paper%20fragments%20reassembled%20into%20a%20coherent%20card%2C%20golden%20kintsugi%20thread%20weaving%20through%20the%20cracks%2C%20deep%20wine%20red%20and%20aged%20brass%20tones%2C%20warm%20illuminating%20light%20from%20one%20side%2C%20textured%20parchment%2C%20hopeful%20reflective%20mood%2C%20refined%20minimal%20aesthetic&width=800&height=1024&seq=gallery-card-04-v6&orientation=portrait&nocache=true',
    status: 'v2',
    cardType: 'gold',
  },
  {
    id: '5',
    title: '我如何用一封邮件，让陌生前辈愿意花时间看我的作品',
    author: '@正在找方向但没有人脉的人 / 示例',
    category: '职场成长',
    categoryId: 'career',
    description: '不知道自己做的事情对不对，想找一个有经验的人给点反馈，但不认识任何业内人士',
    tags: ['刚开始建立专业人脉', '没有业内人士可帮忙评估'],
    boundaryTag: '不适用：已有稳定人脉网络',
    imageUrl: 'https://readdy.ai/api/search-image?query=Sincere%20editorial%20composition%20of%20a%20handwritten%20letter%20illuminated%20by%20warm%20light%2C%20deep%20burgundy%20and%20copper%20background%2C%20fine%20golden%20thread%20extending%20from%20the%20letter%20toward%20the%20edge%2C%20textured%20paper%20with%20subtle%20folds%2C%20minimal%20clean%20aesthetic%2C%20warm%20atmospheric%20glow%2C%20human%20connection%20feeling%20without%20showing%20people&width=1200&height=840&seq=gallery-card-05-v6&orientation=landscape&nocache=true',
    status: 'v1',
    cardType: 'ink',
  },
  {
    id: '6',
    title: '我如何克服公开表达前的拖延和恐惧',
    author: '@每次上台前都想逃跑的人 / 示例',
    category: '个人成长',
    categoryId: 'personal',
    description: '每次有汇报或分享机会，提前一周就开始焦虑，准备的过程变成了反复修改和不断怀疑',
    tags: ['有演讲/汇报需求', '容易在准备阶段拖延'],
    boundaryTag: '不适用：需要专业演讲培训',
    imageUrl: 'https://readdy.ai/api/search-image?query=Warm%20atmospheric%20editorial%20composition%20of%20confidence%20and%20finding%20ones%20voice%2C%20gentle%20golden%20light%20breaking%20through%20dark%20burgundy%20shadows%2C%20floating%20paper%20notes%20with%20handwritten%20words%2C%20soft%20copper%20accents%2C%20minimal%20elegant%20style%2C%20warm%20encouraging%20tone%2C%20textured%20parchment%20surface&width=1200&height=840&seq=gallery-card-06-v6&orientation=landscape&nocache=true',
    status: 'v1',
    cardType: 'ink',
  },
  {
    id: '7',
    title: '我如何用一张纸的规则，结束了合租冰箱空间之战',
    author: '@第一次和陌生人合租的人 / 示例',
    category: '生活成长',
    categoryId: 'life',
    description: '冰箱空间分配混乱、公共区域使用时间冲突、群聊里怨气越来越重',
    tags: ['合租/室友共用空间', '因小事反复产生摩擦'],
    boundaryTag: '不适用：独自居住',
    imageUrl: 'https://readdy.ai/api/search-image?query=Editorial%20composition%20of%20shared%20space%20harmony%2C%20layered%20paper%20notes%20with%20handwritten%20house%20rules%2C%20warm%20copper%20and%20burgundy%20tones%2C%20soft%20golden%20connecting%20threads%20between%20the%20papers%2C%20textured%20parchment%20surface%2C%20calm%20domestic%20atmosphere%2C%20minimal%20clean%20aesthetic%2C%20warm%20ambient%20glow&width=800&height=1024&seq=gallery-card-07-v6&orientation=portrait&nocache=true',
    status: 'v1',
    cardType: 'ink',
  },
  {
    id: '8',
    title: '我如何把 30 个读书笔记碎片变成第一篇被转载的文章',
    author: '@读了很多但写不出来的人 / 示例',
    category: '创作与项目',
    categoryId: 'creation',
    description: '读了很多书但感觉什么都没记住，想分享但打开空白的编辑页面就大脑一片空白',
    tags: ['读了很多书记不住', '想做知识输出但不知如何组织'],
    boundaryTag: '不适用：追求学术严谨的论文写作',
    imageUrl: 'https://readdy.ai/api/search-image?query=Elegant%20editorial%20composition%20of%20scattered%20reading%20notes%20converging%20into%20a%20coherent%20article%2C%20golden%20threads%20connecting%20paper%20fragments%20across%20the%20composition%2C%20deep%20burgundy%20and%20aged%20copper%20tones%2C%20warm%20illuminating%20beam%20from%20upper%20left%2C%20textured%20book%20pages%20and%20handwriting%2C%20minimal%20refined%20aesthetic%2C%20intellectual%20creative%20atmosphere&width=1200&height=840&seq=gallery-card-08-v6&orientation=landscape&nocache=true',
    status: 'v2',
    cardType: 'gold',
  },
];

export const flowSteps = [
  { id: '01', label: '真实经历', icon: 'ri-file-text-line' },
  { id: '02', label: 'AI 编辑', icon: 'ri-robot-line' },
  { id: '03', label: '作者确认', icon: 'ri-check-double-line' },
  { id: '04', label: '他人试用', icon: 'ri-user-shared-line' },
  { id: '05', label: '反馈更新', icon: 'ri-loop-left-line' },
];

export const footerLinks = {
  explore: [
    { label: '经验广场', href: '#' },
    { label: '社区共创', href: '#' },
    { label: '创建名片', href: '#' },
    { label: '我的名片', href: '#' },
  ],
  coCreate: [
    { label: '共创中的经验', href: '#' },
    { label: '寻求试用者', href: '#' },
    { label: '寻找协作伙伴', href: '#' },
    { label: '我需要帮助', href: '#' },
  ],
  about: [
    { label: '产品理念', href: '#' },
    { label: '联系我们', href: '#' },
  ],
  philosophy: [
    { label: 'AI 是编辑，不是裁判', href: '#' },
    { label: '经验属于分享它的人', href: '#' },
    { label: '普通人也有值得留下的事', href: '#' },
  ],
};
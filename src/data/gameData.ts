export interface Identity {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface Question {
  id: number;
  text: string;
}

export const identities: Identity[] = [
  { id: "village-head", name: "村支书", emoji: "👨‍💼", description: "你是一位在本地有威望的村支书，大家遇到事情都会找你商量。", color: "hsl(352, 85%, 44%)" },
  { id: "single-mom", name: "单亲妈妈", emoji: "👩", description: "你是一位独自抚养两个孩子的单亲妈妈，靠打零工维持生计。", color: "hsl(25, 80%, 50%)" },
  { id: "deaf-elder", name: "有听力障碍的老人", emoji: "👴", description: "你是一位 72 岁的老人，听力严重下降，需要佩戴助听器，没有智能手机。", color: "hsl(200, 60%, 45%)" },
  { id: "migrant-worker", name: "外来务工人员", emoji: "👷", description: "你刚从外地搬来这个社区，人生地不熟，没有本地户口。", color: "hsl(140, 50%, 40%)" },
  { id: "disabled-youth", name: "残疾青年", emoji: "🧑‍🦽", description: "你是一位 25 岁的轮椅使用者，大学毕业后一直在找工作。", color: "hsl(270, 50%, 50%)" },
  { id: "left-behind-child", name: "留守儿童", emoji: "👦", description: "你是一个 12 岁的孩子，父母都在外地打工，你跟奶奶一起生活。", color: "hsl(45, 80%, 45%)" },
  { id: "retired-teacher", name: "退休教师", emoji: "👩‍🏫", description: "你是一位退休的中学教师，有稳定的退休金和医疗保障。", color: "hsl(180, 50%, 40%)" },
  { id: "mental-health", name: "有抑郁症的大学生", emoji: "🧑‍🎓", description: "你是一位正在与抑郁症抗争的大学生，不敢告诉周围的人。", color: "hsl(220, 60%, 50%)" },
  { id: "local-farmer", name: "本地普通农民", emoji: "👨‍🌾", description: "你是一位本地农户，文化程度不高，平时忙于农活。", color: "hsl(90, 50%, 40%)" },
  { id: "shop-owner", name: "小店老板", emoji: "🏪", description: "你在村里经营一家杂货店，认识不少人。", color: "hsl(30, 60%, 45%)" },
];

export const questions: Question[] = [
  { id: 1, text: "我能负担得起基本生活开支。" },
  { id: 2, text: "生病时，我能及时获得医疗帮助。" },
  { id: 3, text: "我能方便地使用智能手机获取信息。" },
  { id: 4, text: "在社区里，我认识有影响力的人。" },
  { id: 5, text: "当我在社区遇到困难时，我知道可以向谁求助。" },
  { id: 6, text: "村里发布\u201c建桥\u201d的通知时，我通常能第一时间知道。" },
  { id: 7, text: "村里在村委会二楼召开建桥会议，我能顺利到达现场，并安心参与讨论。" },
  { id: 8, text: "在会议上，如果我不同意建桥方案，我敢当众提出意见。" },
  { id: 9, text: "如果我不想公开发言，我知道还有其他方式可以表达自己的想法。" },
  { id: 10, text: "当我表达意见后，我相信村里的决定会认真考虑我的想法。" },
];

export function getRandomIdentity(): Identity {
  return identities[Math.floor(Math.random() * identities.length)];
}

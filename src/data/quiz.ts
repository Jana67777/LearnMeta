import type { QuizQuestion } from '@/types/types';

export const preTestQuestions: QuizQuestion[] = [
  {
    id: 'pre-1',
    question: '台风形成的主要条件是什么？',
    options: [
      { label: 'A', text: '高温高湿的海洋环境' },
      { label: 'B', text: '寒冷干燥的陆地环境' },
      { label: 'C', text: '高海拔山区环境' },
      { label: 'D', text: '沙漠环境' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 'pre-2',
    question: '台风的能量主要来源于？',
    options: [
      { label: 'A', text: '太阳辐射' },
      { label: 'B', text: '海洋热量' },
      { label: 'C', text: '地热能' },
      { label: 'D', text: '风能' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'pre-3',
    question: '台风中心被称为？',
    options: [
      { label: 'A', text: '台风眼' },
      { label: 'B', text: '台风壁' },
      { label: 'C', text: '台风核' },
      { label: 'D', text: '台风心' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 'pre-4',
    question: '以下哪个海域是台风（飓风）最常生成的区域？',
    options: [
      { label: 'A', text: '北大西洋' },
      { label: 'B', text: '西北太平洋' },
      { label: 'C', text: '地中海' },
      { label: 'D', text: '北冰洋' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'pre-5',
    question: '台风属于哪种天气系统？',
    options: [
      { label: 'A', text: '温带气旋' },
      { label: 'B', text: '热带气旋' },
      { label: 'C', text: '反气旋' },
      { label: 'D', text: '锋面系统' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'pre-6',
    question: '台风眼内的天气特征是？',
    options: [
      { label: 'A', text: '狂风暴雨' },
      { label: 'B', text: '风平浪静' },
      { label: 'C', text: '大雪纷飞' },
      { label: 'D', text: '沙尘暴' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'pre-7',
    question: '台风形成需要海水温度达到多少度以上？',
    options: [
      { label: 'A', text: '20℃' },
      { label: 'B', text: '26.5℃' },
      { label: 'C', text: '30℃' },
      { label: 'D', text: '35℃' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'pre-8',
    question: '台风登陆后强度会如何变化？',
    options: [
      { label: 'A', text: '逐渐增强' },
      { label: 'B', text: '保持不变' },
      { label: 'C', text: '逐渐减弱' },
      { label: 'D', text: '先增强后减弱' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'pre-9',
    question: '台风预警信号中，最高级别是什么颜色？',
    options: [
      { label: 'A', text: '橙色' },
      { label: 'B', text: '黄色' },
      { label: 'C', text: '红色' },
      { label: 'D', text: '蓝色' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'pre-10',
    question: '台风按强度分为几个等级？',
    options: [
      { label: 'A', text: '3个等级' },
      { label: 'B', text: '4个等级' },
      { label: 'C', text: '5个等级' },
      { label: 'D', text: '6个等级' },
    ],
    correctAnswer: 'D',
  },
];

export const postTestQuestions: QuizQuestion[] = [
  {
    id: 'post-1',
    question: '台风形成需要海水温度达到多少度以上？',
    options: [
      { label: 'A', text: '20℃' },
      { label: 'B', text: '26.5℃' },
      { label: 'C', text: '30℃' },
      { label: 'D', text: '35℃' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'post-2',
    question: '台风按强度分为几个等级？',
    options: [
      { label: 'A', text: '3个等级' },
      { label: 'B', text: '4个等级' },
      { label: 'C', text: '5个等级' },
      { label: 'D', text: '6个等级' },
    ],
    correctAnswer: 'D',
  },
  {
    id: 'post-3',
    question: '台风登陆后强度会如何变化？',
    options: [
      { label: 'A', text: '逐渐增强' },
      { label: 'B', text: '保持不变' },
      { label: 'C', text: '逐渐减弱' },
      { label: 'D', text: '先增强后减弱' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'post-4',
    question: '台风眼内的天气特征是？',
    options: [
      { label: 'A', text: '狂风暴雨' },
      { label: 'B', text: '风平浪静' },
      { label: 'C', text: '大雪纷飞' },
      { label: 'D', text: '沙尘暴' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'post-5',
    question: '台风预警信号中，最高级别是什么颜色？',
    options: [
      { label: 'A', text: '橙色' },
      { label: 'B', text: '黄色' },
      { label: 'C', text: '红色' },
      { label: 'D', text: '蓝色' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'post-6',
    question: '台风的能量主要来源于哪个过程？',
    options: [
      { label: 'A', text: '水汽凝结释放潜热' },
      { label: 'B', text: '太阳直接照射' },
      { label: 'C', text: '海底火山喷发' },
      { label: 'D', text: '地壳运动' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 'post-7',
    question: '以下哪项不是台风形成的基本条件？',
    options: [
      { label: 'A', text: '广阔的高温洋面' },
      { label: 'B', text: '足够的地转偏向力' },
      { label: 'C', text: '垂直风切变大' },
      { label: 'D', text: '初始扰动' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'post-8',
    question: '台风的平均寿命约为多少天？',
    options: [
      { label: 'A', text: '1-2天' },
      { label: 'B', text: '7-10天' },
      { label: 'C', text: '30天' },
      { label: 'D', text: '3个月' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'post-9',
    question: '眼墙是台风中哪个特征最明显的区域？',
    options: [
      { label: 'A', text: '风力最弱' },
      { label: 'B', text: '风力最强、降雨最剧烈' },
      { label: 'C', text: '天气晴朗' },
      { label: 'D', text: '无云区' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'post-10',
    question: '台风来临前应做好以下哪项准备？',
    options: [
      { label: 'A', text: '到海边观赏海浪' },
      { label: 'B', text: '加固门窗、储备物资' },
      { label: 'C', text: '外出跑步锻炼' },
      { label: 'D', text: '打开所有窗户通风' },
    ],
    correctAnswer: 'B',
  },
];
// Cinema Mode Extension - 完整的影院播放器（含智能切分 + 背景/音乐）
console.log('[CinemaMode] 扩展加载中...');

let context = null;
let cinemaModeActive = false;
let cinemaMessages = [];
let currentMessageIndex = 0;
let currentSegments = [];
let currentSegmentIndex = 0;
let autoPlayInterval = null;
let cinemaElements = {};
// 在文件开头添加
let currentAIChatName = 'AI';      // 当前AI角色的名字
let currentUserName = '主人公';     // 当前用户的名字
// ==================== 状态栏UI变量====================
let syncParser = null;
let syncUpdater = null;
let syncInitialized = false;

// 场景背景映射
const SCENE_FILE_MAP = {
    '标题': '标题',
    '教室': '教室',
    '天空': '天空',
    '天台': '天台',
    '小巷': '小巷',
    '伦敦': '伦敦',
    '洛阳': '洛阳',
    '开封': '开封',
    '少林': '少林',
    '武当': '武当',
    '杭州': '杭州',
    '苏州': '苏州',
    '西湖': '西湖',
    '成都': '成都',
    '重庆': '重庆',
    '峨眉': '峨眉',
    '剑阁': '剑阁',
    '燕云': '燕云',
    '长城': '长城',
    '东洲': '东洲',
    '焚情谷': '焚情谷',
    '居所': '居所',
    '草原': '草原',
    '大理': '大理',
    '天山': '天山',
    '大漠': '大漠',
    '广州': '广州',
    '佛山': '佛山',
    '港口': '港口',
    '蓬莱': '蓬莱',
    '昆仑': '昆仑',
    '伦敦东区': '伦敦东区',
    '工厂': '工厂',
    '博物馆': '博物馆',
    '拍卖行': '拍卖行',
    '股票交易所': '股票交易所',
    '歌剧院': '歌剧院',
    '贵族沙龙': '贵族沙龙',
    '裁缝店': '裁缝店',
    '高端餐厅': '高端餐厅',
    '餐厅': '高端餐厅',
    '公寓': '公寓',
    '普通餐厅': '普通餐厅',
    '贫民窟': '贫民窟',
    '酒店': '酒店',
    '楼梯': '楼梯',
    '花坛': '花坛',
    '走廊': '走廊',
    '广播室': '广播室',
    '医务室': '医务室',
    '值班室': '值班室',
    '汽修厂': '汽修厂',
    '地下室': '地下室',
    '宿舍内': '宿舍内',
    '宿舍走廊': '宿舍走廊',
    '街': '街',
    '大学城': '大学城',
    '俱乐部': '俱乐部',
    '网吧': '网吧',
    '赛场': '赛场',
    '体育馆': '体育馆',
    '篮球场': '篮球场',
    '实验室': '实验室',
    '试验室': '试验室',
    '食堂': '食堂',
    '校门': '校门',
    '开篇': '开篇',
    '家': '家',
    '卧室': '卧室',
    '电影院': '电影院',
    '医院': '医院',
    '咖啡店': '咖啡店',
    '商场': '商场',
    '泳池': '泳池',
    '水族馆': '水族馆',
    '天桥': '天桥',
    '公园': '公园',
    '赛马场': '赛马场',
    '超市': '超市',
    '便利店': '便利店',
    '主神空间': '主神空间',
    '新手村': '新手村',
    '风景': '新手村风景',
    '酒馆': '酒馆',
    '迷宫': '墓地',
    '训练场': '训练场',
    '墓地': '墓地',
    '山顶': '山顶',
    '屋内': '屋内',
    '图书馆': '图书馆',
    '商店街': '商店街',
    '公交车': '公交车',
    '废弃小剧场': '废弃小剧场',
    '剧场': '剧场',
    '舞台': '舞台',
    '演唱会': '演唱会',
    '训练室': '训练室',
    '森林': '森林',
    '海': '海',
    '山': '山',
    '河': '河',
    '默认': '默认'
};



// 音乐情绪映射
const MUSIC_MAP = {
    // 情绪 -> 音乐类型
    '开心': '欢乐',
    '害羞': '温馨',
    '生气': '紧张',
    '忧伤': '忧伤',
    '惊讶': '意外',
    '温馨': '温馨',
    '紧张': '紧张',
    '浪漫': '浪漫',
    '欢乐': '欢乐',
    '悲伤': '悲伤',
    '宁静': '宁静',
    '神秘': '神秘',
    '舒缓': '舒缓',
    '意外': '意外',
    '悠扬': '悠扬',
    '惨剧': '惨剧',
    '希望': '希望',
    '思考': '思考',
    '振奋': '振奋',
    '兴奋': '振奋',
    '鼓舞': '鼓舞',
    '比赛': '比赛',
    '结算': '结算',
    '总结': '结算',
    '电竞': '比赛',
    '游戏': '比赛',
    '日常': '日常',
    '训练': '训练',
    '结尾': '结尾',
    '新的开始': '新的开始',
    '主题': '主题'
};

// ==================== 全局状态栏栏目配置 ====================

// 栏目关键词映射（统一）
const SECTION_KEYWORDS = {
    '人物状态': ['人物状态', '状态', '当前状态', '生存', '生命', '体力', '健康', '血量', '理智', '混乱', '孤独', '误解', '饥饿', '口渴', '精力', '精神'],
    '角色属性': ['角色属性', '属性', '基本属性', '能力值', '角色数值'],
    '物品栏': ['物品栏', '物品', '库存', '背包', '道具', '行李'],
    '人际关系': ['人际关系', '关系', '好感度', '情缘', '羁绊', '相遇角色'],
    '武学栏': ['武学', '技能', '招式', '功法', '心法', '能力', '法术'],
    '任务栏': ['任务', '目标', '委托', '使命', '待办'],
    '装备栏': ['装备', '穿戴', '防具', '武器', '饰品']
};

// ==================== 情绪关键词统一映射 ====================

const EMOTION_KEYWORDS = {
    '开心': ['哈哈', '开心', '高兴', '真好', '耶', '😊', '愉快', '喜悦', '雀跃', '欢呼', '欢笑', '快乐', '兴奋'],
    '害羞': ['脸红', '不好意思', '讨厌', '别说了', '笨蛋', '😳', '羞涩', '腼腆', '低头', '扭捏'],
    '生气': ['生气', '愤怒', '可恶', '混蛋', '😠', '恼火', '暴怒', '不爽', '恨', '咬牙切齿', '暴躁'],
    '忧伤': ['唉', '悲伤', '难过', '失落', '😢', '心痛', '抑郁', '沉重', '泪目', '凄凉'],
    '惊讶': ['什么', '真的吗', '惊讶', '难以置信', '😲', '震惊', '意外', '居然', '天哪', '吓一跳'],
    '温馨': ['温柔', '微笑', '阳光', '温暖', '暖意', '贴心', '关怀', '治愈', '柔软', '🥰'],
    '紧张': ['紧张', '危险', '不安', '害怕', '恐惧', '惊慌', '焦虑', '压迫', '窒息', '心慌', '😖'],
    '浪漫': ['心跳', '喜欢', '爱', '牵手', '拥抱', '心动', '甜蜜', '暧昧', '深情', '依恋', '💕'],
    '欢乐': ['欢乐', '愉快', '欢呼', '庆祝', '🥳', '雀跃', '兴高采烈', '手舞足蹈'],
    '悲伤': ['悲伤', '悲痛', '哀伤', '绝望', '哭泣', '泪流', '心碎', '撕心裂肺', '😭'],
    '宁静': ['安静', '静谧', '宁静', '平和', '安详', '沉默', '无声', '寂静', '幽静'],
    '神秘': ['神秘', '诡异', '奇异', '古怪', '未知', '谜', '幽暗', '阴森', '玄妙'],
    '舒缓': ['舒缓', '放松', '悠闲', '惬意', '慵懒', '自在', '舒适', '闲适'],
    '意外': ['意外', '没想到', '出乎意料', '竟然', '居然', '突袭', '突然', '猝不及防'],
    '悠扬': ['悠扬', '婉转', '悦耳', '动听', '优美', '旋律', '余音', '空灵'],
    '惨剧': ['惨剧', '惨烈', '悲剧', '血腥', '残酷', '残忍', '噩梦', '地狱'],
    '希望': ['希望', '期待', '向往', '憧憬', '曙光', '盼望', '愿望', '信念'],
    '思考': ['思考', '推理', '推导', '分析', '思索', '沉思', '琢磨', '反省', '沉思', '🤔'],
    '振奋': ['振奋', '激动', '热血', '燃', '斗志', '激昂', '澎湃', '沸腾', '鼓舞', '亢奋', '激情', '豪迈', '壮烈', '慷慨'],
    '比赛': ['比赛', '赛场', '电子竞技', '游戏比赛', '大赛', '赛事', '竞技', '打一场'],
    '结算': ['结算', '总结', '回顾', '经验'],
    '日常': ['日常', '平常', '普通', '一般', '平淡', '平凡', '照常', '一如既往']
};

// ==================== 物品图标全局映射 ====================

const ITEM_ICON_MAP = {
    // 电子设备
    '手机': '📱', '平板': '📱', '电脑': '💻', '笔记本': '💻', '充电宝': '🔋', '耳机': '🎧', '音响': '🔊',
    // 食物饮料
    '矿泉水': '💧', '饮料': '🥤', '可乐': '🥤', '雪碧': '🥤', '果汁': '🧃', '牛奶': '🥛',
    '面包': '🍞', '饼干': '🍪', '蛋糕': '🍰', '糖果': '🍬', '巧克力': '🍫', '薯片': '🍟',
    '罐头': '🥫', '方便面': '🍜', '火腿肠': '🌭', '便当': '🍱',
    // 医疗
    '急救包': '🩹', '绷带': '🩹', '止痛药': '💊', '感冒药': '💊', '创可贴': '🩹', '消毒水': '🧴',
    // 武器
    '手枪': '🔫', '步枪': '🔫', '子弹': '🔸', '刀具': '🔪', '匕首': '🔪', '剑': '⚔️',
    // 工具
    '手电筒': '🔦', '地图': '🗺️', '钥匙': '🔑', '日记': '📔', '笔记本': '📓', '笔': '✒️',
    '打火机': '🔥', '火柴': '🔥', '绳子': '🪢', '胶带': '📦',
    // 游戏相关
    '胜利积分': '🏆', '金币': '💰', '银币': '💰', '钻石': '💎', '宝石': '💎',
    '俱乐部资金': '💰', '银行负债': '💸', '贡献点': '⭐', '声望': '🏅',
    // 其他
    '书籍': '📚', '杂志': '📰', '照片': '🖼️', '信件': '✉️', '礼物': '🎁'
};

// 默认物品图标
const DEFAULT_ITEM_ICON = '📦';

// ==================== 角色心情图标映射 ====================

const MOOD_ICON_MAP = {
    '开心': '😊', '高兴': '😄', '喜悦': '😆', '快乐': '😁', '兴奋': '🤩',
    '愤怒': '😠', '生气': '😤', '暴躁': '🤬', '恼火': '😡',
    '悲伤': '😢', '难过': '😭', '忧伤': '😔', '忧郁': '🥺', '失落': '😞',
    '惊讶': '😲', '吃惊': '😮', '震惊': '😱', '意外': '😯',
    '害羞': '😳', '脸红': '☺️', '羞涩': '🥰','执念': ' 🖤',
    '冷静': '😐', '平静': '🙂', '淡定': '😌', '日常': '💬',
    '疲惫': '😫', '困倦': '😴', '劳累': '😪',
    '害怕': '😨', '恐惧': '😱', '紧张': '😖',
    '疑惑': '🤔', '思考': '💭', '好奇': '🧐',
    '温馨': '🥰', '浪漫': '💕', '甜蜜': '🍯'
};

// 默认心情图标
const DEFAULT_MOOD_ICON = '💭';

// ==================== 角色性别图标 ====================

const GENDER_ICON = {
    '女': '♀',
    '男': '♂',
    '未知': '❓'
};

// 获取情绪阶段配置
// ==================== 情绪/好感度阶段配置 ====================

const AFFECTION_STAGES = {
    negative: {
        '-80': { text: '死敌', color: '#8B0000', barColor: '#8B0000', icon: '⚔️' },
        '-50': { text: '憎恨', color: '#B22222', barColor: '#B22222', icon: '👿' },
        '-20': { text: '厌恶', color: '#CD5C5C', barColor: '#CD5C5C', icon: '😤' },
        'default': { text: '冷淡', color: '#A9A9A9', barColor: '#A9A9A9', icon: '😒' }
    },
    positive: {
        '90': { text: '挚爱', color: '#FF1493', barColor: '#FF1493', icon: '💕' },
        '70': { text: '热恋', color: '#FF69B4', barColor: '#FF69B4', icon: '💗' },
        '50': { text: '喜欢', color: '#FF88CC', barColor: '#FF88CC', icon: '💖' },
        '30': { text: '友好', color: '#88CCFF', barColor: '#88CCFF', icon: '💙' },
        '10': { text: '认识', color: '#88FF88', barColor: '#88FF88', icon: '💚' },
        'default': { text: '陌生', color: '#A9A9A9', barColor: '#A9A9A9', icon: '💔' }
    }
};

// 获取栏目名称（根据关键词匹配）
function getSectionName(keyword) {
    for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
        if (keywords.some(kw => keyword.includes(kw) || kw.includes(keyword))) {
            return sectionName;
        }
    }
    return null;
}

// 检查文本是否属于某个栏目
function isSectionMatch(text, sectionName) {
    const keywords = SECTION_KEYWORDS[sectionName];
    if (!keywords) return false;
    return keywords.some(kw => text.includes(kw));
}

// 获取所有栏目名称
function getAllSectionNames() {
    return Object.keys(SECTION_KEYWORDS);
}

// 获取情绪阶段配置（修复版）
function getAffectionStage(affection) {
    // 确保 affection 是数字
    const value = Number(affection);
    if (isNaN(value)) {
        return { text: '陌生', color: '#A9A9A9', barColor: '#A9A9A9', icon: '💔' };
    }
    
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const stages = isNegative ? AFFECTION_STAGES.negative : AFFECTION_STAGES.positive;
    
    // 负数阶段判断（绝对值越大越负面）
    if (isNegative) {
        if (absValue >= 80) return stages['-80'];
        if (absValue >= 50) return stages['-50'];
        if (absValue >= 20) return stages['-20'];
        return stages.default;
    }
    // 正数阶段判断
    else {
        if (absValue >= 90) return stages['90'];
        if (absValue >= 70) return stages['70'];
        if (absValue >= 50) return stages['50'];
        if (absValue >= 30) return stages['30'];
        if (absValue >= 10) return stages['10'];
        return stages.default;
    }
}

// ==================== 全局工具函数 ====================

// 获取物品图标
function getItemIcon(itemName) {
    // 精确匹配
    if (ITEM_ICON_MAP[itemName]) return ITEM_ICON_MAP[itemName];
    
    // 模糊匹配（包含关键词）
    for (const [key, icon] of Object.entries(ITEM_ICON_MAP)) {
        if (itemName.includes(key)) return icon;
    }
    
    return DEFAULT_ITEM_ICON;
}

// 获取心情图标
function getMoodIcon(mood) {
    return MOOD_ICON_MAP[mood] || DEFAULT_MOOD_ICON;
}

// 获取性别图标
function getGenderIcon(gender) {
    return GENDER_ICON[gender] || GENDER_ICON['未知'];
}

// 从文本中提取情绪（统一函数）
function extractEmotionFromText(text) {
    if (!text) return '日常';
    
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        if (keywords.some(kw => text.includes(kw))) {
            return emotion;
        }
    }
    return '日常';
}

// 从文本中提取心情（用于音乐映射）
function extractMoodFromText(text) {
    return extractEmotionFromText(text);
}

// 根据情绪获取音乐
function getMusicByEmotion(emotion) {
    return MUSIC_MAP[emotion] || '日常';
}

// ==================== 将所有配置挂载到 window ====================
window.SCENE_FILE_MAP = SCENE_FILE_MAP;
window.MUSIC_MAP = MUSIC_MAP;
window.SECTION_KEYWORDS = SECTION_KEYWORDS;
window.EMOTION_KEYWORDS = EMOTION_KEYWORDS;
window.ITEM_ICON_MAP = ITEM_ICON_MAP;
window.MOOD_ICON_MAP = MOOD_ICON_MAP;
window.GENDER_ICON = GENDER_ICON;
window.AFFECTION_STAGES = AFFECTION_STAGES;

// 工具函数也挂载
window.getMoodIcon = getMoodIcon;
window.getGenderIcon = getGenderIcon;
window.getItemIcon = getItemIcon;
window.extractEmotionFromText = extractEmotionFromText;
window.getAffectionStage = getAffectionStage;

// ==================== 主题管理器 ====================

class ThemeManager {
    constructor() {
        this.themes = {
            // ========== 原有主题 ==========
            'default': {
                name: '默认',
                icon: '🎬',
                description: '经典影院风格',
                colors: {
                    primary: '#ff69b4',
                    secondary: '#ff4444',
                    bg: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
                    text: '#ffffff',
                    accent: '#ffd700',
                    cardBg: 'rgba(0,0,0,0.6)',
                    border: 'rgba(255,105,180,0.3)',
                    glow: 'rgba(255,105,180,0.2)',
                    textAreaBg: 'rgba(0,0,0,0.75)'
                }
            },
            'cyberpunk': {
                name: '赛博朋克',
                icon: '🌃',
                description: '霓虹都市，未来感',
                colors: {
                    primary: '#00f0ff',
                    secondary: '#ff00ff',
                    bg: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)',
                    text: '#00f0ff',
                    accent: '#ff00ff',
                    cardBg: 'rgba(0,10,20,0.8)',
                    border: 'rgba(0,240,255,0.4)',
                    glow: 'rgba(0,240,255,0.2)',
                    textAreaBg: 'rgba(0,10,30,0.85)'
                }
            },
            'sunset': {
                name: '日落',
                icon: '🌅',
                description: '温暖橙红，浪漫氛围',
                colors: {
                    primary: '#ff6b35',
                    secondary: '#ff8c42',
                    bg: 'linear-gradient(135deg, #1a0a0a, #2e1a0a)',
                    text: '#ffd4a8',
                    accent: '#ff8c42',
                    cardBg: 'rgba(30,15,10,0.8)',
                    border: 'rgba(255,107,53,0.4)',
                    glow: 'rgba(255,107,53,0.2)',
                    textAreaBg: 'rgba(30,10,5,0.85)'
                }
            },
            'forest': {
                name: '森林',
                icon: '🌲',
                description: '翠绿自然，宁静致远',
                colors: {
                    primary: '#2ecc71',
                    secondary: '#27ae60',
                    bg: 'linear-gradient(135deg, #0a1a0a, #0a2e1a)',
                    text: '#a8e6cf',
                    accent: '#2ecc71',
                    cardBg: 'rgba(10,30,15,0.8)',
                    border: 'rgba(46,204,113,0.4)',
                    glow: 'rgba(46,204,113,0.2)',
                    textAreaBg: 'rgba(5,25,10,0.85)'
                }
            },
            'ocean': {
                name: '海洋',
                icon: '🌊',
                description: '深邃湛蓝，广阔宁静',
                colors: {
                    primary: '#3498db',
                    secondary: '#2980b9',
                    bg: 'linear-gradient(135deg, #0a0a1a, #0a1a3a)',
                    text: '#85c1e9',
                    accent: '#3498db',
                    cardBg: 'rgba(10,20,40,0.8)',
                    border: 'rgba(52,152,219,0.4)',
                    glow: 'rgba(52,152,219,0.2)',
                    textAreaBg: 'rgba(5,10,30,0.85)'
                }
            },
            'cherry': {
                name: '樱花',
                icon: '🌸',
                description: '粉嫩甜美，少女心',
                colors: {
                    primary: '#ff88cc',
                    secondary: '#ff69b4',
                    bg: 'linear-gradient(135deg, #1a0a18, #2e1a28)',
                    text: '#ffb6c1',
                    accent: '#ff88cc',
                    cardBg: 'rgba(30,10,25,0.8)',
                    border: 'rgba(255,136,204,0.4)',
                    glow: 'rgba(255,136,204,0.2)',
                    textAreaBg: 'rgba(25,5,20,0.85)'
                }
            },
            'midnight': {
                name: '午夜',
                icon: '🌙',
                description: '深色静谧，沉浸观影',
                colors: {
                    primary: '#8e44ad',
                    secondary: '#6c3483',
                    bg: 'linear-gradient(135deg, #050510, #0a0518)',
                    text: '#c39bd3',
                    accent: '#8e44ad',
                    cardBg: 'rgba(10,5,20,0.9)',
                    border: 'rgba(142,68,173,0.4)',
                    glow: 'rgba(142,68,173,0.2)',
                    textAreaBg: 'rgba(5,0,15,0.9)'
                }
            },
            'gold': {
                name: '金色',
                icon: '✨',
                description: '奢华金灿，典雅高贵',
                colors: {
                    primary: '#f1c40f',
                    secondary: '#f39c12',
                    bg: 'linear-gradient(135deg, #1a150a, #2e200a)',
                    text: '#f9e79f',
                    accent: '#f1c40f',
                    cardBg: 'rgba(30,20,10,0.8)',
                    border: 'rgba(241,196,15,0.4)',
                    glow: 'rgba(241,196,15,0.2)',
                    textAreaBg: 'rgba(25,15,5,0.85)'
                }
            },
            'lava': {
                name: '熔岩',
                icon: '🌋',
                description: '炽热激情，能量迸发',
                colors: {
                    primary: '#e74c3c',
                    secondary: '#c0392b',
                    bg: 'linear-gradient(135deg, #1a0505, #2e0a0a)',
                    text: '#f1948a',
                    accent: '#e74c3c',
                    cardBg: 'rgba(30,5,5,0.8)',
                    border: 'rgba(231,76,60,0.4)',
                    glow: 'rgba(231,76,60,0.2)',
                    textAreaBg: 'rgba(25,0,0,0.85)'
                }
            },

            // ========== 新增主题 ==========
            
            // 1. 星空主题
            'starry': {
                name: '星空',
                icon: '🌌',
                description: '璀璨星海，梦幻深邃',
                colors: {
                    primary: '#7c3aed',
                    secondary: '#4f46e5',
                    bg: 'linear-gradient(135deg, #0a0a2e, #1a0a3e, #0a0a2e)',
                    text: '#c4b5fd',
                    accent: '#a78bfa',
                    cardBg: 'rgba(10,5,30,0.85)',
                    border: 'rgba(124,58,237,0.5)',
                    glow: 'rgba(124,58,237,0.3)',
                    textAreaBg: 'rgba(5,0,20,0.9)'
                }
            },
            
            // 2. 极光主题
            'aurora': {
                name: '极光',
                icon: '🌠',
                description: '极光流转，梦幻色彩',
                colors: {
                    primary: '#06b6d4',
                    secondary: '#8b5cf6',
                    bg: 'linear-gradient(135deg, #0a1a2e, #1a0a3e, #0a1a2e)',
                    text: '#67e8f9',
                    accent: '#a78bfa',
                    cardBg: 'rgba(5,15,30,0.85)',
                    border: 'rgba(6,182,212,0.5)',
                    glow: 'rgba(6,182,212,0.3)',
                    textAreaBg: 'rgba(0,10,20,0.9)'
                }
            },
            
            // 3. 糖果主题
            'candy': {
                name: '糖果',
                icon: '🍬',
                description: '缤纷甜美，活泼可爱',
                colors: {
                    primary: '#ec4899',
                    secondary: '#f472b6',
                    bg: 'linear-gradient(135deg, #1a0a1a, #2e1a2e, #1a0a1a)',
                    text: '#fbcfe8',
                    accent: '#f472b6',
                    cardBg: 'rgba(30,10,30,0.8)',
                    border: 'rgba(236,72,153,0.4)',
                    glow: 'rgba(236,72,153,0.25)',
                    textAreaBg: 'rgba(20,5,20,0.85)'
                }
            },
            
            // 4. 薄荷主题
            'mint': {
                name: '薄荷',
                icon: '🌿',
                description: '清新薄荷，清爽自然',
                colors: {
                    primary: '#34d399',
                    secondary: '#6ee7b7',
                    bg: 'linear-gradient(135deg, #0a1a12, #0a2e1a, #0a1a12)',
                    text: '#a7f3d0',
                    accent: '#34d399',
                    cardBg: 'rgba(5,20,10,0.8)',
                    border: 'rgba(52,211,153,0.4)',
                    glow: 'rgba(52,211,153,0.2)',
                    textAreaBg: 'rgba(0,15,5,0.85)'
                }
            },
            
            // 5. 薰衣草主题
            'lavender': {
                name: '薰衣草',
                icon: '💜',
                description: '紫色浪漫，温柔优雅',
                colors: {
                    primary: '#a855f7',
                    secondary: '#c084fc',
                    bg: 'linear-gradient(135deg, #0a051a, #1a0a2e, #0a051a)',
                    text: '#ddd6fe',
                    accent: '#c084fc',
                    cardBg: 'rgba(15,5,30,0.85)',
                    border: 'rgba(168,85,247,0.4)',
                    glow: 'rgba(168,85,247,0.25)',
                    textAreaBg: 'rgba(10,0,20,0.9)'
                }
            },
            
            // 6. 琥珀主题
            'amber': {
                name: '琥珀',
                icon: '🟠',
                description: '琥珀温润，复古怀旧',
                colors: {
                    primary: '#f59e0b',
                    secondary: '#d97706',
                    bg: 'linear-gradient(135deg, #1a120a, #2e1a0a, #1a120a)',
                    text: '#fde68a',
                    accent: '#f59e0b',
                    cardBg: 'rgba(30,20,10,0.8)',
                    border: 'rgba(245,158,11,0.4)',
                    glow: 'rgba(245,158,11,0.25)',
                    textAreaBg: 'rgba(25,15,5,0.85)'
                }
            },
            
            // 7. 冰霜主题
            'frost': {
                name: '冰霜',
                icon: '❄️',
                description: '冰晶剔透，凛冽纯净',
                colors: {
                    primary: '#60a5fa',
                    secondary: '#93c5fd',
                    bg: 'linear-gradient(135deg, #0a1a2e, #1a2a3e, #0a1a2e)',
                    text: '#bfdbfe',
                    accent: '#60a5fa',
                    cardBg: 'rgba(10,20,40,0.85)',
                    border: 'rgba(96,165,250,0.4)',
                    glow: 'rgba(96,165,250,0.2)',
                    textAreaBg: 'rgba(5,10,30,0.9)'
                }
            },
            
            // 8. 烈焰主题
            'flame': {
                name: '烈焰',
                icon: '🔥',
                description: '熊熊烈火，炽热燃烧',
                colors: {
                    primary: '#ef4444',
                    secondary: '#f97316',
                    bg: 'linear-gradient(135deg, #1a0505, #2e0a0a, #1a0505)',
                    text: '#fca5a5',
                    accent: '#f97316',
                    cardBg: 'rgba(30,5,5,0.85)',
                    border: 'rgba(239,68,68,0.4)',
                    glow: 'rgba(239,68,68,0.25)',
                    textAreaBg: 'rgba(25,0,0,0.9)'
                }
            },
            
            // 9. 翡翠主题
            'jade': {
                name: '翡翠',
                icon: '💚',
                description: '翠绿欲滴，典雅华贵',
                colors: {
                    primary: '#059669',
                    secondary: '#10b981',
                    bg: 'linear-gradient(135deg, #0a1a0a, #0a2e1a, #0a1a0a)',
                    text: '#a7f3d0',
                    accent: '#059669',
                    cardBg: 'rgba(5,20,10,0.85)',
                    border: 'rgba(5,150,105,0.4)',
                    glow: 'rgba(5,150,105,0.25)',
                    textAreaBg: 'rgba(0,15,5,0.9)'
                }
            },
            
            // 10. 玫瑰主题
            'rose': {
                name: '玫瑰',
                icon: '🌹',
                description: '玫瑰红艳，浪漫深情',
                colors: {
                    primary: '#e11d48',
                    secondary: '#fb7185',
                    bg: 'linear-gradient(135deg, #1a050a, #2e0a1a, #1a050a)',
                    text: '#fda4af',
                    accent: '#fb7185',
                    cardBg: 'rgba(30,5,10,0.85)',
                    border: 'rgba(225,29,72,0.4)',
                    glow: 'rgba(225,29,72,0.25)',
                    textAreaBg: 'rgba(25,0,5,0.9)'
                }
            },
            
            // 11. 紫罗兰主题
            'violet': {
                name: '紫罗兰',
                icon: '🌸',
                description: '紫花烂漫，清新脱俗',
                colors: {
                    primary: '#8b5cf6',
                    secondary: '#a78bfa',
                    bg: 'linear-gradient(135deg, #0a051a, #1a0a2e, #0a051a)',
                    text: '#c4b5fd',
                    accent: '#8b5cf6',
                    cardBg: 'rgba(15,5,30,0.85)',
                    border: 'rgba(139,92,246,0.4)',
                    glow: 'rgba(139,92,246,0.25)',
                    textAreaBg: 'rgba(10,0,20,0.9)'
                }
            },
            
            // 12. 珊瑚主题
            'coral': {
                name: '珊瑚',
                icon: '🪸',
                description: '珊瑚粉色，温暖明亮',
                colors: {
                    primary: '#fb7185',
                    secondary: '#fda4af',
                    bg: 'linear-gradient(135deg, #1a0a0a, #2e1a1a, #1a0a0a)',
                    text: '#fecdd3',
                    accent: '#fb7185',
                    cardBg: 'rgba(30,10,10,0.8)',
                    border: 'rgba(251,113,133,0.4)',
                    glow: 'rgba(251,113,133,0.2)',
                    textAreaBg: 'rgba(25,5,5,0.85)'
                }
            },
            
            // 13. 石墨主题
            'graphite': {
                name: '石墨',
                icon: '⚫',
                description: '低调深邃，沉稳大气',
                colors: {
                    primary: '#6b7280',
                    secondary: '#9ca3af',
                    bg: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #0a0a0a)',
                    text: '#d1d5db',
                    accent: '#9ca3af',
                    cardBg: 'rgba(10,10,10,0.9)',
                    border: 'rgba(107,114,128,0.4)',
                    glow: 'rgba(107,114,128,0.2)',
                    textAreaBg: 'rgba(5,5,5,0.95)'
                }
            },
            
            // 14. 海洋之心主题
            'oceanheart': {
                name: '海洋之心',
                icon: '💎',
                description: '深邃蓝宝石，永恒经典',
                colors: {
                    primary: '#0ea5e9',
                    secondary: '#38bdf8',
                    bg: 'linear-gradient(135deg, #0a0a2e, #0a1a4a, #0a0a2e)',
                    text: '#bae6fd',
                    accent: '#38bdf8',
                    cardBg: 'rgba(5,10,40,0.85)',
                    border: 'rgba(14,165,233,0.4)',
                    glow: 'rgba(14,165,233,0.25)',
                    textAreaBg: 'rgba(0,5,30,0.9)'
                }
            },
            
            // 15. 黄昏主题
            'twilight': {
                name: '黄昏',
                icon: '🌆',
                description: '暮色苍茫，温暖归途',
                colors: {
                    primary: '#f97316',
                    secondary: '#fb923c',
                    bg: 'linear-gradient(135deg, #1a0a0a, #2e1a0a, #1a0a0a)',
                    text: '#fed7aa',
                    accent: '#fb923c',
                    cardBg: 'rgba(30,15,5,0.85)',
                    border: 'rgba(249,115,22,0.4)',
                    glow: 'rgba(249,115,22,0.2)',
                    textAreaBg: 'rgba(25,10,0,0.9)'
                }
            },
            
            // 16. 翡翠梦境主题
            'emerald': {
                name: '翡翠梦境',
                icon: '🍀',
                description: '翡翠绿意，生机盎然',
                colors: {
                    primary: '#10b981',
                    secondary: '#34d399',
                    bg: 'linear-gradient(135deg, #0a1a0a, #0a2e0a, #0a1a0a)',
                    text: '#a7f3d0',
                    accent: '#34d399',
                    cardBg: 'rgba(5,25,5,0.85)',
                    border: 'rgba(16,185,129,0.4)',
                    glow: 'rgba(16,185,129,0.25)',
                    textAreaBg: 'rgba(0,15,0,0.9)'
                }
            },
            
            // 17. 月光主题
            'moonlight': {
                name: '月光',
                icon: '🌕',
                description: '银色月光，宁静柔和',
                colors: {
                    primary: '#94a3b8',
                    secondary: '#cbd5e1',
                    bg: 'linear-gradient(135deg, #0a0a1a, #1a1a2e, #0a0a1a)',
                    text: '#e2e8f0',
                    accent: '#cbd5e1',
                    cardBg: 'rgba(10,10,30,0.85)',
                    border: 'rgba(148,163,184,0.4)',
                    glow: 'rgba(148,163,184,0.2)',
                    textAreaBg: 'rgba(5,5,20,0.9)'
                }
            },
            
            // 18. 樱花雨主题
            'sakura': {
                name: '樱花雨',
                icon: '🌸',
                description: '樱花纷飞，浪漫唯美',
                colors: {
                    primary: '#f472b6',
                    secondary: '#f9a8d4',
                    bg: 'linear-gradient(135deg, #1a0a1a, #2e1a2e, #1a0a1a)',
                    text: '#fbcfe8',
                    accent: '#f472b6',
                    cardBg: 'rgba(30,10,30,0.8)',
                    border: 'rgba(244,114,182,0.4)',
                    glow: 'rgba(244,114,182,0.25)',
                    textAreaBg: 'rgba(25,5,20,0.85)'
                }
            },
            
            // 19. 极夜主题
            'polar': {
                name: '极夜',
                icon: '🌌',
                description: '极地暗夜，神秘深邃',
                colors: {
                    primary: '#4f46e5',
                    secondary: '#6366f1',
                    bg: 'linear-gradient(135deg, #05050a, #0a0a1a, #05050a)',
                    text: '#c7d2fe',
                    accent: '#6366f1',
                    cardBg: 'rgba(5,5,15,0.9)',
                    border: 'rgba(79,70,229,0.4)',
                    glow: 'rgba(79,70,229,0.2)',
                    textAreaBg: 'rgba(0,0,10,0.95)'
                }
            },
            
            // 20. 蜜糖主题
            'honey': {
                name: '蜜糖',
                icon: '🍯',
                description: '甜蜜温暖，软萌可爱',
                colors: {
                    primary: '#fbbf24',
                    secondary: '#fcd34d',
                    bg: 'linear-gradient(135deg, #1a120a, #2e1a0a, #1a120a)',
                    text: '#fde68a',
                    accent: '#fbbf24',
                    cardBg: 'rgba(30,20,10,0.8)',
                    border: 'rgba(251,191,36,0.4)',
                    glow: 'rgba(251,191,36,0.25)',
                    textAreaBg: 'rgba(25,15,5,0.85)'
                }
            },
            
            // 21. 银河主题
            'galaxy': {
                name: '银河',
                icon: '🌌',
                description: '浩瀚星河，璀璨壮丽',
                colors: {
                    primary: '#7c3aed',
                    secondary: '#6d28d9',
                    bg: 'linear-gradient(135deg, #0a0a2e, #1a0a3e, #2a0a4e, #0a0a2e)',
                    text: '#c4b5fd',
                    accent: '#8b5cf6',
                    cardBg: 'rgba(10,5,30,0.85)',
                    border: 'rgba(124,58,237,0.5)',
                    glow: 'rgba(124,58,237,0.3)',
                    textAreaBg: 'rgba(5,0,20,0.9)'
                }
            },
            
            // 22. 棉花糖主题
            'cottoncandy': {
                name: '棉花糖',
                icon: '🍭',
                description: '粉色梦幻，柔和甜软',
                colors: {
                    primary: '#f472b6',
                    secondary: '#fb7185',
                    bg: 'linear-gradient(135deg, #1a0a1a, #2e1a2e, #1a0a1a)',
                    text: '#fbcfe8',
                    accent: '#f472b6',
                    cardBg: 'rgba(30,10,30,0.8)',
                    border: 'rgba(244,114,182,0.4)',
                    glow: 'rgba(244,114,182,0.2)',
                    textAreaBg: 'rgba(25,5,20,0.85)'
                }
            },
            
            // 23. 翡翠森林主题（比森林更深沉）
            'deepforest': {
                name: '翡翠森林',
                icon: '🌳',
                description: '密林深处，幽静神秘',
                colors: {
                    primary: '#065f46',
                    secondary: '#047857',
                    bg: 'linear-gradient(135deg, #051a0a, #0a2e1a, #051a0a)',
                    text: '#6ee7b7',
                    accent: '#10b981',
                    cardBg: 'rgba(5,25,10,0.85)',
                    border: 'rgba(6,95,70,0.4)',
                    glow: 'rgba(6,95,70,0.2)',
                    textAreaBg: 'rgba(0,15,5,0.9)'
                }
            },
            
            // 24. 夕阳主题
            'sunsetgold': {
                name: '夕阳',
                icon: '🌇',
                description: '金色夕阳，温暖治愈',
                colors: {
                    primary: '#f59e0b',
                    secondary: '#f97316',
                    bg: 'linear-gradient(135deg, #1a0a0a, #2e1a0a, #1a0a0a)',
                    text: '#fde68a',
                    accent: '#f59e0b',
                    cardBg: 'rgba(30,15,5,0.85)',
                    border: 'rgba(245,158,11,0.4)',
                    glow: 'rgba(245,158,11,0.25)',
                    textAreaBg: 'rgba(25,10,0,0.9)'
                }
            },
            
            // 25. 深海主题
            'deepsea': {
                name: '深海',
                icon: '🌊',
                description: '深海幽蓝，神秘静谧',
                colors: {
                    primary: '#1e40af',
                    secondary: '#2563eb',
                    bg: 'linear-gradient(135deg, #0a0a2e, #0a1a4a, #0a0a2e)',
                    text: '#93c5fd',
                    accent: '#3b82f6',
                    cardBg: 'rgba(5,10,40,0.85)',
                    border: 'rgba(30,64,175,0.4)',
                    glow: 'rgba(30,64,175,0.2)',
                    textAreaBg: 'rgba(0,5,30,0.9)'
                }
            }
        };
        
        this.currentTheme = 'default';
        this.loadSavedTheme();
    }
    
    // 加载保存的主题
    loadSavedTheme() {
        const saved = localStorage.getItem('cinema_theme');
        if (saved && this.themes[saved]) {
            this.currentTheme = saved;
        }
    }
    
    // 保存主题
    saveTheme() {
        localStorage.setItem('cinema_theme', this.currentTheme);
    }
    
    // 获取当前主题配置
    getCurrentTheme() {
        return this.themes[this.currentTheme] || this.themes['default'];
    }
    
    // 应用主题到影院UI
    // 完整的 applyTheme 方法
    applyTheme(themeName) {
        if (!this.themes[themeName]) return false;
        
        this.currentTheme = themeName;
        this.saveTheme();
        
        const theme = this.themes[themeName];
        const colors = theme.colors;
        
        // ========== 1. 主容器 ==========
        const overlay = document.getElementById('cinema-overlay');
        if (overlay) {
            overlay.style.background = colors.bg;
        }
        
        // ========== 2. 艺术区域 ==========
        const artArea = document.getElementById('cinema-art-area');
        if (artArea) {
            artArea.style.background = colors.bg;
        }
        
        // ========== 3. 文本区域（重要！） ==========
        const textArea = document.getElementById('cinema-text-area');
        if (textArea) {
            textArea.style.background = `linear-gradient(135deg, ${colors.textAreaBg || colors.cardBg}, rgba(0,0,0,0.75))`;
            textArea.style.borderTop = `2px solid ${colors.primary}`;
            textArea.style.boxShadow = `0 -5px 30px ${colors.glow}`;
        }
        
        // ========== 4. 说话人 ==========
        const speaker = document.getElementById('cinema-speaker');
        if (speaker) {
            speaker.style.color = colors.accent;
            speaker.style.textShadow = `0 0 20px ${colors.glow}`;
        }
        
        // ========== 5. 内容文字（重要！） ==========
        const content = document.getElementById('cinema-content');
        if (content) {
            content.style.color = colors.text;
            // 滚动条样式
            content.style.scrollbarColor = `${colors.primary} rgba(255,255,255,0.08)`;
        }
        
        // ========== 6. 进度文字 ==========
        const progress = document.getElementById('cinema-progress');
        if (progress) {
            progress.style.color = colors.text;
            progress.style.opacity = '0.6';
        }
        
        // ========== 7. 分段进度 ==========
        const segmentProgress = document.getElementById('cinema-segment-progress');
        if (segmentProgress) {
            segmentProgress.style.color = colors.primary;
        }
        
        // ========== 8. 场景文字 ==========
        const scene = document.getElementById('cinema-scene');
        if (scene) {
            scene.style.color = colors.text;
            scene.style.opacity = '0.7';
        }
        
        // ========== 9. 音乐文字 ==========
        const music = document.getElementById('cinema-music');
        if (music) {
            music.style.color = colors.text;
            music.style.opacity = '0.7';
        }
        
        // ========== 10. 控制按钮 ==========
        document.querySelectorAll('.cinema-control-btn').forEach(btn => {
            btn.style.background = `${colors.primary}33`;
            btn.style.border = `1px solid ${colors.primary}`;
            btn.style.color = colors.primary;
            btn.style.transition = 'all 0.3s ease';
        });
        
        // ========== 11. 侧边栏 ==========
        const sidebar = document.querySelector('#cinema-overlay > div > div:first-child');
        if (sidebar) {
            sidebar.style.background = `rgba(0,0,0,0.6)`;
            sidebar.style.borderRight = `1px solid ${colors.border}`;
        }
        
        // ========== 12. 状态栏面板容器 ==========
        const syncContainer = document.getElementById('cinema-sync-panel-container');
        if (syncContainer) {
            syncContainer.style.background = `linear-gradient(145deg, ${colors.cardBg}, rgba(0,0,0,0.7))`;
            syncContainer.style.borderLeft = `2px solid ${colors.border}`;
        }
        
        // ========== 13. 标签页按钮 ==========
        document.querySelectorAll('.sync-tab-btn').forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.style.color = colors.text;
            } else {
                btn.style.background = `${colors.primary}66`;
                btn.style.color = colors.accent;
            }
        });
        
        // ========== 14. 状态栏标题 ==========
        document.querySelectorAll('.sync-section-title').forEach(title => {
            title.style.color = colors.accent;
            title.style.borderBottom = `1px solid ${colors.border}`;
        });
        
        // ========== 15. 滚动条样式（通过 CSS） ==========
        const styleId = 'cinema-theme-scrollbar';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
            #cinema-content::-webkit-scrollbar {
                width: 6px;
            }
            #cinema-content::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.06);
                border-radius: 10px;
            }
            #cinema-content::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
            }
            #cinema-content::-webkit-scrollbar-thumb:hover {
                background: ${colors.secondary || colors.primary};
            }
            #cinema-text-area {
                transition: background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
            }
            #cinema-speaker, #cinema-content, #cinema-progress, 
            #cinema-segment-progress, #cinema-scene, #cinema-music {
                transition: color 0.5s ease, text-shadow 0.5s ease;
            }
        `;
        
        // ========== 16. 主题按钮高亮 ==========
        document.querySelectorAll('.cinema-theme-btn').forEach(btn => {
            if (btn.dataset.theme === this.currentTheme) {
                btn.style.background = `${colors.primary}44`;
                btn.style.borderColor = colors.primary;
                btn.style.color = colors.accent;
            } else {
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.borderColor = 'rgba(255,255,255,0.2)';
                btn.style.color = colors.text;
            }
        });

        // ========== 消息列表 ==========
        document.querySelectorAll('.cinema-message-item').forEach(item => {
            if (item.dataset.index && parseInt(item.dataset.index) === currentMessageIndex) {
                // 当前选中的消息
                item.style.background = `${colors.primary}44`;  // 使用主题色半透明
                item.style.borderLeft = `3px solid ${colors.primary}`;
            } else {
                item.style.background = 'rgba(255,255,255,0.05)';
                item.style.borderLeft = 'none';
            }
        });

        // 消息列表的文字颜色
        document.querySelectorAll('.cinema-message-item .message-name').forEach(el => {
            el.style.color = colors.accent || colors.primary;
        });

        document.querySelectorAll('.cinema-message-item .message-preview').forEach(el => {
            el.style.color = colors.text;
        });
        
        // ========== 更新进度条颜色 ==========
        const progressBars = document.querySelectorAll('.sync-attribute-bar-fill');
        if (progressBars.length > 0) {
            // 获取当前主题的主色
            const primaryColor = colors.primary;
            const accentColor = colors.accent || '#ffc107';
            
            progressBars.forEach(bar => {
                // 获取当前进度条的宽度
                const width = bar.style.width;
                if (width) {
                    const percent = parseFloat(width);
                    let color = primaryColor;
                    if (percent > 70) color = '#4ecdc4';
                    else if (percent > 40) color = accentColor;
                    else color = '#ff6b6b';
                    bar.style.background = color;
                }
            });
        }

        // ========== 更新属性标签颜色 ==========
        document.querySelectorAll('.sync-attribute-label span:last-child').forEach(el => {
            // 保持原有颜色逻辑，但使用主题色作为基础
            const text = el.textContent;
            if (text) {
                const numMatch = text.match(/(\d+)/);
                if (numMatch) {
                    const val = parseInt(numMatch[1]);
                    let color = colors.primary;
                    if (val > 70) color = '#4ecdc4';
                    else if (val > 40) color = colors.accent || '#ffc107';
                    else color = '#ff6b6b';
                    el.style.color = color;
                }
            }
        });

        // ========== 更新角色头像边框（强制刷新） ==========
        const avatar = document.getElementById('sync-character-avatar');
        if (avatar) {
            avatar.style.border = `2px solid ${colors.primary}`;
            avatar.style.boxShadow = `0 0 15px ${colors.glow || 'rgba(255,105,180,0.3)'}`;
        }

        // 同时更新头像内的图片边框（如果有）
        const avatarImg = document.getElementById('sync-character-avatar-img');
        if (avatarImg) {
            // 不需要额外边框，保持干净
        }

        // 更新头像的父容器边框（如果有）
        // const avatarContainer = avatar?.parentElement;
        // if (avatarContainer) {
        //     avatarContainer.style.border = `2px solid ${colors.primary}`;
        // }
        
        // ========== 更新角色卡片边框 ==========
        document.querySelectorAll('.sync-character-avatar, .cinema-relationship-avatar, .sync-character-row').forEach(el => {
            if (el.id !== 'sync-character-avatar') {  // 避免重复更新
                el.style.borderColor = colors.primary;
            }
        });

        // ========== 新增：更新滚动条 ==========
        this.updateAllScrollbars();
        // 如果选项面板存在，更新其主题
        if (optionPanelManager && optionPanelManager.panel) {
            optionPanelManager.updateTheme();
        }
        // 显示提示
        showCinemaToast(`🎨 切换到: ${theme.name}`, 'info');
        
        return true;
    }
    
    // 获取所有主题列表
    getAllThemes() {
        return Object.entries(this.themes).map(([key, theme]) => ({
            id: key,
            ...theme
        }));
    }
    
    // 获取主题预览样式
    getThemePreviewStyle(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return '';
        const c = theme.colors;
        return `background: ${c.bg}; border: 2px solid ${c.primary}; color: ${c.text};`;
    }

    // 更新所有滚动条样式
    updateAllScrollbars() {
        const theme = this.getCurrentTheme();
        const colors = theme.colors;
        
        // 更新所有滚动条的颜色
        const scrollContainers = [
            '#cinema-content',
            '#cinema-message-list',
            '#cinema-sync-panel-container',
            '#sync-attributes',
            '#sync-items',
            '#sync-characters',
            '#cinema-option-panel .cinema-option-panel-content',
            '#sync-other-sections',
            '#cinema-text-area .cinema-status-container'
        ];
        
        // 创建或更新全局滚动条样式
        let styleEl = document.getElementById('cinema-scrollbar-theme');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'cinema-scrollbar-theme';
            document.head.appendChild(styleEl);
        }
        
        // 生成滚动条样式
        const scrollbarCSS = `
            /* ========== 全局滚动条（跟随主题） ========== */
            
            /* 主内容区滚动条 */
            #cinema-content::-webkit-scrollbar {
                width: 6px;
            }
            #cinema-content::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.06);
                border-radius: 10px;
            }
            #cinema-content::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
                transition: background 0.3s;
            }
            #cinema-content::-webkit-scrollbar-thumb:hover {
                background: ${colors.secondary || colors.primary};
            }
            
            /* 消息列表滚动条 */
            #cinema-message-list::-webkit-scrollbar {
                width: 5px;
            }
            #cinema-message-list::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #cinema-message-list::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
                transition: background 0.3s;
            }
            #cinema-message-list::-webkit-scrollbar-thumb:hover {
                background: ${colors.secondary || colors.primary};
            }
            
            /* 右侧状态栏滚动条 */
            #cinema-sync-panel-container::-webkit-scrollbar {
                width: 4px;
            }
            #cinema-sync-panel-container::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #cinema-sync-panel-container::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
                transition: background 0.3s;
            }
            #cinema-sync-panel-container::-webkit-scrollbar-thumb:hover {
                background: ${colors.secondary || colors.primary};
            }
            
            /* 属性区域滚动条 */
            #sync-attributes::-webkit-scrollbar {
                width: 3px;
            }
            #sync-attributes::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #sync-attributes::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
            }
            
            /* 物品栏滚动条 */
            #sync-items div[style*="max-height"]::-webkit-scrollbar,
            #sync-items::-webkit-scrollbar {
                width: 5px;
            }
            #sync-items div[style*="max-height"]::-webkit-scrollbar-track,
            #sync-items::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #sync-items div[style*="max-height"]::-webkit-scrollbar-thumb,
            #sync-items::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
                transition: background 0.3s;
            }
            #sync-items div[style*="max-height"]::-webkit-scrollbar-thumb:hover,
            #sync-items::-webkit-scrollbar-thumb:hover {
                background: ${colors.secondary || colors.primary};
            }
            
            /* 人际关系滚动条 */
            #sync-characters::-webkit-scrollbar {
                width: 4px;
            }
            #sync-characters::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #sync-characters::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
            }
            
            /* 其他栏目滚动条 */
            #sync-other-sections div[style*="overflow-y"]::-webkit-scrollbar {
                width: 4px;
            }
            #sync-other-sections div[style*="overflow-y"]::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #sync-other-sections div[style*="overflow-y"]::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
            }
            
            /* 选项面板滚动条 */
            #cinema-option-panel .cinema-option-panel-content::-webkit-scrollbar,
            #cinema-option-panel::-webkit-scrollbar {
                width: 5px;
            }
            #cinema-option-panel .cinema-option-panel-content::-webkit-scrollbar-track,
            #cinema-option-panel::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #cinema-option-panel .cinema-option-panel-content::-webkit-scrollbar-thumb,
            #cinema-option-panel::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
            }
            
            /* 状态栏容器滚动条 */
            .cinema-status-container::-webkit-scrollbar {
                width: 4px;
            }
            .cinema-status-container::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            .cinema-status-container::-webkit-scrollbar-thumb {
                background: ${colors.primary};
                border-radius: 10px;
            }
            
            /* Firefox 滚动条支持 */
            #cinema-content,
            #cinema-message-list,
            #cinema-sync-panel-container,
            #sync-attributes,
            #sync-items,
            #sync-characters,
            #sync-other-sections,
            #cinema-option-panel,
            .cinema-status-container {
                scrollbar-color: ${colors.primary} rgba(255,255,255,0.06);
                scrollbar-width: thin;
            }
        `;
        
        styleEl.textContent = scrollbarCSS;
        
        console.log('[主题] 滚动条样式已更新');
    }
}

// 创建全局主题管理器实例
let themeManager = null;

// 初始化主题管理器
function initThemeManager() {
    if (!themeManager) {
        themeManager = new ThemeManager();
        console.log('[主题] 主题管理器已初始化');
    }
    return themeManager;
}

// ==================== 音频管理器 ====================

class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.currentMusicName = null;
        this.isMuted = false;
        this.volume = 0.5;
    }
    
    playMusic(musicName, loop = true) {
        if (this.currentMusicName === musicName && this.currentAudio && !this.currentAudio.paused) {
            return;
        }
        
        this.stopMusic();
        
        const musicPath = `${BASE_PATH}music/${musicName}.mp3`;
        const audio = new Audio(musicPath);
        audio.loop = loop;
        audio.volume = this.volume;
        audio.oncanplay = () => {
            audio.play().catch(e => console.warn('[CinemaMode] 音乐播放失败:', e));
        };
        audio.onerror = () => {
            console.log('[CinemaMode] 音乐文件不存在:', musicPath);
        };
        
        this.currentAudio = audio;
        this.currentMusicName = musicName;
        console.log('[CinemaMode] 播放音乐:', musicName);
    }
    
    stopMusic() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.currentMusicName = null;
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.currentAudio) {
            this.currentAudio.volume = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }
}


// ==================== 角色立绘管理器（心情版） ====================

class CharacterPortraitManager {
    constructor() {
        this.characterMap = new Map();      // 角色名 -> { path, gender, moodPaths }
        this.characterVisible = new Map();   // 角色名 -> 是否可见
        this.characterCurrentMood = new Map(); // 角色名 -> 当前心情
        this.usedImages = {
            female: new Set(),
            male: new Set(),
            unknown: new Set()
        };
        this.portraitLibrary = {
            female: [],
            male: [],
            unknown: []
        };
        this.isLoading = false;
        this.isScanning = false;
        this.customPortraits = new Map();     // 缓存自定义立绘路径
        this.characterGender = new Map();
    }
    
    // 获取角色当前立绘（根据心情）
    getPortrait(characterName, mood = null) {
        const data = this.characterMap.get(characterName);
        if (!data) return null;
        
        // 如果有心情文件夹立绘，优先使用
        if (data.moodPaths && data.moodPaths.size > 0) {
            const targetMood = mood || this.characterCurrentMood.get(characterName) || '日常';
            // 尝试获取对应心情的立绘
            if (data.moodPaths.has(targetMood)) {
                console.log(`[立绘] ${characterName} 使用心情立绘: ${targetMood}`);
                return data.moodPaths.get(targetMood);
            }
            // 降级：尝试获取"日常"心情
            if (data.moodPaths.has('日常')) {
                console.log(`[立绘] ${characterName} 降级使用日常立绘`);
                return data.moodPaths.get('日常');
            }
            // 再降级：使用第一张心情立绘
            const firstMood = data.moodPaths.values().next().value;
            if (firstMood) {
                console.log(`[立绘] ${characterName} 降级使用第一张心情立绘`);
                return firstMood;
            }
        }
        
        // 返回默认立绘
        return data.path;
    }
    
    // 获取角色性别
    getCharacterGender(characterName) {
        return this.characterGender.get(characterName) || '未知';
    }
    
    // 获取角色当前心情
    getCharacterMood(characterName) {
        return this.characterCurrentMood.get(characterName) || '日常';
    }
    
    // 设置角色心情并更新立绘
    setCharacterMood(characterName, mood, silent = false) {
        if (!this.characterMap.has(characterName)) {
            console.warn(`[立绘] 角色 ${characterName} 不存在，无法设置心情`);
            return false;
        }
        
        const oldMood = this.characterCurrentMood.get(characterName) || '日常';
        if (oldMood === mood) return false;
        
        this.characterCurrentMood.set(characterName, mood);
        
        if (!silent) {
            console.log(`[立绘] ${characterName} 心情变化: ${oldMood} → ${mood}`);
            
            // 触发立绘更新事件
            const event = new CustomEvent('characterMoodChange', {
                detail: { name: characterName, oldMood: oldMood, newMood: mood }
            });
            document.dispatchEvent(event);
        }
        
        return true;
    }
    
    // 检查角色是否有心情文件夹立绘
    async checkMoodFolderPortrait(characterName, gender = '未知') {
        const moodPaths = new Map();
        const formats = ['png', 'jpg', 'jpeg', 'webp'];
        
        // 动态从 MOOD_ICON_MAP 获取心情名称
        const moods = Object.keys(window.MOOD_ICON_MAP || {});
        
        // 根据性别确定文件夹
        let genderFolder = '';
        if (gender === '女') genderFolder = '女';
        else if (gender === '男') genderFolder = '男';
        else genderFolder = '通用';
        
        // 构建基础路径
        let basePath = `${BASE_PATH}images/portrait/library/${genderFolder}/${characterName}`;
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }
        
        let checkedCount = 0;
        let foundCount = 0;
        
        for (const mood of moods) {
            for (const format of formats) {
                const url = `${basePath}${mood}.${format}`;
                checkedCount++;
                const exists = await this.imageExists(url);
                
                if (exists) {
                    moodPaths.set(mood, url);
                    foundCount++;
                    break; // 找到一种格式就跳出格式循环
                }
            }
        }

        
        if (foundCount > 0) {
            return moodPaths;
        }
        
        console.log(`[立绘] ${characterName} 没有心情文件夹立绘，将使用默认立绘`);
        return null;
    }
    
    
    // 检查同名立绘（单张）
    async checkCustomPortrait(characterName) {
        if (this.customPortraits.has(characterName)) {
            return this.customPortraits.get(characterName);
        }
        
        const mainPortraitPath = `${BASE_PATH}images/portrait/`;
        const formats = ['png', 'jpg', 'jpeg', 'webp'];
        
        for (const format of formats) {
            const url = `${mainPortraitPath}${characterName}.${format}`;
            const exists = await this.imageExists(url);
            if (exists) {
                console.log(`[立绘] 找到同名立绘: ${characterName}.${format}`);
                this.customPortraits.set(characterName, url);
                return url;
            }
        }
        
        // 检查性别文件夹中的同名立绘
        const genderFolders = ['女', '男', '通用'];
        for (const folder of genderFolders) {
            for (const format of formats) {
                const url = `${mainPortraitPath}library/${folder}/${characterName}.${format}`;
                const exists = await this.imageExists(url);
                if (exists) {
                    console.log(`[立绘] 在${folder}文件夹找到同名立绘: ${characterName}.${format}`);
                    this.customPortraits.set(characterName, url);
                    return url;
                }
            }
        }
        
        this.customPortraits.set(characterName, null);
        return null;
    }
    
    // 分配立绘（优先检查心情文件夹，再检查同名立绘，最后随机分配）
    async assignRandomPortrait(characterName, gender = '未知') {
        if (this.characterMap.has(characterName)) {
            return this.characterMap.get(characterName).path;
        }
        
        // 1. 优先检查心情文件夹立绘
        // 先快速检查是否有心情文件夹
    const genderFolder = gender === '女' ? '女' : (gender === '男' ? '男' : '通用');
    const quickCheckUrl = `${BASE_PATH}images/portrait/library/${genderFolder}/${characterName}/日常.png`;
    const hasMoodFolder = await this.imageExists(quickCheckUrl);
    
    if (hasMoodFolder) {
        const moodPaths = await this.checkMoodFolderPortrait(characterName, gender);
        if (moodPaths && moodPaths.size > 0) {
            // 获取默认心情立绘（优先"日常"，否则取第一个）
            const defaultMood = moodPaths.has('日常') ? '日常' : Array.from(moodPaths.keys())[0];
            const defaultPath = moodPaths.get(defaultMood);
            
            this.characterMap.set(characterName, { 
                path: defaultPath, 
                gender, 
                moodPaths: moodPaths 
            });
            this.characterGender.set(characterName, gender);
            this.characterCurrentMood.set(characterName, defaultMood);
            
            console.log(`[立绘] 为角色 ${characterName}(${gender}) 使用心情文件夹立绘，默认心情: ${defaultMood}`);
            return defaultPath;
        }
    }
        
        // 2. 检查同名立绘
        const customPortrait = await this.checkCustomPortrait(characterName);
        if (customPortrait) {
            this.characterMap.set(characterName, { path: customPortrait, gender, moodPaths: null });
            this.characterGender.set(characterName, gender);
            this.characterCurrentMood.set(characterName, '日常');
            console.log(`[立绘] 为角色 ${characterName}(${gender}) 使用同名立绘`);
            return customPortrait;
        }
        
        // 3. 随机分配立绘
        await this.initPortraitLibrary();
        
        let library, usedSet, folderName;
        if (gender === '女') {
            library = this.portraitLibrary.female;
            usedSet = this.usedImages.female;
            folderName = '女';
        } else if (gender === '男') {
            library = this.portraitLibrary.male;
            usedSet = this.usedImages.male;
            folderName = '男';
        } else {
            if (this.portraitLibrary.unknown.length > 0) {
                library = this.portraitLibrary.unknown;
                usedSet = this.usedImages.unknown;
                folderName = '通用';
            } else {
                library = [...this.portraitLibrary.female, ...this.portraitLibrary.male, ...this.portraitLibrary.unknown];
                usedSet = new Set([...this.usedImages.female, ...this.usedImages.male, ...this.usedImages.unknown]);
                folderName = '混合';
            }
        }
        
        const availableImages = library.filter(img => !usedSet.has(img));
        
        if (availableImages.length === 0) {
            console.warn(`[立绘] 没有可用的${gender}性立绘图片`);
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const selectedImage = availableImages[randomIndex];
        
        usedSet.add(selectedImage);
        
        const imagePath = `${BASE_PATH}images/portrait/library/${folderName}/${selectedImage}`;
        this.characterMap.set(characterName, { path: imagePath, gender, moodPaths: null });
        this.characterGender.set(characterName, gender);
        this.characterCurrentMood.set(characterName, '日常');
        
        console.log(`[立绘] 为角色 ${characterName}(${gender}) 随机分配立绘: ${folderName}/${selectedImage}`);
        
        // 验证图片是否存在
        const exists = await this.imageExists(imagePath);
        if (!exists) {
            console.warn(`[立绘] 立绘图片不存在: ${imagePath}`);
            this.characterMap.delete(characterName);
            usedSet.delete(selectedImage);
            this.characterGender.delete(characterName);
            this.characterCurrentMood.delete(characterName);
            return this.assignRandomPortrait(characterName, gender);
        }
        
        return imagePath;
    }
    
    // 批量注册角色
    async registerCharacters(characters, forceUpdate = false) {
        if (this.isScanning) {
            console.log('[立绘] 角色扫描进行中，跳过本次注册');
            return [];
        }
        
        this.isScanning = true;
        
        try {
            const charactersToRegister = [];
            
            for (const character of characters) {
                const name = typeof character === 'string' ? character : character.name;
                const gender = typeof character === 'object' && character.gender ? character.gender : '未知';
                const mood = typeof character === 'object' && character.mood ? character.mood : '日常';
                let visible = true;
                
                if (typeof character === 'object') {
                    if (character.visible === false || character.visible === 'false') {
                        visible = false;
                    } else if (character.visible === true || character.visible === 'true') {
                        visible = true;
                    }
                }
                
                console.log(`[立绘] 处理角色: ${name}, gender=${gender}, mood=${mood}, visible=${visible}`);
                
                if (this.characterMap.has(name) && !forceUpdate) {
                    // 角色已存在，只更新显隐状态和心情
                    const oldVisible = this.characterVisible.get(name);
                    if (oldVisible !== visible) {
                        this.characterVisible.set(name, visible);
                        console.log(`[立绘] 更新角色 ${name} 显隐: ${oldVisible !== false ? '显示' : '隐藏'} → ${visible ? '显示' : '隐藏'}`);
                    }
                    
                    // 更新心情（如果情绪变化）
                    const oldMood = this.characterCurrentMood.get(name) || '日常';
                    if (oldMood !== mood) {
                        this.setCharacterMood(name, mood, true);
                    }
                    continue;
                }
                
                if (forceUpdate && this.characterMap.has(name)) {
                    const oldData = this.characterMap.get(name);
                    if (oldData && oldData.path) {
                        const oldGender = oldData.gender;
                        const filename = oldData.path.split('/').pop();
                        if (filename && oldData.moodPaths === null) {
                            if (oldGender === '女') {
                                this.usedImages.female.delete(filename);
                            } else if (oldGender === '男') {
                                this.usedImages.male.delete(filename);
                            } else {
                                this.usedImages.unknown.delete(filename);
                            }
                        }
                    }
                    this.characterMap.delete(name);
                    this.characterGender.delete(name);
                    this.characterVisible.delete(name);
                    this.characterCurrentMood.delete(name);
                }
                
                charactersToRegister.push({ name, gender, mood, visible });
            }
            
            if (charactersToRegister.length === 0) {
                console.log('[立绘] 没有新角色需要注册');
                return [];
            }
            
            const registrationPromises = charactersToRegister.map(async ({ name, gender, mood, visible }) => {
                const portrait = await this.assignRandomPortrait(name, gender);
                if (portrait) {
                    this.characterVisible.set(name, visible);
                    this.setCharacterMood(name, mood, true);
                    console.log(`[立绘] 成功注册角色: ${name} (${gender}) ${visible ? '显示' : '隐藏'}, 心情: ${mood}`);
                    return { name, portrait, gender, visible, mood };
                }
                return null;
            });
            
            const results = await Promise.all(registrationPromises);
            const newCharacters = results.filter(result => result !== null);
            
            console.log(`[立绘] 批量注册完成，成功注册 ${newCharacters.length}/${charactersToRegister.length} 个角色`);
            
            return newCharacters;
            
        } finally {
            this.isScanning = false;
        }
    }
    
    // 获取所有角色（包括隐藏）
    getAllCharacters() {
        return Array.from(this.characterMap.entries()).map(([name, data]) => ({
            name,
            portrait: this.getPortrait(name),
            gender: data.gender,
            visible: this.characterVisible.get(name) !== false,
            mood: this.characterCurrentMood.get(name) || '日常'
        }));
    }
    
    // 获取可见角色
    getVisibleCharacters() {
        const visibleList = [];
        for (const [name, data] of this.characterMap.entries()) {
            const isVisible = this.characterVisible.get(name) !== false;
            if (isVisible) {
                visibleList.push({
                    name: name,
                    portrait: this.getPortrait(name),
                    gender: data.gender,
                    mood: this.characterCurrentMood.get(name) || '日常',
                    visible: true
                });
            }
        }
        console.log(`[立绘] getVisibleCharacters 返回 ${visibleList.length} 个角色:`, visibleList.map(c => `${c.name}(${c.mood})`).join(', '));
        return visibleList;
    }
    
    // 获取角色可见性
    isCharacterVisible(name) {
        const visible = this.characterVisible.get(name);
        const result = visible !== false;
        return result;
    }
    
    // 设置角色可见性
    setCharacterVisible(name, visible) {
        if (this.characterMap.has(name)) {
            const oldVisible = this.characterVisible.get(name);
            this.characterVisible.set(name, visible);
            console.log(`[立绘] 角色 ${name} 显隐状态: ${oldVisible !== false ? '显示' : '隐藏'} → ${visible ? '显示' : '隐藏'}`);
            return true;
        }
        console.warn(`[立绘] 角色 ${name} 不存在，无法设置显隐`);
        return false;
    }
    
    // 获取角色心情
    getCharacterMood(name) {
        return this.characterCurrentMood.get(name) || '日常';
    }
    
    // 图片存在检查
    imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;

                    resolve(false);
                }
            }, 5000);
            
            img.onload = () => {
                if (!resolved) {
                    clearTimeout(timeout);
                    resolved = true;
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    clearTimeout(timeout);
                    resolved = true;
                    resolve(false);
                }
            };
            
            img.src = url;
            
            // 【关键修复】检查图片是否已经加载完成（缓存情况）
            if (img.complete) {
                // 图片已在缓存中，直接触发 onload
                img.onload();
            }
        });
    }
    
    // 初始化图片库
    async initPortraitLibrary() {
        if (this.portraitLibrary.female.length > 0 || 
            this.portraitLibrary.male.length > 0 || 
            this.portraitLibrary.unknown.length > 0) {
            return;
        }
        
        // 直接使用动态发现，不加载 JSON
        await this.discoverImagesByFolder();
        
        const total = this.portraitLibrary.female.length + 
                      this.portraitLibrary.male.length + 
                      this.portraitLibrary.unknown.length;
        console.log(`[立绘] 图片库初始化完成: 女性=${this.portraitLibrary.female.length}, 男性=${this.portraitLibrary.male.length}, 通用=${this.portraitLibrary.unknown.length}, 总计=${total}`);
    }
    
    async discoverImagesByFolder() {
        const commonFormats = ['png', 'jpg', 'jpeg', 'webp'];
        
        for (let i = 1; i <= 91; i++) {
            for (const format of commonFormats) {
                this.portraitLibrary.female.push(`${i}.${format}`);
            }
        }

                
        for (let i = 1; i <= 12; i++) {
            for (const format of commonFormats) {
                this.portraitLibrary.male.push(`${i}.${format}`);
            }
        }
        
        for (let i = 1; i <= 2; i++) {
            for (const format of commonFormats) {
                this.portraitLibrary.unknown.push(`${i}.${format}`);
            }
        }
        
        console.log('[立绘] 使用动态图片发现模式');
    }
    
    // 重置已使用图片记录
    resetUsedImages(gender = null) {
        if (gender === '女') {
            this.usedImages.female.clear();
            console.log('[立绘] 重置女性图片使用记录');
        } else if (gender === '男') {
            this.usedImages.male.clear();
            console.log('[立绘] 重置男性图片使用记录');
        } else if (gender === '未知') {
            this.usedImages.unknown.clear();
            console.log('[立绘] 重置通用图片使用记录');
        } else {
            this.usedImages = {
                female: new Set(),
                male: new Set(),
                unknown: new Set()
            };
            console.log('[立绘] 重置所有图片使用记录');
        }
    }
    
    // 清空所有数据
    clear() {
        this.characterMap.clear();
        this.characterVisible.clear();
        this.characterCurrentMood.clear();
        this.characterGender.clear();
        this.customPortraits.clear();
        this.resetUsedImages();
        console.log('[立绘] 所有角色数据已清空');
    }
    
    // 获取统计信息
    getStatistics() {
        return {
            totalCharacters: this.characterMap.size,
            characters: this.getAllCharacters(),
            availableImages: {
                female: this.portraitLibrary.female.length - this.usedImages.female.size,
                male: this.portraitLibrary.male.length - this.usedImages.male.size,
                unknown: this.portraitLibrary.unknown.length - this.usedImages.unknown.size
            },
            usedImages: {
                female: this.usedImages.female.size,
                male: this.usedImages.male.size,
                unknown: this.usedImages.unknown.size
            }
        };
    }
    
    // 从状态栏文本提取角色信息
    extractCharactersFromStatus(text) {
        const characters = [];
        
        console.log('[调试] 解析状态栏文本:', text.substring(0, 200));
        
        // 新格式：【XX|女|显|开心|好感度:100/100】-描述
        const newFormatPattern = /[【\[][^】\]]*?([^|【\]\[，,、\n]+)\|([男女]+)\|([显隐]+)\|([^|]+)\|好感度[：:]\s*(-?\d+)\/100[】\]]\s*-?\s*([^【\n]*)/g;
        let match;
        
        while ((match = newFormatPattern.exec(text)) !== null) {
            let charName = match[1].trim();
            let gender = match[2].trim();
            let visibility = match[3].trim();
            let mood = match[4].trim();
            const affectionValue = parseInt(match[5]);
            let description = match[6]?.trim() || '';
            
            charName = charName.replace(/[|｜]/g, '').trim();
            
            if (gender === '女') gender = '女';
            else if (gender === '男') gender = '男';
            else gender = '未知';
            
            const isVisible = visibility === '显';
            
            console.log(`[调试] 解析角色: ${charName} | 性别=${gender} | 心情=${mood} | 好感度=${affectionValue} | 可见=${isVisible}`);
            
            if (charName && charName.length > 0 && charName.length < 20 && !isNaN(affectionValue)) {
                const exists = characters.some(c => c.name === charName);
                if (!exists) {
                    characters.push({
                        name: charName,
                        gender: gender,
                        mood: mood,
                        affection: affectionValue,
                        visible: isVisible,
                        description: description
                    });
                }
            }
        }
        
        // 备选格式（无心情）
        const noMoodPattern = /[【\[][^】\]]*?([^|【\]\[，,、\n]+)\|([男女]+)\|好感度[：:]\s*(\d+)\/100[】\]]\s*-?\s*([^【\n]*)/g;
        while ((match = noMoodPattern.exec(text)) !== null) {
            let charName = match[1].trim();
            let gender = match[2].trim();
            const affectionValue = parseInt(match[3]);
            let description = match[4]?.trim() || '';
            
            charName = charName.replace(/[|｜]/g, '').trim();
            
            if (gender === '女') gender = '女';
            else if (gender === '男') gender = '男';
            else gender = '未知';
            
            const exists = characters.some(c => c.name === charName);
            
            if (charName && charName.length > 0 && charName.length < 20 && !isNaN(affectionValue) && !exists) {
                characters.push({
                    name: charName,
                    gender: gender,
                    mood: '日常',
                    affection: affectionValue,
                    visible: true,
                    description: description
                });
                console.log(`[调试] 解析角色(无心情): ${charName} | 性别=${gender} | 好感度=${affectionValue}`);
            }
        }
        
        // 去重
        const uniqueCharacters = new Map();
        for (const char of characters) {
            const existing = uniqueCharacters.get(char.name);
            if (!existing || char.affection > existing.affection) {
                uniqueCharacters.set(char.name, char);
            }
        }
        
        const result = Array.from(uniqueCharacters.values());
        console.log('[调试] 最终解析角色:', result.map(c => `${c.name}(${c.gender}) 心情=${c.mood} 可见=${c.visible}`).join(', '));
        
        return result;
    }
    
    // 批量注册角色（兼容旧接口）
    filterUnregisteredCharacters(characters) {
        if (characters.length > 0 && typeof characters[0] === 'object') {
            return characters.filter(c => !this.characterMap.has(c.name));
        }
        return characters.filter(name => !this.characterMap.has(name));
    }
    
    // 等待所有图片加载
    async waitForAllImagesLoaded(characters) {
        const imagePromises = characters.map(async (char) => {
            if (char.portrait) {
                return this.waitForImageLoad(char.portrait);
            }
            return false;
        });
        
        await Promise.all(imagePromises);
        console.log('[立绘] 所有立绘图片加载完成');
    }
    
    waitForImageLoad(url) {
        return new Promise((resolve) => {
            const img = new Image();
            if (img.complete) {
                resolve(true);
            } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            }
            setTimeout(() => resolve(false), 3000);
        });
    }
    
    isCharacterRegistered(name) {
        return this.characterMap.has(name);
    }
}
// ==================== 多角色立绘渲染器（优化版） ====================

class MultiPortraitRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.portraits = [];
        this.maxPortraits = 10;
        this.lastDisplayNames = [];
    }
    
    /**
     * 从对话文本中提取实际出场的角色
     * @param {string} dialogueText - 当前对话文本
     * @param {CharacterPortraitManager} portraitManager - 角色管理器
     * @returns {Array} 按出场顺序排列的角色名数组
     */
    extractActiveCharacters(dialogueText, portraitManager) {
        if (!dialogueText || typeof dialogueText !== 'string') {
            return [];
        }
        
        const visibleCharacters = portraitManager.getVisibleCharacters();
        
        if (visibleCharacters.length === 0) {
            console.log('[调试] 没有可见角色，返回空列表');
            return [];
        }
        
        // 记录角色出现的位置和次数
        const characterOccurrences = new Map();
        
        // ========== 优先级1：从状态栏人际关系中提取 ==========
        // 提取状态栏内容
        const statusMatch = dialogueText.match(/```([\s\S]*?)```/);
        let relationshipSection = '';
        
        if (statusMatch) {
            const statusContent = statusMatch[1];
            // 查找人际关系栏目
            const relationMatch = statusContent.match(/【人际关系】([\s\S]*?)(?=\n【|$)/);
            if (relationMatch) {
                relationshipSection = relationMatch[1];
                console.log('[调试] 从状态栏人际关系中提取角色');
            }
        }
        
        // 解析人际关系中的角色
        if (relationshipSection) {
            const relationPattern = /【([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|好感度:(-?\d+)\/100】/g;
            let match;
            while ((match = relationPattern.exec(relationshipSection)) !== null) {
                const name = match[1].trim();
                // 只处理可见角色
                if (visibleCharacters.some(c => c.name === name)) {
                    if (!characterOccurrences.has(name)) {
                        console.log(`[调试] 从人际关系提取角色: ${name}`);
                        characterOccurrences.set(name, {
                            firstIndex: -1,  // 人际关系中的角色放在前面（小索引）
                            count: 1,
                            gender: match[2],
                            portrait: portraitManager.getPortrait(name),
                            visible: true,
                            source: 'relationship'
                        });
                    }
                }
            }
        }
        
        // ========== 优先级2：从对话文本中匹配 ==========
        for (const character of visibleCharacters) {
            const name = character.name;
            
            // 如果已经通过人际关系添加了，继续检测但只更新出现次数
            const existing = characterOccurrences.get(name);
            let firstIndex = existing ? existing.firstIndex : -1;
            let count = existing ? existing.count : 0;
            
            const isVisible = portraitManager.isCharacterVisible(name);
            if (!isVisible) continue;
            
            // 正则匹配角色名
            const regex = new RegExp(`(?:^|[^\\u4e00-\\u9fa5a-zA-Z])(${this.escapeRegex(name)})(?:[^\\u4e00-\\u9fa5a-zA-Z]|$)`, 'gi');
            let match;
            
            regex.lastIndex = 0;
            while ((match = regex.exec(dialogueText)) !== null) {
                count++;
                if (firstIndex === -1) {
                    firstIndex = match.index;
                }
            }
            
            // 检查引号内的名字
            const quotedRegex = new RegExp(`[""'‘’「」『』]\\s*${this.escapeRegex(name)}\\s*[""'‘’「」『』]`, 'gi');
            quotedRegex.lastIndex = 0;
            while ((match = quotedRegex.exec(dialogueText)) !== null) {
                count++;
                if (firstIndex === -1 || match.index < firstIndex) {
                    firstIndex = match.index;
                }
            }
            
            // 检查动作描述中的角色
            const actionRegex = new RegExp(`${this.escapeRegex(name)}(?:\\s*(?:点|摇|看|站|坐|走|跑|说|喊|叫|笑|哭|皱|推|拉|拿|放|捡|踢|打|拍|鼓))`, 'gi');
            actionRegex.lastIndex = 0;
            while ((match = actionRegex.exec(dialogueText)) !== null) {
                count++;
                if (firstIndex === -1 || match.index < firstIndex) {
                    firstIndex = match.index;
                }
            }
            
            if (count > 0 || existing) {
                characterOccurrences.set(name, {
                    firstIndex: firstIndex === -1 ? 999999 : firstIndex, // 人际关系中的角色优先
                    count: count,
                    gender: character.gender,
                    portrait: character.portrait,
                    visible: true,
                    source: existing ? 'both' : 'dialogue'
                });
            }
        }
        
        // 按首次出现位置排序（人际关系中的角色 firstIndex 为 -1，会排在前面）
        const sortedCharacters = Array.from(characterOccurrences.entries())
            .sort((a, b) => {
                // 人际关系中的角色优先（firstIndex 较小或为 -1）
                const aIndex = a[1].firstIndex === -1 ? 0 : a[1].firstIndex;
                const bIndex = b[1].firstIndex === -1 ? 0 : b[1].firstIndex;
                return aIndex - bIndex;
            })
            .map(([name, data]) => ({ 
                name, 
                ...data,
                // 如果没有出现次数，至少显示1次
                count: data.count > 0 ? data.count : 1
            }));
        
        console.log(`[调试] 最终出场角色 ${sortedCharacters.length} 个:`, 
                    sortedCharacters.map(c => `${c.name}(来源:${c.source},出现${c.count}次)`).join(', '));
        
        return sortedCharacters;
    }
    
    /**
     * 转义正则表达式特殊字符
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * 更新显示的立绘（基于实际出场的角色）
     * @param {string} dialogueText - 当前对话文本
     * @param {CharacterPortraitManager} portraitManager - 角色管理器
     * @param {boolean} forceUpdate - 是否强制更新
     */
    // 修改 updatePortraitsFromDialogue 方法，返回检测到的角色数量
    async updatePortraitsFromDialogue(dialogueText, portraitManager, forceUpdate = false) {
        if (!this.container) return;
        
        // 每次调用都强制清空容器
        this.container.innerHTML = '';
        
        const activeCharacters = this.extractActiveCharacters(dialogueText, portraitManager);
        
        const uniqueMap = new Map();
        for (const char of activeCharacters) {
            if (!uniqueMap.has(char.name)) {
                uniqueMap.set(char.name, char);
            }
        }
        
        const displayCharacters = Array.from(uniqueMap.values()).slice(0, this.maxPortraits);
        const displayNames = displayCharacters.map(c => c.name);
        
        if (displayCharacters.length === 0) {
            this.showDefault();
            this.lastDisplayNames = [];
            return 0;
        }
        
        console.log(`[CinemaMode] 渲染 ${displayCharacters.length} 个出场角色:`, displayNames.join(', '));
        
        for (let i = 0; i < displayCharacters.length; i++) {
            const character = displayCharacters[i];
            const portraitPath = character.portrait;
            
            if (portraitPath) {
                await this.createPortraitElement(character.name, portraitPath, i, displayCharacters.length, character.count);
            } else {
                this.createDefaultElement(character.name, i, displayCharacters.length);
            }
        }
        
        this.lastDisplayNames = [...displayNames];
        return displayCharacters.length;
    }

// 手动显示单个角色（用于说话人兜底）
async showSingleCharacter(characterName, portraitManager) {
    if (!this.container) return;
    
    const portraitPath = portraitManager.getPortrait(characterName);
    
    // 清空容器
    this.container.innerHTML = '';
    
    if (portraitPath) {
        await this.createPortraitElement(characterName, portraitPath, 0, 1);
    } else {
        this.createDefaultElement(characterName, 0, 1);
    }
    
    this.lastDisplayNames = [characterName];
    console.log(`[CinemaMode] 手动显示单角色: ${characterName}`);
}
    // 手动显示单个角色（用于说话人兜底）
async showSingleCharacter(characterName, portraitManager) {
    if (!this.container) return;
    
    const portraitPath = portraitManager.getPortrait(characterName);
    
    // 清空容器
    this.container.innerHTML = '';
    
    if (portraitPath) {
        await this.createPortraitElement(characterName, portraitPath, 0, 1);
    } else {
        this.createDefaultElement(characterName, 0, 1);
    }
    
    this.lastDisplayNames = [characterName];
    console.log(`[CinemaMode] 手动显示单角色: ${characterName}`);
}


    // 兼容旧接口：从角色名数组更新
    async updatePortraits(characterNames, portraitManager) {
        if (!this.container) return;
        
        const uniqueNames = [...new Set(characterNames)];
        const displayNames = uniqueNames.slice(0, this.maxPortraits);
        
        const hasChanged = this.hasDisplayChanged(displayNames);
        if (!hasChanged) return;
        
        this.container.innerHTML = '';
        
        if (displayNames.length === 0) {
            this.showDefault();
            this.lastDisplayNames = [];
            return;
        }
        
        for (let i = 0; i < displayNames.length; i++) {
            const name = displayNames[i];
            const portraitPath = portraitManager.getPortrait(name);
            
            if (portraitPath) {
                await this.createPortraitElement(name, portraitPath, i, displayNames.length);
            } else {
                this.createDefaultElement(name, i, displayNames.length);
            }
        }
        
        this.lastDisplayNames = [...displayNames];
    }
    
    hasDisplayChanged(newNames) {
        if (this.lastDisplayNames.length !== newNames.length) {
            return true;
        }
        
        for (let i = 0; i < this.lastDisplayNames.length; i++) {
            if (this.lastDisplayNames[i] !== newNames[i]) {
                return true;
            }
        }
        
        return false;
    }
    
    async createPortraitElement(name, imagePath, index, total, occurrenceCount = 0) {
        const containerWidth = this.container.clientWidth;
        const elementWidth = containerWidth / total;
        // 动态计算高度
        const containerHeight = this.container.clientHeight;
        const portraitHeight = containerHeight - 60; // 留出名字标签空间

        // 获取角色当前心情
        const currentMood = characterPortraitManager?.getCharacterMood(name) || '日常';
        const moodIcon = getMoodIcon(currentMood);
        
        // 获取实际立绘路径（根据心情）
        const actualPortraitPath = characterPortraitManager?.getPortrait(name) || imagePath;

        const portraitDiv = document.createElement('div');
        portraitDiv.className = 'cinema-multi-portrait';
        portraitDiv.style.cssText = `
            position: relative;
            width: ${elementWidth}px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            animation: portraitSlideIn 0.3s ease-out ${index * 0.1}s both;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        // 添加高光效果（如果是重要角色或多次出现）
        const isImportant = occurrenceCount >= 3;
        
        // 图片区域
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            width: 100%;
            height: ${portraitHeight}px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        `;
        
        const img = document.createElement('img');
        img.src = imagePath;
        img.style.cssText = `
            max-width: 90%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 10px;
            filter: drop-shadow(0 0 10px rgba(0,0,0,0.6)) ${isImportant ? 'drop-shadow(0 0 5px rgba(255,215,0,0.6))' : ''};
            transition: transform 0.3s, filter 0.3s;
        `;
        img.onmouseenter = () => {
            img.style.transform = 'scale(1.05)';
            img.style.filter = 'drop-shadow(0 0 15px rgba(0,0,0,0.6)) drop-shadow(0 0 8px #ffd700)';
        };
        img.onmouseleave = () => {
            img.style.transform = 'scale(1)';
            img.style.filter = `drop-shadow(0 0 10px rgba(0,0,0,0.5)) ${isImportant ? 'drop-shadow(0 0 5px rgba(255,215,0,0.5))' : ''}`;
        };
        
        imgContainer.appendChild(img);
        
        // 名字标签 - 根据重要性调整样式
        const nameLabel = document.createElement('div');
        const isSpeaking = this.isCurrentlySpeaking(name, this.lastDialogueText);
        
        nameLabel.style.cssText = `
            background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6));
            backdrop-filter: blur(16px);
            border: 1px solid ${isImportant ? '#ffd700' : 'rgba(255,105,180,0.6)'};
            border-radius: 50px;
            padding: 6px 18px;
            margin-top: 10px;
            font-size: ${isSpeaking ? '22px' : '18px'};
            font-weight: bold;
            color: ${isSpeaking ? '#ffd700' : (isImportant ? '#ffd700' : '#ffb6c1')};
            text-shadow: 0 0 8px ${isSpeaking ? '#ff69b4' : 'transparent'};
            white-space: nowrap;
            text-align: center;
            transition: all 0.3s;
            ${isSpeaking ? 'animation: namePulse 1s ease-in-out infinite;' : ''}
        `;
        
        // 添加说话标记
        if (isSpeaking) {
            nameLabel.textContent = `🎙️ ${name} ${moodIcon} 🎙️`;
        } else if (isImportant) {
            nameLabel.textContent = `⭐ ${name} ${moodIcon} ⭐`;
        } else {
            nameLabel.textContent = `💤 ${name} ${moodIcon} 💤`;
        }
        
        portraitDiv.appendChild(imgContainer);
        portraitDiv.appendChild(nameLabel);
        
        // 添加点击事件 - 显示角色详情
        portraitDiv.onclick = () => {
            this.showCharacterDetail(name, imagePath);
        };
        
        this.container.appendChild(portraitDiv);
    }
    
    // 检测角色是否正在说话（正在说话的给予高亮）
    isCurrentlySpeaking(name, dialogueText) {
        if (!dialogueText) return false;
        // 检测是否在引号内出现（说话内容）
        const speakingPattern = new RegExp(`[""'‘’「」『』][^" "'‘’「」『』]*${this.escapeRegex(name)}[^" "'‘’「」『』]*[""'‘’「」『』]`, 'i');
        // 检测是否作为说话主体（如 "张磊说："）
        const sayPattern = new RegExp(`${this.escapeRegex(name)}\\s*(?:说|道|问|喊|叫|回答|应道|答道)`, 'i');
        return speakingPattern.test(dialogueText) || sayPattern.test(dialogueText);
    }
    
    createDefaultElement(name, index, total) {
        const containerWidth = this.container.clientWidth;
        const elementWidth = containerWidth / total;
        
        const portraitDiv = document.createElement('div');
        portraitDiv.style.cssText = `
            position: relative;
            width: ${elementWidth}px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            animation: portraitSlideIn 0.3s ease-out ${index * 0.1}s both;
            cursor: pointer;
        `;
        
        const emojiContainer = document.createElement('div');
        emojiContainer.style.cssText = `
            width: 100%;
            height: 380px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 100px;
            filter: drop-shadow(0 0 15px rgba(0,0,0,0.5));
            transition: transform 0.3s;
        `;
        emojiContainer.textContent = '👤';
        
        const nameLabel = document.createElement('div');
        nameLabel.style.cssText = `
            background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6));
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,105,180,0.6);
            border-radius: 50px;
            padding: 6px 18px;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
            color: #ffb6c1;
            white-space: nowrap;
            text-align: center;
        `;
        nameLabel.textContent = `🌟 ${name} 🌟`;
        
        portraitDiv.appendChild(emojiContainer);
        portraitDiv.appendChild(nameLabel);
        this.container.appendChild(portraitDiv);
    }
    
    showDefault() {
        this.container.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.5s ease;
            ">
                <div style="font-size: 80px; filter: drop-shadow(0 0 15px rgba(0,0,0,0.5));">🎭</div>
                <div style="
                    background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6));
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,105,180,0.6);
                    border-radius: 50px;
                    padding: 8px 24px;
                    margin-top: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #888;
                ">暂无出场角色</div>
            </div>
        `;
    }
    
    showCharacterDetail(name, portraitPath) {
        // 可以扩展：显示角色详细信息面板
        console.log(`[CinemaMode] 查看角色详情: ${name}`);
        // 这里可以触发一个自定义事件，让主程序显示角色详情弹窗
        const event = new CustomEvent('characterDetail', {
            detail: { name, portrait: portraitPath }
        });
        document.dispatchEvent(event);
    }
    
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
            this.lastDisplayNames = [];
            this.lastDialogueText = '';
        }
    }
    
    // 添加上次对话文本记录，用于说话检测
    setLastDialogueText(text) {
        this.lastDialogueText = text;
    }
}
// 在创建 multiPortraitRenderer 之后添加
document.addEventListener('characterMoodChange', (e) => {
    const { name, newMood } = e.detail;
    console.log(`[立绘] 收到心情变化事件: ${name} → ${newMood}，刷新立绘`);
    
    // 刷新当前显示的立绘
    if (cinemaModeActive && multiPortraitRenderer) {
        const currentMsg = cinemaMessages[currentMessageIndex];
        if (currentMsg) {
            // 重新渲染立绘
            const fullDialogueContext = (currentMsg.content || '') + '\n' + (currentSegments[currentSegmentIndex]?.text || '');
            multiPortraitRenderer.setLastDialogueText(fullDialogueContext);
            multiPortraitRenderer.updatePortraitsFromDialogue(fullDialogueContext, characterPortraitManager, true);
        }
    }
});
// ==================== 修改 updateMultiPortrait 函数 ====================

let lastProcessedMessageHash = null; // 记录上次处理的消息哈希，避免重复处理

async function updateMultiPortrait(messageText, currentMessage) {
    if (!characterPortraitManager || !multiPortraitRenderer) return;
    
    //生成消息哈希，检测内容是否真的变化了
    const messageHash = `${currentMessage?.index || 0}_${messageText.length}_${messageText.substring(0, 100)}`;
    if (lastProcessedMessageHash === messageHash) {
        console.log('[CinemaMode] 消息未变化，跳过立绘更新');
        return;
    }
    lastProcessedMessageHash = messageHash;
    
    // 提取状态栏中的角色并注册
    const characters = characterPortraitManager.extractCharactersFromStatus(messageText);

   // 在 updateMultiPortrait 函数中，添加心情变化处理
    for (const character of characters) {
        console.log(`[调试] 角色 ${character.name} 的心情: ${character.mood}`);
        const existingChar = characterPortraitManager.characterMap.get(character.name);
        
        if (existingChar) {
            // 角色已存在，更新显隐状态和心情
            const oldVisible = characterPortraitManager.characterVisible.get(character.name);
            if (oldVisible !== character.visible) {
                characterPortraitManager.characterVisible.set(character.name, character.visible);
                console.log(`[调试] 更新角色 ${character.name} 显隐: ${oldVisible !== false ? '显示' : '隐藏'} → ${character.visible ? '显示' : '隐藏'}`);
            }
            
            // 【新增】更新心情
            if (character.mood) {
                console.log(`[调试] 尝试更新 ${character.name} 的心情: ${character.mood}`);
                characterPortraitManager.setCharacterMood(character.name, character.mood);
            }
        } else {
            // 新角色，注册
            await characterPortraitManager.registerCharacters([character]);
        }
    }

    // 原有的过滤注册逻辑（兼容）
    const unregisteredCharacters = characterPortraitManager.filterUnregisteredCharacters(characters);
    if (unregisteredCharacters.length > 0) {
        console.log(`[CinemaMode] 发现新角色: ${unregisteredCharacters.map(c => c.name).join(', ')}`);
        await characterPortraitManager.registerCharacters(unregisteredCharacters);
    }

    // 强制刷新立绘显示（确保显隐变化生效）
    if (multiPortraitRenderer && multiPortraitRenderer.container) {
        const fullDialogueContext = (currentMessage?.content || '') + '\n' + (messageText || '');
        multiPortraitRenderer.setLastDialogueText(fullDialogueContext);
        await multiPortraitRenderer.updatePortraitsFromDialogue(fullDialogueContext, characterPortraitManager, true);
    }

    // const unregisteredCharacters = characterPortraitManager.filterUnregisteredCharacters(characters);
    
    if (unregisteredCharacters.length > 0) {
        console.log(`[CinemaMode] 发现新角色: ${unregisteredCharacters.join(', ')}`);
        await characterPortraitManager.registerCharacters(unregisteredCharacters);
    }
    
    // ========== 新版：智能角色出场检测 ==========
    // 构建完整的对话上下文
    let fullDialogueContext = '';
    
    // 添加当前消息内容
    if (currentMessage && currentMessage.content) {
        fullDialogueContext += currentMessage.content + '\n';
    }
    
    // 添加消息文本（可能包含状态栏）
    if (messageText) {
        fullDialogueContext += messageText;
    }
    
    // 如果渲染器是增强版，使用智能出场检测
    if (multiPortraitRenderer.extractActiveCharacters) {
        multiPortraitRenderer.setLastDialogueText(fullDialogueContext);
        await multiPortraitRenderer.updatePortraitsFromDialogue(fullDialogueContext, characterPortraitManager);
        
        // 【关键修改】检查是否没有检测到任何出场角色
        const activeCharacters = multiPortraitRenderer.extractActiveCharacters(fullDialogueContext, characterPortraitManager);
        
        if (activeCharacters.length === 0 && currentMessage && currentMessage.name) {
            const speakerName = currentMessage.name;
            // 过滤掉叙述者和主人公（可以根据需要调整）
            if (speakerName && speakerName !== '主人公' && speakerName !== '叙述者' && speakerName !== '系统') {
                console.log(`[CinemaMode] 未检测到出场角色，使用当前说话人: ${speakerName}`);
                
                // 确保说话人已注册
                if (!characterPortraitManager.isCharacterRegistered(speakerName)) {
                    console.log(`[CinemaMode] 注册说话人: ${speakerName}`);
                    await characterPortraitManager.registerCharacters([{ name: speakerName, gender: '未知' }]);
                }
                
                // 单独显示说话人
                const portraitPath = characterPortraitManager.getPortrait(speakerName);
                if (portraitPath) {
                    // 清空容器并只显示说话人
                    multiPortraitRenderer.container.innerHTML = '';
                    await multiPortraitRenderer.createPortraitElement(speakerName, portraitPath, 0, 1);
                    multiPortraitRenderer.lastDisplayNames = [speakerName];
                } else {
                    // 如果没有立绘，显示默认
                    multiPortraitRenderer.container.innerHTML = '';
                    multiPortraitRenderer.createDefaultElement(speakerName, 0, 1);
                    multiPortraitRenderer.lastDisplayNames = [speakerName];
                }
            }
        }
    } 
    // 否则使用原有逻辑（旧版渲染器）
    else {
        const allCharacterNames = characterPortraitManager.getAllCharacters().map(c => c.name);
        const mentionedCharacters = extractMentionedCharacters(messageText, allCharacterNames);
        
        let displayCharacters = [...characters];
        for (const char of mentionedCharacters) {
            if (!displayCharacters.includes(char)) {
                displayCharacters.push(char);
            }
        }
        
        // 【关键修改】如果没有检测到角色，使用当前说话人
        if (displayCharacters.length === 0 && currentMessage && currentMessage.name) {
            const speakerName = currentMessage.name;
            if (speakerName !== '主人公' && speakerName !== '叙述者') {
                console.log(`[CinemaMode] 未检测到角色，使用当前说话人: ${speakerName}`);
                
                if (!characterPortraitManager.isCharacterRegistered(speakerName)) {
                    await characterPortraitManager.registerCharacters([speakerName]);
                }
                displayCharacters = [speakerName];
            }
        }
        
        if (displayCharacters.length > 0) {
            displayCharacters = displayCharacters.filter(name => typeof name === 'string');
            const missingCharacters = displayCharacters.filter(name => !characterPortraitManager.isCharacterRegistered(name));
            
            if (missingCharacters.length > 0) {
                await characterPortraitManager.registerCharacters(missingCharacters);
            }
        }
        
        if (displayCharacters.length > 0) {
            await multiPortraitRenderer.updatePortraits(displayCharacters, characterPortraitManager);
        } else {
            await multiPortraitRenderer.updatePortraits([], characterPortraitManager);
        }
    }

    // 同步更新逻辑保持不变...
    if (!syncInitialized) {
        initSyncModule();
    }
    
    if (messageText && (messageText.includes('```') || messageText.includes('【'))) {
        try {
            const parseResult = syncParser.parse(messageText);
            
            if (parseResult.hasUpdate) {
                let allChanges = [];
                
                if (Object.keys(parseResult.attributes).length > 0) {
                    const attrChanges = syncUpdater.updateAttributes(parseResult.attributes);
                    allChanges.push(...attrChanges);
                }
                
                if (Object.keys(parseResult.stats).length > 0) {
                    const statChanges = syncUpdater.updateStats(parseResult.stats);
                    allChanges.push(...statChanges);
                }
                
                if (parseResult.items.length > 0) {
                    syncUpdater.updateItems(parseResult.items);
                    allChanges.push({ action: 'items_updated', count: parseResult.items.length, category: 'items' });
                }
                
                if (parseResult.characters.length > 0) {
                    const charChanges = syncUpdater.updateCharacters(parseResult.characters);
                    allChanges.push(...charChanges);
                }
                
                if (parseResult.day && gameState.day !== parseResult.day) {
                    gameState.day = parseResult.day;
                    allChanges.push({ action: 'day_changed', newValue: parseResult.day, category: 'game' });
                }
                if (parseResult.phase && gameState.phase !== parseResult.phase) {
                    gameState.phase = parseResult.phase;
                }
                if (parseResult.weather && gameState.weather !== parseResult.weather) {
                    gameState.weather = parseResult.weather;
                }
                if (parseResult.location && gameState.location !== parseResult.location) {
                    gameState.location = parseResult.location;
                }
                
                renderSyncPanel();
                saveSyncData();
                
                console.log(`[CinemaMode] ✅ 同步更新完成: ${allChanges.length} 处变化`);
            }
        } catch (error) {
            console.error('[CinemaMode] 同步解析出错:', error);
        }
    }
}

// 辅助函数：提取文本中提到的角色名（优化版）
function extractMentionedCharacters(text, characterNames) {
    const mentioned = [];
    for (const name of characterNames) {
        // 使用正则匹配，避免部分匹配，确保独立出现
        const pattern = new RegExp(`(?:^|[^\\u4e00-\\u9fa5a-zA-Z])${escapeRegExp(name)}(?:[^\\u4e00-\\u9fa5a-zA-Z]|$)`, 'i');
        if (pattern.test(text)) {
            mentioned.push(name);
        }
    }
    return mentioned;
}

// 辅助函数：转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// ==================== 选项面板管理器 ====================

class OptionPanelManager {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.options = [];
        this.onOptionSelected = null;
        this.pendingOptions = null;
        this.isCustomMode = false;  // 是否处于自定义输入模式
        // ========== 骰子系统 ==========
        this.diceResult = 0;           // 当前骰子结果
        this.diceCount = 1;            // 骰子数量
        this.diceSides = 20;           // 骰子面数 (D20 是标准的 DND 骰子)
        this.diceModifier = 0;          // 修正值
        this.lastDiceInfo = null;       // 上次骰子信息
    }
    
    // ========== 骰子系统方法 ==========
    
    // 掷骰子
    rollDice(sides = 20, count = 1, modifier = 0) {
        let total = 0;
        let rolls = [];
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }
        
        const finalTotal = total + modifier;
        
        this.diceResult = finalTotal;
        this.lastDiceInfo = {
            sides: sides,
            count: count,
            modifier: modifier,
            rolls: rolls,
            total: total,
            finalTotal: finalTotal,
            timestamp: Date.now()
        };
        
        console.log(`[骰子] 掷出 ${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : ''} = ${finalTotal} (${rolls.join('+')}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : ''})`);
        
        return this.lastDiceInfo;
    }
    
    // 获取骰子结果文本（用于显示）
    getDiceResultText() {
        if (!this.lastDiceInfo) return '未掷骰';
        
        const info = this.lastDiceInfo;
        if (info.count === 1) {
            return `${info.finalTotal} (d${info.sides}${info.modifier !== 0 ? (info.modifier > 0 ? `+${info.modifier}` : `${info.modifier}`) : ''})`;
        } else {
            return `${info.finalTotal} (${info.count}d${info.sides}${info.modifier !== 0 ? (info.modifier > 0 ? `+${info.modifier}` : `${info.modifier}`) : ''})`;
        }
    }
    
    // 获取AI可读的骰子结果
    getDiceResultForAI() {
        if (!this.lastDiceInfo) return null;
        
        const info = this.lastDiceInfo;
        let resultText = `[骰子结果] `;
        
        if (info.count === 1) {
            resultText += `掷出了 d${info.sides} = ${info.rolls[0]}`;
            if (info.modifier !== 0) {
                resultText += ` ${info.modifier > 0 ? '+' : ''}${info.modifier} = ${info.finalTotal}`;
            }
        } else {
            resultText += `掷出了 ${info.count}d${info.sides} = ${info.rolls.join('+')}`;
            if (info.modifier !== 0) {
                resultText += ` ${info.modifier > 0 ? '+' : ''}${info.modifier} = ${info.finalTotal}`;
            }
        }
        
        // 添加 DND 风格的判定提示
        if (info.sides === 20) {
            if (info.rolls[0] === 20) {
                resultText += ` ✨ 大成功！(Natural 20) ✨`;
            } else if (info.rolls[0] === 1) {
                resultText += ` 💀 大失败！(Natural 1) 💀`;
            }
        }
        
        return resultText;
    }
    
    // 重置骰子
    resetDice() {
        this.diceResult = 0;
        this.lastDiceInfo = null;
        console.log('[骰子] 骰子已重置');
    }
    
    // 设置骰子参数
    setDiceParams(sides = 20, count = 1, modifier = 0) {
        this.diceSides = sides;
        this.diceCount = count;
        this.diceModifier = modifier;
        console.log(`[骰子] 骰子参数已设置: ${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : ''}`);
    }

    // 在 OptionPanelManager 类中修改 createPanel 方法
    createPanel() {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
        
        console.log('[CinemaMode] 创建选项面板');
        
        const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
        const colors = currentTheme ? currentTheme.colors : { 
            primary: '#ff69b4', 
            accent: '#ffd700', 
            text: '#ffffff',
            cardBg: 'rgba(0,0,0,0.95)',
            border: 'rgba(255,105,180,0.5)',
            glow: 'rgba(255,105,180,0.3)'
        };
        
        this.panel = document.createElement('div');
        this.panel.id = 'cinema-option-panel';
        this.panel.style.cssText = `
            position: fixed;
            bottom: 150px;
            left: 50%;
            width: 80%;
            max-width: 700px;
            max-height: 90vh;
            background: linear-gradient(135deg, ${colors.cardBg}, rgba(20,20,40,0.95));
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 2px solid ${colors.border};
            box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${colors.glow};
            z-index: 200010;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            padding: 20px;
            pointer-events: auto;
            overflow-y: auto;
            transform: translateX(-50%) translateY(0);
        `;
        
        this.panel.innerHTML = `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 15px;
                margin-bottom: 15px;
                border-bottom: 2px solid ${colors.border};
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    color: ${colors.accent};
                ">
                    <span style="font-size: 24px;">🎮</span>
                    <span id="cinema-option-title">请选择你的行动</span>
                </div>
                <div id="cinema-option-close" style="
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 18px;
                    color: ${colors.text};
                ">✕</div>
            </div>
            
            <div id="cinema-option-content" style="
                max-height: 300px;
                overflow-y: auto;
                padding: 5px;
            ">
                <!-- 选项会动态添加到这里 -->
            </div>
            
            <!-- ========== 【修改】文本区域单独一行，按钮+骰子合并一行 ========== -->
            <div style="
                margin-top: 15px;
                padding-top: 12px;
                border-top: 1px solid ${colors.border};
            ">
                <!-- 第一行：文本区域（独占一行） -->
                <div style="margin-bottom: 10px;">
                    <textarea id="cinema-option-input" 
                        placeholder="输入自定义指令（Ctrl+Enter发送）..." 
                        rows="3"
                        style="
                            width: 100%;
                            background: rgba(255,255,255,0.08);
                            border: 1px solid ${colors.border};
                            border-radius: 16px;
                            padding: 12px 16px;
                            color: ${colors.text};
                            font-size: 16px;
                            outline: none;
                            transition: all 0.2s;
                            resize: vertical;
                            font-family: inherit;
                            line-height: 1.6;
                            min-height: 60px;
                            max-height: 150px;
                            box-sizing: border-box;
                        "
                        onfocus="this.style.borderColor='${colors.primary}'; this.style.background='rgba(255,255,255,0.12)'" 
                        onblur="this.style.borderColor='${colors.border}'; this.style.background='rgba(255,255,255,0.08)'"
                        oninput="autoResizeTextarea(this)"
                    ></textarea>
                </div>
                
                <!-- 第二行：发送按钮 + 骰子区域（合并为一行） -->
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <!-- 发送按钮 -->
                    <button id="cinema-option-send" style="
                        background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary});
                        border: none;
                        border-radius: 30px;
                        padding: 10px 28px;
                        color: white;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.2s;
                        box-shadow: 0 2px 8px ${colors.glow};
                        flex-shrink: 0;
                        white-space: nowrap;
                    " onmouseenter="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px ${colors.glow}'" 
                    onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px ${colors.glow}'">
                        ➤ 发送
                    </button>
                    
                    <!-- 骰子区域 -->
                    <div style="
                        background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
                        border-radius: 16px;
                        padding: 8px 14px;
                        border: 1px solid ${colors.border};
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        flex-wrap: wrap;
                        flex: 1;
                    ">
                        <div style="
                            background: ${colors.primary}33;
                            border-radius: 30px;
                            padding: 4px 12px;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            flex-shrink: 0;
                        ">
                            <span style="font-size: 18px;">🎲</span>
                            <span style="font-size: 14px; font-weight: bold; color: ${colors.primary};">DICE</span>
                        </div>
                        
                        <select id="cinema-dice-select" style="
                            background: rgba(0,0,0,0.6);
                            border: 1px solid ${colors.border};
                            border-radius: 25px;
                            padding: 5px 10px;
                            color: ${colors.accent};
                            font-size: 14px;
                            font-weight: bold;
                            cursor: pointer;
                            outline: none;
                            transition: all 0.2s;
                            flex-shrink: 0;
                        " onmouseenter="this.style.borderColor='${colors.primary}'" onmouseleave="this.style.borderColor='${colors.border}'">
                            <option value="4">D4</option>
                            <option value="6">D6</option>
                            <option value="8">D8</option>
                            <option value="10">D10</option>
                            <option value="12">D12</option>
                            <option value="20" selected>D20</option>
                            <option value="100">D100</option>
                        </select>
                        
                        <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.4); border-radius: 25px; padding: 2px 10px; flex-shrink: 0;">
                            <span style="font-size: 14px; color: #aaa;">±</span>
                            <input type="number" id="cinema-dice-modifier" value="0" style="
                                background: transparent;
                                border: none;
                                width: 40px;
                                color: ${colors.accent};
                                text-align: center;
                                font-size: 16px;
                                font-weight: bold;
                                outline: none;
                            ">
                        </div>
                        
                        <button id="cinema-dice-roll" style="
                            background: ${colors.primary}33;
                            border: 1px solid ${colors.primary};
                            border-radius: 25px;
                            padding: 5px 16px;
                            color: ${colors.primary};
                            font-size: 14px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            flex-shrink: 0;
                        " onmouseenter="this.style.background='${colors.primary}66'; this.style.transform='scale(1.02)'" 
                        onmouseleave="this.style.background='${colors.primary}33'; this.style.transform='scale(1)'">
                            <span>🎲</span> 掷骰
                        </button>
                        
                        <div style="
                            background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));
                            border-radius: 25px;
                            padding: 5px 14px;
                            min-width: 70px;
                            text-align: center;
                            border: 1px solid ${colors.border}66;
                            flex-shrink: 0;
                        ">
                            <div id="cinema-dice-result" style="
                                font-size: 15px;
                                font-weight: bold;
                                color: ${colors.accent};
                                font-family: monospace;
                            ">未掷骰</div>
                        </div>
                    </div>
                </div>
                
                <div style="font-size: 14px; color: #666; margin-top: 8px; text-align: center;">
                    💡 点击选项自动发送 | Ctrl+Enter 发送自定义指令
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        // ========== 【新增】文本区域自动调整高度 ==========
        // 添加全局函数用于自动调整
        if (!window.autoResizeTextarea) {
            window.autoResizeTextarea = function(el) {
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 200) + 'px';
            };
        }
        
        // ... 后续绑定事件保持不变 ...
        
        // 绑定关闭按钮
        const closeBtn = document.getElementById('cinema-option-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hidePanel();
        }
        
        // 绑定骰子按钮
        const diceRollBtn = document.getElementById('cinema-dice-roll');
        const diceSelect = document.getElementById('cinema-dice-select');
        const diceModifier = document.getElementById('cinema-dice-modifier');
        const diceResultDiv = document.getElementById('cinema-dice-result');
        
        if (diceRollBtn) {
            diceRollBtn.onclick = () => {
                const sides = parseInt(diceSelect.value);
                const modifier = parseInt(diceModifier.value) || 0;
                const diceInfo = this.rollDice(sides, 1, modifier);
                if (diceResultDiv) {
                    diceResultDiv.textContent = this.getDiceResultText();
                    diceResultDiv.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        diceResultDiv.style.transform = 'scale(1)';
                    }, 200);
                }
                this.playDiceSound();
            };
        }
        
        // ========== 【修改】绑定文本区域和发送按钮 ==========
        const inputArea = document.getElementById('cinema-option-input');
        const sendBtn = document.getElementById('cinema-option-send');
        
        if (inputArea) {
            // Ctrl+Enter 发送（保留 Enter 换行功能）
            inputArea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.sendCustomMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.onclick = () => this.sendCustomMessage();
        }
    }
    // 播放骰子音效（简单实现）
    playDiceSound() {
        try {
            // 使用 Web Audio API 生成简单的音效
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch(e) {
            // 静默失败
        }
    }
    // 发送自定义消息
    async sendCustomMessage() {
        const inputBox = document.getElementById('cinema-option-input');
        if (!inputBox) return;
        
        let message = inputBox.value.trim();
        if (!message) {
            this.showToast('请输入指令内容');
            return;
        }
        
        console.log('[CinemaMode] 发送自定义消息:', message);
        
        // 清空输入框
        inputBox.value = '';
        
        // 调用AI生成回复
        await this.sendToAI(message);
        
        // 关闭面板
        this.hidePanel();
    }
    
    // 向AI发送消息并获取回复
    async sendToAI(userMessage, optionKey = null) {
        let finalMessage = userMessage;
        
        // ========== 如果有骰子结果，添加到消息中 ==========
        if (this.lastDiceInfo && this.lastDiceInfo.finalTotal > 0) {
            const diceText = this.getDiceResultForAI();
            finalMessage = `${userMessage}\n\n${diceText}`;
            console.log(`[骰子] 已将结果添加到消息: ${diceText}`);
            
            // 发送后重置骰子（可选，如果不希望重复使用）
            this.resetDice();
            const diceResultDiv = document.getElementById('cinema-dice-result');
            if (diceResultDiv) diceResultDiv.textContent = '未掷骰';
        }
        
        console.log(`[CinemaMode] 发送消息到AI: ${finalMessage}`);
        
        // 显示加载提示
        this.showToast('🤔 AI思考中...', 1500);

        // ========== 【修复】安全获取日志内容 ==========
        let logContent = '';
        const logTextarea = document.getElementById('sync-log');
        if (logTextarea) {
            logContent = logTextarea.value.trim();
        }
        
        if (logContent) {
            finalMessage = `${finalMessage}\n\n【最近行动记录】\n${logContent}`;
            console.log(`[日志] 已将行动记录添加到消息`);
        }

        // ========== 如果有日志，添加到消息中 ==========
        // const actionLog = getRecentActionsForAI(5);
        // if (actionLog) {
        //     // finalMessage = `${finalMessage}\n\n【最近行动记录】\n${actionLog}`;
        //     finalMessage = `${finalMessage}\n\n【最近行动记录】\n${logContent}`;
        //     console.log(`[日志] 已将行动记录添加到消息`);
        // }

        // 调用生成函数
        const aiReply = await generateAIReply(finalMessage, optionKey);
        
        if (aiReply) {
            this.showToast('✅ 已获得回复', 1000);
        } else {
            this.showToast('❌ AI回复失败，请重试', 2000);
        }
    }
    
    // 在 showPanel 方法中，修改选项生成部分

    showPanel(options, description = '', onSelect = null, isCustomOnly = false) {
        console.log('[CinemaMode] 显示选项面板，选项数量:', options.length);
        
        if (!this.panel) {
            this.createPanel();
        }
        
        if (!this.panel || !document.body.contains(this.panel)) {
            this.createPanel();
        }
        
        this.options = options;
        this.onOptionSelected = onSelect;
        this.isCustomMode = isCustomOnly || (options.length === 0);
        
        // 重置骰子显示
        this.resetDice();
        const diceResultDiv = document.getElementById('cinema-dice-result');
        if (diceResultDiv) {
            diceResultDiv.textContent = '未掷骰';
        }
        
        // 获取当前主题颜色
        const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
        const colors = currentTheme ? currentTheme.colors : { 
            primary: '#ff69b4', 
            accent: '#ffd700', 
            text: '#ffffff',
            border: 'rgba(255,105,180,0.5)'
        };
        
        // 更新标题
        const titleEl = document.getElementById('cinema-option-title');
        if (titleEl) {
            if (this.isCustomMode) {
                titleEl.textContent = '📝 请输入你的指令';
            } else {
                titleEl.textContent = '请选择你的行动';
            }
            titleEl.style.color = colors.accent;
        }
        
        const contentContainer = document.getElementById('cinema-option-content');
        if (!contentContainer) {
            console.error('[CinemaMode] 找不到内容容器');
            return;
        }
        
        // 如果是纯自定义模式
        if (this.isCustomMode) {
            contentContainer.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 30px;
                    color: #aaa;
                ">
                    <div style="font-size: 48px; margin-bottom: 15px;">✏️</div>
                    <div style="color: ${colors.text};">没有预设选项</div>
                    <div style="font-size: 16px; margin-top: 10px; color: #888;">请在下方输入框输入你的指令</div>
                </div>
            `;
            this.showPanelWithAnimation();
            return;
        }
        
        // 生成选项HTML
        let optionsHtml = '';
        
        // 描述文本
        if (description) {
            optionsHtml += `
                <div style="
                    padding: 15px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    margin-bottom: 20px;
                    font-size: 16px;
                    line-height: 1.6;
                    color: ${colors.text};
                    border-left: 3px solid ${colors.primary};
                ">
                    ${description}
                </div>
            `;
        }
        
        optionsHtml += '<div style="display: flex; flex-direction: column; gap: 12px;">';
        
        const colorsArray = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3b6'];
        
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const color = colorsArray[i % colorsArray.length];
            
            optionsHtml += `
                <div class="cinema-option-item" data-option-key="${opt.key}" data-option-text="${this.escapeHtml(opt.text)}" style="
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 12px 18px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-left: 4px solid ${color};
                    color: ${colors.text};
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        font-weight: bold;
                        font-size: 20px;
                        color: white;
                        background: ${color};
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">${opt.key}</div>
                    <div style="
                        flex: 1;
                        font-size: 17px;
                        line-height: 1.4;
                        color: ${colors.text};
                    ">${this.escapeHtml(opt.text)}</div>
                    <div style="
                        color: ${color};
                        font-size: 18px;
                        opacity: 0;
                        transition: opacity 0.2s;
                    ">▶</div>
                </div>
            `;
        }
        
        optionsHtml += '</div>';
        contentContainer.innerHTML = optionsHtml;
        
        // 绑定选项点击事件
        const optionItems = contentContainer.querySelectorAll('.cinema-option-item');
        
        optionItems.forEach(item => {
            item.onclick = async () => {
                const key = item.getAttribute('data-option-key');
                const text = item.getAttribute('data-option-text');
                const selectedOption = { key, text };
                
                console.log('[CinemaMode] 选择了选项:', key, text);
                
                const inputBox = document.getElementById('cinema-option-input');
                const customInput = inputBox ? inputBox.value.trim() : '';
                
                let messageToSend = text;
                if (customInput) {
                    messageToSend = `${text}，另外我想补充：${customInput}`;
                    inputBox.value = '';
                }
                
                item.style.transform = 'scale(0.98)';
                item.style.background = `${colors.primary}33`;
                
                await this.sendToAI(messageToSend, key);
                
                if (this.onOptionSelected) {
                    this.onOptionSelected(selectedOption, customInput);
                }
                
                this.hidePanel();
            };
            
            item.onmouseenter = () => {
                item.style.transform = 'translateX(10px)';
                item.style.background = 'rgba(255,255,255,0.15)';
                const hint = item.querySelector('div:last-child');
                if (hint) hint.style.opacity = '1';
            };
            item.onmouseleave = () => {
                item.style.transform = 'translateX(0)';
                item.style.background = 'rgba(255,255,255,0.05)';
                const hint = item.querySelector('div:last-child');
                if (hint) hint.style.opacity = '0';
            };
        });
        
        this.showPanelWithAnimation();
    }
    
    // 纯自定义模式（无选项）
    showCustomOnlyPanel() {
        this.showPanel([], '', null, true);
    }
    // 更新面板主题（当主题切换时调用）
    updateTheme() {
        if (!this.panel) return;
        
        const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
        const colors = currentTheme ? currentTheme.colors : { 
            primary: '#ff69b4', 
            accent: '#ffd700', 
            text: '#ffffff',
            cardBg: 'rgba(0,0,0,0.95)',
            border: 'rgba(255,105,180,0.5)',
            glow: 'rgba(255,105,180,0.3)'
        };
        
        // 更新面板样式
        this.panel.style.background = `linear-gradient(135deg, ${colors.cardBg}, rgba(20,20,40,0.95))`;
        this.panel.style.border = `2px solid ${colors.border}`;
        this.panel.style.boxShadow = `0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${colors.glow}`;
        
        // 更新标题
        const titleEl = document.getElementById('cinema-option-title');
        if (titleEl) {
            titleEl.style.color = colors.accent;
        }
        
        // 更新分隔线
        const headerDiv = this.panel.querySelector('div[style*="border-bottom"]');
        if (headerDiv) {
            headerDiv.style.borderBottom = `2px solid ${colors.border}`;
        }
        
        // 更新骰子区域边框
        const diceArea = this.panel.querySelector('div[style*="border-top"]');
        if (diceArea) {
            diceArea.style.borderTop = `1px solid ${colors.border}`;
        }
        
        // 更新输入框
        const inputBox = document.getElementById('cinema-option-input');
        if (inputBox) {
            inputBox.style.border = `1px solid ${colors.border}`;
            inputBox.style.color = colors.text;
            inputBox.onfocus = function() {
                this.style.borderColor = colors.primary;
                this.style.background = 'rgba(255,255,255,0.12)';
            };
            inputBox.onblur = function() {
                this.style.borderColor = colors.border;
                this.style.background = 'rgba(255,255,255,0.08)';
            };
        }
        
        // 更新发送按钮
        const sendBtn = document.getElementById('cinema-option-send');
        if (sendBtn) {
            sendBtn.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`;
            sendBtn.style.boxShadow = `0 2px 8px ${colors.glow}`;
            sendBtn.onmouseenter = function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = `0 4px 12px ${colors.glow}`;
            };
            sendBtn.onmouseleave = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = `0 2px 8px ${colors.glow}`;
            };
        }
        
        // 更新骰子按钮
        const diceRollBtn = document.getElementById('cinema-dice-roll');
        if (diceRollBtn) {
            diceRollBtn.style.border = `1px solid ${colors.primary}`;
            diceRollBtn.style.color = colors.primary;
            diceRollBtn.onmouseenter = function() {
                this.style.background = `${colors.primary}66`;
                this.style.transform = 'scale(1.02)';
            };
            diceRollBtn.onmouseleave = function() {
                this.style.background = `${colors.primary}33`;
                this.style.transform = 'scale(1)';
            };
        }
        
        // 更新骰子结果
        const diceResult = document.getElementById('cinema-dice-result');
        if (diceResult) {
            diceResult.style.color = colors.accent;
        }
        
        // 更新骰子选择框
        const diceSelect = document.getElementById('cinema-dice-select');
        if (diceSelect) {
            diceSelect.style.border = `1px solid ${colors.border}`;
            diceSelect.style.color = colors.accent;
            diceSelect.onmouseenter = function() {
                this.style.borderColor = colors.primary;
            };
            diceSelect.onmouseleave = function() {
                this.style.borderColor = colors.border;
            };
        }
        
        // 更新骰子修正输入框
        const diceModifier = document.getElementById('cinema-dice-modifier');
        if (diceModifier) {
            diceModifier.style.color = colors.accent;
        }
        
        // 更新DICE标签
        const diceLabel = this.panel.querySelector('div[style*="background:"] > span[style*="color:"]');
        if (diceLabel && diceLabel.textContent === 'DICE') {
            diceLabel.style.color = colors.primary;
        }
    }
    // 显示提示消息（增强版）
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 200px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: #ffd700;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 16px;
            z-index: 200011;
            animation: fadeOut ${duration/1000}s ease;
            white-space: nowrap;
            max-width: 80%;
            white-space: normal;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid #ff69b4;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }
    
    // 显示面板动画
    showPanelWithAnimation() {
        if (!this.panel) return;
        
        this.panel.style.visibility = 'visible';
        this.panel.style.opacity = '1';
        this.panel.style.transform = 'translateX(-50%) translateY(0)';
        this.isVisible = true;
        
        // 聚焦输入框（如果不是纯自定义模式）
        if (!this.isCustomMode) {
            const inputBox = document.getElementById('cinema-option-input');
            if (inputBox) {
                setTimeout(() => inputBox.focus(), 100);
            }
        }
    }
    
    // 隐藏面板
    hidePanel() {
        if (!this.panel) return;
        
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'translateX(-50%) translateY(0)';
        this.panel.style.visibility = 'hidden';
        this.isVisible = false;
        this.isCustomMode = false;
        
        // 清空输入框
        const inputBox = document.getElementById('cinema-option-input');
        if (inputBox) {
            inputBox.value = '';
        }
    }

    // 提取选项（万能版）
    // 提取选项（增强版 - 支持 [A] 格式）
    extractOptions(content) {
        const options = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            let key = null;
            let text = '';
            
            // 格式1: [A] 文字
            let match = trimmed.match(/^\[([A-Z])\]\s*(.+)$/);
            if (match) {
                key = match[1];
                text = match[2].trim();
                options.push({ key, text });
                continue;
            }
            
            // 格式2: **A.** 文字
            match = trimmed.match(/^\*\*([A-Z])\.\*\*\s+(.+)$/);
            if (match) {
                key = match[1];
                text = match[2].trim();
                options.push({ key, text });
                continue;
            }
            
            // 格式3: A. 文字
            match = trimmed.match(/^([A-Z])\.\s+(.+)$/);
            if (match) {
                key = match[1];
                text = match[2].trim();
                options.push({ key, text });
                continue;
            }
            
            // 格式4: **A** 文字
            match = trimmed.match(/^\*\*([A-Z])\*\*\s+(.+)$/);
            if (match) {
                key = match[1];
                text = match[2].trim();
                options.push({ key, text });
                continue;
            }
            
            // 格式5: A) 文字
            match = trimmed.match(/^([A-Z])\)\s+(.+)$/);
            if (match) {
                key = match[1];
                text = match[2].trim();
                options.push({ key, text });
                continue;
            }
            
            // 格式6: A、文字
            match = trimmed.match(/^([A-Z])、\s*(.+)$/);
            if (match) {
                key = match[1];
                text = match[2].trim();
                options.push({ key, text });
                continue;
            }
        }
        
        console.log(`[CinemaMode] 提取到 ${options.length} 个选项:`, options);
        return options;
    }
    
    // 提取描述文本
    extractDescription(content) {
        const lines = content.split('\n');
        const descriptionLines = [];
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // 检查是否是选项行（支持 [A] 和 **A.** 格式）
            const isOptionLine = /^\[[A-Z]\]/.test(trimmedLine) ||
                                /^\*{0,2}[A-Z]\){0,1}\.{0,1}\*{0,2}\s+/.test(trimmedLine);
            
            if (!isOptionLine) {
                descriptionLines.push(trimmedLine);
            }
        }
        
        let description = descriptionLines.join('<br>');
        
        // 将 **文本** 转换为 <strong>文本</strong>
        description = description.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // 将 *文本* 转换为 <em>文本</em>
        description = description.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        return description;
    }
    // 检测文本中是否包含选项格式
    detectOptionsInText(text) {
        // 支持 [A]、**A.**、A. 等格式
        const optionPatterns = [
            /\[[A-Z]\]/,           // [A]
            /\*\*[A-Z]\.\*\*/,     // **A.**
            /\*\*[A-Z]\*\*/,       // **A**
            /^[A-Z]\.\s+/,         // A. 
            /^[A-Z]\)\s+/,         // A) 
            /^[A-Z]、\s+/          // A、
        ];
        
        let totalMatches = 0;
        for (const pattern of optionPatterns) {
            const matches = text.match(new RegExp(pattern.source, 'gm'));
            if (matches) {
                totalMatches += matches.length;
            }
        }
        
        return totalMatches >= 2;
    }
    // 检查并显示选项面板（自动检测）
    checkAndShowOptions(text) {
        // 方法1：检测是否被 *** 包裹的选项块
        const optionMatch = text.match(/\[\[\[[\s\S]*?\]\]\]/);
        let options = [];
        let description = '';
        
        if (optionMatch) {
            const optionsContent = optionMatch[1];
            options = this.extractOptions(optionsContent);
            description = this.extractDescription(optionsContent);
        }
        
        // 方法2：如果没有找到选项块，直接检测文本中是否有 ABCD 或 A. B. C. 格式
        if (options.length === 0) {
            // 检测常见选项格式
            const hasOptions = this.detectOptionsInText(text);
            if (hasOptions) {
                options = this.extractOptions(text);
                description = this.extractDescription(text);
            }
        }
        
        // 如果有选项，显示选项面板
        if (options.length > 0) {
            this.showPanel(options, description);
            return true;
        }
        
        // 方法3：没有任何选项，显示自定义输入面板
        this.showCustomOnlyPanel();
        return false;
    }
    
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 强制关闭
    forceClose() {
        this.hidePanel();
    }
}



// ==================== 音乐状态管理器 ====================

class MusicStateManager {
    constructor() {
        this.currentMusic = null;      // 当前正在播放的音乐
        this.currentSource = null;     // 音乐来源（分段/状态栏/消息/情绪）
        this.pendingMusic = null;      // 待切换的音乐
        this.messageMusicCache = new Map(); // 每条消息的默认音乐缓存
        this.isTransitioning = false;
    }
    
    // 请求播放音乐
    requestMusic(musicName, source, priority = 0) {
        // 如果音乐没有变化，直接返回
        if (this.currentMusic === musicName) {
            console.log(`[音乐] 音乐未变化，保持: ${musicName}`);
            return false;
        }
        
        // 优先级判断（数字越大优先级越高）
        // 分段标记优先级最高（100），状态栏次之（80），消息标记再次（60），情绪分析最低（40）
        const priorityMap = {
            '分段标记': 100,
            '状态栏': 80,
            '消息标记': 60,
            '情绪分析': 40
        };
        const currentPriority = priorityMap[this.currentSource] || 0;
        const newPriority = priorityMap[source] || priority;
        
        // 如果新请求优先级低于当前，且当前音乐存在，则忽略
        if (this.currentMusic && newPriority < currentPriority) {
            console.log(`[音乐] 忽略低优先级请求: ${musicName} (${source}) < 当前: ${this.currentMusic} (${this.currentSource})`);
            return false;
        }
        
        console.log(`[音乐] 切换音乐: ${this.currentMusic || '无'} → ${musicName} (来源: ${source})`);
        this.currentMusic = musicName;
        this.currentSource = source;
        return true;
    }
    
    // 获取当前音乐
    getCurrentMusic() {
        return this.currentMusic;
    }
    
    // 重置状态（切换消息时调用）
    reset() {
        console.log(`[音乐] 重置音乐状态，当前音乐: ${this.currentMusic}`);
        this.currentMusic = null;
        this.currentSource = null;
    }
    
    // 设置消息的默认音乐（从状态栏解析）
    setMessageDefaultMusic(messageIndex, musicName) {
        this.messageMusicCache.set(messageIndex, musicName);
        console.log(`[音乐] 消息 ${messageIndex} 默认音乐: ${musicName}`);
    }
    
    // 获取消息的默认音乐
    getMessageDefaultMusic(messageIndex) {
        return this.messageMusicCache.get(messageIndex);
    }
}

// 创建全局音乐状态管理器实例
let musicStateManager = null;

// 初始化音乐状态管理器
function initMusicStateManager() {
    if (!musicStateManager) {
        musicStateManager = new MusicStateManager();
        console.log('[音乐] 音乐状态管理器已初始化');
    }
}
// ==================== 修改 displayCurrentSegment 函数 ====================

let textBeautifier = null;
let optionPanelManager = null;
let isoptionall = true;

function displayCurrentSegment(msg) {
    const segment = currentSegments[currentSegmentIndex];
    if (!segment) return;
    
    // 初始化组件
    if (!textBeautifier) {
        textBeautifier = new TextBeautifier();
    }
    if (!optionPanelManager) {
        optionPanelManager = new OptionPanelManager();
    }

    // 确保音乐状态管理器已初始化
    if (!musicStateManager) {
        initMusicStateManager();
    }
    
    let beautifiedContent;
    let isOptionBlock = false;
    let hasShownPanel = false;

    // ========== 【新增】当前分段的状态栏解析 ==========
    // 无论是否是状态栏分段，都尝试从分段文本中解析状态数据
    if (segment.text) {
        // 检查当前分段是否包含状态栏
        const statusMatch = segment.text.match(/```([\s\S]*?)```/);
        if (statusMatch) {
            console.log(`[分段同步] 分段 ${currentSegmentIndex + 1} 检测到状态栏，尝试解析`);
            // 解析状态栏
            if (syncParser && syncUpdater) {
                const parseResult = syncParser.parse(segment.text);
                if (parseResult.hasUpdate) {
                    let allChanges = [];
                    
                    if (Object.keys(parseResult.attributes).length > 0) {
                        const attrChanges = syncUpdater.updateAttributes(parseResult.attributes);
                        allChanges.push(...attrChanges);
                    }
                    
                    if (Object.keys(parseResult.stats).length > 0) {
                        const statChanges = syncUpdater.updateStats(parseResult.stats);
                        allChanges.push(...statChanges);
                    }
                    
                    if (parseResult.items.length > 0) {
                        syncUpdater.updateItems(parseResult.items);
                        allChanges.push({ action: 'items_updated', count: parseResult.items.length, category: 'items' });
                    }
                    
                    if (parseResult.characters.length > 0) {
                        const charChanges = syncUpdater.updateCharacters(parseResult.characters);
                        allChanges.push(...charChanges);
                    }
                    
                    if (parseResult.otherSections && Object.keys(parseResult.otherSections).length > 0) {
                        syncUpdater.updateOtherSections(parseResult.otherSections);
                        allChanges.push({ 
                            action: 'other_sections_updated', 
                            sections: Object.keys(parseResult.otherSections) 
                        });
                    }
                    
                    if (parseResult.day && gameState.day !== parseResult.day) {
                        gameState.day = parseResult.day;
                        allChanges.push({ action: 'day_changed', newValue: parseResult.day, category: 'game' });
                    }
                    if (parseResult.phase && gameState.phase !== parseResult.phase) {
                        gameState.phase = parseResult.phase;
                    }
                    if (parseResult.weather && gameState.weather !== parseResult.weather) {
                        gameState.weather = parseResult.weather;
                    }
                    if (parseResult.location && gameState.location !== parseResult.location) {
                        gameState.location = parseResult.location;
                    }
                    
                    if (allChanges.length > 0) {
                        renderSyncPanel();
                        saveSyncData();
                        
                        // ========== 【新增】强制刷新立绘 ==========
                        // 1. 重新从状态栏提取角色信息（更新角色的 visible 状态）
                        const charactersFromStatus = characterPortraitManager.extractCharactersFromStatus(segment.text);
                        for (const char of charactersFromStatus) {
                            const existingChar = characters.find(c => c.name === char.name);
                            if (existingChar) {
                                // 更新 characterPortraitManager 中的 visible 状态
                                characterPortraitManager.setCharacterVisible(char.name, char.visible);
                                console.log(`[立绘同步] 更新 ${char.name} 显隐: ${char.visible ? '显示' : '隐藏'}`);
                            }
                        }
                        
                        // 2. 强制刷新立绘渲染
                        if (multiPortraitRenderer && multiPortraitRenderer.container) {
                            const fullDialogueContext = (msg?.content || '') + '\n' + (segment.text || '');
                            multiPortraitRenderer.setLastDialogueText(fullDialogueContext);
                            multiPortraitRenderer.updatePortraitsFromDialogue(
                                fullDialogueContext, 
                                characterPortraitManager, 
                                true  // 强制更新
                            );
                        }
                        
                        console.log(`[分段同步] ✅ 分段 ${currentSegmentIndex + 1} 更新完成，立绘已刷新`);
                    }
                
                }
            }
        }
    }
    
    // 优先检查是否被 [[[ ... ]]] 包裹（选项栏）
    if (textBeautifier.isOptionBlock(segment.text)) {
        console.log('[CinemaMode] 检测到选项块');
        isoptionall = true;
        const optionsContent = textBeautifier.extractOptionsContent(segment.text);
        const options = optionPanelManager.extractOptions(optionsContent);
        const description = optionPanelManager.extractDescription(optionsContent);
        
        if (options.length > 0) {
            // 显示选项面板
            optionPanelManager.showPanel(options, description, async (selectedOption, customInput) => {
                console.log('[CinemaMode] 选项已选择:', selectedOption, customInput);
                // 回调已经在 sendToAI 中处理，这里可以添加额外逻辑
            });
            hasShownPanel = true;
        } else {
            // 没有选项，显示自定义输入面板
            optionPanelManager.showCustomOnlyPanel();
            hasShownPanel = true;
        }
        
        // 显示占位符
        beautifiedContent = `
            <div class="cinema-option-placeholder">
                <div class="cinema-option-placeholder-icon">🎮</div>
                <div class="cinema-option-placeholder-text">
                    ${options.length > 0 ? '出现了新的选项' : '等待你的指令'}
                </div>
                <div class="cinema-option-placeholder-subtext">
                    请在上方选项面板中选择
                </div>
                ${options.length > 0 ? `<div class="cinema-option-placeholder-hint">
                    ${options.map(opt => `${opt.key}. ${opt.text.substring(0, 30)}${opt.text.length > 30 ? '...' : ''}`).join(' | ')}
                </div>` : ''}
            </div>
        `;
        isOptionBlock = true;
    }
    // 检查是否是状态栏
    else if (segment.isStatus || textBeautifier.isStatusBlock(segment.text)) {
        beautifiedContent = textBeautifier.beautifyStatus(segment.text);
    }
    // 普通文本美化
    else {
        beautifiedContent = textBeautifier.beautifyNormalText(segment.text);
        isoptionall = false;
        // 检查普通文本中是否包含未包裹的选项
        if (!hasShownPanel && textBeautifier.containsOptions(segment.text)) {
            const options = optionPanelManager.extractOptions(segment.text);
            if (options.length > 0) {
                optionPanelManager.showPanel(options, '', (selectedOption) => {
                    console.log('[CinemaMode] 选项已选择:', selectedOption);
                });
                hasShownPanel = true;
            }
        }
    }
    
    // 更新文字
    if (cinemaElements.content) {
        cinemaElements.content.innerHTML = beautifiedContent;
        
        // 添加淡入效果
        cinemaElements.content.style.opacity = '0';
        setTimeout(() => {
            cinemaElements.content.style.opacity = '1';
            cinemaElements.content.style.transition = 'opacity 0.2s';
        }, 50);
    }
    
    // 根据内容类型设置不同样式
    if (segment.isStatus || textBeautifier.isStatusBlock(segment.text)) {
        cinemaElements.content.style.fontFamily = '';
        cinemaElements.content.style.fontSize = '17px';
        cinemaElements.content.style.backgroundColor = 'rgba(0,0,0,0.2)';
        cinemaElements.content.style.padding = '17px';
        cinemaElements.content.style.borderRadius = '17px';
        cinemaElements.content.style.lineHeight = '1.6';
    } else if (isOptionBlock) {
        cinemaElements.content.style.fontFamily = '';
        cinemaElements.content.style.fontSize = '19px';
        cinemaElements.content.style.backgroundColor = 'rgba(0,0,0,0.3)';
        cinemaElements.content.style.padding = '24px';
        cinemaElements.content.style.borderRadius = '17px';
        cinemaElements.content.style.textAlign = 'center';
    } else {
        cinemaElements.content.style.fontFamily = '';
        cinemaElements.content.style.fontSize = '23px';
        cinemaElements.content.style.backgroundColor = 'transparent';
        cinemaElements.content.style.padding = '0';
        cinemaElements.content.style.borderRadius = '0';
        cinemaElements.content.style.lineHeight = '1.8';
        cinemaElements.content.style.textAlign = 'left';
    }
    
    // 更新说话人
    const extractedName = textSplitter.extractCharacterName(segment);
    if (cinemaElements.speaker) {
        cinemaElements.speaker.textContent = extractedName || msg.name;
    }
    
    // 更新多角色立绘
    updateMultiPortrait(msg.content, msg, currentMessageIndex);
    
    // 更新场景背景
    updateBackground(msg.scene);
    
  
    // // 更新音乐
    // const mood = textSplitter.extractMoodFromSegment(segment);
    // // const finalMood = MUSIC_MAP[mood] || MUSIC_MAP[msg.mood] || '日常';
    // let musicToPlay = null;
    // console.log(`[音乐] 从分段文本中匹配: ${msg.content}`);
    // // 1. 优先从当前分段文本中提取音乐标记
    // const extractedMusic = extractMusicFromText(msg.content);
    // console.log(`[音乐] 从分段文本中匹配1: ${extractedMusic}`);
    // if (extractedMusic) {
    //     musicToPlay = extractedMusic;
    //     console.log(`[音乐] 从分段文本中匹配: ${musicToPlay}`);
    // }
    // else{
    //     musicToPlay = MUSIC_MAP[mood] || MUSIC_MAP[msg.mood] || '日常';
    // }


    // if (cinemaElements.music) {
    //     cinemaElements.music.textContent = `🎵 音乐: ${musicToPlay}`;
    // }
    // if (audioManager) {
    //     audioManager.playMusic(musicToPlay);
    // }

    // ========== 音乐更新（持久化状态） ==========
    let musicToPlay = null;
    let musicSource = null;
    let shouldUpdateMusic = false;
    
    // 优先级1：检查当前分段是否有音乐标记（最高优先级，会覆盖所有）
    if (segment.text) {
        const segmentMusic = extractMusicFromText(segment.text);
        if (segmentMusic) {
            musicToPlay = segmentMusic;
            musicSource = '分段标记';
            shouldUpdateMusic = true;
            console.log(`[音乐] 分段标记检测到: ${musicToPlay}`);
        }
    }
    
    // 优先级2：如果是分段的第一句，检查状态栏是否有音乐标记
    // 状态栏音乐只在消息开始时生效，但可以被分段标记覆盖
    if (!shouldUpdateMusic && currentSegmentIndex === 0 && msg.content) {
        // 检查状态栏中的音乐标记
        const statusMatch = msg.content.match(/```([\s\S]*?)```/);
        if (statusMatch) {
            const statusMusic = extractMusicFromText(statusMatch[1]);
            if (statusMusic) {
                // 缓存当前消息的默认音乐
                musicStateManager.setMessageDefaultMusic(currentMessageIndex, statusMusic);
                musicToPlay = statusMusic;
                musicSource = '状态栏';
                shouldUpdateMusic = true;
                console.log(`[音乐] 状态栏音乐检测到: ${statusMusic}`);
            }
        }
    }
    
    // 优先级3：如果没有分段标记，检查消息级别的音乐标记
    if (!shouldUpdateMusic && msg.content) {
        const msgMusic = extractMusicFromText(msg.content);
        if (msgMusic) {
            // 检查是否是分段的第一句，或者消息音乐与当前不同
            if (currentSegmentIndex === 0 || musicStateManager.getCurrentMusic() !== msgMusic) {
                musicToPlay = msgMusic;
                musicSource = '消息标记';
                shouldUpdateMusic = true;
                console.log(`[音乐] 消息标记检测到: ${msgMusic}`);
            }
        }
    }
    
    // 优先级4：如果是分段的第一句，检查是否有缓存的默认音乐
    if (!shouldUpdateMusic && currentSegmentIndex === 0) {
        const defaultMusic = musicStateManager.getMessageDefaultMusic(currentMessageIndex);
        if (defaultMusic && musicStateManager.getCurrentMusic() !== defaultMusic) {
            musicToPlay = defaultMusic;
            musicSource = '状态栏缓存';
            shouldUpdateMusic = true;
            console.log(`[音乐] 使用缓存的默认音乐: ${defaultMusic}`);
        }
    }
    
    // 优先级5：使用情绪分析（仅当没有任何音乐标记且没有正在播放的音乐时）
    if (!shouldUpdateMusic && !musicStateManager.getCurrentMusic()) {
        const mood = textSplitter.extractMoodFromSegment(segment);
        musicToPlay = MUSIC_MAP[mood] || MUSIC_MAP[msg.mood] || '日常';
        musicSource = '情绪分析';
        shouldUpdateMusic = true;
        console.log(`[音乐] 情绪分析结果: ${musicToPlay}`);
    }
    
    // 如果有音乐需要切换，请求音乐状态管理器
    if (shouldUpdateMusic && musicToPlay) {
        const canSwitch = musicStateManager.requestMusic(musicToPlay, musicSource);
        
        if (canSwitch) {
            // 播放音乐
            if (cinemaElements.music) {
                cinemaElements.music.textContent = `🎵 音乐: ${musicToPlay}`;
            }
            if (audioManager) {
                audioManager.playMusic(musicToPlay);
                console.log(`[音乐] 🎵 播放: ${musicToPlay} (${musicSource})`);
            }
        }
    } else if (musicStateManager.getCurrentMusic()) {
        // 没有新音乐请求，但已有音乐在播放，确保UI显示正确
        const currentMusic = musicStateManager.getCurrentMusic();
        if (cinemaElements.music && cinemaElements.music.textContent !== `🎵 音乐: ${currentMusic}`) {
            cinemaElements.music.textContent = `🎵 音乐: ${currentMusic}`;
        }
        console.log(`[音乐] 继续播放: ${currentMusic}`);
    }
    // ========== 新增：同步状态栏数据 ==========
    // 从当前消息中提取状态栏并同步
    if (msg.content && (msg.content.includes('```') || msg.content.includes('【'))) {
        console.log('[CinemaMode] 从当前消息同步状态栏');
        
        // 提取状态栏内容
        const statusMatch = msg.content.match(/```([\s\S]*?)```/);
        if (statusMatch) {
            const statusContent = statusMatch[1];
            
            // 使用同步解析器解析
            if (!syncParser) syncParser = new SmartStateParser();
            const parseResult = syncParser.parse(msg.content); // 注意：这里传入完整消息，因为 parse 内部会提取 ```
            
            if (parseResult && parseResult.otherSections && Object.keys(parseResult.otherSections).length > 0) {
                console.log('[同步] 从消息中解析到其他栏目:', parseResult.otherSections);
                
                if (!gameState.otherSections) gameState.otherSections = {};
                
                for (const [sectionName, content] of Object.entries(parseResult.otherSections)) {
                    if (sectionName.includes('第') && sectionName.includes('天')) continue;
                    gameState.otherSections[sectionName] = content;
                    console.log(`[同步] 保存栏目: ${sectionName}`);
                }
                
                // 刷新同步面板
                if (typeof renderSyncPanel === 'function') {
                    renderSyncPanel();
                }
                saveSyncData();
            }
        }
    }

    // 更新场景文字
    if (cinemaElements.scene) {
        cinemaElements.scene.innerHTML = `🎬 场景: ${msg.scene}`;
    }
    
    updateSegmentProgress();
}

// 从文本中提取音乐名称
function extractMusicFromText(text) {
    if (!text) return null;
    
    // 格式1: 🎵 音乐：温馨
    let match = text.match(/🎵\s*音乐[：:]\s*([^\s\n]+)/);
    if (match) return match[1].trim();
    
    // 格式2: [音乐：浪漫]
    match = text.match(/\[音乐[：:]\s*([^\s\n\]]+)\]/);
    if (match) return match[1].trim();
    
    // 格式3: 【音乐：忧伤】
    match = text.match(/【音乐[：:]\s*([^\s\n】]+)/);
    if (match) return match[1].trim();
    
    // 格式4: 播放音乐：欢乐
    match = text.match(/播放音乐[：:]\s*([^\s\n]+)/);
    if (match) return match[1].trim();
    
    // 格式5: BGM：日常
    match = text.match(/BGM[：:]\s*([^\s\n]+)/i);
    if (match) return match[1].trim();
    
    return null;
}
// ==================== 添加重置功能 ====================

function resetCharacterPortraits() {
    if (characterPortraitManager) {
        characterPortraitManager.characterMap.clear();
        // characterPortraitManager.usedImages.clear();
        characterPortraitManager.resetUsedImages();
        characterPortraitManager.customPortraits.clear();
        console.log('[CinemaMode] 角色立绘映射已重置');
    }
    if (multiPortraitRenderer) {
        multiPortraitRenderer.clear();
        multiPortraitRenderer.lastDisplayNames = [];
    }
    // lastProcessedMessageHash = null;
}

// ==================== 添加调试面板功能（可选） ====================

function showCharacterDebugInfo() {
    if (!characterPortraitManager) return;
    
    const characters = characterPortraitManager.getAllCharacters();
    const registeredCount = characters.length;
    const usedImagesCount = characterPortraitManager.usedImages.size;
    
    console.log('[CinemaMode] 角色调试信息:');
    console.log(`  已注册角色数: ${registeredCount}`);
    console.log(`  已使用图片数: ${usedImagesCount}`);
    console.log(`  角色列表: ${characters.map(c => c.name).join(', ')}`);
    
    showCinemaToast(`已注册 ${registeredCount} 位角色`, 'info');
}

// ==================== 图片加载器 ====================

class ImageLoader {
    constructor() {
        this.cache = new Map();
    }
    
    loadBackground(sceneName) {
        // 支持的图片格式列表（按优先级排序）
        const formats = ['jpg', 'png', 'jpeg', 'webp', 'gif'];
        
        // 返回一个包含所有可能路径的对象，实际使用时按顺序尝试
        return formats.map(format => `${BASE_PATH}images/background/${sceneName}.${format}`);
    }

    async tryLoadImage(urls, element, callback) {
        for (const url of urls) {
            const success = await this.trySingleLoad(url);
            if (success) {
                if (callback) callback(url);
                return true;
            }
        }
        return false;
    }
    
    trySingleLoad(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    preloadImage(src) {
        if (this.cache.has(src)) return this.cache.get(src);
        const img = new Image();
        img.src = src;
        this.cache.set(src, img);
        return img;
    }
}

// ==================== 智能文本切分器 ====================

class TextSplitter {
    constructor() {
        this.rules = [
            // 段落分隔（两个连续换行）
            { pattern: /\n\s*\n/g, type: 'paragraph', priority: 0.5 },
            
            // 句号/感叹号/问号分隔
            { pattern: /([^。！？!?]+[。！？!?])/g, type: 'sentence', priority: 3 },
            
            // 逗号/分号分隔
            { pattern: /([^，,；;]+[，,；;])/g, type: 'clause', priority: 4 },
            
            // 固定长度切分
            { type: 'fixed', maxLength: 80, priority: 5 }
        ];
    }
    
    split(text, maxLength = 100) {
        if (!text || text.trim() === '') return [];
        
        // ========== 第一步：提取并保护特殊内容 ==========
        const protectedBlocks = [];
        let protectedText = text;
        
        // 【修复1】保护 [[[ ... ]]] 选项栏
        protectedText = protectedText.replace(/\[\[\[([\s\S]*?)\]\]\]/g, (match, content) => {
            const placeholder = `__PROTECTED_OPTION_${protectedBlocks.length}__`;
            protectedBlocks.push({
                placeholder: placeholder,
                original: match,
                type: 'option',
                content: content  // 保存内容供后续解析
            });
            return placeholder;
        });
        
        // 【修复2】保护 ``` ``` 状态栏（每个独立保护）
        protectedText = protectedText.replace(/```([\s\S]*?)```/g, (match, content) => {
            const placeholder = `__PROTECTED_STATUS_${protectedBlocks.length}__`;
            protectedBlocks.push({
                placeholder: placeholder,
                original: match,
                type: 'status',
                content: content  // 保存状态栏内容
            });
            return placeholder;
        });
        
        // 保护 *** *** 状态栏
        protectedText = protectedText.replace(/\*\*\*([\s\S]*?)\*\*\*/g, (match, content) => {
            const placeholder = `__PROTECTED_STATUS_${protectedBlocks.length}__`;
            protectedBlocks.push({
                placeholder: placeholder,
                original: match,
                type: 'status',
                content: content
            });
            return placeholder;
        });
        
        // 保护 【状态栏】格式（没有```包裹的状态栏）
        protectedText = protectedText.replace(/【当前状态】[\s\S]*?(?=\n\n|$)/g, (match) => {
            const placeholder = `__PROTECTED_STATUS_${protectedBlocks.length}__`;
            protectedBlocks.push({
                placeholder: placeholder,
                original: match,
                type: 'status',
                content: match
            });
            return placeholder;
        });
        
        // ========== 第二步：对保护后的文本进行切分 ==========
        const segments = [];
        let remaining = protectedText;
        
        for (const rule of this.rules) {
            if (remaining.length <= maxLength) {
                if (remaining.trim()) {
                    segments.push({
                        text: remaining.trim(),
                        type: 'final',
                        isStatus: false,
                        isOption: false
                    });
                }
                break;
            }
            
            if (rule.pattern) {
                const result = this.splitByPattern(remaining, rule);
                if (result.segments.length > 0) {
                    segments.push(...result.segments);
                    remaining = result.remaining;
                }
            }
            
            if (remaining.length <= maxLength) {
                if (remaining.trim()) {
                    segments.push({
                        text: remaining.trim(),
                        type: 'final',
                        isStatus: false,
                        isOption: false
                    });
                }
                break;
            }
        }
        
        if (remaining.length > maxLength) {
            const fixedSegments = this.splitByFixedLength(remaining, maxLength);
            segments.push(...fixedSegments);
        }
        
        // ========== 第三步：恢复保护的内容 ==========
        const finalSegments = [];
        for (const seg of segments) {
            let restoredText = seg.text;
            let isOption = false;
            let isStatus = false;
            let statusContent = null;
            
            for (const block of protectedBlocks) {
                if (restoredText.includes(block.placeholder)) {
                    restoredText = restoredText.replace(block.placeholder, block.original);
                    if (block.type === 'option') {
                        isOption = true;
                    } else if (block.type === 'status') {
                        isStatus = true;
                        statusContent = block.content;  // 保存状态栏内容
                    }
                }
            }
            
            finalSegments.push({
                ...seg,
                text: restoredText,
                isStatus: isStatus || seg.type === 'status' || restoredText.includes('【当前状态】') || restoredText.includes('```'),
                isOption: isOption || restoredText.includes('[[[') || restoredText.includes(']]]'),
                statusContent: statusContent  // 【新增】保存状态栏原始内容
            });
        }
        
        // ========== 第四步：确保特殊块独立成段 ==========
        const result = [];
        for (const seg of finalSegments) {
            // 选项栏独立成段
            if (seg.isOption) {
                result.push(seg);
            }
            // 状态栏独立成段（优先使用保存的 statusContent）
            else if (seg.isStatus) {
                result.push(seg);
            }
            // 检查普通文本中是否包含特殊标记（但不再自动标记为状态栏）
            else if (seg.text.includes('```') || seg.text.includes('[[')) {
                // 检查是否是状态栏（但只标记真正的状态栏）
                const isRealStatus = seg.text.includes('```') && /```[\s\S]*?```/.test(seg.text);
                result.push({
                    ...seg,
                    isStatus: isRealStatus,
                    isOption: seg.text.includes('[[')
                });
            } else {
                result.push(seg);
            }
        }
        
        // ========== 第五步：过滤空片段 ==========
        const filteredSegments = [];
        for (const seg of result) {
            const trimmedText = seg.text?.trim();
            if (trimmedText && trimmedText.length > 0) {
                // 检查是否只有标点符号或空白
                const hasContent = /[^\s\[\]【】（）\.,!?;:、。！？；：""'']/.test(trimmedText);
                if (hasContent || trimmedText.length > 3) {
                    filteredSegments.push({
                        ...seg,
                        text: trimmedText
                    });
                }
            }
        }
        
        // 如果过滤后没有片段，至少返回一个包含原始文本的片段
        if (filteredSegments.length === 0 && text.trim()) {
            return [{
                text: text.trim(),
                type: 'final',
                isStatus: false,
                isOption: false,
                statusContent: null
            }];
        }
        
        return filteredSegments;
    }
    
    // ========== 【新增】检测是否包含多个状态栏 ==========
    hasMultipleStatusBlocks(text) {
        const statusMatches = text.match(/```([\s\S]*?)```/g);
        return statusMatches && statusMatches.length > 1;
    }
    
    // ========== 【新增】获取所有状态栏内容 ==========
    extractAllStatusBlocks(text) {
        const blocks = [];
        const regex = /```([\s\S]*?)```/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            blocks.push({
                content: match[1],
                fullMatch: match[0],
                index: match.index
            });
        }
        return blocks;
    }
    
    splitByPattern(text, rule) {
        const segments = [];
        let lastIndex = 0;
        let match;
        const pattern = new RegExp(rule.pattern.source, 'g');
        
        while ((match = pattern.exec(text)) !== null) {
            // 跳过空匹配
            if (match[0].length === 0) continue;
            
            // 添加匹配前的文本（非空）
            if (match.index > lastIndex) {
                const beforeText = text.substring(lastIndex, match.index);
                if (beforeText.trim()) {
                    segments.push({
                        text: beforeText.trim(),
                        type: rule.type,
                        isStatus: false,
                        isOption: false,
                        statusContent: null
                    });
                }
            }
            
            // 添加匹配的片段（非空）
            const matchedText = match[0];
            if (matchedText.trim()) {
                segments.push({
                    text: matchedText.trim(),
                    type: rule.type === 'status' ? 'status' : rule.type,
                    isStatus: rule.type === 'status',
                    isOption: false,
                    statusContent: null
                });
            }
            
            lastIndex = match.index + matchedText.length;
        }
        
        // 添加剩余文本（非空）
        const remaining = text.substring(lastIndex);
        
        return { segments, remaining };
    }
    
    splitByFixedLength(text, maxLength) {
        const segments = [];
        let remaining = text;
        
        while (remaining.length > maxLength) {
            let splitPoint = maxLength;
            const lastSpace = remaining.lastIndexOf(' ', maxLength);
            const lastPunctuation = Math.max(
                remaining.lastIndexOf('，', maxLength),
                remaining.lastIndexOf(',', maxLength),
                remaining.lastIndexOf('、', maxLength)
            );
            
            splitPoint = Math.max(lastSpace, lastPunctuation);
            if (splitPoint < maxLength / 2) splitPoint = maxLength;
            
            segments.push({
                text: remaining.substring(0, splitPoint).trim(),
                type: 'fixed',
                isStatus: false,
                isOption: false,
                statusContent: null
            });
            remaining = remaining.substring(splitPoint);
        }
        
        if (remaining.trim()) {
            segments.push({
                text: remaining.trim(),
                type: 'fixed',
                isStatus: false,
                isOption: false,
                statusContent: null
            });
        }
        
        return segments;
    }
    
    isStatusLine(text) {
        // 如果是选项栏，不是状态栏
        if (text.includes('[[[') && text.includes(']]]')) return false;
        
        const statusKeywords = ['身体状况', '库存', '装备', '金币', '等级', '经验', '技能', '法术', '能力', '关系', '目标', '位置', '威胁', 'BP', 'EXP', 'G'];
        const hasStatusKeyword = statusKeywords.some(kw => text.includes(kw));
        const hasStatusMarkers = text.includes('：') && (text.includes('\n') || text.includes('  '));
        return hasStatusKeyword || hasStatusMarkers;
    }
    
    isOptionBlock(text) {
        // 检查是否被 [[[ ... ]]] 包裹
        return /\[\[\[[\s\S]*?\]\]\]/.test(text);
    }
    
    extractCharacterName(segment) {
        const namePattern = /^([\u4e00-\u9fa5]{2,4})[：:]/;
        const match = segment.text.match(namePattern);
        return match ? match[1] : null;
    }
    
    extractEmotion(segment) {
        return extractEmotionFromText(segment.text);
    }
    
    extractMoodFromSegment(segment) {
        return extractEmotionFromText(segment.text);
    }
}
// ==================== 全局变量 ====================

let textSplitter = null;
let audioManager = null;
let imageLoader = null;
let characterPortraitManager = null;
let multiPortraitRenderer = null;

// 获取扩展基础路径
function getExtensionBasePath() {
    // 方法1：通过当前脚本的 src 获取
    const scripts = document.getElementsByTagName('script');
    for (const script of scripts) {
        if (script.src && script.src.includes('CinemaMode')) {
            // 获取脚本所在目录
            let path = script.src.substring(0, script.src.lastIndexOf('/'));
            console.log('[CinemaMode] 通过脚本路径获取:', path);
            return path + '/';
        }
    }
    
    // 方法2：通过 SillyTavern 的上下文获取扩展基础路径
    if (context && context.getExtensionsPath) {
        const extPath = context.getExtensionsPath();
        console.log('[CinemaMode] 通过 context 获取:', extPath);
        return extPath + 'CinemaMode/';
    }
    
    // 方法3：默认路径（相对路径）
    console.log('[CinemaMode] 使用默认路径');
    return '/data/default-user/extensions/CinemaMode/';
}

const BASE_PATH = getExtensionBasePath();
console.log('[CinemaMode] 资源基础路径:', BASE_PATH);



// 在 init 或 openCinemaMode 函数中
// 修改 initContextNames 函数
function initContextNames() {
    if (context && context.chat && context.chat.length > 0) {
        // 遍历获取非用户的名字（AI角色名）- 取最后一个出现的
        let foundAIName = null;
        let foundUserName = null;
        
        for (const msg of context.chat) {
            if (!msg.is_user && msg.name && msg.name !== 'AI' && msg.name !== '助手') {
                foundAIName = msg.name;
            }
            if (msg.is_user && msg.name) {
                foundUserName = msg.name;
            }
        }
        
        if (foundAIName) {
            currentAIChatName = foundAIName;
        }
        if (foundUserName) {
            currentUserName = foundUserName;
        }
    }
    
    console.log(`[CinemaMode] 名字初始化: 用户=${currentUserName}, AI=${currentAIChatName}`);
}
// ==================== 初始化 ====================

function init() {
    if (typeof SillyTavern === 'undefined' || !SillyTavern.getContext) {
        setTimeout(init, 500);
        return;
    }
    
    context = SillyTavern.getContext();
    textSplitter = new TextSplitter();
    console.log('[CinemaMode] 上下文获取成功，切分器已初始化');
    addCinemaButton();
    initContextNames()
}

function addCinemaButton() {
    if (document.getElementById('cinema-mode-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'cinema-mode-btn';
    btn.innerHTML = '🎬 影院模式';
    btn.style.cssText = `
        position: fixed;
        bottom: 480px;
        right: 20px;
        background: linear-gradient(135deg, #ff69b4, #ff4444);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 100000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: transform 0.2s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = openCinemaMode;
    document.body.appendChild(btn);
}

// ==================== 本地存储管理 ====================

class StorageManager {
    constructor() {
        this.storageKey = 'cinema_mode_data';
    }
    
    // 保存影院模式数据
    save(data) {
        try {
            const saveData = {
                cinemaMessages: data.cinemaMessages,
                contextMessages: data.contextMessages,
                currentMessageIndex: data.currentMessageIndex,
                currentLocation: data.currentLocation,
                currentTime: data.currentTime,
                currentWeather: data.currentWeather,
                characters: data.characters,
                gameState: data.gameState,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            console.log('[Storage] 数据已保存');
            return true;
        } catch (e) {
            console.error('[Storage] 保存失败:', e);
            return false;
        }
    }
    
    // 导出到文件
    exportToFile() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) {
                console.warn('[Storage] 没有可导出的存档');
                return false;
            }
            
            const data = JSON.parse(raw);
            const saveData = {
                ...data,
                exportVersion: '1.0',
                exportTime: new Date().toISOString()
            };
            
            const jsonStr = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `cinema_save_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[Storage] 存档已导出到文件');
            return true;
        } catch (e) {
            console.error('[Storage] 导出失败:', e);
            return false;
        }
    }
    
    // 加载影院模式数据
    load() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return null;
            
            const data = JSON.parse(raw);
            console.log('[Storage] 数据已加载，时间:', new Date(data.timestamp).toLocaleString());
            return data;
        } catch (e) {
            console.error('[Storage] 加载失败:', e);
            return null;
        }
    }
    
    // 清除数据
    clear() {
        localStorage.removeItem(this.storageKey);
        console.log('[Storage] 数据已清除');
    }
    
    // 检查是否有保存的数据
    hasData() {
        return localStorage.getItem(this.storageKey) !== null;
    }
    
    // ========== 新增：从文件导入存档 ==========
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // 验证存档格式
                    if (!importedData.cinemaMessages && !importedData.contextMessages) {
                        reject(new Error('无效的存档文件格式'));
                        return;
                    }
                    
                    // 保存到 localStorage
                    localStorage.setItem(this.storageKey, JSON.stringify(importedData));
                    console.log('[Storage] 存档已导入');
                    resolve(importedData);
                } catch (err) {
                    reject(err);
                }
            };
            
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsText(file);
        });
    }
}

// 全局存储实例
let storageManager = null;

// ==================== 影院模式核心 ====================

// ==================== 上下文总结管理器 ====================

class ContextSummaryManager {
    constructor() {
        this.summaries = []; // 存储总结历史
        this.currentSummary = null;
        this.isOpen = false;
    }
    
    // 创建总结UI
    createSummaryUI() {
        if (document.getElementById('cinema-summary-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'cinema-summary-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 700px;
            max-width: 90vw;
            max-height: 85vh;
            background: linear-gradient(145deg, rgba(30,20,50,0.98), rgba(20,15,40,0.98));
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255,105,180,0.6);
            border-radius: 24px;
            padding: 20px;
            color: #fff;
            z-index: 200020;
            font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
            display: flex;
            flex-direction: column;
            gap: 15px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 0 50px rgba(255,105,180,0.3);
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 2px solid rgba(255,105,180,0.3);">
                <span style="font-size: 20px; font-weight: bold; color: #ff69b4;">📝 上下文总结器</span>
                <button id="summary-close" style="
                    background: rgba(255,68,68,0.3);
                    border: none;
                    color: #ff8888;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                ">✕</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 16px; color: #aaa;">📋 总结提示词</label>
                <textarea id="summary-prompt" style="
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,105,180,0.3);
                    border-radius: 12px;
                    padding: 10px;
                    color: #fff;
                    font-size: 17px;
                    resize: vertical;
                    font-family: monospace;
                " rows="4"></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="summary-generate" style="
                    background: linear-gradient(135deg, #ff69b4, #ff4444);
                    border: none;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 17px;
                ">🤖 一键总结</button>
                <button id="summary-export" style="
                    background: rgba(78,205,196,0.3);
                    border: 1px solid #4ecdc4;
                    color: #4ecdc4;
                    padding: 8px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 17px;
                ">💾 保存总结</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 16px; color: #aaa;">📄 总结内容（可编辑）</label>
                <textarea id="summary-content" style="
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,105,180,0.3);
                    border-radius: 12px;
                    padding: 12px;
                    color: #ddd;
                    font-size: 17px;
                    resize: vertical;
                    min-height: 200px;
                    font-family: monospace;
                    line-height: 1.5;
                " placeholder="点击「一键总结」生成总结..."></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,105,180,0.2);">
                <div style="display: flex; gap: 10px;">
                    <button id="summary-build" style="
                        background: rgba(255,193,7,0.3);
                        border: 1px solid #ffc107;
                        color: #ffc107;
                        padding: 8px 20px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 17px;
                    ">🔨 构建压缩上下文</button>
                    <button id="summary-backup" style="
                        background: rgba(255,255,255,0.1);
                        border: 1px solid #888;
                        color: #ccc;
                        padding: 8px 20px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 17px;
                    ">📦 导出备份</button>
                </div>
                <div>
                    <span id="summary-stats" style="font-size: 16px; color: #888;">消息数: 0</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 绑定事件
        document.getElementById('summary-close').onclick = () => this.hide();
        document.getElementById('summary-generate').onclick = () => this.generateSummary();
        document.getElementById('summary-export').onclick = () => this.saveSummary();
        document.getElementById('summary-build').onclick = () => this.buildCompressedContext();
        document.getElementById('summary-backup').onclick = () => this.backupCurrentContext();
        
        // 设置默认提示词
        const defaultPrompt = `请总结以下对话的主要内容。要求：
1. 按时间顺序概括剧情发展
2. 记录重要的角色互动和好感度变化
3. 记录关键的决策和选择
4. 记录当前的目标和未完成的事项
5. 较详细的记录重要事件，简要记录次要事件，梳理人物关系。
6. 使用中文输出

对话内容：`;
        document.getElementById('summary-prompt').value = defaultPrompt;
        
        this.panel = panel;
    }
    
    show() {
        if (!this.panel) this.createSummaryUI();
        this.updateStats();
        this.panel.style.opacity = '1';
        this.panel.style.visibility = 'visible';
        this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
        this.isOpen = true;
    }
    
    hide() {
        if (!this.panel) return;
        this.panel.style.opacity = '0';
        this.panel.style.visibility = 'hidden';
        this.panel.style.transform = 'translate(-50%, -50%) scale(0.9)';
        this.isOpen = false;
    }
    
    updateStats() {
        const statsSpan = document.getElementById('summary-stats');
        if (statsSpan && contextManager) {
            const msgCount = contextManager.messages?.length || 0;
            statsSpan.textContent = `消息数: ${msgCount} | 轮次: ${Math.floor(msgCount / 2)}`;
        }
    }
    
    async generateSummary() {
        const promptInput = document.getElementById('summary-prompt');
        const contentArea = document.getElementById('summary-content');
        
        if (!promptInput || !contentArea) return;
        
        const prompt = promptInput.value;
        if (!prompt) {
            showCinemaToast('请先设置总结提示词', 'warning');
            return;
        }
        
        // 获取所有消息
        if (!contextManager || !contextManager.messages || contextManager.messages.length === 0) {
            showCinemaToast('没有消息可总结', 'warning');
            return;
        }
        
        showCinemaToast('正在生成总结...', 'info');
        contentArea.value = '生成中...';
        
        try {
            // 构建要总结的对话内容
            let conversationText = '';
            for (const msg of contextManager.messages) {
                const role = msg.role === 'user' ? '玩家' : 'AI';
                // 限制每条消息长度，避免超长
                let content = msg.content;
                if (content.length > 5000) {
                    content = content.substring(0, 5000) + '...';
                }
                conversationText += `\n[${role}]: ${content}\n`;
            }
            
            const fullPrompt = conversationText + prompt;
            console.log(`[Summary]总结提示  ${fullPrompt} `);
            // 调用AI生成总结
            const context = SillyTavern.getContext();
            if (context && context.generateQuietPrompt) {
                const result = await context.generateQuietPrompt({
                    quietPrompt: `${fullPrompt}`
                });
                
                if (result) {
                    contentArea.value = result;
                    showCinemaToast('总结生成完成', 'success');
                } else {
                    contentArea.value = '生成失败，请重试';
                    showCinemaToast('生成失败', 'error');
                }
            } else {
                contentArea.value = '无法连接到AI，请检查SillyTavern连接';
                showCinemaToast('无法连接到AI', 'error');
            }
        } catch (error) {
            console.error('[Summary] 生成总结失败:', error);
            contentArea.value = '生成失败: ' + error.message;
            showCinemaToast('生成失败', 'error');
        }
    }
    
    saveSummary() {
        const contentArea = document.getElementById('summary-content');
        if (!contentArea || !contentArea.value) {
            showCinemaToast('没有内容可保存', 'warning');
            return;
        }
        
        const summary = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            content: contentArea.value,
            messageCount: contextManager?.messages?.length || 0
        };
        
        this.summaries.push(summary);
        
        // 保存到localStorage
        localStorage.setItem('cinema_summaries', JSON.stringify(this.summaries));
        
        showCinemaToast('总结已保存', 'success');
    }
    
    async backupCurrentContext() {
        if (!contextManager || !contextManager.messages) {
            showCinemaToast('没有上下文可备份', 'warning');
            return;
        }
        
        // 收集完整存档数据
        const saveData = {
            // 上下文消息
            contextMessages: contextManager.exportForSave(),
            // 影院消息
            cinemaMessages: cinemaMessages || [],
            // 当前进度
            currentMessageIndex: currentMessageIndex || 0,
            currentLocation: currentLocation || '默认',
            currentTime: currentTime || '',
            currentWeather: currentWeather || '',
            // 角色数据
            characters: characters || [],
            // 游戏状态
            gameState: gameState || { attributes: {}, stats: {}, items: [] },
            // 立绘数据
            characterPortraitData: null,
            // 时间戳和版本
            timestamp: Date.now(),
            exportVersion: '1.0',
            exportTime: new Date().toISOString()
        };
        
        // 收集立绘管理器数据（如果有）
        if (characterPortraitManager) {
            try {
                const characterMapObj = {};
                if (characterPortraitManager.characterMap && typeof characterPortraitManager.characterMap.forEach === 'function') {
                    characterPortraitManager.characterMap.forEach((value, key) => {
                        characterMapObj[key] = value;
                    });
                }
                
                const characterVisibleObj = {};
                if (characterPortraitManager.characterVisible && typeof characterPortraitManager.characterVisible.forEach === 'function') {
                    characterPortraitManager.characterVisible.forEach((value, key) => {
                        characterVisibleObj[key] = value;
                    });
                }
                
                const characterGenderObj = {};
                if (characterPortraitManager.characterGender && typeof characterPortraitManager.characterGender.forEach === 'function') {
                    characterPortraitManager.characterGender.forEach((value, key) => {
                        characterGenderObj[key] = value;
                    });
                }
                
                saveData.characterPortraitData = {
                    characterMap: characterMapObj,
                    characterVisible: characterVisibleObj,
                    characterGender: characterGenderObj
                };
            } catch (err) {
                console.warn('[Storage] 保存立绘数据失败:', err);
            }
        }
        
        const jsonStr = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cinema_save_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showCinemaToast('存档已导出', 'success');
    }
    
    async buildCompressedContext() {
        const contentArea = document.getElementById('summary-content');
        if (!contentArea || !contentArea.value) {
            showCinemaToast('请先生成总结内容', 'warning');
            return;
        }
        
        // 确认对话框
        const confirmed = confirm(
            '⚠️ 警告：此操作将压缩当前上下文！\n\n' +
            '保留内容：\n' +
            '- 最初的0条消息（开场，因为已经自带傻酒馆的消息）\n' +
            '- 最近5条消息（近期对话）\n' +
            '- 其他消息将替换为总结\n\n' +
            '是否先导出当前上下文作为备份？'
        );
        
        if (confirmed) {
            // 先导出备份
            await this.backupCurrentContext();
            
            // 二次确认
            const secondConfirm = confirm('备份已完成！是否继续执行上下文压缩？');
            if (!secondConfirm) return;
        }
        
        if (!contextManager) return;
        
        const messages = contextManager.messages;
        if (messages.length <= 8) {
            showCinemaToast('消息数量较少，无需压缩', 'info');
            return;
        }

        // 保存原始的角色名字映射
        const originalNameMap = new Map();
        if (cinemaMessages && cinemaMessages.length > 0) {
            for (const msg of cinemaMessages) {
                if (msg.name && msg.name !== 'AI' && msg.name !== '叙述者') {
                    const key = msg.index !== undefined ? msg.index : `content_${msg.content.substring(0, 50)}`;
                    if (!originalNameMap.has(key)) {
                        originalNameMap.set(key, msg.name);
                    }
                }
            }
        }
        
        // 构建压缩后的消息列表
        const compressedMessages = [];
        
        // 保留开场白（前2条消息）
        const keepStartCount = 0;
        for (let i = 0; i < Math.min(keepStartCount, messages.length); i++) {
            compressedMessages.push(messages[i]);
        }
        
        // 添加总结消息
        const summaryContent = contentArea.value;
        compressedMessages.push({
            role: 'assistant',
            content: `【剧情总结】\n${summaryContent}\n\n[以上是之前剧情的总结，请基于此继续剧情]`,
            timestamp: Date.now(),
            isSummary: true,
            name: '系统'  // 添加名字
        });
        
        // 保留最近 N 条消息（保持原有的顺序和 role）
        const keepRecentCount = 6;  // 保留最近3轮对话（6条消息）
        const startIndex = Math.max(0, messages.length - keepRecentCount);
        
        // 【关键】按原有顺序添加，不要反转
        for (let i = startIndex; i < messages.length; i++) {
            const msg = messages[i];
            // 确保 role 正确（user 或 assistant）
            const role = msg.role === 'user' ? 'user' : 'assistant';
            compressedMessages.push({
                role: role,
                content: msg.content,
                name: msg.name || (role === 'user' ? '用户' : 'AI'),
                timestamp: msg.timestamp,
                originalIndex: i  // 保留原始索引用于调试
            });
        }
        
        // 替换contextManager中的消息
    contextManager.messages = compressedMessages;
    
        // 【修复】重建 cinemaMessages 时保留原始名字
        if (cinemaModeActive && cinemaMessages) {
            const stMessages = contextManager.exportToSTFormat();
            const newCinemaMessages = formatMessages(stMessages);
            
            // 恢复原始的名字
            for (let i = 0; i < newCinemaMessages.length; i++) {
                const originalName = originalNameMap.get(newCinemaMessages[i].index);
                if (originalName && newCinemaMessages[i].name !== originalName) {
                    newCinemaMessages[i].name = originalName;
                    console.log(`[压缩] 恢复角色名: ${originalName}`);
                }
            }
            
            cinemaMessages = newCinemaMessages;
            
            // 刷新UI
            updateMessageListUI();
            updateProgressDisplay();
            
            // 跳转到第一条消息
            goToMessage(0);
        }
        
        showCinemaToast(`上下文压缩完成！消息数: ${messages.length} → ${compressedMessages.length}`, 'success');
        this.updateStats();
        
        // 关闭面板
        this.hide();
    }
    
    loadSavedSummaries() {
        const saved = localStorage.getItem('cinema_summaries');
        if (saved) {
            try {
                this.summaries = JSON.parse(saved);
                console.log(`[Summary] 加载了 ${this.summaries.length} 条保存的总结`);
            } catch(e) {}
        }
    }
}

class ContextManager {
    constructor() {
        this.messages = [];      // 存储对话历史
        this.systemPrompt = '';  // 系统提示
        this.currentIndex = 0;   // 当前播放位置
        this.aiName = '';        // AI角色名（如"电竞梦之队"）
        this.userName = '';      // 用户角色名
    }
    
    // 初始化系统提示
    initSystemPrompt(prompt) {
        this.systemPrompt = prompt;
        console.log('[ContextManager] 系统提示已设置');
    }
    
    // 添加用户消息
    addUserMessage(content, optionKey = null) {
        let message = content;
        if (optionKey) {
            message = `[选择了选项 ${optionKey}] ${content}`;
        }
        
        this.messages.push({
            role: 'user',
            content: message,
            name: this.userName || '用户',
            timestamp: Date.now()
        });
        
        this.currentIndex = this.messages.length - 1;
        console.log(`[ContextManager] 添加用户消息: ${message.substring(0, 50)}...`);
        return this;
    }
    
    // 添加AI消息
    addAIMessage(content) {
        this.messages.push({
            role: 'assistant',
            content: content,
            name: this.aiName || 'AI',
            timestamp: Date.now()
        });
        
        this.currentIndex = this.messages.length - 1;
        console.log(`[ContextManager] 添加AI消息: ${content.substring(0, 50)}...`);
        return this;
    }
    
    // 获取当前所有消息（用于构建API请求）
    getMessagesForAPI() {
        const messages = [];
        
        // 添加系统提示
        if (this.systemPrompt) {
            messages.push({
                role: 'system',
                content: this.systemPrompt
            });
        }
        
        // 添加历史消息
        for (const msg of this.messages) {
            messages.push({
                role: msg.role,
                name: msg.name,
                content: msg.content
            });
        }
        
        return messages;
    }
    
    // 获取最后一条AI消息
    getLastAIMessage() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            if (this.messages[i].role === 'assistant') {
                return this.messages[i];
            }
        }
        return null;
    }
    
    // 获取所有消息（用于显示）
    getAllMessages() {
        return this.messages;
    }
    
    // 重置上下文
    reset() {
        this.messages = [];
        this.currentIndex = 0;
        console.log('[ContextManager] 上下文已重置');
    }
    
    // 导出为可保存的格式
    exportForSave() {
        return {
            messages: this.messages,
            systemPrompt: this.systemPrompt,
            currentIndex: this.currentIndex,
            aiName: this.aiName,
            userName: this.userName
        };
    }
    
    // 从保存的数据导入
    importFromSave(data) {
        this.messages = data.messages || [];
        this.systemPrompt = data.systemPrompt || '';
        this.currentIndex = data.currentIndex || 0;
        this.aiName = data.aiName || '';
        this.userName = data.userName || '';
        console.log(`[ContextManager] 导入了 ${this.messages.length} 条消息`);
    }
    
    // 导入已有聊天记录
    importFromChat(chat, systemPrompt = '') {
        this.systemPrompt = systemPrompt;
        this.messages = [];
        
        for (const msg of chat) {
            const role = msg.is_user ? 'user' : 'assistant';
            const speakerName = msg.name || (msg.is_user ? '用户' : 'AI');
            
            // 记录 AI 和用户的名字
            if (!msg.is_user && !this.aiName) {
                this.aiName = speakerName;
            }
            if (msg.is_user && !this.userName) {
                this.userName = speakerName;
            }
            
            this.messages.push({
                role: role,
                content: msg.mes,
                name: speakerName,
                timestamp: msg.send_date || Date.now(),
                is_user: msg.is_user
            });
        }
        
        console.log(`[ContextManager] 导入了 ${this.messages.length} 条消息`);
    }
    
    // 导出为SillyTavern格式
    // 在 ContextManager 类中修改 exportToSTFormat 方法
        exportToSTFormat() {
            return this.messages.map(msg => ({
                mes: msg.content,
                name: msg.name || (msg.role === 'user' ? (this.userName || '用户') : (this.aiName || 'AI')),  // 保留名字
                is_user: msg.role === 'user',
                send_date: msg.timestamp
            }));
        }
}

// ==================== 消息编辑器 ====================

class MessageEditor {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.currentMessageIndex = null;
    }

    // 创建编辑模态框
    createModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }

        this.modal = document.createElement('div');
        this.modal.id = 'cinema-message-editor';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(15px);
            z-index: 200100;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;

        this.modal.innerHTML = `
            <div style="
                width: 85%;
                max-width: 900px;
                max-height: 85vh;
                background: linear-gradient(145deg, rgba(30,20,50,0.98), rgba(20,15,40,0.98));
                border-radius: 24px;
                border: 2px solid rgba(255,105,180,0.5);
                box-shadow: 0 0 40px rgba(255,105,180,0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.3s ease;
            ">
                <!-- 头部 -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 24px;
                    background: linear-gradient(135deg, rgba(255,105,180,0.1), transparent);
                    border-bottom: 1px solid rgba(255,105,180,0.3);
                ">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 28px;">✏️</span>
                        <div>
                            <div style="font-size: 18px; font-weight: bold; color: #ffd700;">编辑消息</div>
                            <div style="font-size: 17px; color: #aaa; margin-top: 2px;">修改后自动同步上下文</div>
                        </div>
                    </div>
                    <button id="editor-close" style="
                        background: rgba(255,68,68,0.3);
                        border: none;
                        color: #ff8888;
                        width: 34px;
                        height: 34px;
                        border-radius: 50%;
                        font-size: 18px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseenter="this.style.background='rgba(255,68,68,0.6)'; this.style.transform='scale(1.05)'" 
                    onmouseleave="this.style.background='rgba(255,68,68,0.3)'; this.style.transform='scale(1)'">✕</button>
                </div>

                <!-- 消息信息栏 -->
                <div style="
                    padding: 12px 24px;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                ">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #ff69b4;">📌</span>
                        <span style="color: #aaa;">索引:</span>
                        <span id="editor-index" style="color: #ffd700; font-weight: bold;">0</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #ff69b4;">👤</span>
                        <span style="color: #aaa;">说话人:</span>
                        <input type="text" id="editor-speaker" style="
                            background: rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,105,180,0.4);
                            border-radius: 20px;
                            padding: 4px 12px;
                            color: #ffd700;
                            font-size: 17px;
                            width: 120px;
                            outline: none;
                        ">
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #ff69b4;">🎬</span>
                        <span style="color: #aaa;">场景:</span>
                        <input type="text" id="editor-scene" style="
                            background: rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,105,180,0.4);
                            border-radius: 20px;
                            padding: 4px 12px;
                            color: #ffd700;
                            font-size: 17px;
                            width: 100px;
                            outline: none;
                        ">
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #ff69b4;">🎭</span>
                        <span style="color: #aaa;">情绪:</span>
                        <select id="editor-emotion" style="
                            background: rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,105,180,0.4);
                            border-radius: 20px;
                            padding: 4px 12px;
                            color: #ffd700;
                            font-size: 17px;
                            outline: none;
                        ">
                            <option value="default">默认</option>
                            <option value="开心">😊 开心</option>
                            <option value="害羞">😳 害羞</option>
                            <option value="生气">😠 生气</option>
                            <option value="忧伤">😔 忧伤</option>
                            <option value="惊讶">😲 惊讶</option>
                            <option value="温馨">🥰 温馨</option>
                            <option value="紧张">😖 紧张</option>
                            <option value="浪漫">💕 浪漫</option>
                            <option value="欢乐">🥳 欢乐</option>
                            <option value="悲伤">😢 悲伤</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #ff69b4;">🎵</span>
                        <span style="color: #aaa;">心情:</span>
                        <select id="editor-mood" style="
                            background: rgba(0,0,0,0.5);
                            border: 1px solid rgba(255,105,180,0.4);
                            border-radius: 20px;
                            padding: 4px 12px;
                            color: #ffd700;
                            font-size: 17px;
                            outline: none;
                        ">
                            <option value="日常">日常</option>
                            <option value="开心">开心</option>
                            <option value="害羞">害羞</option>
                            <option value="生气">生气</option>
                            <option value="忧伤">忧伤</option>
                            <option value="惊讶">惊讶</option>
                            <option value="温馨">温馨</option>
                            <option value="紧张">紧张</option>
                            <option value="浪漫">浪漫</option>
                            <option value="欢乐">欢乐</option>
                            <option value="悲伤">悲伤</option>
                            <option value="宁静">宁静</option>
                            <option value="神秘">神秘</option>
                            <option value="振奋">振奋</option>
                        </select>
                    </div>
                </div>

                <!-- 内容编辑区 -->
                <div style="flex: 1; padding: 20px 24px; overflow-y: auto; min-height: 300px;">
                    <div style="margin-bottom: 10px;">
                        <span style="color: #aaa; font-size: 16px;">📝 消息内容 (支持Markdown和状态栏)</span>
                    </div>
                    <textarea id="editor-content" style="
                        width: 100%;
                        height: 280px;
                        background: rgba(0,0,0,0.5);
                        border: 1px solid rgba(255,105,180,0.3);
                        border-radius: 16px;
                        padding: 15px;
                        color: #ddd;
                        font-size: 17px;
                        line-height: 1.6;
                        resize: vertical;
                        outline: none;
                        font-family: monospace;
                    " placeholder="编辑消息内容..."></textarea>
                    
                    <!-- 预览区域 -->
                    <div style="margin-top: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="color: #ff69b4;">👁️</span>
                            <span style="color: #aaa; font-size: 17px;">实时预览</span>
                        </div>
                        <div id="editor-preview" style="
                            background: rgba(0,0,0,0.3);
                            border-radius: 12px;
                            padding: 12px;
                            max-height: 150px;
                            overflow-y: auto;
                            font-size: 16px;
                            color: #ccc;
                            border: 1px solid rgba(255,255,255,0.05);
                        "></div>
                    </div>
                </div>

                <!-- 底部按钮 -->
                <div style="
                    padding: 16px 24px;
                    border-top: 1px solid rgba(255,105,180,0.2);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                ">
                    <button id="editor-cancel" style="
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 30px;
                        padding: 8px 24px;
                        color: #ccc;
                        font-size: 17px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseenter="this.style.background='rgba(255,255,255,0.2)'" 
                    onmouseleave="this.style.background='rgba(255,255,255,0.1)'">取消</button>
                    <button id="editor-save" style="
                        background: linear-gradient(135deg, #ff69b4, #ff4444);
                        border: none;
                        border-radius: 30px;
                        padding: 8px 28px;
                        color: white;
                        font-size: 17px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.2s;
                        box-shadow: 0 2px 8px rgba(255,105,180,0.3);
                    " onmouseenter="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(255,105,180,0.5)'" 
                    onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(255,105,180,0.3)'">💾 保存修改</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // 绑定事件
        const closeBtn = document.getElementById('editor-close');
        const cancelBtn = document.getElementById('editor-cancel');
        const saveBtn = document.getElementById('editor-save');
        const contentTextarea = document.getElementById('editor-content');
        const previewDiv = document.getElementById('editor-preview');

        if (closeBtn) closeBtn.onclick = () => this.close();
        if (cancelBtn) cancelBtn.onclick = () => this.close();
        if (saveBtn) saveBtn.onclick = () => this.save();
        if (contentTextarea) {
            contentTextarea.oninput = () => {
                if (previewDiv) {
                    // 简单预览（移除状态栏和选项栏的详细渲染）
                    let previewText = contentTextarea.value;
                    previewText = previewText.substring(0, 300);
                    previewDiv.innerHTML = previewText.replace(/\n/g, '<br>');
                }
            };
        }
    }

    // 打开编辑器
    open(messageIndex) {
        if (!cinemaMessages || cinemaMessages.length === 0) return;
        if (messageIndex < 0 || messageIndex >= cinemaMessages.length) return;

        this.currentMessageIndex = messageIndex;
        const msg = cinemaMessages[messageIndex];

        if (!this.modal) this.createModal();

        // 填充数据
        const indexSpan = document.getElementById('editor-index');
        const speakerInput = document.getElementById('editor-speaker');
        const sceneInput = document.getElementById('editor-scene');
        const emotionSelect = document.getElementById('editor-emotion');
        const moodSelect = document.getElementById('editor-mood');
        const contentTextarea = document.getElementById('editor-content');
        const previewDiv = document.getElementById('editor-preview');

        if (indexSpan) indexSpan.textContent = messageIndex;
        if (speakerInput) speakerInput.value = msg.name || '';
        if (sceneInput) sceneInput.value = msg.scene || '默认';
        if (emotionSelect) emotionSelect.value = msg.emotion || 'default';
        if (moodSelect) moodSelect.value = msg.mood || '日常';
        if (contentTextarea) {
            contentTextarea.value = msg.content || '';
            // 触发预览
            if (previewDiv) {
                let previewText = contentTextarea.value;
                previewText = previewText.substring(0, 300);
                previewDiv.innerHTML = previewText.replace(/\n/g, '<br>');
            }
        }

        this.modal.style.opacity = '1';
        this.modal.style.visibility = 'visible';
        const modalContent = this.modal.querySelector('div');
        if (modalContent) modalContent.style.transform = 'scale(1)';
        this.isOpen = true;
    }

    // 关闭编辑器
    close() {
        if (!this.modal) return;
        this.modal.style.opacity = '0';
        this.modal.style.visibility = 'hidden';
        const modalContent = this.modal.querySelector('div');
        if (modalContent) modalContent.style.transform = 'scale(0.95)';
        this.isOpen = false;
        this.currentMessageIndex = null;
    }

    // 保存修改
    save() {
        if (this.currentMessageIndex === null) return;

        const speakerInput = document.getElementById('editor-speaker');
        const sceneInput = document.getElementById('editor-scene');
        const emotionSelect = document.getElementById('editor-emotion');
        const moodSelect = document.getElementById('editor-mood');
        const contentTextarea = document.getElementById('editor-content');

        const newName = speakerInput?.value.trim() || '叙述者';
        const newScene = sceneInput?.value.trim() || '默认';
        const newEmotion = emotionSelect?.value || 'default';
        const newMood = moodSelect?.value || '日常';
        const newContent = contentTextarea?.value || '';

        // 获取旧消息
        const oldMsg = cinemaMessages[this.currentMessageIndex];
        
        // 创建新消息对象
        const updatedMessage = {
            ...oldMsg,
            name: newName,
            scene: newScene,
            emotion: newEmotion,
            mood: newMood,
            content: newContent,
            isEdited: true,
            editTimestamp: Date.now()
        };

        // 更新 cinemaMessages
        cinemaMessages[this.currentMessageIndex] = updatedMessage;

        // 同步更新 contextManager 中的消息
        if (contextManager && contextManager.messages) {
            // 找到对应的消息索引（需要根据角色和时间戳匹配）
            for (let i = 0; i < contextManager.messages.length; i++) {
                const ctxMsg = contextManager.messages[i];
                // 简单匹配：根据原始内容和说话人
                if (ctxMsg.content === oldMsg.content && 
                    ((ctxMsg.role === 'user' && oldMsg.isUser) || 
                     (ctxMsg.role === 'assistant' && !oldMsg.isUser))) {
                    contextManager.messages[i] = {
                        ...ctxMsg,
                        content: newContent,
                        edited: true,
                        editTimestamp: Date.now()
                    };
                    break;
                }
            }
        }

        // 如果当前正在显示这条消息，刷新显示
        if (this.currentMessageIndex === currentMessageIndex) {
            // 重新切分文本
            currentSegments = textSplitter.split(newContent, 80);
            currentSegmentIndex = 0;
            displayCurrentSegment(updatedMessage);
        }

        // 刷新消息列表UI
        updateMessageListUI();

        // 更新进度显示
        updateProgressDisplay();

        // 高亮当前项
        highlightCurrentItem();

        // 保存数据
        saveCinemaData();

        // 显示成功提示
        showCinemaToast('✅ 消息已保存并同步', 'success');

        // 关闭编辑器
        this.close();
    }
}

// 全局编辑器实例
let messageEditor = null;

let summaryManager = null;  // 独立的上下文压缩管理器
let contextManager = null;  // 独立的上下文管理器
let isAIGenerating = false;  // 防止重复生成

// 初始化上下文管理器
function initContextManager() {
    contextManager = new ContextManager();
    
    // 设置系统提示（可以自定义）
    const systemPrompt = `你是一个Galgame/视觉小说的剧本AI。
    
【重要规则】
1. 输出格式必须包含状态栏（用 \`\`\` 包裹）和选项（用 [[[选项栏]]] 包裹）
2. 状态栏可以包含：时间、位置、人物状态、角色属性、物品栏、人际关系
3. 选项格式：[A]选项内容
4. 保持角色性格一致，推动剧情发展
5. 适当添加 🎵 音乐：音乐名 来切换背景音乐

请开始剧情。`;
    
    contextManager.initSystemPrompt(systemPrompt);
    console.log('[CinemaMode] 上下文管理器已初始化');
}

// 调用AI生成回复（使用SillyTavern的API）
// 在 generateAIReply 函数中
async function generateAIReply(userMessage, optionKey = null) {
    if (isAIGenerating) {
        console.log('[CinemaMode] AI正在生成中，请稍后');
        return null;
    }
    
    isAIGenerating = true;
    
    try {
        // 添加用户消息到上下文
        contextManager.addUserMessage(userMessage, optionKey);
        
        // 获取当前上下文消息
        const messages = contextManager.getMessagesForAPI();
        
        // 使用SillyTavern的generateQuietPrompt
        const context = SillyTavern.getContext();
        
        if (context && context.generateQuietPrompt) {
            // 构建提示
            const prompt = messages.map(m => {
                if (m.role === 'system') return `[系统] ${m.content}`;
                if (m.role === 'user') return `[用户] ${m.content}`;
                return `附加 ${m.content}`;
            }).join('\n\n');
            
            const result = await context.generateQuietPrompt({
                quietPrompt: `${prompt}\n\n附加: 请继续剧情，保持格式：\`\`\`makedown\n状态栏\`\`\` 和 [[[选项]]]`
            });
            
            if (result) {
                // 添加AI回复到上下文
                contextManager.addAIMessage(result);
                
                // 【修复】获取当前 AI 角色的名字
                let aiName = currentAIChatName;
                if (context && context.chat) {
                    for (let i = context.chat.length - 1; i >= 0; i--) {
                        const msg = context.chat[i];
                        if (!msg.is_user && msg.name && msg.name !== 'AI' && msg.name !== '助手') {
                            aiName = msg.name;
                            currentAIChatName = aiName;
                            break;
                        }
                    }
                }
                
                // 调用修复后的函数，传入两个参数
                addNewMessageToCinema(result, aiName);
                
                return result;
            }
        }
        
        console.error('[CinemaMode] 无法调用AI生成');
        return null;
        
    } catch (error) {
        console.error('[CinemaMode] AI生成失败:', error);
        return null;
    } finally {
        isAIGenerating = false;
    }
}

// 添加新消息到影院模式
function addNewMessageToCinema(aiMessage, aiName = null) {
    if (!cinemaModeActive) return;
     // 使用传入的名字或全局AI名字
    // 【修复】优先使用传入的 AI 名字，否则从当前 AI 消息中提取
    let speakerName = aiName;
    if (!speakerName) {
        // 尝试从 AI 消息中提取名字（如果消息对象有 name 字段）
        // 或者在调用时传入 context.chat 中最后一条 AI 消息的名字
        speakerName = currentAIChatName;
        if (!speakerName || speakerName === 'AI') {
            // 如果还是默认值，从 context 中获取最新 AI 消息的名字
            if (context && context.chat) {
                for (let i = context.chat.length - 1; i >= 0; i--) {
                    const msg = context.chat[i];
                    if (!msg.is_user && msg.name && msg.name !== 'AI' && msg.name !== '助手') {
                        speakerName = msg.name;
                        currentAIChatName = speakerName; // 更新全局变量
                        break;
                    }
                }
            }
        }
    }
    
    // 确保有名字
    if (!speakerName || speakerName === 'AI') {
        speakerName = '叙述者';
    }
    // 解析AI消息中的状态栏信息
    const statusMatch = aiMessage.match(/```([\s\S]*?)```/);
    let location = currentLocation;
    let time = currentTime;
    let weather = currentWeather;
    
    if (statusMatch) {
        const statusText = statusMatch[1];
        const newLocation = extractLocationFromStatus(statusText);
        if (newLocation) location = newLocation;
        const timeWeather = extractTimeAndWeather(statusText);
        if (timeWeather.time) time = timeWeather.time;
        if (timeWeather.weather) weather = timeWeather.weather;
    }
    
    // 创建新消息对象
    const newMessage = {
        index: cinemaMessages.length,
        name: speakerName,
        isUser: false,
        content: aiMessage,
        emotion: 'default',
        scene: matchScene(location),
        mood: '日常',
        location: location,
        time: time,
        weather: weather,
        timestamp: new Date().toISOString()
    };
    
    // 添加到消息列表
    cinemaMessages.push(newMessage);
    
    // 更新UI
    updateMessageListUI();
    
    // 自动跳转到新消息
    goToMessage(cinemaMessages.length - 1);

    // 添加后自动保存
    saveCinemaData();
    
    // 更新消息计数
    const countSpan = document.getElementById('cinema-message-count');
    if (countSpan) {
        countSpan.textContent = cinemaMessages.length;
    }
    
    console.log('[CinemaMode] 新消息已添加到影院模式');
}

// 修改 updateMessageListUI 函数，添加编辑按钮
function updateMessageListUI() {
    const container = document.getElementById('cinema-message-list');
    if (!container) return;
    
    let html = '';
    cinemaMessages.forEach((msg, idx) => {
        const prefix = msg.isUser ? '👤' : (msg.name === '叙述者' ? '📖' : '💬');
        const preview = msg.content.substring(0, 35) + (msg.content.length > 35 ? '...' : '');
        
        html += `
            <div class="cinema-message-item" data-index="${idx}" style="
                padding: 8px 12px;
                margin: 4px 8px;
                border-radius: 12px;
                background: ${idx === currentMessageIndex ? 'rgba(255,105,180,0.3)' : 'rgba(255,255,255,0.05)'};
                cursor: pointer;
                position: relative;
                transition: all 0.2s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; color: #ffd700; font-size: 16px;">${prefix} ${escapeHtml(msg.name)}</div>
                    <button class="cinema-edit-msg-btn" data-index="${idx}" style="
                        background: rgba(255,105,180,0.2);
                        border: none;
                        border-radius: 8px;
                        padding: 4px 10px;
                        font-size: 16px;
                        color: #ffb6c1;
                        cursor: pointer;
                        transition: all 0.2s;
                        opacity: 0.7;
                    " onmouseenter="this.style.opacity='1'; this.style.background='rgba(255,105,180,0.4)'" 
                    onmouseleave="this.style.opacity='0.7'; this.style.background='rgba(255,105,180,0.2)'">✏️ 编辑</button>
                </div>
                <div style="font-size: 16px; color: #aaa; margin-top: 4px;">${escapeHtml(preview)}</div>
                <div style="font-size: 16px; color: #666; margin-top: 2px;">#${msg.index}${msg.isEdited ? ' ✏️已编辑' : ''}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // 重新绑定点击事件
    container.querySelectorAll('.cinema-message-item').forEach(el => {
        const idx = parseInt(el.dataset.index);
        if (!isNaN(idx)) {
            el.onclick = (e) => {
                if (e.target.classList && e.target.classList.contains('cinema-edit-msg-btn')) {
                    return;
                }
                goToMessage(idx);
            };
        }
    });
    
    // 绑定编辑按钮事件
    container.querySelectorAll('.cinema-edit-msg-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            if (!isNaN(idx)) {
                if (!messageEditor) {
                    messageEditor = new MessageEditor();
                }
                messageEditor.open(idx);
            }
        };
    });
}


function openCinemaMode() {
    if (cinemaModeActive) return;
    
    // 初始化存储管理器
    if (!storageManager) {
        storageManager = new StorageManager();
    }

    // 初始化上下文管理器
    if (!contextManager) {
        initContextManager();
    }
    
    // 重置状态栏创建标志，确保重新创建
    syncPanelCreated = false;
    
    // 尝试加载保存的数据
    const savedData = loadCinemaData();

    if (!savedData || cinemaMessages.length === 0) {
        // 没有保存的数据，从现有聊天导入
        if (context && context.chat && context.chat.length > 0) {
            contextManager.importFromChat(context.chat);
            const stMessages = contextManager.exportToSTFormat();
            cinemaMessages = formatMessages(stMessages);
        }
    }

    if (cinemaMessages.length === 0) {
        alert('没有可播放的内容');
        return;
    }

    // 初始化资源管理器
    audioManager = new AudioManager();
    imageLoader = new ImageLoader();
    
    currentMessageIndex = Math.min(currentMessageIndex, cinemaMessages.length - 1);
    currentSegments = [];
    currentSegmentIndex = 0;
    cinemaModeActive = true;
    createCinemaUI();
    // 初始化主题管理器
    initThemeManager();

    // 应用保存的主题
    if (themeManager) {
        const currentTheme = themeManager.currentTheme;
        // 延迟应用主题，确保UI已渲染
        setTimeout(() => {
            themeManager.applyTheme(currentTheme);
            themeManager.updateAllScrollbars();
        }, 200);
    }
    loadMessageAndRender();
}

// 全局变量
let currentLocation = '默认';
let currentTime = '';
let currentWeather = '';

// 从状态文本中提取位置信息
// 从状态文本中提取位置信息（只返回位置字符串）
function extractLocationFromStatus(statusText) {
    // 匹配格式：📍 当前位置：大学宿舍楼4层走廊
    const locationPattern = /📍\s*当前位置[：:]\s*(.+?)(?:\n|$)/;
    const match = statusText.match(locationPattern);
    
    if (match) {
        currentLocation = match[1].trim();
        console.log(`[CinemaMode] 提取到位置: ${currentLocation}`);
        return currentLocation;
    }
    
    console.log('[CinemaMode] 未提取到位置，保持原有:', currentLocation);
    return currentLocation;
}

// 提取时间和天气
function extractTimeAndWeather(statusText) {
    const timePattern = /【第\d+天\s*·\s*([^·]+)\s*·\s*([^】]+)】/;
    const match = statusText.match(timePattern);
    
    if (match) {
        currentTime = match[1].trim();
        currentWeather = match[2].trim();
        return { time: currentTime, weather: currentWeather };
    }
    
    return { time: currentTime, weather: currentWeather };
}

// 根据消息内容或位置匹配场景
function matchScene(text) {
    if (!text || text === '默认') return '默认';
    
    console.log('[CinemaMode] 匹配场景:', text);
    
    let firstMatch = null;
    let firstIndex = Infinity;
    
    // 遍历所有场景关键词，找到在文本中出现位置最靠前的
    for (const sceneName of Object.keys(SCENE_FILE_MAP)) {
        if (sceneName !== '默认') {
            const index = text.indexOf(sceneName);
            if (index !== -1 && index < firstIndex) {
                firstIndex = index;
                firstMatch = sceneName;
            }
        }
    }
    
    if (firstMatch) {
        console.log(`[CinemaMode] 匹配到第一个关键词: ${firstMatch} (位置: ${firstIndex})`);
        return firstMatch;
    }
    
    console.log('[CinemaMode] 未匹配到，返回默认');
    return '默认';
}

// 增强的formatMessages函数
function formatMessages(chat) {
    const messages = [];
    
    for (let i = 0; i < chat.length; i++) {
        const msg = chat[i];
        if (!msg.mes || msg.mes.trim() === '') continue;
        
        const emotion = extractEmotionFromText(msg.mes);
        const mood = extractEmotionFromText(msg.mes);
        const scene = matchScene(msg.mes);
        
        // 【修复】优先使用原始名字，如果消息对象中已有名字
        let speakerName = msg.name;
        
        // 如果没有原始名字，尝试从消息内容中提取
        if (!speakerName || speakerName === 'AI' || speakerName === '用户') {
            // 尝试提取引号前的名字，如 "XX：xxx" 或 "XX说：xxx"
            const nameMatch = msg.mes.match(/^([\u4e00-\u9fa5]{2,4})[：:说]/);
            if (nameMatch) {
                speakerName = nameMatch[1];
            } else {
                speakerName = msg.is_user ? (currentUserName || '主人公') : (currentAIChatName || '叙述者');
            }
        }
        
        messages.push({
            index: i,
            name: speakerName,
            isUser: msg.is_user || false,
            content: msg.mes,
            emotion: emotion,
            scene: scene,
            mood: mood,
            location: currentLocation,
            time: currentTime,
            weather: currentWeather,
            timestamp: msg.send_date
        });
    }
    
    return messages;
}

function createCinemaUI() {
    if (document.getElementById('cinema-overlay')) {
        document.getElementById('cinema-overlay').remove();
    }
    
    // 1. 先创建 overlay 元素
    const overlay = document.createElement('div');
    overlay.id = 'cinema-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
        z-index: 200000;
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
        animation: cinemaFadeIn 0.3s ease;
    `;
    
    // 2. 设置 innerHTML
    overlay.innerHTML = `
        <div style="display: flex; height: 100%;">
            <!-- 左侧边栏 -->
            <div style="
                width: 280px;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(10px);
                border-right: 1px solid rgba(255,105,180,0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <div style="padding: 15px; border-bottom: 1px solid rgba(255,105,180,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <div style="font-size: 18px; font-weight: bold; color: #ff69b4;">🎬 剧情索引</div>
                            <div style="font-size: 16px; color: #888; margin-top: 5px;">共 <span id="cinema-message-count">${cinemaMessages.length}</span> 段</div>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button id="cinema-export-save" style="
                                background: rgba(78,205,196,0.3);
                                border: 1px solid #4ecdc4;
                                color: #4ecdc4;
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 16px;
                                cursor: pointer;
                                transition: all 0.2s;
                            " title="导出存档到文件">📤 导出</button>
                            <button id="cinema-import-save" style="
                                background: rgba(255,193,7,0.3);
                                border: 1px solid #ffc107;
                                color: #ffc107;
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 16px;
                                cursor: pointer;
                                transition: all 0.2s;
                            " title="从文件导入存档">📥 导入</button>
                            <button id="cinema-reset-history" style="
                                background: rgba(255,68,68,0.3);
                                border: 1px solid #ff4444;
                                color: #ff8888;
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 16px;
                                cursor: pointer;
                                transition: all 0.2s;
                            " title="重置所有历史记录">🗑️ 重置</button>
                        </div>
                    </div>
                </div>
                <div id="cinema-message-list" class="cinema-scroll" style="flex: 1; overflow-y: auto; padding: 10px;"></div>
                <div style="padding: 15px; border-top: 1px solid rgba(255,105,180,0.3);">
                    <button id="cinema-close" style="
                        width: 100%;
                        background: rgba(255,68,68,0.3);
                        border: 1px solid #ff4444;
                        color: #ff8888;
                        padding: 8px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">关闭影院模式</button>
                </div>
            </div>
            
            <!-- 中间区域（立绘 + 文字区） -->
            <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
                <div id="cinema-art-area" style="
                    flex: 3;
                    background: #0a0a1a;
                    position: relative;
                    overflow: hidden;
                    background-size: cover;
                    background-position: center;
                    transition: background-image 0.5s ease;
                ">
                    <div id="cinema-multi-portrait-container" style="
                        position: absolute;
                        bottom: 20px;
                        left: 0;
                        right: 0;
                        height: 640px;
                        display: flex;
                        flex-direction: row;
                        align-items: flex-end;
                        justify-content: center;
                        gap: 20px;
                        padding: 0 40px;
                        z-index: 2;
                    "></div>
                </div>
                
                <div id="cinema-text-area" style="
                    flex: 1;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(20px);
                    border-top: 2px solid rgba(255,105,180,0.5);
                    padding: 20px 30px;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.2s;
                ">
                    <div id="cinema-speaker" style="
                        font-size: 20px;
                        font-weight: bold;
                        color: #ffd700;
                        margin-bottom: 10px;
                    "></div>
                    <div id="cinema-content" style="
                        font-size: 18px;
                        line-height: 1.6;
                        color: #fff;
                        min-height: 80px;
                    "></div>
                    
                    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <button id="cinema-prev" class="cinema-control-btn">◀ 上一句</button>
                        <button id="cinema-play" class="cinema-control-btn">▶ 自动播放</button>
                        <button id="cinema-next" class="cinema-control-btn">下一句 ▶</button>
                        <button id="cinema-music-toggle" class="cinema-control-btn">🔊 音乐</button>
                        <button id="cinema-character-list" class="cinema-control-btn">👥 角色图鉴</button>
                        <button id="cinema-summary-btn" class="cinema-control-btn">📝 总结</button>
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <span id="cinema-progress" style="font-size: 16px; color: #888;">第 1 / 1 句</span>
                        <span id="cinema-segment-progress" style="font-size: 16px; color: #ff69b4; margin-left: 10px;"></span>
                        <span id="cinema-scene" style="font-size: 16px; color: #888; margin-left: 15px;">🎬 场景: 默认</span>
                        <span id="cinema-music" style="font-size: 16px; color: #888; margin-left: 15px;">🎵 音乐: 日常</span>
                    </div>
                </div>
            </div>
            
            <!-- 右侧容器（状态栏将渲染到这里） -->
            <div id="cinema-sync-panel-container" style="
                width: 360px;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(10px);
                border-left: 1px solid rgba(255,105,180,0.3);
                overflow-y: auto;
                padding: 10px;
            "></div>
        </div>
    `;
    
    // 3. 添加到 body
    document.body.appendChild(overlay);
    
    // 4. 初始化存储管理器
    if (!storageManager) {
        storageManager = new StorageManager();
    }

    // 绑定总结按钮事件
    const summaryBtn = document.getElementById('cinema-summary-btn');
    if (summaryBtn) {
        summaryBtn.onclick = () => {
            if (!summaryManager) {
                summaryManager = new ContextSummaryManager();
                summaryManager.loadSavedSummaries();
            }
            summaryManager.show();
        };
    }

    // 5. 绑定重置按钮事件
    const resetBtn = document.getElementById('cinema-reset-history');
    if (resetBtn) {
        resetBtn.onclick = () => showResetConfirmDialog();
    }
    
    // 绑定导出按钮事件
    const exportBtn = document.getElementById('cinema-export-save');
    if (exportBtn) {
        exportBtn.onclick = () => {
            // 保存当前数据
            saveCinemaData();
            // 导出存档
            if (storageManager && storageManager.exportToFile) {
                storageManager.exportToFile();
            } else {
                // 降级方案
                backupCurrentContext();
            }
        };
    }
    
    // 7. 绑定导入按钮事件
    const importBtn = document.getElementById('cinema-import-save');
    if (importBtn) {
        importBtn.onclick = () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    showCinemaToast('正在导入存档...', 'info');
                    const importedData = await storageManager.importFromFile(file);
                    
                    if (importedData) {
                        // 直接加载数据到内存
                        await loadCinemaData(importedData);
                        
                        // 刷新UI
                        refreshCinemaUI();
                        
                        showCinemaToast('存档导入成功！', 'success');
                    }
                } catch (err) {
                    console.error('[CinemaMode] 导入失败:', err);
                    showCinemaToast('导入失败：' + err.message, 'error');
                }
            };
            fileInput.click();
        };
        importBtn.onmouseenter = () => {
            importBtn.style.background = 'rgba(255,193,7,0.5)';
            importBtn.style.transform = 'scale(1.02)';
        };
        importBtn.onmouseleave = () => {
            importBtn.style.background = 'rgba(255,193,7,0.3)';
            importBtn.style.transform = 'scale(1)';
        };
    }
    // ========== 新增：刷新UI函数 ==========
function refreshCinemaUI() {
    if (!cinemaModeActive) return;
    
    console.log('[CinemaMode] 刷新UI...');
    
    // 更新消息列表
    updateMessageListUI();
    
    // 更新消息计数
    const countSpan = document.getElementById('cinema-message-count');
    if (countSpan) {
        countSpan.textContent = cinemaMessages.length;
    }
    
    // 重新加载当前消息
    if (cinemaMessages.length > 0) {
        // 确保索引有效
        if (currentMessageIndex >= cinemaMessages.length) {
            currentMessageIndex = cinemaMessages.length - 1;
        }
        if (currentMessageIndex < 0) {
            currentMessageIndex = 0;
        }
        
        const msg = cinemaMessages[currentMessageIndex];
        if (msg) {
            currentSegments = textSplitter.split(msg.content, 80);
            currentSegmentIndex = 0;
            displayCurrentSegment(msg);
        }
    } else {
        // 没有消息时显示空状态
        if (cinemaElements.content) {
            cinemaElements.content.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                    <div style="font-size: 18px; color: #888;">暂无剧情内容</div>
                    <div style="font-size: 16px; color: #666; margin-top: 10px;">请导入存档或开始新游戏</div>
                </div>
            `;
        }
    }
    
    // 更新进度显示
    updateProgressDisplay();
    
    // 高亮当前消息
    highlightCurrentItem();
    
    // 刷新同步面板（如果存在）
    if (typeof renderSyncPanel === 'function') {
        renderSyncPanel();
    }
    
    console.log('[CinemaMode] UI刷新完成');
}
    // 8. 初始化管理器
    characterPortraitManager = new CharacterPortraitManager();
    multiPortraitRenderer = new MultiPortraitRenderer('cinema-multi-portrait-container');
    
    cinemaElements = {
        speaker: document.getElementById('cinema-speaker'),
        content: document.getElementById('cinema-content'),
        progress: document.getElementById('cinema-progress'),
        segmentProgress: document.getElementById('cinema-segment-progress'),
        scene: document.getElementById('cinema-scene'),
        music: document.getElementById('cinema-music'),
        playBtn: document.getElementById('cinema-play'),
        textArea: document.getElementById('cinema-text-area'),
        artArea: document.getElementById('cinema-art-area'),
        characterListBtn: document.getElementById('cinema-character-list')
    };
    
    // 9. 绑定事件
    const closeBtn = document.getElementById('cinema-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            saveCinemaData();
            closeCinemaMode();
        };
    }
    
    const prevBtn = document.getElementById('cinema-prev');
    if (prevBtn) prevBtn.onclick = prevMessage;
    
    const nextBtn = document.getElementById('cinema-next');
    if (nextBtn) nextBtn.onclick = nextMessage;
    
    const playBtn = document.getElementById('cinema-play');
    if (playBtn) playBtn.onclick = toggleAutoPlay;
    
    const musicToggleBtn = document.getElementById('cinema-music-toggle');
    if (musicToggleBtn) musicToggleBtn.onclick = toggleMusic;
    
    if (cinemaElements.characterListBtn) {
        cinemaElements.characterListBtn.onclick = showCharacterGallery;
    }
    
    if(cinemaElements.content){
        cinemaElements.content.onclick = handleTextAreaClick;
    }

    // 在 createCinemaUI 函数中，找到绑定事件的部分

    // 修改这部分代码
    if (cinemaElements.textArea) {
        // 移除或修改这些事件，让它们使用主题色而不是固定黑色
        cinemaElements.textArea.onmouseenter = () => {
            // 获取当前主题颜色
            const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
            const colors = currentTheme ? currentTheme.colors : { textAreaBg: 'rgba(0,0,0,0.75)', primary: '#ff69b4' };
            // 使用主题色
            cinemaElements.textArea.style.background = `linear-gradient(135deg, ${colors.textAreaBg || colors.cardBg}, rgba(0,0,0,0.8))`;
            cinemaElements.textArea.style.borderTop = `2px solid ${colors.primary}`;
        };
        cinemaElements.textArea.onmouseleave = () => {
            // 恢复为主题色（而不是固定黑色）
            const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
            const colors = currentTheme ? currentTheme.colors : { textAreaBg: 'rgba(0,0,0,0.7)', primary: '#ff69b4' };
            cinemaElements.textArea.style.background = `linear-gradient(135deg, ${colors.textAreaBg || colors.cardBg}, rgba(0,0,0,0.75))`;
            cinemaElements.textArea.style.borderTop = `2px solid ${colors.primary}`;
        };
    }
    
    buildMessageList();
}

// 保存影院数据
// ==================== 简化版 saveCinemaData（去掉立绘保存） ====================

function saveCinemaData() {
    if (!storageManager || !contextManager) return;
    
    // 收集立绘管理器数据
    let characterPortraitData = null;
    if (characterPortraitManager) {
        try {
            const characterMapObj = {};
            if (characterPortraitManager.characterMap && typeof characterPortraitManager.characterMap.forEach === 'function') {
                characterPortraitManager.characterMap.forEach((value, key) => {
                    characterMapObj[key] = value;
                });
            }
            
            const characterVisibleObj = {};
            if (characterPortraitManager.characterVisible && typeof characterPortraitManager.characterVisible.forEach === 'function') {
                characterPortraitManager.characterVisible.forEach((value, key) => {
                    characterVisibleObj[key] = value;
                });
            }
            
            const characterGenderObj = {};
            if (characterPortraitManager.characterGender && typeof characterPortraitManager.characterGender.forEach === 'function') {
                characterPortraitManager.characterGender.forEach((value, key) => {
                    characterGenderObj[key] = value;
                });
            }
            
            characterPortraitData = {
                characterMap: characterMapObj,
                characterVisible: characterVisibleObj,
                characterGender: characterGenderObj
            };
        } catch (err) {
            console.warn('[CinemaMode] 保存立绘数据失败:', err);
        }
    }
    
    const saveData = {
        cinemaMessages: cinemaMessages || [],
        contextMessages: contextManager.exportForSave ? contextManager.exportForSave() : { messages: [], systemPrompt: '', currentIndex: 0 },
        currentMessageIndex: currentMessageIndex || 0,
        currentLocation: currentLocation || '默认',
        currentTime: currentTime || '',
        currentWeather: currentWeather || '',
        characters: characters || [],
        gameState: gameState || { attributes: {}, stats: {}, items: [] },
        characterPortraitData: characterPortraitData,
        timestamp: Date.now(),
        exportVersion: '1.0'
    };
    
    storageManager.save(saveData);
}

// ==================== 简化版 loadCinemaData（去掉立绘恢复） ====================

function loadCinemaData() {
    if (!storageManager) return null;
    
    const data = storageManager.load();
    if (!data) return null;
    
    console.log('[loadCinemaData] 数据加载，cinemaMessages 长度:', data.cinemaMessages?.length || 0);
    
    // 恢复数据
    cinemaMessages = data.cinemaMessages || [];
    currentMessageIndex = data.currentMessageIndex || 0;
    currentLocation = data.currentLocation || '默认';
    currentTime = data.currentTime || '';
    currentWeather = data.currentWeather || '';
    characters = data.characters || [];
    gameState = data.gameState || { attributes: {}, stats: {}, items: [] };
    
    // ========== 关键修复：从 cinemaMessages 重建 contextManager ==========
    if (contextManager && cinemaMessages.length > 0) {
        // 清空并重建（就像 resetAllData 中的 importFromChat 一样）
        contextManager.messages = [];
        for (const msg of cinemaMessages) {
            contextManager.messages.push({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.content,
                name: msg.name || (msg.isUser ? '用户' : 'AI'),
                timestamp: msg.timestamp || Date.now(),
                is_user: msg.isUser || false
            });
        }
        console.log('[loadCinemaData] ✅ contextManager 从 cinemaMessages 重建，长度:', contextManager.messages.length);
    } else if (contextManager && cinemaMessages.length === 0) {
        console.warn('[loadCinemaData] ⚠️ cinemaMessages 为空，contextManager 保持为空');
    }
    
    // 恢复系统提示（如果有）
    if (contextManager && data.contextMessages && data.contextMessages.systemPrompt) {
        contextManager.systemPrompt = data.contextMessages.systemPrompt;
    }
    
    console.log('[CinemaMode] 数据已加载，共', cinemaMessages.length, '条消息');
    return data;
}

// 显示重置确认对话框
function showResetConfirmDialog() {
    // 创建遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px);
        z-index: 200100;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: linear-gradient(135deg, #2a1a3a, #1a0a2e);
        border: 2px solid #ff4444;
        border-radius: 24px;
        padding: 30px;
        width: 400px;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 0 40px rgba(255,68,68,0.3);
        animation: fadeIn 0.2s ease;
    `;
    
    dialog.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <div style="font-size: 20px; font-weight: bold; color: #ff8888; margin-bottom: 15px;">
            确认重置所有历史？
        </div>
        <div style="font-size: 16px; color: #aaa; margin-bottom: 25px; line-height: 1.5;">
            这将清除所有对话记录、角色数据、游戏状态。<br>
            此操作不可恢复！
        </div>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="reset-confirm-yes" style="
                background: rgba(255,68,68,0.3);
                border: 2px solid #ff4444;
                color: #ff8888;
                padding: 10px 25px;
                border-radius: 30px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            ">确认重置</button>
            <button id="reset-confirm-no" style="
                background: rgba(255,255,255,0.1);
                border: 2px solid #888;
                color: #ccc;
                padding: 10px 25px;
                border-radius: 30px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            ">取消</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // 绑定按钮事件
    const confirmBtn = document.getElementById('reset-confirm-yes');
    const cancelBtn = document.getElementById('reset-confirm-no');
    
    confirmBtn.onclick = () => {
        resetAllData();
        overlay.remove();
    };
    
    cancelBtn.onclick = () => {
        overlay.remove();
    };
    
    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

// 重置所有数据
function resetAllData() {
    console.log('[CinemaMode] 开始重置所有数据...');
    
    // 重置上下文管理器
    if (contextManager) {
        contextManager.reset();
        // 重新设置系统提示
        const systemPrompt = `你是一个Galgame/视觉小说的剧本AI。
        
【重要规则】
1. 输出格式必须包含状态栏（用 \`\`\` 包裹）和选项（用 [[[选项]]] 包裹）
2. 状态栏可以包含：时间、位置、人物状态、角色属性、物品栏、人际关系
3. 选项格式：[A] 选项内容
4. 保持角色性格一致，推动剧情发展
5. 适当添加 🎵 音乐：音乐名 来切换背景音乐

请开始剧情。`;
        contextManager.initSystemPrompt(systemPrompt);
    }
    
    // 重置影院消息
    cinemaMessages = [];
    currentMessageIndex = 0;
    currentSegments = [];
    currentSegmentIndex = 0;
    
    // 重置位置信息
    currentLocation = '默认';
    currentTime = '';
    currentWeather = '';
    
    // 重置角色和游戏状态
    characters = [];
    gameState = {
        attributes: {},
        stats: {},
        items: []
    };
    
    // 重置角色立绘管理器
    if (characterPortraitManager) {
        characterPortraitManager.characterMap.clear();
        // characterPortraitManager.usedImages.clear();
    }
    
    // 清除本地存储
    if (storageManager) {
        storageManager.clear();
    }
    
    // 重新加载初始消息（如果有）
    if (context && context.chat && context.chat.length > 0) {
        contextManager.importFromChat(context.chat);
        const stMessages = contextManager.exportToSTFormat();
        cinemaMessages = formatMessages(stMessages);
    }
    
    // 刷新UI
    if (cinemaModeActive) {
        updateMessageListUI();
        goToMessage(0);
        // renderAll();
    }
    
    console.log('[CinemaMode] 所有数据已重置');
    
    // 显示提示
    showCinemaToast('历史记录已清空', 'info');
}

// ==================== 角色图鉴功能（优化版） ====================

function showCharacterGallery() {
    if (!characterPortraitManager) return;
    
    const characters = characterPortraitManager.getAllCharacters();
    
    if (characters.length === 0) {
        showCinemaToast('暂无邂逅角色', 'info');
        return;
    }
    
    // 创建图鉴弹窗
    const galleryOverlay = document.createElement('div');
    galleryOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.92);
        backdrop-filter: blur(20px);
        z-index: 200010;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: cinemaFadeIn 0.3s ease;
    `;
    
    const galleryContent = document.createElement('div');
    galleryContent.style.cssText = `
        background: linear-gradient(135deg, rgba(30,20,50,0.95), rgba(20,15,40,0.95));
        border: 2px solid rgba(255,105,180,0.5);
        border-radius: 24px;
        padding: 25px;
        width: 90%;
        max-width: 1000px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 40px rgba(255,105,180,0.2);
    `;
    
    // 头部
    const headerHtml = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(255,105,180,0.3);
        ">
            <h2 style="color: #ff69b4; margin: 0; font-size: 24px;">📖 角色图鉴</h2>
            <span style="color: #aaa; font-size: 16px;">共 ${characters.length} 位角色</span>
        </div>
    `;
    
    // 角色网格 - 响应式布局
    let gridHtml = `
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 18px;
            overflow-y: auto;
            padding: 5px 10px 15px 5px;
            max-height: calc(85vh - 120px);
        ">
    `;
    
    for (const char of characters) {
        const isVisible = char.visible !== false;
        const opacity = isVisible ? '1' : '0.5';
        const statusIcon = isVisible ? '👁️' : '🔇';
        const statusText = isVisible ? '显示中' : '已隐藏';
        
        gridHtml += `
            <div style="
                text-align: center;
                padding: 15px 10px;
                background: rgba(255,255,255,0.05);
                border-radius: 16px;
                transition: all 0.2s ease;
                cursor: pointer;
                opacity: ${opacity};
                border: 1px solid ${isVisible ? 'rgba(255,105,180,0.3)' : 'rgba(255,255,255,0.1)'};
            " onmouseenter="this.style.transform='translateY(-5px)'; this.style.background='rgba(255,255,255,0.1)'"
             onmouseleave="this.style.transform='translateY(0)'; this.style.background='rgba(255,255,255,0.05)'">
                <div style="
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                    overflow: hidden;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.3);
                    border: 2px solid ${isVisible ? '#ff69b4' : '#555'};
                ">
                    <img src="${char.portrait}" style="width: 100%; height: 100%; object-fit: cover;" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'50%\' x=\'50%\' text-anchor=\'middle\' dy=\'.3em\' font-size=\'50\'%3E👤%3C/text%3E%3C/svg%3E'">
                </div>
                <div style="
                    margin-top: 14px;
                    font-weight: bold;
                    color: #ffd700;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                ">
                    <span>${char.name}</span>
                    <span style="font-size: 16px; color: ${isVisible ? '#4ecdc4' : '#888'};">${statusIcon}</span>
                </div>
                <div style="
                    font-size: 16px;
                    color: ${isVisible ? '#aaa' : '#666'};
                    margin-top: 4px;
                ">${statusText}</div>
                <div style="
                    font-size: 16px;
                    color: #ff69b4;
                    margin-top: 6px;
                ">${char.gender === '女' ? '♀ 女性' : (char.gender === '男' ? '♂ 男性' : '❓ 未知')}</div>
            </div>
        `;
    }
    
    gridHtml += `</div>`;
    
    // 底部按钮
    const footerHtml = `
        <div style="
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,105,180,0.2);
        ">
            <button id="gallery-close" style="
                background: rgba(255,68,68,0.3);
                border: 1px solid #ff4444;
                color: #ff8888;
                padding: 8px 30px;
                border-radius: 30px;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,68,68,0.5)'" onmouseleave="this.style.background='rgba(255,68,68,0.3)'">关闭</button>
        </div>
    `;
    
    galleryContent.innerHTML = headerHtml + gridHtml + footerHtml;
    galleryOverlay.appendChild(galleryContent);
    document.body.appendChild(galleryOverlay);
    
    // 绑定关闭事件
    const closeBtn = document.getElementById('gallery-close');
    if (closeBtn) {
        closeBtn.onclick = () => galleryOverlay.remove();
    }
    
    // 点击背景关闭
    galleryOverlay.onclick = (e) => {
        if (e.target === galleryOverlay) {
            galleryOverlay.remove();
        }
    };
}

// 修改 buildMessageList 和 updateMessageListUI 函数，添加编辑按钮
function buildMessageList() {
    const container = document.getElementById('cinema-message-list');
    if (!container) return;
    
    let html = '';
    cinemaMessages.forEach((msg, idx) => {
        const prefix = msg.isUser ? '👤' : (msg.name === '叙述者' ? '📖' : '💬');
        const preview = msg.content.substring(0, 35) + (msg.content.length > 35 ? '...' : '');
        
        html += `
            <div class="cinema-message-item" data-index="${idx}" style="
                padding: 8px 12px;
                margin: 4px 8px;
                border-radius: 12px;
                background: ${idx === currentMessageIndex ? 'rgba(255,105,180,0.3)' : 'rgba(255,255,255,0.05)'};
                cursor: pointer;
                position: relative;
                transition: all 0.2s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; color: #ffd700; font-size: 16px;">${prefix} ${msg.name}</div>
                    <button class="cinema-edit-msg-btn" data-index="${idx}" style="
                        background: rgba(255,105,180,0.2);
                        border: none;
                        border-radius: 8px;
                        padding: 4px 10px;
                        font-size: 16px;
                        color: #ffb6c1;
                        cursor: pointer;
                        transition: all 0.2s;
                        opacity: 0.7;
                    " onmouseenter="this.style.opacity='1'; this.style.background='rgba(255,105,180,0.4)'" 
                    onmouseleave="this.style.opacity='0.7'; this.style.background='rgba(255,105,180,0.2)'">✏️ 编辑</button>
                </div>
                <div style="font-size: 16px; color: #aaa; margin-top: 4px;">${escapeHtml(preview)}</div>
                <div style="font-size: 16px; color: #666; margin-top: 2px;">#${msg.index}${msg.isEdited ? ' ✏️已编辑' : ''}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // 重新绑定点击事件
    container.querySelectorAll('.cinema-message-item').forEach(el => {
        const idx = parseInt(el.dataset.index);
        if (!isNaN(idx)) {
            el.onclick = (e) => {
                // 防止点击编辑按钮时触发消息跳转
                if (e.target.classList && e.target.classList.contains('cinema-edit-msg-btn')) {
                    return;
                }
                goToMessage(idx);
            };
        }
    });
    
    // 绑定编辑按钮事件
    container.querySelectorAll('.cinema-edit-msg-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            if (!isNaN(idx)) {
                if (!messageEditor) {
                    messageEditor = new MessageEditor();
                }
                messageEditor.open(idx);
            }
        };
    });
}


function loadMessageAndRender() {
    const msg = cinemaMessages[currentMessageIndex];
    if (!msg) return;
    
    currentSegments = textSplitter.split(msg.content, 80);
    currentSegmentIndex = 0;
    
    displayCurrentSegment(msg);
    highlightCurrentItem();
    updateProgressDisplay();
}

    // 更新立绘（根据名字匹配图片）
    async function updatePortrait(characterName) {
        if (!characterName) return;
        
        const imageContainer = document.getElementById('cinema-portrait-image');
        const emojiDiv = document.getElementById('cinema-portrait-emoji');
        const nameDiv = document.getElementById('cinema-portrait-name');
        const nameTextSpan = document.getElementById('portrait-name-text');
        
        // 更新名字显示
        if (nameDiv) {
            nameDiv.style.display = 'flex';
        }
        if (nameTextSpan) {
            nameTextSpan.textContent = characterName;
        }
        
        // 清除之前的图片
        if (imageContainer) {
            // 移除之前添加的img元素
            const oldImg = imageContainer.querySelector('img');
            if (oldImg) oldImg.remove();
        }
        
        // 支持的图片格式
        const formats = ['png', 'jpg', 'jpeg', 'webp'];
        const basePath = `${BASE_PATH}images/portrait/`;
        
        let loaded = false;
        
        for (const format of formats) {
            const url = `${basePath}${characterName}.${format}`;
            const exists = await imageExists(url);
            if (exists) {
                // 创建img元素加载图片
                const img = document.createElement('img');
                img.src = url;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '10px';
                
                if (imageContainer) {
                    // 清空容器并添加图片
                    imageContainer.innerHTML = '';
                    imageContainer.appendChild(img);
                }
                if (emojiDiv) {
                    emojiDiv.style.display = 'none';
                }
                loaded = true;
                console.log('[CinemaMode] 加载立绘:', url);
                break;
            }
        }
        
        // 没有找到匹配的图片，显示默认emoji
        if (!loaded) {
            if (imageContainer) {
                imageContainer.innerHTML = '';
                if (emojiDiv) {
                    imageContainer.appendChild(emojiDiv);
                    emojiDiv.style.display = 'flex';
                }
            }
            // 设置默认emoji
            const isPlayer = (characterName === '主人公' || characterName === '玩家'|| characterName === '探客'|| characterName === 'Galgame生存游戏');
            if (emojiDiv) {
                emojiDiv.textContent = isPlayer ? '👤' : '🎭';
            }
            console.log('[CinemaMode] 未找到立绘，使用默认:', characterName);
        }
    }
    


    // 辅助函数：检查图片是否存在

    function imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            // 超时处理
            setTimeout(() => resolve(false), 2000);
        });
    }

async function updateBackground(sceneName) {
    if (!imageLoader || !cinemaElements.artArea) return;
    
    const fileName = SCENE_FILE_MAP[sceneName] || SCENE_FILE_MAP['默认'];
    const urls = imageLoader.loadBackground(fileName);
    
    // 尝试加载第一个可用的图片
    for (const url of urls) {
        const testImg = new Image();
        testImg.onload = () => {
            cinemaElements.artArea.style.backgroundImage = `url(${url})`;
            cinemaElements.artArea.style.backgroundSize = 'cover';
            cinemaElements.artArea.style.backgroundPosition = 'center';
            console.log('[CinemaMode] 加载背景:', url);
        };
        testImg.onerror = () => {
            console.log('[CinemaMode] 背景不存在:', url);
        };
        testImg.src = url;
        
        // 等待一小段时间看是否加载成功
        await new Promise(resolve => setTimeout(resolve, 10));
        if (testImg.complete && testImg.naturalHeight !== 0) {
            break; // 加载成功，停止尝试后续格式
        }
    }
}

// ==================== 分段跳转对话框 ====================

function showSegmentJumpDialog() {
    const total = currentSegments.length;
    const current = currentSegmentIndex + 1;
    
    if (total <= 1) {
        showCinemaToast('当前消息只有一段，无需跳转', 'info');
        return;
    }
    
    // 创建遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(8px);
        z-index: 200050;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: cinemaFadeIn 0.2s ease;
    `;
    
    const theme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = theme ? theme.colors : { 
        primary: '#ff69b4', 
        accent: '#ffd700', 
        text: '#ffffff',
        cardBg: 'rgba(0,0,0,0.9)',
        border: 'rgba(255,105,180,0.5)',
        glow: 'rgba(255,105,180,0.3)'
    };
    
    // 获取当前消息信息
    const msg = cinemaMessages[currentMessageIndex];
    const msgSpeaker = msg ? msg.name : '未知';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: linear-gradient(145deg, ${colors.cardBg}, rgba(20,15,40,0.95));
        border: 2px solid ${colors.border};
        border-radius: 24px;
        padding: 30px 35px;
        width: 420px;
        max-width: 90vw;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${colors.glow};
        transform: scale(0.9);
        animation: panelSlideIn 0.25s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        text-align: center;
    `;
    
    // 当前分段预览
    const currentSegment = currentSegments[currentSegmentIndex];
    const preview = currentSegment ? currentSegment.text.substring(0, 80) + (currentSegment.text.length > 80 ? '...' : '') : '';
    
    dialog.innerHTML = `
        <div style="margin-bottom: 20px;">
            <span style="font-size: 42px; display: block; margin-bottom: 8px;">📄</span>
            <div style="font-size: 20px; font-weight: bold; color: ${colors.accent};">
                跳转到分段
            </div>
            <div style="font-size: 16px; color: #888; margin-top: 4px;">
                💬 ${escapeHtml(msgSpeaker)} · 共 ${total} 段 · 当前第 ${current} 段
            </div>
        </div>
        
        <!-- 当前分段预览 -->
        <div style="
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 20px;
            border-left: 3px solid ${colors.primary};
            text-align: left;
        ">
            <div style="font-size: 16px; color: ${colors.primary}; font-weight: bold; margin-bottom: 4px;">
                📍 当前位置
            </div>
            <div style="font-size: 17px; color: ${colors.text}; opacity: 0.8; line-height: 1.5;">
                ${escapeHtml(preview)}
            </div>
        </div>
        
        <!-- 输入区域 -->
        <div style="display: flex; gap: 12px; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 18px; color: #888;">#</span>
            <input type="number" id="segment-jump-input" 
                   min="1" max="${total}" 
                   value="${current}"
                   style="
                       width: 100px;
                       background: rgba(0,0,0,0.5);
                       border: 2px solid ${colors.border};
                       border-radius: 16px;
                       padding: 12px 16px;
                       color: ${colors.text};
                       font-size: 24px;
                       font-weight: bold;
                       text-align: center;
                       outline: none;
                       transition: all 0.2s;
                       font-family: 'Courier New', monospace;
                   "
                   onfocus="this.style.borderColor='${colors.primary}'; this.style.boxShadow='0 0 20px ${colors.glow}'"
                   onblur="this.style.borderColor='${colors.border}'; this.style.boxShadow='none'"
                   oninput="updateSegmentJumpPreview(this.value)"
            >
            <span style="font-size: 18px; color: #888;">/ ${total}</span>
        </div>
        
        <!-- 预览目标 -->
        <div id="segment-jump-preview" style="
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 20px;
            min-height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            color: #888;
            transition: all 0.2s;
            border: 1px dashed rgba(255,255,255,0.05);
        ">
            💡 输入数字预览内容
        </div>
        
        <!-- 快捷跳转按钮 -->
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
            <button class="segment-jump-quick-btn" data-target="1" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">⏮ 开头</button>
            
            <button class="segment-jump-quick-btn" data-target="${Math.max(1, current - 3)}" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">⬅ -3</button>
            
            <button class="segment-jump-quick-btn" data-target="${Math.min(total, current + 3)}" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">+3 ➡</button>
            
            <button class="segment-jump-quick-btn" data-target="${total}" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">⏭ 结尾</button>
        </div>
        
        <!-- 按钮 -->
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="segment-jump-cancel" style="
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 30px;
                padding: 10px 30px;
                color: #aaa;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.15)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#aaa'">取消</button>
            
            <button id="segment-jump-confirm" style="
                background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary});
                border: none;
                border-radius: 30px;
                padding: 10px 35px;
                color: white;
                font-size: 17px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 15px ${colors.glow};
            " onmouseenter="this.style.transform='scale(1.03)'; this.style.boxShadow='0 6px 25px ${colors.glow}'" 
            onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px ${colors.glow}'">
                🎯 跳转
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const input = document.getElementById('segment-jump-input');
    if (input) {
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    }
    
    // 绑定确认按钮
    document.getElementById('segment-jump-confirm').onclick = () => {
        const val = parseInt(input.value);
        if (!isNaN(val) && val >= 1 && val <= total) {
            overlay.remove();
            currentSegmentIndex = val - 1;
            displayCurrentSegment(cinemaMessages[currentMessageIndex]);
        } else {
            showCinemaToast(`请输入 1-${total} 之间的数字`, 'warning');
            input.focus();
            input.select();
        }
    };
    
    // 绑定取消按钮
    document.getElementById('segment-jump-cancel').onclick = () => overlay.remove();
    
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('segment-jump-confirm').click();
        } else if (e.key === 'Escape') {
            overlay.remove();
        }
    });
    
    document.querySelectorAll('.segment-jump-quick-btn').forEach(btn => {
        btn.onclick = () => {
            const target = parseInt(btn.dataset.target);
            if (!isNaN(target) && target >= 1 && target <= total) {
                input.value = target;
                updateSegmentJumpPreview(target);
                input.focus();
                input.select();
            }
        };
    });
}

function updateSegmentJumpPreview(value) {
    const previewEl = document.getElementById('segment-jump-preview');
    if (!previewEl) return;
    
    const total = currentSegments.length;
    const num = parseInt(value);
    const theme = themeManager ? themeManager.getCurrentTheme() : null;
    const primaryColor = theme ? theme.colors.primary : '#ff69b4';
    
    if (isNaN(num) || num < 1 || num > total) {
        previewEl.innerHTML = `
            <span style="color: #ff6b6b;">⚠️ 请输入 1-${total} 之间的数字</span>
        `;
        previewEl.style.borderColor = '#ff6b6b';
        return;
    }
    
    const seg = currentSegments[num - 1];
    if (seg) {
        const preview = seg.text.substring(0, 100) + (seg.text.length > 100 ? '...' : '');
        const isStatus = seg.isStatus || false;
        const isOption = seg.isOption || false;
        let typeLabel = '📝 正文';
        if (isStatus) typeLabel = '📊 状态栏';
        if (isOption) typeLabel = '🎮 选项';
        
        previewEl.innerHTML = `
            <div style="width: 100%; text-align: left;">
                <span style="color: ${primaryColor}; font-weight: bold;">${typeLabel}</span>
                <span style="color: #aaa; margin-left: 8px; font-size: 16px;">#${num}</span>
                <div style="color: #ccc; margin-top: 2px; font-size: 17px; line-height: 1.4;">${escapeHtml(preview)}</div>
            </div>
        `;
        previewEl.style.borderColor = 'rgba(255,255,255,0.1)';
    }
}

// 挂载到全局
window.showSegmentJumpDialog = showSegmentJumpDialog;
window.updateSegmentJumpPreview = updateSegmentJumpPreview;

function updateSegmentProgress() {
    if (cinemaElements.segmentProgress && currentSegments.length > 1) {
        const current = currentSegmentIndex + 1;
        const total = currentSegments.length;
        cinemaElements.segmentProgress.innerHTML = `
            <span style="cursor: pointer; padding: 4px 12px; border-radius: 20px; transition: all 0.2s; display: inline-block;"
                  onclick="showSegmentJumpDialog()"
                  onmouseenter="this.style.background='rgba(255,105,180,0.2)'; this.style.transform='scale(1.02)'"
                  onmouseleave="this.style.background='transparent'; this.style.transform='scale(1)'"
                  title="点击跳转到当前消息内的分段">
                📄 ${current}/${total}
            </span>
        `;
    } else if (cinemaElements.segmentProgress) {
        cinemaElements.segmentProgress.innerHTML = '';
    }
}

window.showJumpDialog = showJumpDialog;
window.updateJumpPreview = updateJumpPreview;

function updateProgressDisplay() {
    if (cinemaElements.progress) {
        const total = cinemaMessages.length;
        const current = currentMessageIndex + 1;
        cinemaElements.progress.innerHTML = `
            <span style="cursor: pointer; padding: 4px 12px; border-radius: 20px; transition: all 0.2s; display: inline-block;"
                  onclick="showJumpDialog()"
                  onmouseenter="this.style.background='rgba(255,105,180,0.2)'; this.style.transform='scale(1.02)'"
                  onmouseleave="this.style.background='transparent'; this.style.transform='scale(1)'"
                  title="点击跳转到指定段落">
                📖 第 ${current} / ${total} 句
            </span>
        `;
    }
}
// ==================== 跳转对话框 ====================

function showJumpDialog() {
    const total = cinemaMessages.length;
    const current = currentMessageIndex + 1;
    
    // 创建遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(8px);
        z-index: 200050;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: cinemaFadeIn 0.2s ease;
    `;
    
    // 获取当前主题色
    const theme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = theme ? theme.colors : { 
        primary: '#ff69b4', 
        accent: '#ffd700', 
        text: '#ffffff',
        cardBg: 'rgba(0,0,0,0.9)',
        border: 'rgba(255,105,180,0.5)',
        glow: 'rgba(255,105,180,0.3)'
    };
    
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: linear-gradient(145deg, ${colors.cardBg}, rgba(20,15,40,0.95));
        border: 2px solid ${colors.border};
        border-radius: 24px;
        padding: 30px 35px;
        width: 420px;
        max-width: 90vw;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${colors.glow};
        transform: scale(0.9);
        animation: panelSlideIn 0.25s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        text-align: center;
    `;
    
    // 获取当前段落预览
    const currentMsg = cinemaMessages[currentMessageIndex];
    const preview = currentMsg ? currentMsg.content.substring(0, 80) + (currentMsg.content.length > 80 ? '...' : '') : '';
    const speaker = currentMsg ? currentMsg.name : '未知';
    
    dialog.innerHTML = `
        <div style="margin-bottom: 20px;">
            <span style="font-size: 42px; display: block; margin-bottom: 8px;">📖</span>
            <div style="font-size: 20px; font-weight: bold; color: ${colors.accent};">
                跳转到指定段落
            </div>
            <div style="font-size: 16px; color: #888; margin-top: 4px;">
                共 ${total} 句 · 当前第 ${current} 句
            </div>
        </div>
        
        <!-- 当前预览 -->
        <div style="
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 20px;
            border-left: 3px solid ${colors.primary};
            text-align: left;
        ">
            <div style="font-size: 16px; color: ${colors.primary}; font-weight: bold; margin-bottom: 4px;">
                💬 ${speaker}
            </div>
            <div style="font-size: 17px; color: ${colors.text}; opacity: 0.8; line-height: 1.5;">
                ${escapeHtml(preview)}
            </div>
        </div>
        
        <!-- 输入区域 -->
        <div style="display: flex; gap: 12px; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 18px; color: #888;">#</span>
            <input type="number" id="jump-input" 
                   min="1" max="${total}" 
                   value="${current}"
                   style="
                       width: 100px;
                       background: rgba(0,0,0,0.5);
                       border: 2px solid ${colors.border};
                       border-radius: 16px;
                       padding: 12px 16px;
                       color: ${colors.text};
                       font-size: 24px;
                       font-weight: bold;
                       text-align: center;
                       outline: none;
                       transition: all 0.2s;
                       font-family: 'Courier New', monospace;
                   "
                   onfocus="this.style.borderColor='${colors.primary}'; this.style.boxShadow='0 0 20px ${colors.glow}'"
                   onblur="this.style.borderColor='${colors.border}'; this.style.boxShadow='none'"
                   oninput="updateJumpPreview(this.value)"
            >
            <span style="font-size: 18px; color: #888;">/ ${total}</span>
        </div>
        
        <!-- 预览目标 -->
        <div id="jump-preview" style="
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 20px;
            min-height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            color: #888;
            transition: all 0.2s;
            border: 1px dashed rgba(255,255,255,0.05);
        ">
            💡 输入数字预览内容
        </div>
        
        <!-- 快捷跳转按钮 -->
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
            <button class="jump-quick-btn" data-target="1" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">⏮ 开头</button>
            
            <button class="jump-quick-btn" data-target="${Math.max(1, current - 5)}" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">⬅ -5</button>
            
            <button class="jump-quick-btn" data-target="${Math.min(total, current + 5)}" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">+5 ➡</button>
            
            <button class="jump-quick-btn" data-target="${total}" style="
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 4px 14px;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.12)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.06)'; this.style.color='#888'">⏭ 结尾</button>
        </div>
        
        <!-- 按钮 -->
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="jump-cancel" style="
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 30px;
                padding: 10px 30px;
                color: #aaa;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseenter="this.style.background='rgba(255,255,255,0.15)'; this.style.color='#fff'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#aaa'">取消</button>
            
            <button id="jump-confirm" style="
                background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary});
                border: none;
                border-radius: 30px;
                padding: 10px 35px;
                color: white;
                font-size: 17px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 15px ${colors.glow};
            " onmouseenter="this.style.transform='scale(1.03)'; this.style.boxShadow='0 6px 25px ${colors.glow}'" 
            onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px ${colors.glow}'">
                🎯 跳转
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // 获取输入框并聚焦
    const input = document.getElementById('jump-input');
    if (input) {
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    }
    
    // 绑定确认按钮
    document.getElementById('jump-confirm').onclick = () => {
        const val = parseInt(input.value);
        if (!isNaN(val) && val >= 1 && val <= total) {
            overlay.remove();
            goToMessage(val - 1);
        } else {
            showCinemaToast(`请输入 1-${total} 之间的数字`, 'warning');
            input.focus();
            input.select();
        }
    };
    
    // 绑定取消按钮
    document.getElementById('jump-cancel').onclick = () => overlay.remove();
    
    // 点击遮罩关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
    
    // 键盘事件：Enter 确认，Esc 取消
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('jump-confirm').click();
        } else if (e.key === 'Escape') {
            overlay.remove();
        }
    });
    
    // 绑定快捷按钮
    document.querySelectorAll('.jump-quick-btn').forEach(btn => {
        btn.onclick = () => {
            const target = parseInt(btn.dataset.target);
            if (!isNaN(target) && target >= 1 && target <= total) {
                input.value = target;
                updateJumpPreview(target);
                input.focus();
                input.select();
            }
        };
    });
}

// 预览目标内容
function updateJumpPreview(value) {
    const previewEl = document.getElementById('jump-preview');
    if (!previewEl) return;
    
    const total = cinemaMessages.length;
    const num = parseInt(value);
    
    if (isNaN(num) || num < 1 || num > total) {
        previewEl.innerHTML = `
            <span style="color: #ff6b6b;">⚠️ 请输入 1-${total} 之间的数字</span>
        `;
        previewEl.style.borderColor = '#ff6b6b';
        return;
    }
    
    const msg = cinemaMessages[num - 1];
    if (msg) {
        const preview = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
        const speaker = msg.name || '未知';
        previewEl.innerHTML = `
            <div style="width: 100%; text-align: left;">
                <span style="color: ${themeManager?.getCurrentTheme()?.colors?.primary || '#ff69b4'}; font-weight: bold;">💬 ${escapeHtml(speaker)}</span>
                <span style="color: #aaa; margin-left: 8px; font-size: 16px;">#${num}</span>
                <div style="color: #ccc; margin-top: 2px; font-size: 17px; line-height: 1.4;">${escapeHtml(preview)}</div>
            </div>
        `;
        previewEl.style.borderColor = 'rgba(255,255,255,0.1)';
    }
}
function highlightCurrentItem() {
    const items = document.querySelectorAll('.cinema-message-item');
    const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = currentTheme ? currentTheme.colors : { primary: '#ff69b4', text: '#ffffff' };
    
    items.forEach((item, idx) => {
        if (idx === currentMessageIndex) {
            item.style.background = `${colors.primary}44`;
            item.style.borderLeft = `3px solid ${colors.primary}`;
            item.style.color = colors.accent || colors.primary;
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.style.background = 'rgba(255,255,255,0.05)';
            item.style.borderLeft = 'none';
            item.style.color = colors.text;
        }
    });
}

// ==================== 导航控制 ====================

function handleTextAreaClick() {
    if (currentSegmentIndex < currentSegments.length - 1) {
        nextSegment();
    } else if (currentMessageIndex < cinemaMessages.length - 1) {

        nextMessage();
    } else {
        goToMessage(0);
    }
}

function nextSegment() {
    if (currentSegmentIndex < currentSegments.length - 1) {
        currentSegmentIndex++;
        displayCurrentSegment(cinemaMessages[currentMessageIndex]);
    } else {
        nextMessage();
    }
}

function prevSegment() {
    if (currentSegmentIndex > 0) {
        currentSegmentIndex--;
        displayCurrentSegment(cinemaMessages[currentMessageIndex]);
    } else if (currentMessageIndex > 0) {
        goToMessage(currentMessageIndex - 1);
        currentSegmentIndex = currentSegments.length - 1;
        displayCurrentSegment(cinemaMessages[currentMessageIndex]);
    }
}

function goToMessage(index) {
    if (index < 0) index = 0;
    if (index >= cinemaMessages.length) index = cinemaMessages.length - 1;

    // 重置音乐状态管理器（切换消息时重置，因为新消息可能有不同的音乐上下文）
    if (musicStateManager) {
        musicStateManager.reset();
    }
    const oldSnapshot = createStateSnapshot();
    currentMessageIndex = index;
    const msg = cinemaMessages[currentMessageIndex];

    // ========== 新增：切换消息时清空日志 ==========
    if (msg) {
        // 清空日志并添加新消息标记
        clearLogForNewMessage(index, msg.name);
    }

    currentSegments = textSplitter.split(msg.content, 80);
    currentSegmentIndex = 0;
    // 延迟对比
    setTimeout(() => {
        const newSnapshot = createStateSnapshot();
        const changes = compareStates(oldSnapshot, newSnapshot);
        
        if (changes.length > 0) {
            console.log('[状态对比] 切换消息后检测到变化:', changes);
            showChangeNotification(changes);
        }
    }, 200);
    displayCurrentSegment(msg);
    highlightCurrentItem();
    updateProgressDisplay();
}

function prevMessage() {
    if (currentMessageIndex > 0) {
        goToMessage(currentMessageIndex - 1);
        currentSegmentIndex = currentSegments.length - 1;
        displayCurrentSegment(cinemaMessages[currentMessageIndex]);
    } else {
        goToMessage(cinemaMessages.length - 1);
        currentSegmentIndex = currentSegments.length - 1;
        displayCurrentSegment(cinemaMessages[currentMessageIndex]);
    }
}

function nextMessage() {     
    const msg = cinemaMessages[currentMessageIndex];
    console.log("[下一句消息]当前说话人${msg.isUser}" ,context.chat)
    if (isoptionall == false && msg.isUser != true) {
        // 没有选项，显示自定义输入面板
        optionPanelManager.showCustomOnlyPanel();
    }
    if (currentMessageIndex < cinemaMessages.length - 1) {
        goToMessage(currentMessageIndex + 1);
    } else {
        goToMessage(0);
    }
}

// ==================== 优化版自动播放 ====================

// 阅读速度配置（字/分钟）
const readingSpeed = {
    slow: 180,      // 慢速 - 仔细阅读
    normal: 300,    // 正常速度
    fast: 450,      // 快速阅读
    galgame: 240    // Galgame风格（带语音感）
};

// 当前选择的阅读速度（可在UI中调整）
let currentReadingSpeed = readingSpeed.galgame;

// 计算文本阅读所需时间（毫秒）
function calculateReadingTime(text) {
    if (!text || text.trim() === '') return 2000; // 默认2秒
    
    // 统计中文字符数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // 统计英文单词数（按空格分割）
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    // 统计标点符号（增加停顿）
    const punctuations = (text.match(/[。！？!?；;：:、，,.]/g) || []).length;
    
    // 总字符数（中文字符 + 英文单词）
    const totalChars = chineseChars + englishWords;
    
    // 基础阅读时间：字数 / 阅读速度（字/分钟） * 60秒 * 1000毫秒
    let readingTimeMs = (totalChars / currentReadingSpeed) * 60 * 1000;
    
    // 添加标点停顿：每个标点额外增加0.3秒
    readingTimeMs += punctuations * 300;
    
    // 状态栏或选项块需要额外时间
    if (text.includes('```') || text.includes('***')) {
        readingTimeMs += 1500;
    }
    
    // 限制时间范围：最小1.5秒，最大12秒
    readingTimeMs = Math.max(1500, Math.min(12000, readingTimeMs));
    
    console.log(`[自动播放] 文本长度: ${totalChars}字, 标点: ${punctuations}个, 阅读时间: ${Math.round(readingTimeMs / 1000)}秒`);
    
    return readingTimeMs;
}

// 计算分段文本的阅读时间（用于多个分段）
function calculateSegmentsTime(segments, currentIndex) {
    let totalTime = 0;
    for (let i = currentIndex; i < segments.length; i++) {
        totalTime += calculateReadingTime(segments[i].text);
    }
    return totalTime;
}

// 优化后的自动播放函数
function toggleAutoPlay() {
    if (autoPlayInterval) {
        // 停止自动播放
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        if (cinemaElements.playBtn) cinemaElements.playBtn.textContent = '▶ 自动播放';
        showCinemaToast('自动播放已暂停', 'info');
    } else {
        // 开始自动播放
        startAutoPlay();
    }
}

// 开始自动播放
function startAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    
    // 立即显示当前分段
    displayCurrentSegment(cinemaMessages[currentMessageIndex]);
    
    // 计算当前分段的阅读时间
    const currentSegment = currentSegments[currentSegmentIndex];
    const currentTime = calculateReadingTime(currentSegment?.text || '');
    
    console.log(`[自动播放] 当前分段: ${currentSegmentIndex + 1}/${currentSegments.length}, 停留时间: ${currentTime / 1000}秒`);
    
    // 设置定时器
    autoPlayInterval = setTimeout(function playNext() {
        // 判断是否还有下一个分段
        if (currentSegmentIndex < currentSegments.length - 1) {
            // 下一个分段
            nextSegment();
            
            // 重新设置定时器（等待新分段的时间）
            const newSegment = currentSegments[currentSegmentIndex];
            if (newSegment) {
                const newTime = calculateReadingTime(newSegment.text);
                console.log(`[自动播放] 下一分段: ${currentSegmentIndex + 1}/${currentSegments.length}, 停留时间: ${newTime / 1000}秒`);
                autoPlayInterval = setTimeout(playNext, newTime);
            } else {
                // 没有新分段，结束
                clearAutoPlay();
            }
        } 
        else if (currentMessageIndex < cinemaMessages.length - 1) {
            // 下一条消息
            nextMessage();
            
            // 新消息加载后，重新计算时间
            const newSegment = currentSegments[currentSegmentIndex];
            if (newSegment) {
                const newTime = calculateReadingTime(newSegment.text);
                console.log(`[自动播放] 下一条消息: ${currentMessageIndex + 1}/${cinemaMessages.length}, 停留时间: ${newTime / 1000}秒`);
                autoPlayInterval = setTimeout(playNext, newTime);
            } else {
                clearAutoPlay();
            }
        } 
        else {
            // 播放完毕
            clearAutoPlay();
            showCinemaToast('剧情播放完毕 🎬', 'info');
        }
    }, currentTime);
    
    // 更新按钮文字
    if (cinemaElements.playBtn) cinemaElements.playBtn.textContent = '⏸ 暂停';
}

// 清除自动播放
function clearAutoPlay() {
    if (autoPlayInterval) {
        clearTimeout(autoPlayInterval);
        autoPlayInterval = null;
    }
    if (cinemaElements.playBtn) cinemaElements.playBtn.textContent = '▶ 自动播放';
}

// 设置阅读速度（可在控制台调用或添加UI按钮）
function setReadingSpeed(speed) {
    const validSpeeds = ['slow', 'normal', 'fast', 'galgame'];
    if (validSpeeds.includes(speed)) {
        currentReadingSpeed = readingSpeed[speed];
        showCinemaToast(`阅读速度已改为: ${speed}`, 'info');
        console.log(`[自动播放] 阅读速度: ${speed} (${currentReadingSpeed}字/分钟)`);
        
        // 如果正在自动播放，重新开始以应用新速度
        if (autoPlayInterval) {
            const wasPlaying = autoPlayInterval !== null;
            clearAutoPlay();
            if (wasPlaying) {
                startAutoPlay();
            }
        }
    } else {
        console.warn(`[自动播放] 无效的速度选项: ${speed}，可选: slow, normal, fast, galgame`);
    }
}

// 在UI中添加速度控制按钮（可选）
function addSpeedControl() {
    if (document.getElementById('cinema-speed-control')) return;
    
    const speedControl = document.createElement('div');
    speedControl.id = 'cinema-speed-control';
    speedControl.style.cssText = `
        display: inline-flex;
        gap: 5px;
        margin-left: 15px;
    `;
    
    speedControl.innerHTML = `
        <button class="cinema-speed-btn" data-speed="slow" style="
            background: rgba(255,105,180,0.2);
            border: 1px solid #ff69b4;
            color: #ff69b4;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 16px;
            cursor: pointer;
        ">🐢 慢</button>
        <button class="cinema-speed-btn" data-speed="galgame" style="
            background: rgba(255,105,180,0.4);
            border: 1px solid #ff69b4;
            color: #ffd700;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 16px;
            cursor: pointer;
        ">🎮 Gal</button>
        <button class="cinema-speed-btn" data-speed="normal" style="
            background: rgba(255,105,180,0.2);
            border: 1px solid #ff69b4;
            color: #ff69b4;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 16px;
            cursor: pointer;
        ">⚡ 中</button>
        <button class="cinema-speed-btn" data-speed="fast" style="
            background: rgba(255,105,180,0.2);
            border: 1px solid #ff69b4;
            color: #ff69b4;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 16px;
            cursor: pointer;
        ">🚀 快</button>
    `;
    
    // 插入到控制栏
    const controlBar = document.querySelector('#cinema-text-area div:first-of-type');
    if (controlBar) {
        controlBar.appendChild(speedControl);
    } else {
        const textArea = document.getElementById('cinema-text-area');
        if (textArea) {
            const existingBar = textArea.querySelector('div');
            if (existingBar && existingBar.style.display === 'flex') {
                existingBar.appendChild(speedControl);
            }
        }
    }
    
    
    // 绑定速度按钮事件
    document.querySelectorAll('.cinema-speed-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const speed = btn.getAttribute('data-speed');
            setReadingSpeed(speed);
            
            // 高亮当前选中的按钮
            document.querySelectorAll('.cinema-speed-btn').forEach(b => {
                b.style.background = 'rgba(255,105,180,0.2)';
                b.style.color = '#ff69b4';
            });
            btn.style.background = 'rgba(255,105,180,0.4)';
            btn.style.color = '#ffd700';
        };
    });
}

function toggleMusic() {
    if (audioManager) {
        const isMuted = audioManager.toggleMute();
        const toggleBtn = document.getElementById('cinema-music-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = isMuted ? '🔇 音乐' : '🔊 音乐';
        }
        showCinemaToast(isMuted ? '音乐已静音' : '音乐已恢复', 'info');
    }
}

// ==================== 修改 closeCinemaMode 函数 ====================

function closeCinemaMode() {
    // 保存数据
    if (cinemaModeActive) {
        saveCinemaData();
    }
    
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    if (audioManager) {
        audioManager.stopMusic();
    }
    if (optionPanelManager) {
        optionPanelManager.forceClose();
    }
    cinemaModeActive = false;
    
    resetCharacterPortraits();
    lastProcessedMessageHash = null;
    
    // ========== 重置状态栏创建标志 ==========
    syncPanelCreated = false;

    // ========== 新增：移除浮动回顶按钮 ==========
    const floatingBtn = document.getElementById('cinema-floating-scroll-btn');
    if (floatingBtn) {
        floatingBtn.remove();
    }
    
    const overlay = document.getElementById('cinema-overlay');
    if (overlay) overlay.remove();
    console.log('[CinemaMode] 影院模式已关闭，数据已保存，浮动按钮已移除');
}

function showCinemaToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: #ffd700;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 16px;
        z-index: 2000009;
        animation: fadeOut 2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}
// ==================== 状态快照对比系统 ====================

// 保存状态快照
let lastStateSnapshot = {
    attributes: {},
    stats: {},
    items: [],
    characters: [],
    otherSections: {}
};

// 创建当前状态快照（扩展版）
function createStateSnapshot() {
    return {
        attributes: JSON.parse(JSON.stringify(gameState.attributes || {})),
        stats: JSON.parse(JSON.stringify(gameState.stats || {})),
        items: JSON.parse(JSON.stringify(gameState.items || [])),
        characters: JSON.parse(JSON.stringify(characters.map(c => ({
            name: c.name,
            affection: c.affection,
            gender: c.gender,
            visible: c.visible,
            description: c.description
        })))),
        otherSections: JSON.parse(JSON.stringify(gameState.otherSections || {})),
        day: gameState.day,
        phase: gameState.phase,
        weather: gameState.weather,
        location: gameState.location
    };
}

// 对比两个状态，返回变化列表
function compareStates(oldState, newState) {
    const changes = [];
    
    // 1. 对比属性变化
    const allAttrKeys = new Set([...Object.keys(oldState.attributes), ...Object.keys(newState.attributes)]);
    for (const key of allAttrKeys) {
        const oldValue = oldState.attributes[key];
        const newValue = newState.attributes[key];
        
        if (oldValue !== undefined && newValue === undefined) {
            changes.push({ type: 'attribute_removed', name: key, oldValue });
        } else if (oldValue === undefined && newValue !== undefined) {
            changes.push({ type: 'attribute_added', name: key, newValue });
        } else if (oldValue !== newValue) {
            const delta = newValue - oldValue;
            changes.push({ type: 'attribute_changed', name: key, oldValue, newValue, delta });
        }
    }
    
    // 2. 对比角色属性变化（力量、敏捷等）
    const allStatKeys = new Set([...Object.keys(oldState.stats), ...Object.keys(newState.stats)]);
    for (const key of allStatKeys) {
        const oldValue = oldState.stats[key]?.value;
        const newValue = newState.stats[key]?.value;
        
        if (oldValue !== undefined && newValue === undefined) {
            changes.push({ type: 'stat_removed', name: key, oldValue });
        } else if (oldValue === undefined && newValue !== undefined) {
            changes.push({ type: 'stat_added', name: key, newValue });
        } else if (oldValue !== newValue) {
            const delta = newValue - oldValue;
            changes.push({ type: 'stat_changed', name: key, oldValue, newValue, delta });
        }
    }
    
    // 3. 对比物品栏变化
    const oldItemMap = new Map(oldState.items.map(i => [i.name, i]));
    const newItemMap = new Map(newState.items.map(i => [i.name, i]));
    
    // 新增物品
    for (const [name, item] of newItemMap) {
        if (!oldItemMap.has(name)) {
            changes.push({ type: 'item_added', name, quantity: item.quantity, note: item.note });
        } else if (oldItemMap.get(name).quantity !== item.quantity) {
            const oldQty = oldItemMap.get(name).quantity;
            const delta = item.quantity - oldQty;
            changes.push({ type: 'item_quantity_changed', name, oldQuantity: oldQty, newQuantity: item.quantity, delta, note: item.note });
        }
    }
    
    // 移除物品
    for (const [name, item] of oldItemMap) {
        if (!newItemMap.has(name)) {
            changes.push({ type: 'item_removed', name, quantity: item.quantity });
        }
    }
    
    // 4. 对比角色好感度变化
    const oldCharMap = new Map(oldState.characters.map(c => [c.name, c]));
    const newCharMap = new Map(newState.characters.map(c => [c.name, c]));
    
    for (const [name, char] of newCharMap) {
        if (!oldCharMap.has(name)) {
            changes.push({ type: 'character_added', name, affection: char.affection, gender: char.gender });
        } else {
            const oldChar = oldCharMap.get(name);
            if (oldChar.affection !== char.affection) {
                const delta = char.affection - oldChar.affection;
                changes.push({ type: 'affection_changed', name, oldAffection: oldChar.affection, newAffection: char.affection, delta });
            }
            // 显隐状态变化
            if (oldChar.visible !== char.visible) {
                changes.push({ type: 'visibility_changed', name, oldVisible: oldChar.visible, newVisible: char.visible });
            }
        }
    }

     // ========== 新增：其他栏目变化 ==========
     const oldSectionKeys = new Set([...Object.keys(oldState.otherSections), ...Object.keys(newState.otherSections)]);
     for (const key of oldSectionKeys) {
         const oldContent = oldState.otherSections[key];
         const newContent = newState.otherSections[key];
         
         if (oldContent !== newContent) {
             if (oldContent === undefined) {
                 changes.push({ type: 'section_added', name: key });
             } else if (newContent === undefined) {
                 changes.push({ type: 'section_removed', name: key });
             } else if (oldContent !== newContent) {
                 changes.push({ type: 'section_changed', name: key });
             }
         }
     }
    
    // 新增：时间变化检测
    if (oldState.day !== newState.day) {
        changes.push({
            type: 'day_changed',
            oldDay: oldState.day,
            newDay: newState.day
        });
    }
    
    // 时段变化
    if (oldState.phase !== newState.phase && newState.phase) {
        changes.push({
            type: 'phase_changed',
            oldPhase: oldState.phase,
            newPhase: newState.phase
        });
    }
    
    // 天气变化
    if (oldState.weather !== newState.weather && newState.weather) {
        changes.push({
            type: 'weather_changed',
            oldWeather: oldState.weather,
            newWeather: newState.weather
        });
    }
    
    // 位置变化
    if (oldState.location !== newState.location && newState.location) {
        changes.push({
            type: 'location_changed',
            oldLocation: oldState.location,
            newLocation: newState.location
        });
    }
    return changes;
}
// ==================== 优化版通知系统 - 合并显示 ====================

// 通知队列
let notificationQueue = [];
let notificationTimer = null;
let isShowingNotification = false;

// 清空通知队列
function clearNotificationQueue() {
    notificationQueue = [];
    if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
    }
}


// 修改 addChangeToQueue 支持更多合并
function addChangeToQueue(change) {
    let merged = false;
    
    for (const existing of notificationQueue) {
        // 好感度变化合并到同一个角色
        if (existing.type === 'affection_changed' && change.type === 'affection_changed' && existing.name === change.name) {
            existing.newAffection = change.newAffection;
            existing.delta = change.delta;
            merged = true;
            break;
        }
        // 物品变化合并到同一个物品
        if ((existing.type === 'item_added' || existing.type === 'item_quantity_changed') && 
            (change.type === 'item_added' || change.type === 'item_quantity_changed') && 
            existing.name === change.name) {
            existing.delta += change.delta || change.quantity;
            existing.newQuantity = (existing.newQuantity || 0) + (change.newQuantity || change.quantity);
            merged = true;
            break;
        }
        // 栏目变化合并
        if (existing.type === 'section_changed' && change.type === 'section_changed' && existing.name === change.name) {
            merged = true;
            break;
        }
    }
    
    if (!merged) {
        notificationQueue.push(change);
    }
}

// 显示合并后的通知（精致版）
function showMergedNotification() {
    if (notificationQueue.length === 0) return;
    if (isShowingNotification) return;
    
    isShowingNotification = true;
    const changes = [...notificationQueue];
    clearNotificationQueue();
    
    // 分类变化
    const categories = {
        time: [],         // 时间变化
        location: [],     // 位置变化
        character: [],    // 角色相关
        affection: [],    // 好感度变化
        attribute: [],    // 属性变化
        item: [],        // 物品变化
        section: []       // 栏目变化（新增）
    };
    
    for (const change of changes) {
        if (change.type === 'day_changed' || change.type === 'phase_changed' || change.type === 'weather_changed') {
            categories.time.push(change);
        } else if (change.type === 'location_changed') {
            categories.location.push(change);
        } else if (change.type === 'character_added') {
            categories.character.push(change);
        } else if (change.type === 'affection_changed') {
            categories.affection.push(change);
        } else if (change.type === 'attribute_changed' || change.type === 'attribute_added') {
            categories.attribute.push(change);
        } else if (change.type === 'item_added' || change.type === 'item_quantity_changed' || change.type === 'item_removed') {
            categories.item.push(change);
        }else if (change.type === 'section_added' || change.type === 'section_changed') {
            categories.section.push(change);
        }
    }
    
    // 确定主题
    let theme = 'default';
    let icon = '📌';
    let title = '状态更新';
    
    if (categories.time.length > 0) {
        theme = 'time';
        icon = '⏰';
        title = '🕐 时间流逝 🕐';
    } else if (categories.location.length > 0) {
        theme = 'location';
        icon = '📍';
        title = '🗺️ 位置移动 🗺️';
    } else if (categories.character.length > 0 || categories.affection.length > 0) {
        theme = 'romance';
        icon = '💕';
        title = '✨ 邂逅与心动 ✨';
    } else if (categories.item.length > 0) {
        theme = 'item';
        icon = '🎒';
        title = '📦 物品变动 📦';
    } else if (categories.attribute.length > 0) {
        theme = 'status';
        icon = '📊';
        title = '⚡ 状态变化 ⚡';
    } else if (categories.section.length > 0) {
        theme = 'section';
        icon = '📋';
        title = '📌 信息更新 📌';
    }
    
    // 构建内容HTML
    let contentHtml = '';

    // ========== 时间变化显示 ==========
    if (categories.time.length > 0) {
        let timeHtml = '';
        let newDay = null;
        let newPhase = null;
        let newWeather = null;
        
        for (const change of categories.time) {
            if (change.type === 'day_changed') {
                newDay = change.newDay;
                timeHtml += `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>📅</span>
                        <span>第 ${change.oldDay} 天 → 第 ${change.newDay} 天</span>
                    </div>
                `;
            } else if (change.type === 'phase_changed') {
                newPhase = change.newPhase;
                const phaseIcon = getPhaseIcon(change.newPhase);
                timeHtml += `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${phaseIcon}</span>
                        <span>${change.oldPhase || '?'} → ${change.newPhase}</span>
                    </div>
                `;
            } else if (change.type === 'weather_changed') {
                newWeather = change.newWeather;
                const weatherIcon = getWeatherIcon(change.newWeather);
                timeHtml += `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${weatherIcon}</span>
                        <span>${change.oldWeather || '?'} → ${change.newWeather}</span>
                    </div>
                `;
            }
        }
        
        if (timeHtml) {
            contentHtml += `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px;
                    margin: 6px 0;
                    background: linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,193,7,0.02));
                    border-radius: 16px;
                    border-left: 3px solid #ffc107;
                ">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: #ffc107;">
                        <span>⏰</span> 时间推进
                    </div>
                    ${timeHtml}
                </div>
            `;
        }
    }
    
    // ========== 位置变化显示 ==========
    for (const change of categories.location) {
        contentHtml += `
            <div class="cinema-notify-item" data-type="location" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                margin: 8px 0;
                background: linear-gradient(135deg, rgba(78,205,196,0.12), rgba(78,205,196,0.03));
                border-radius: 16px;
                border-left: 3px solid #4ecdc4;
                transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                cursor: pointer;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: rgba(78,205,196,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    transition: transform 0.2s;
                ">📍</div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; color: #4ecdc4; margin-bottom: 2px;">移动至</div>
                    <div style="font-size: 17px; font-weight: bold; color: #ffd700;">${escapeHtml(change.newLocation)}</div>
                    ${change.oldLocation ? `<div style="font-size: 16px; color: #888; margin-top: 3px;">← ${escapeHtml(change.oldLocation)}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    // 角色加入
    for (const change of categories.character) {
        contentHtml += `
            <div class="cinema-notify-item" data-type="character" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                margin: 8px 0;
                background: linear-gradient(135deg, rgba(255,105,180,0.15), rgba(255,105,180,0.05));
                border-radius: 16px;
                border-left: 3px solid #ff88cc;
                transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                cursor: pointer;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: rgba(255,105,180,0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    transition: transform 0.2s;
                ">✨</div>
                <div style="flex: 1;">
                    <div style="font-size: 17px; font-weight: bold; color: #ffd700;">新角色出现</div>
                    <div style="font-size: 18px; color: #ff88cc;">${escapeHtml(change.name)}</div>
                </div>
                <div style="font-size: 16px; font-weight: bold; color: #ff88cc; background: rgba(255,105,180,0.2); padding: 4px 10px; border-radius: 20px;">❤️ ${change.affection}</div>
            </div>
        `;
    }
    
    // 好感度变化
    for (const change of categories.affection) {
        const isPositive = change.delta > 0;
        const deltaText = isPositive ? `+${change.delta}` : `${change.delta}`;
        const arrowIcon = isPositive ? '💕' : '💔';
        const barWidth = Math.min(100, change.newAffection);
        
        contentHtml += `
            <div class="cinema-notify-item" data-type="affection" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                margin: 8px 0;
                background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.15));
                border-radius: 16px;
                border-left: 3px solid ${isPositive ? '#ff88cc' : '#ff8888'};
                transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                cursor: pointer;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: rgba(255,105,180,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    transition: transform 0.2s;
                ">${arrowIcon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: bold; color: #ffd700;">${escapeHtml(change.name)}</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px;">
                        <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${barWidth}%; height: 100%; background: ${isPositive ? '#ff88cc' : '#888'}; border-radius: 3px;"></div>
                        </div>
                        <span style="font-size: 16px; color: #ffd700;">${change.newAffection}</span>
                    </div>
                </div>
                <div style="
                    font-size: 18px; 
                    font-weight: bold; 
                    color: ${isPositive ? '#88ff88' : '#ff8888'};
                    background: rgba(0,0,0,0.3);
                    padding: 4px 10px;
                    border-radius: 20px;
                ">${deltaText}</div>
            </div>
        `;
    }
    


    // 物品变化
    // 合并相同物品
    const itemMap = new Map();
    for (const change of categories.item) {
        const name = change.name;
        if (!itemMap.has(name)) {
            itemMap.set(name, { name, delta: 0, note: change.note });
        }
        if (change.type === 'item_added') {
            itemMap.get(name).delta += change.quantity;
        } else if (change.type === 'item_quantity_changed') {
            itemMap.get(name).delta += change.delta;
        } else if (change.type === 'item_removed') {
            itemMap.get(name).delta -= change.quantity;
        }
    }
    
    
    for (const [name, data] of itemMap) {
        const isPositive = data.delta > 0;
        const deltaText = isPositive ? `+${data.delta}` : `${data.delta}`;
        const itemIcon = isPositive ? '📦' : '🗑️';
        
        contentHtml += `
            <div class="cinema-notify-item" data-type="item" style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                margin: 8px 0;
                background: linear-gradient(135deg, rgba(78,205,196,0.12), rgba(78,205,196,0.03));
                border-radius: 16px;
                border-left: 3px solid ${isPositive ? '#4ecdc4' : '#ff8888'};
                transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                cursor: pointer;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: rgba(78,205,196,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    transition: transform 0.2s;
                ">${itemIcon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 17px; font-weight: bold; color: #ffd700;">${escapeHtml(name)}</div>
                    ${data.note ? `<div style="font-size: 16px; color: #aaa; margin-top: 2px;">${escapeHtml(data.note)}</div>` : ''}
                </div>
                <div style="
                    font-size: 18px; 
                    font-weight: bold; 
                    color: ${isPositive ? '#4ecdc4' : '#ff8888'};
                    background: rgba(0,0,0,0.3);
                    padding: 4px 10px;
                    border-radius: 20px;
                ">${deltaText}</div>
            </div>
        `;
    }
    
    // 属性变化
    for (const change of categories.attribute) {
        const isPositive = change.delta > 0;
        const deltaText = isPositive ? `+${change.delta}` : `${change.delta}`;
        const arrowIcon = isPositive ? '📈' : '📉';
        const percent = Math.min(100, change.newValue);
        
        if (change.type === 'attribute_changed') {
            contentHtml += `
                <div class="cinema-notify-item" data-type="attribute" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    margin: 8px 0;
                    background: linear-gradient(135deg, rgba(255,105,180,0.1), rgba(255,105,180,0.02));
                    border-radius: 16px;
                    border-left: 3px solid ${isPositive ? '#ff69b4' : '#ff8888'};
                    transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                    cursor: pointer;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(255,105,180,0.15);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 22px;
                        transition: transform 0.2s;
                    ">${arrowIcon}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 16px; font-weight: bold; color: #ffd700;">${escapeHtml(change.name)}</div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px;">
                            <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${percent}%; height: 100%; background: ${isPositive ? '#ff69b4' : '#888'}; border-radius: 3px;"></div>
                            </div>
                            <span style="font-size: 16px; color: #ffd700;">${change.newValue}</span>
                        </div>
                    </div>
                    <div style="
                        font-size: 18px; 
                        font-weight: bold; 
                        color: ${isPositive ? '#88ff88' : '#ff8888'};
                        background: rgba(0,0,0,0.3);
                        padding: 4px 10px;
                        border-radius: 20px;
                    ">${deltaText}</div>
                </div>
            `;
        } else if (change.type === 'attribute_added') {
            contentHtml += `
                <div class="cinema-notify-item" data-type="attribute" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    margin: 8px 0;
                    background: linear-gradient(135deg, rgba(78,205,196,0.12), rgba(78,205,196,0.03));
                    border-radius: 16px;
                    border-left: 3px solid #4ecdc4;
                    transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                    cursor: pointer;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(78,205,196,0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 22px;
                        transition: transform 0.2s;
                    ">✨</div>
                    <div style="flex: 1;">
                        <div style="font-size: 17px; font-weight: bold; color: #4ecdc4;">新属性</div>
                        <div style="font-size: 17px; color: #ffd700;">${escapeHtml(change.name)} = ${change.newValue}</div>
                    </div>
                </div>
            `;
        }
    }
    // ========== 新增：栏目变化显示 ==========
    for (const change of categories.section) {
        const sectionIcon = getSectionIcon(change.name);
        if (change.type === 'section_added') {
            contentHtml += `
                <div class="cinema-notify-item" data-type="section" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    margin: 8px 0;
                    background: linear-gradient(135deg, rgba(255,193,7,0.12), rgba(255,193,7,0.03));
                    border-radius: 16px;
                    border-left: 3px solid #ffc107;
                    transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                    cursor: pointer;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(255,193,7,0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 22px;
                    ">${sectionIcon}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 16px; color: #ffc107;">新栏目</div>
                        <div style="font-size: 17px; font-weight: bold; color: #ffd700;">${escapeHtml(change.name)}</div>
                    </div>
                </div>
            `;
        } else if (change.type === 'section_changed') {
            contentHtml += `
                <div class="cinema-notify-item" data-type="section" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    margin: 8px 0;
                    background: linear-gradient(135deg, rgba(255,193,7,0.08), rgba(255,193,7,0.02));
                    border-radius: 16px;
                    border-left: 3px solid #ffc107;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(255,193,7,0.15);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 22px;
                    ">📝</div>
                    <div style="flex: 1;">
                        <div style="font-size: 16px; color: #ffc107;">栏目更新</div>
                        <div style="font-size: 16px; font-weight: bold; color: #ffd700;">${escapeHtml(change.name)}</div>
                    </div>
                </div>
            `;
        }
    }
    // 如果没有内容，返回
    if (!contentHtml) {
        isShowingNotification = false;
        return;
    }
    
    // 创建精美通知
    createFancyNotification(icon, title, contentHtml, theme);
    
    setTimeout(() => {
        isShowingNotification = false;
        if (notificationQueue.length > 0) {
            showMergedNotification();
        }
    }, 3500);
}

// 在生成内容时添加 hover 样式类
function generateStyledChangeItem(content, bgGradient, borderColor, hoverGlow) {
    return `
        <div class="notification-change-item" 
             style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                margin: 6px 0;
                background: ${bgGradient};
                border-radius: 16px;
                border-left: 3px solid ${borderColor};
                transition: all 0.2s ease;
                cursor: pointer;
             "
             onmouseenter="this.style.transform='translateX(4px)'; this.style.background='${hoverGlow}'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'"
             onmouseleave="this.style.transform='translateX(0)'; this.style.background='${bgGradient}'; this.style.boxShadow='none'">
            ${content}
        </div>
    `;
}

// 创建美观通知（精致版）
function createFancyNotification(icon, title, contentHtml, theme = 'default') {
    const toast = document.createElement('div');
    
    // 根据主题选择主题色
    const themeColors = {
        romance: { border: '#ff88cc', glow: 'rgba(255,105,180,0.4)', bg: 'linear-gradient(135deg, rgba(40,20,50,0.98), rgba(30,15,40,0.98))' },
        time: { border: '#ffc107', glow: 'rgba(255,193,7,0.4)', bg: 'linear-gradient(135deg, rgba(50,40,20,0.98), rgba(40,30,15,0.98))' },
        location: { border: '#4ecdc4', glow: 'rgba(78,205,196,0.4)', bg: 'linear-gradient(135deg, rgba(20,45,50,0.98), rgba(15,35,40,0.98))' },
        item: { border: '#4ecdc4', glow: 'rgba(78,205,196,0.4)', bg: 'linear-gradient(135deg, rgba(20,40,50,0.98), rgba(15,30,40,0.98))' },
        status: { border: '#ff69b4', glow: 'rgba(255,105,180,0.3)', bg: 'linear-gradient(135deg, rgba(30,20,50,0.98), rgba(20,15,40,0.98))' },
        default: { border: '#ff69b4', glow: 'rgba(255,105,180,0.3)', bg: 'linear-gradient(135deg, rgba(30,20,50,0.98), rgba(20,15,40,0.98))' }
    };
    
    const colors = themeColors[theme] || themeColors.default;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 340px;
        right: 20px;
        width: 360px;
        max-width: calc(100vw - 40px);
        background: ${colors.bg};
        backdrop-filter: blur(20px);
        border: 2px solid ${colors.border};
        border-radius: 24px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 30px ${colors.glow};
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
        z-index: 200012;
        overflow: hidden;
        pointer-events: auto;  /* 改为 auto，允许交互 */
    `;
    
    toast.innerHTML = `
        <div style="
            padding: 16px 18px;
            background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
        ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                <div style="
                    width: 44px;
                    height: 44px;
                    background: rgba(255,105,180,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    animation: pulse 0.5s ease;
                ">${icon}</div>
                <div>
                    <div style="font-size: 16px; color: ${colors.border}; letter-spacing: 1px;">✨ 实时更新 ✨</div>
                    <div style="font-size: 18px; font-weight: bold; color: #ffd700;">${title}</div>
                </div>
            </div>
            <div style="max-height: 400px; overflow-y: auto; padding-right: 4px;">
                ${contentHtml}
            </div>
        </div>
        <div style="
            height: 3px;
            background: linear-gradient(90deg, ${colors.border}, transparent);
            animation: shrinkWidth 3.5s linear forwards;
        "></div>
    `;
    
    // 添加滚动条样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @keyframes shrinkWidth {
            from { width: 100%; }
            to { width: 0%; }
        }
        .notification-scroll-area::-webkit-scrollbar {
            width: 6px;
        }
        .notification-scroll-area::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.08);
            border-radius: 10px;
            margin: 4px 0;
        }
        .notification-scroll-area::-webkit-scrollbar-thumb {
            background: ${colors.border};
            border-radius: 10px;
        }
        .notification-scroll-area::-webkit-scrollbar-thumb:hover {
            background: ${colors.border};
            opacity: 0.8;
        }
    `;
    
    // 避免重复添加样式
    const styleId = `notification-style-${theme}`;
    if (!document.getElementById(styleId)) {
        style.id = styleId;
        document.head.appendChild(style);
    }


    if (!document.querySelector('#cinema-notification-style')) {
        style.id = 'cinema-notification-style';
        document.head.appendChild(style);
    }
    
    let container = document.getElementById('cinema-notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cinema-notification-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 200012;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
            pointer-events: none;  /* 容器不拦截事件，但内部元素可交互 */
        `;
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    // 鼠标悬停时暂停消失动画
    toast.addEventListener('mouseenter', () => {
        const progressBar = toast.querySelector('div:last-child');
        if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
        }
        // 清除原有的消失定时器
        if (toast._hideTimer) {
            clearTimeout(toast._hideTimer);
            toast._hideTimer = null;
        }
    });
    
    toast.addEventListener('mouseleave', () => {
        const progressBar = toast.querySelector('div:last-child');
        if (progressBar) {
            progressBar.style.animationPlayState = 'running';
        }
        // 重新设置消失定时器
        toast._hideTimer = setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    });
    
    // 设置自动消失
    toast._hideTimer = setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getPhaseIcon(phase) {
    const iconMap = {
        '清晨': '🌅',
        '早晨': '🌄',
        '上午': '☀️',
        '中午': '🌞',
        '下午': '⛅',
        '傍晚': '🌆',
        '夜晚': '🌙',
        '深夜': '🌃'
    };
    return iconMap[phase] || '⏰';
}

// ========== 辅助函数：获取天气图标 ==========

function getWeatherIcon(weather) {
    const iconMap = {
        '晴天': '☀️',
        '阴天': '☁️',
        '雨天': '🌧️',
        '暴雨': '⛈️',
        '雪天': '❄️',
        '雾天': '🌫️'
    };
    return iconMap[weather] || '🌡️';
}

// ========== 在状态更新后自动触发对比 ==========

function notifyStateChange() {
    if (!lastStateSnapshot) {
        lastStateSnapshot = createStateSnapshot();
        return;
    }
    
    const newSnapshot = createStateSnapshot();
    const changes = compareStates(lastStateSnapshot, newSnapshot);
    
    if (changes.length > 0) {
        console.log('[状态对比] 检测到变化:', changes);
        for (const change of changes) {
            addChangeToQueue(change);
        }
        
        if (notificationTimer) clearTimeout(notificationTimer);
        notificationTimer = setTimeout(() => {
            showMergedNotification();
            notificationTimer = null;
        }, 100);
    }
    
    lastStateSnapshot = newSnapshot;
}

// 初始化
function initStateCompare() {
    lastStateSnapshot = createStateSnapshot();
    console.log('[状态对比] 系统已初始化');
}
// HTML转义
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 可选的提示音效
function playNotificationSound() {
    try {
        // 使用Web Audio API生成简单提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch(e) {
        // 静默失败
    }
}
// 显示美观的变化提示
// function showChangeNotification(changes) {
//     if (!changes || changes.length === 0) return;
    
//     // 限制一次最多显示5条变化
//     const displayChanges = changes.slice(0, 5);
    
//     for (const change of displayChanges) {
//         let message = '';
//         let icon = '📌';
//         let color = '#ffd700';
//         let bgGradient = 'linear-gradient(135deg, #1a2a3a, #0a1a2e)';
        
//         switch (change.type) {
//             case 'attribute_changed':
//                 icon = change.delta > 0 ? '📈' : '📉';
//                 color = change.delta > 0 ? '#88ff88' : '#ff8888';
//                 message = `${change.name}: ${change.oldValue} → ${change.newValue} ${change.delta > 0 ? `(+${change.delta})` : `(${change.delta})`}`;
//                 break;
                
//             case 'attribute_added':
//                 icon = '✨';
//                 color = '#88ff88';
//                 message = `新属性: ${change.name} = ${change.newValue}`;
//                 break;
                
//             case 'stat_changed':
//                 icon = change.delta > 0 ? '⬆️' : '⬇️';
//                 color = change.delta > 0 ? '#88ff88' : '#ff8888';
//                 message = `${change.name}: ${change.oldValue} → ${change.newValue}`;
//                 break;
                
//             case 'stat_added':
//                 icon = '⭐';
//                 color = '#ffd700';
//                 message = `新能力: ${change.name} = ${change.newValue}`;
//                 break;
                
//             case 'character_added':
//                 icon = '💕';
//                 color = '#ff88cc';
//                 message = `新角色出现: ${change.name}`;
//                 bgGradient = 'linear-gradient(135deg, #2a1a3a, #1a0a2e)';
//                 break;
                
//             case 'affection_changed':
//                 icon = change.delta > 0 ? '💕' : '💔';
//                 color = change.delta > 0 ? '#ff88cc' : '#ff8888';
//                 message = `${change.name}好感度 ${change.delta > 0 ? `+${change.delta}` : `${change.delta}`} (${change.oldAffection} → ${change.newAffection})`;
//                 bgGradient = change.delta > 0 ? 'linear-gradient(135deg, #2a1a3a, #1a0a2e)' : 'linear-gradient(135deg, #3a1a2a, #2a0a1e)';
//                 break;
                
//             case 'item_added':
//                 icon = '📦';
//                 color = '#4ecdc4';
//                 message = `获得: ${change.name} x${change.quantity}`;
//                 if (change.note) message += ` (${change.note})`;
//                 break;
                
//             case 'item_quantity_changed':
//                 icon = change.delta > 0 ? '📥' : '📤';
//                 color = change.delta > 0 ? '#4ecdc4' : '#ff8888';
//                 message = `${change.name}: ${change.oldQuantity} → ${change.newQuantity} ${change.delta > 0 ? `(+${change.delta})` : `(${change.delta})`}`;
//                 break;
                
//             case 'item_removed':
//                 icon = '🗑️';
//                 color = '#ff8888';
//                 message = `失去: ${change.name} x${change.quantity}`;
//                 break;
//         }
        
//         if (message) {
//             createFancyToast(message, icon, color, bgGradient);
//         }
//     }
    
//     // 如果变化超过5条，显示总结
//     if (changes.length > 5) {
//         setTimeout(() => {
//             createFancyToast(`共 ${changes.length} 项变化`, '📊', '#ffd700', 'linear-gradient(135deg, #1a2a3a, #0a1a2e)');
//         }, 1000);
//     }
// }
// 修改原来的 showChangeNotification 函数
function showChangeNotification(changes) {
    if (!changes || changes.length === 0) return;
    
    // 将所有变化加入队列
    for (const change of changes) {
        addChangeToQueue(change);
    }
    
    // 延迟合并显示
    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }
    
    notificationTimer = setTimeout(() => {
        showMergedNotification();
        notificationTimer = null;
    }, 100); // 100ms内收集所有变化
}

// 创建美观的Toast通知
// function createFancyToast(message, icon, color, bgGradient) {
//     const toast = document.createElement('div');
//     toast.style.cssText = `
//         position: fixed;
//         bottom: 120px;
//         right: 20px;
//         background: ${bgGradient};
//         backdrop-filter: blur(12px);
//         border: 2px solid ${color};
//         border-radius: 16px;
//         padding: 12px 20px;
//         margin-bottom: 10px;
//         color: white;
//         font-size: 16px;
//         font-weight: bold;
//         font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
//         box-shadow: 0 6px 25px rgba(0,0,0,0.5), 0 0 15px ${color}80;
//         transform: translateX(120%);
//         transition: transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
//         min-width: 250px;
//         max-width: 350px;
//         z-index: 2000012;
//         pointer-events: none;
//         white-space: nowrap;
//         text-overflow: ellipsis;
//         overflow: hidden;
//     `;
    
//     toast.innerHTML = `
//         <div style="display: flex; align-items: center; gap: 12px;">
//             <span style="font-size: 24px;">${icon}</span>
//             <div style="flex: 1;">
//                 <div style="font-size: 16px; color: ${color}; margin-bottom: 2px;">状态更新</div>
//                 <div style="font-size: 17px;">${message}</div>
//             </div>
//         </div>
//     `;
    
//     // 添加到通知容器
//     let container = document.getElementById('cinema-notification-container');
//     if (!container) {
//         container = document.createElement('div');
//         container.id = 'cinema-notification-container';
//         container.style.cssText = `
//             position: fixed;
//             bottom: 20px;
//             right: 20px;
//             z-index: 2000012;
//             display: flex;
//             flex-direction: column;
//             align-items: flex-end;
//             gap: 8px;
//             pointer-events: none;
//         `;
//         document.body.appendChild(container);
//     }
    
//     container.appendChild(toast);
    
//     // 入场动画
//     setTimeout(() => {
//         toast.style.transform = 'translateX(0)';
//     }, 10);
    
//     // 出场动画
//     setTimeout(() => {
//         toast.style.transform = 'translateX(120%)';
//         setTimeout(() => toast.remove(), 300);
//     }, 3500);
// }
// ==================== 文本美化器（修改版 - 与选项面板协调） ====================

// ==================== 通用状态解析器 ====================

class UniversalStateParser {
    constructor() {
        // 预定义栏目关键词
        this.sectionKeywords = SECTION_KEYWORDS;
    }
    
    // 解析整个状态栏
    parse(statusText) {
        const result = {
            sections: {},      // 各栏目的原始内容
            data: {}          // 解析后的结构化数据
        };
        
        // 1. 按栏目分割
        const sections = this.splitIntoSections(statusText);
        result.sections = sections;
        
        // 2. 解析每个栏目的数据
        for (const [sectionName, sectionContent] of Object.entries(sections)) {
            result.data[sectionName] = this.parseSection(sectionContent, sectionName);
        }
        
        return result;
    }
    
    // 按栏目分割
    splitIntoSections(content) {
        const sections = {};
        const lines = content.split('\n');
        
        let currentSection = null;
        let currentContent = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // 跳过分隔线
            if (trimmed === '------' || trimmed === '---' || trimmed === '====') {
                continue;
            }
            
            // 检测栏目标题（带【】的标题）
            if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
                if (currentSection && currentContent.length > 0) {
                    sections[currentSection] = currentContent.join('\n');
                    console.log(`[分割] 保存栏目: ${currentSection}, 行数: ${currentContent.length}`);
                }
                currentSection = trimmed.replace(/[【】]/g, '');
                currentContent = [];
                console.log(`[分割] 发现新栏目: ${currentSection}`);
            } 
            // 也支持无【】的纯文本栏目检测（但优先用【】格式）
            else if (!currentSection && trimmed.length > 0 && trimmed.length < 30) {
                for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
                    if (keywords.some(kw => trimmed.includes(kw))) {
                        if (currentSection && currentContent.length > 0) {
                            sections[currentSection] = currentContent.join('\n');
                        }
                        currentSection = sectionName;
                        currentContent = [];
                        console.log(`[分割] 发现栏目(无括号): ${currentSection}`);
                        break;
                    }
                }
            }
            else if (currentSection) {
                // 保留原始行，不做任何修改
                currentContent.push(line);
            }
            else if (trimmed.length > 0) {
                // 不属于任何栏目的内容，归入"其他"
                if (!sections['其他信息']) {
                    sections['其他信息'] = [];
                }
                sections['其他信息'] = (sections['其他信息'] || []).concat([line]);
            }
        }
        
        if (currentSection && currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
            console.log(`[分割] 保存最后栏目: ${currentSection}, 行数: ${currentContent.length}`);
        }
        
        // 处理"其他信息"栏目
        if (sections['其他信息'] && Array.isArray(sections['其他信息'])) {
            sections['其他信息'] = sections['其他信息'].join('\n');
        }
        
        console.log('[分割] 最终栏目列表:', Object.keys(sections));
        return sections;
    }
    getSectionName(keyword) {
        return getSectionName(keyword);
    }
    // 解析单个栏目的内容
    parseSection(content, sectionName) {
        const items = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // 尝试多种解析模式
            const parsed = this.parseLine(trimmed);
            if (parsed) {
                items.push(parsed);
            }
        }
        
        return items;
    }
    
    // 解析单行数据（核心方法）
    parseLine(line) {
        // 模式1：键：值/最大值（分数格式）
        let match = line.match(/^([^：:]+)[：:]\s*(\d+)\/(\d+)/);
        if (match) {
            return {
                type: 'fraction',
                key: this.cleanKey(match[1]),
                value: parseInt(match[2]),
                max: parseInt(match[3]),
                display: `${match[2]}/${match[3]}`
            };
        }
        
        // 模式2：键：值（数字格式）
        match = line.match(/^([^：:]+)[：:]\s*(\d+)$/);
        if (match) {
            return {
                type: 'number',
                key: this.cleanKey(match[1]),
                value: parseInt(match[2]),
                display: match[2]
            };
        }
        
        // 模式3：键：值（带单位的数字，如 Lv.3）
        match = line.match(/^([^：:]+)[：:]\s*Lv\.?\s*(\d+)/i);
        if (match) {
            return {
                type: 'level',
                key: this.cleanKey(match[1]),
                value: parseInt(match[2]),
                unit: 'Lv',
                display: `Lv.${match[2]}`
            };
        }
        
        // 模式4：物品名：数量（物品栏专用）
        match = line.match(/^([^：:]+)[：:]\s*(\d+)$/);
        if (match && (line.includes('个') || line.includes('x'))) {
            return {
                type: 'item',
                key: match[1].trim(),
                value: parseInt(match[2]),
                display: `${match[1]} x${match[2]}`
            };
        }
        
        // 模式5：键：值（带描述，如 力量：8 - 描述）
        match = line.match(/^([^：:]+)[：:]\s*(\d+)\s*[-—]\s*(.+)$/);
        if (match) {
            return {
                type: 'number_with_desc',
                key: this.cleanKey(match[1]),
                value: parseInt(match[2]),
                description: match[3].trim(),
                display: `${match[2]} - ${match[3]}`
            };
        }
        
        // 模式6：键：值（百分比格式，如 好感度：75%）
        match = line.match(/^([^：:]+)[：:]\s*(\d+)%/);
        if (match) {
            return {
                type: 'percent',
                key: this.cleanKey(match[1]),
                value: parseInt(match[2]),
                display: `${match[2]}%`
            };
        }
        
        // 模式7：纯文本描述（如 太祖长拳：Lv.3，攻击+6）
        match = line.match(/^([^：:]+)[：:]\s*(.+)$/);
        if (match) {
            return {
                type: 'text',
                key: this.cleanKey(match[1]),
                value: match[2].trim(),
                display: match[2].trim()
            };
        }
        
        // 模式8：物品名 x 数量（无冒号）
        match = line.match(/^([^x×]+)[x×]\s*(\d+)/i);
        if (match) {
            return {
                type: 'item',
                key: match[1].trim(),
                value: parseInt(match[2]),
                display: `${match[1]} x${match[2]}`
            };
        }
        
        // 模式9：键 值（空格分隔，如 力量 8）
        match = line.match(/^([^\s]+)\s+(\d+)$/);
        if (match) {
            return {
                type: 'number',
                key: match[1].trim(),
                value: parseInt(match[2]),
                display: match[2]
            };
        }
        
        // 模式10：无法解析的文本，作为纯文本处理
        if (line.length > 0) {
            return {
                type: 'text',
                key: null,
                value: line,
                display: line
            };
        }
        
        return null;
    }
    
    // 清理键名（移除表情符号和多余空格）
    cleanKey(key) {
        return key
            .replace(/[❤️🧠🌀💪🏃📚🩸👁️✨📊💕🎒⭐]/g, '')
            .trim();
    }
}

class TextBeautifier {
    constructor() {
        // 状态栏匹配模式
        this.statusPatterns = [
            /```([\s\S]*?)```/g,           // 匹配 ``` ``` 包裹的内容
            /\[\[\[[\s\S]*?\]\]\]/g,       // 匹配 *** *** 包裹的内容
            /【当前状态】[\s\S]*?(?=\n\n|$)/g // 匹配状态栏
        ];
        // 选项栏匹配模式
        this.optionWrapperPattern = /\[\[\[[\s\S]*?\]\]\]/g;
    }
     // 添加 splitIntoSections 方法
    // ==================== 修复 splitIntoSections 方法（支持任意栏目） ====================

    splitIntoSections(content) {
        const sections = {};
        const lines = content.split('\n');
        
        let currentSection = null;
        let currentContent = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (trimmed === '------' || trimmed === '---' || trimmed === '====') {
                continue;
            }
            
            let isSectionHeader = false;
            
            // 检测栏目标题（带【】的标题）
            if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
                let sectionName = trimmed.replace(/[【】]/g, '');
                // 验证是否是已知栏目（可选）
                if (SECTION_KEYWORDS[sectionName] || sectionName) {
                    if (currentSection && currentContent.length > 0) {
                        sections[currentSection] = currentContent.join('\n');
                    }
                    currentSection = sectionName;
                    currentContent = [];
                    isSectionHeader = true;
                }
            }
            // 也支持无【】的纯文本栏目检测
            else if (!currentSection && trimmed.length > 0 && trimmed.length < 30) {
                // 检查是否是栏目关键词
                for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
                    if (keywords.some(kw => trimmed.includes(kw))) {
                        if (currentSection && currentContent.length > 0) {
                            sections[currentSection] = currentContent.join('\n');
                        }
                        currentSection = sectionName;
                        currentContent = [];
                        isSectionHeader = true;
                        break;
                    }
                }
            }
            
            if (!isSectionHeader && currentSection) {
                if (line.trim() !== '') {
                    currentContent.push(line);
                } else if (currentContent.length > 0) {
                    currentContent.push('');
                }
            }
        }
        
        if (currentSection && currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
        }
        
        console.log('[分割] 识别到的栏目:', Object.keys(sections));
        return sections;
    }
    // 从人物状态栏目提取数据
    extractStatusFromSection(sectionContent) {
        const statusData = [];
        const lines = sectionContent.split('\n');
        const statusKeywords = ['体力', '理智', '生命', '血量', '混乱', '孤独', '误解', '饥饿', '口渴', '精力', '精神', '健康'];
        
        for (const line of lines) {
            const trimmed = line.trim();
            const match = trimmed.match(/([^：:\n]+)[：:]\s*([^\n]+)/);
            if (match) {
                let key = match[1].trim();
                let value = match[2].trim();
                key = key.replace(/[❤️🧠🌀]/g, '').trim();
                
                const isValid = statusKeywords.some(kw => key.includes(kw) || key === kw);
                if (isValid) {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        statusData.push({ key, value: numValue });
                    }
                }
            }
        }
        return statusData;
    }
    
    // 从角色属性栏目提取数据
    extractStatsFromSection(sectionContent) {
        const statsData = [];
        const lines = sectionContent.split('\n');
        const statNames = ['力量', '敏捷', '智力', '体质', '感知', '魅力'];
        
        for (const line of lines) {
            const trimmed = line.trim();
            const match = trimmed.match(/(?:💪|🏃|📚|🩸|👁️|✨)?\s*([^：:\n]+)[：:]\s*(\d+)/);
            if (match) {
                let key = match[1].trim();
                const value = match[2];
                key = key.replace(/[💪🏃📚🩸👁️✨]/g, '').trim();
                
                if (statNames.includes(key)) {
                    statsData.push({ key, value });
                }
            }
        }
        return statsData;
    }
    
    // 从物品栏栏目提取数据
    extractItemsFromSection(sectionContent) {
        const itemsData = [];
        const lines = sectionContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            const match = trimmed.match(/^([^：:]+)[：:]\s*(\d+)/);
            if (match) {
                const name = match[1].trim();
                const quantity = match[2];
                itemsData.push({ name, quantity });
            }
        }
        return itemsData;
    }
    // 主美化函数
    beautify(text, isStatus = false) {
        if (!text) return text;
        
        // 优先检查是否被 [[[ ... ]]] 包裹（选项栏）
        // 选项栏由 OptionPanelManager 处理，这里只返回占位符
        if (this.isOptionBlock(text)) {
            return this.generateOptionPlaceholder(text);
        }
        
        // 检查是否是状态栏
        if (this.isStatusBlock(text) || isStatus) {
            return this.beautifyStatusEnhanced(text);
        }
        
        // 检查是否包含普通格式的选项（没有被包裹的）
        if (this.containsOptions(text)) {
            // 普通选项也返回占位符，避免重复
            return this.generateOptionPlaceholder(text);
        }
        
        // 普通文本美化
        return this.beautifyNormalText(text);
    }

    beautifyStatusEnhanced(text) {
        // 首先使用原有的美化方法获取基础HTML
        const originalHtml = this.beautifyStatus(text);
        
        // 如果已经美化过了，直接返回
        if (originalHtml && originalHtml.includes('cinema-status-container')) {
            return originalHtml;
        }
        
        // 如果没有匹配到标准栏目，尝试通用解析
        return this.beautifyStatusUniversal(text);
    }

    beautifyStatusUniversal(text) {
        const titleMatch = text.match(/【([^】]+)】/);
        const title = titleMatch ? titleMatch[1] : '状态';
        
        let html = `
            <div class="cinema-status-container" style="
                background: linear-gradient(135deg, rgba(0,0,0,0.75), rgba(20,20,40,0.75));
                border-radius: 20px;
                padding: 15px;
                margin: 10px 0;
                border: 1px solid rgba(255,105,180,0.4);
                overflow-y: auto;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 12px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid rgba(255,105,180,0.4);
                    position: sticky;
                    top: 0;
                    background: inherit;
                ">
                    <span style="font-size: 24px;">📟</span>
                    <span style="font-size: 18px; font-weight: bold; color: #ffd700;">${this.escapeHtml(title)}</span>
                </div>
        `;
        
        // 通用行解析
        const lines = text.split('\n');
        let currentCategory = '其他';
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // 检测分类标题
            if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
                currentCategory = trimmed.replace(/[【】]/g, '');
                html += `
                    <div style="
                        margin: 10px 0 8px 0;
                        font-size: 18px;
                        color: #ff69b4;
                        padding-left: 8px;
                        border-left: 3px solid #ff69b4;
                    ">${currentCategory}</div>
                `;
                continue;
            }
            
            // 解析键值对
            const kvMatch = trimmed.match(/^([^：:]+)[：:]\s*(.+)$/);
            if (kvMatch) {
                let key = kvMatch[1].trim();
                let value = kvMatch[2].trim();
                key = key.replace(/[❤️🧠🌀💪🏃📚🩸👁️✨]/g, '');
                
                // 检查是否是分数格式
                const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
                if (fractionMatch) {
                    const current = parseInt(fractionMatch[1]);
                    const max = parseInt(fractionMatch[2]);
                    const percentage = (current / max) * 100;
                    html += `
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 18px;">${this.escapeHtml(key)}</span>
                                <span style="font-size: 18px;">${current}/${max}</span>
                            </div>
                            <div style="background: rgba(0,0,0,0.4); border-radius: 10px; height: 6px;">
                                <div style="width: ${percentage}%; height: 100%; background: #ff69b4; border-radius: 10px;"></div>
                            </div>
                        </div>
                    `;
                } else {
                    // 普通键值对
                    html += `
                        <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 6px;">
                            <span style="font-size: 18px; color: #ddd;">${this.escapeHtml(key)}</span>
                            <span style="font-size: 18px; color: #ffd700;">${this.escapeHtml(value)}</span>
                        </div>
                    `;
                }
                continue;
            }
            
            // 纯文本行
            if (trimmed.length > 0 && !trimmed.startsWith('---')) {
                html += `
                    <div style="padding: 6px 10px; color: #ccc; font-size: 18px; background: rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 4px;">
                        ${this.escapeHtml(trimmed)}
                    </div>
                `;
            }
        }
        
        html += `</div>`;
        return html;
    }
    
    // 美化表格（支持 Markdown 风格表格）
    beautifyTable(text) {
        // 检测是否是表格格式（包含 | 分隔符和多行）
        const lines = text.split('\n');
        let tableLines = [];
        let inTable = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('|') && trimmed.match(/\|.+\|/)) {
                inTable = true;
                tableLines.push(trimmed);
            } else if (inTable && trimmed === '') {
                break;
            } else if (inTable && !trimmed.includes('|')) {
                inTable = false;
            }
        }
        
        if (tableLines.length < 2) return null;
        
        // 解析表头
        const headerLine = tableLines[0];
        const headers = headerLine.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
        
        // 跳过分隔线（|---|------|）
        let dataStartIndex = 1;
        if (tableLines[1] && tableLines[1].includes('---')) {
            dataStartIndex = 2;
        }
        
        // 解析数据行
        const dataRows = [];
        for (let i = dataStartIndex; i < tableLines.length; i++) {
            const cells = tableLines[i].split('|').filter(cell => cell.trim());
            if (cells.length > 0) {
                dataRows.push(cells);
            }
        }
        
        if (dataRows.length === 0) return null;
        
        // 构建美化的表格HTML
        let html = `
            <div class="cinema-table-container" style="
                background: rgba(0,0,0,0.4);
                border-radius: 16px;
                padding: 12px;
                margin: 10px 0;
                overflow-x: auto;
            ">
                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 18px;
                ">
                    <thead>
                        <tr style="
                            background: linear-gradient(135deg, rgba(255,105,180,0.2), rgba(255,105,180,0.05));
                            border-bottom: 2px solid #ff69b4;
                        ">
        `;
        
        for (const header of headers) {
            html += `
                <th style="
                    padding: 10px 12px;
                    text-align: left;
                    color: #ffd700;
                    font-weight: bold;
                    white-space: nowrap;
                ">${this.escapeHtml(header)}</th>
            `;
        }
        
        html += `
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const isEven = i % 2 === 0;
            html += `
                <tr style="
                    background: ${isEven ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'};
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    transition: all 0.2s;
                " onmouseenter="this.style.background='rgba(255,105,180,0.1)'" 
                onmouseleave="this.style.background='${isEven ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'}'">
            `;
            
            for (let j = 0; j < row.length; j++) {
                let cellContent = row[j].trim();
                // 美化内容中的图标
                cellContent = cellContent.replace(/🗡️/g, '<span style="color: #ff8888;">🗡️</span>');
                cellContent = cellContent.replace(/🛕/g, '<span style="color: #ffd700;">🛕</span>');
                cellContent = cellContent.replace(/🎭/g, '<span style="color: #cc88ff;">🎭</span>');
                
                html += `
                    <td style="
                        padding: 10px 12px;
                        color: #ddd;
                        line-height: 1.4;
                    ">${cellContent}</td>
                `;
            }
            
            html += `
                    </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }

    

// 修改 beautifyNormalText 方法，添加表格检测
    beautifyNormalText(text) {
        // 先检测是否是表格
        if (text.includes('|') && text.split('\n').length >= 3) {
            const tableHtml = this.beautifyTable(text);
            if (tableHtml) return tableHtml;
        }
        
        // 原有逻辑...
        let html = this.escapeHtml(text);
        
        // 美化粗体 **文本**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="cinema-bold">$1</strong>');
        
        // 美化斜体 *文本*
        html = html.replace(/\*([^*]+)\*/g, '<em class="cinema-italic">$1</em>');
        
        // 分段
        html = html
            .split(/\n\s*\n/)
            .filter(p => p.trim())
            .map(paragraph => `<p class="cinema-paragraph">${paragraph.trim()}</p>`)
            .join('');
        
        if (!html.includes('<p class="cinema-paragraph">')) {
            html = `<p class="cinema-paragraph">${html}</p>`;
        }
        
        // 美化引号内的内容
        html = html.replace(/「([^」]+)」/g, '<span class="cinema-quote">「$1」</span>');
        html = html.replace(/『([^』]+)』/g, '<span class="cinema-quote">『$1』</span>');
        
        // 美化语气词和强调
        html = html.replace(/([！？!?]+)/g, '<span class="cinema-emphasis">$1</span>');
        
        // 美化省略号
        html = html.replace(/\.\.\./g, '<span class="cinema-ellipsis">…</span>');
        html = html.replace(/……/g, '<span class="cinema-ellipsis">……</span>');
        
        return html;
    }
    
    // 检测是否为选项块（被 [[[ ]]] 包裹）
    isOptionBlock(text) {
        return this.optionWrapperPattern.test(text);
    }
    
    // 生成选项占位符（用于文本框显示）
    generateOptionPlaceholder(text) {
        // 提取选项内容
        const match = text.match(this.optionWrapperPattern);
        let optionsText = text;
        if (match) {
            optionsText = match[0];
        }
        
        // 提取选项简要信息
        const options = this.extractSimpleOptions(optionsText);
        
        let optionsSummary = '';
        if (options.length > 0) {
            optionsSummary = options.map(opt => `${opt.key}. ${opt.text.substring(0, 25)}${opt.text.length > 25 ? '...' : ''}`).join(' | ');
        }
        
        return `
            <div class="cinema-option-placeholder">
                <div class="cinema-option-placeholder-icon">🎮</div>
                <div class="cinema-option-placeholder-text">
                    出现了新的选项
                </div>
                <div class="cinema-option-placeholder-subtext">
                    请在上方选项面板中选择
                </div>
                ${optionsSummary ? `<div class="cinema-option-placeholder-hint">📋 ${optionsSummary}</div>` : ''}
            </div>
        `;
    }
    
    // 提取简单选项信息（用于占位符显示）
    extractSimpleOptions(text) {
        const options = [];
        const lines = text.split('\n');
        
        for (const line of lines) {
            const match = line.trim().match(/^([A-Z])\.\s+(.+)$/);
            if (match) {
                options.push({
                    key: match[1],
                    text: match[2].trim()
                });
            }
        }
        
        return options;
    }
    
    // 检测是否为状态栏
    isStatusBlock(text) {
        // 1. 首先检查是否被 ``` 包裹
        const codeBlockMatch = text.match(/```([\s\S]*?)```/);
        if (!codeBlockMatch) {
            // 如果没有 ``` 包裹，不是状态栏
            return false;
        }
        
        // 2. 检查 ``` 内的内容是否包含状态栏特征
        const content = codeBlockMatch[1];
        const statusIndicators = ['当前状态', '好感度', '混乱值', '孤独值', '误解值', 'BP', 'EXP', 'G', '人物状态', '角色属性', '物品栏', '人际关系'];
        const hasIndicator = statusIndicators.some(ind => content.includes(ind));
        const hasBrackets = /【[^】]+】/.test(content);
        const hasColons = /[：:]\s*\d+/.test(content);
        
        // 3. 只有包含状态栏特征时才认为是状态栏
        return (hasIndicator && hasBrackets) || (hasColons && hasBrackets && content.includes('【'));
    }
    
    // 检测是否包含选项（没有被包裹的普通选项）
    containsOptions(text) {
        // 如果被 [[[ ]]] 包裹，返回 false（由 OptionPanelManager 处理）
        if (this.isOptionBlock(text)) return false;
        
        // 匹配 A. B. C. D. 等格式
        const optionPattern = /(?:^|\n)\s*([A-Z])\.\s+[^\n]+/g;
        const matches = text.match(optionPattern);
        return matches && matches.length >= 2;
    }
    
    // 提取选项内容（供 OptionPanelManager 使用）
    extractOptionsContent(text) {
        const match = text.match(this.optionWrapperPattern);
        if (match) {
            // 提取 [[[ ... ]]] 内的内容
            const innerMatch = match[0].match(/\*\*\*([\s\S]*?)\*\*\*/);
            if (innerMatch) {
                return innerMatch[1];
            }
        }
        return text;
    }
    
// 美化状态栏
    // ==================== 修复 beautifyStatus 方法（支持任意栏目） ====================

    beautifyStatus(text) {
        // 提取标题
        const titleMatch = text.match(/【([^】]+)】/);
        const title = titleMatch ? titleMatch[1] : '状态';
        
        // 按栏目分割文本
        const sections = this.splitIntoSections(text);
        
        // 构建HTML
        let html = `
            <div class="cinema-status-container" style="
                background: linear-gradient(135deg, rgba(0,0,0,0.75), rgba(20,20,40,0.75));
                backdrop-filter: blur(12px);
                border-radius: 20px;
                padding: 15px;
                margin: 10px 0;
                border: 1px solid rgba(255,105,180,0.4);
                overflow-y: auto;
                font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
            ">
                <!-- 标题栏 -->
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 12px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid rgba(255,105,180,0.4);
                    position: sticky;
                    top: 0;
                    background: inherit;
                    z-index: 1;
                ">
                    <span style="font-size: 24px;">📟</span>
                    <span style="font-size: 18px; font-weight: bold; color: #ffd700;">${this.escapeHtml(title)}</span>
                </div>
        `;
        
        // 游戏信息栏（固定位置）
        html += `
            <div style="
                background: rgba(0,0,0,0.4);
                border-radius: 16px;
                padding: 12px;
                margin-bottom: 15px;
                text-align: center;
                border: 1px solid rgba(255,105,180,0.2);
            ">
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <span style="display: flex; align-items: center; gap: 5px;"><span style="color: #ffd700;">📅</span> ${this.extractDay(text)}</span>
                    <span style="display: flex; align-items: center; gap: 5px;"><span style="color: #ffd700;">🕐</span> ${this.extractPhase(text)}</span>
                    <span style="display: flex; align-items: center; gap: 5px;"><span style="color: #ffd700;">🌤️</span> ${this.extractWeather(text)}</span>
                </div>
                <div style="font-size: 16px; color: #aaa; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <span>📍</span> ${this.extractLocation(text)}
                </div>
            </div>
        `;
        
        // 动态渲染每个栏目
        for (const [sectionName, sectionContent] of Object.entries(sections)) {
            if (!sectionContent || sectionContent.trim() === '') continue;
            
            const sectionIcon = this.getSectionIcon(sectionName);
            
            html += `
                <div style="
                    background: rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 12px;
                    margin-bottom: 15px;
                ">
                    <div style="
                        font-size: 16px;
                        color: #ff69b4;
                        margin-bottom: 12px;
                        padding-left: 8px;
                        border-left: 3px solid #ff69b4;
                    ">${sectionIcon} ${sectionName}</div>
            `;
            
            // 特殊处理物品栏：格子式布局
            if (sectionName === '物品栏') {
                html += this.renderItemsGrid(sectionContent);
            }
            // 特殊处理人际关系
            else if (sectionName === '人际关系') {
                const rendered = this.renderRelationshipSection(sectionContent);
                html += rendered || '<div style="color: #888; padding: 10px; text-align: center;">暂无角色关系</div>';
            }
            // 其他栏目：普通行解析
            else {
                const lines = sectionContent.split('\n');
                let hasContent = false;
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    const rendered = this.renderStatusLine(trimmed);
                    if (rendered) {
                        html += rendered;
                        hasContent = true;
                    }
                }
                if (!hasContent) {
                    html += '<div style="color: #888; padding: 10px; text-align: center;">无数据</div>';
                }
            }
            
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }

    // 渲染物品栏（格子式）
    renderItemsGrid(sectionContent) {
        const items = [];
        const lines = sectionContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            const match = trimmed.match(/^([^：:]+)[：:]\s*(\d+)/);
            if (match) {
                items.push({ name: match[1].trim(), quantity: parseInt(match[2]) });
            }
        }
        
        if (items.length === 0) {
            return '<div style="color: #888; padding: 10px; text-align: center;">空空如也</div>';
        }
        
        let gridHtml = '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">';
        
        for (const item of items) {
            // 使用全局函数获取物品图标
            const icon = getItemIcon(item.name);
            const qtyDisplay = item.quantity > 1 ? `<span style="
                position: absolute;
                bottom: 2px;
                right: 6px;
                font-size: 16px;
                color: #ffd700;
                background: rgba(0,0,0,0.7);
                padding: 0 5px;
                border-radius: 12px;
                font-weight: bold;
            ">${item.quantity}</span>` : '';
            
            gridHtml += `
                <div style="
                    background: rgba(0,0,0,0.4);
                    border-radius: 12px;
                    padding: 10px 4px;
                    text-align: center;
                    position: relative;
                    border: 1px solid rgba(255,105,180,0.2);
                    transition: all 0.2s ease;
                    cursor: default;
                    width: calc(25% - 8px);
                    min-width: 65px;
                    box-sizing: border-box;
                " onmouseenter="this.style.transform='scale(1.05)'; this.style.background='rgba(0,0,0,0.6)'; this.style.borderColor='#ff69b4'"
                onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(0,0,0,0.4)'; this.style.borderColor='rgba(255,105,180,0.2)'">
                    <div style="font-size: 28px; margin-bottom: 6px;">${icon}</div>
                    <div style="
                        font-size: 16px; 
                        color: #ddd; 
                        white-space: nowrap; 
                        overflow: hidden; 
                        text-overflow: ellipsis;
                        max-width: 100%;
                    " title="${this.escapeHtml(item.name)}">
                        ${item.name.length > 6 ? item.name.slice(0, 5) + '…' : this.escapeHtml(item.name)}
                    </div>
                    ${qtyDisplay}
                </div>
            `;
        }
        
        gridHtml += '</div>';
        return gridHtml;
    }

    // 渲染人际关系（支持负数好感度 + 双向进度条）
    // 在 renderRelationshipSection 方法中修改
    renderRelationshipSection(content) {
        let html = '';
        
        const pattern = /【([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|好感度:(-?\d+)\/100】\s*-?\s*([^【\n]*)/g;
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            const name = match[1];
            const gender = match[2];
            const visible = match[3];
            const mood = match[4];
            let value = parseInt(match[5]);
            const description = match[6]?.trim() || '';
            
            // 确保 value 是有效数字
            if (isNaN(value)) value = 0;
            value = Math.min(100, Math.max(-100, value));
            
            const isNegative = value < 0;
            const absValue = Math.abs(value);
            const leftPercent = isNegative ? (absValue / 100) * 100 : 0;
            const rightPercent = !isNegative ? (value / 100) * 100 : 0;
            
            // 安全获取阶段配置
            const stage = getAffectionStage(value);
            
            // 确保 stage 存在
            if (!stage) {
                console.warn('[TextBeautifier] getAffectionStage 返回 undefined, value:', value);
                continue;
            }
            
            const moodIcon = getMoodIcon(mood);
            const isVisible = visible === '显';
            const opacity = isVisible ? '1' : '0.6';
            
            // 安全获取颜色值
            const leftBarColor = isNegative ? (stage.barColor || '#A9A9A9') : '#333';
            const rightBarColor = !isNegative ? (stage.barColor || '#A9A9A9') : '#333';
            
            html += `
                <div class="cinema-relationship-card" style="
                    margin-bottom: 14px; 
                    opacity: ${opacity};
                    background: rgba(0,0,0,0.3);
                    border-radius: 16px;
                    padding: 12px 14px;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: 1px solid rgba(255,105,180,0.2);
                " onmouseenter="this.style.background='rgba(255,105,180,0.08)'; this.style.transform='translateX(5px)'"
                onmouseleave="this.style.background='rgba(0,0,0,0.3)'; this.style.transform='translateX(0)'">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <span style="font-size: 18px; font-weight: bold; color: #ffd700;">${stage.icon || '💔'} ${this.escapeHtml(name)}</span>
                            <span style="font-size: 17px; color: #aaa; background: rgba(0,0,0,0.4); padding: 2px 10px; border-radius: 20px;">
                                ${gender === '女' ? '♀ 女性' : '♂ 男性'}
                            </span>
                            <span style="font-size: 17px; color: ${stage.color || '#A9A9A9'}; background: rgba(0,0,0,0.4); padding: 2px 10px; border-radius: 20px;">
                                ${moodIcon} ${this.escapeHtml(mood)}
                            </span>
                            <span style="font-size: 17px; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 20px; color: ${stage.color || '#A9A9A9'};">
                                ${stage.text || '陌生'}
                            </span>
                            ${!isVisible ? '<span style="font-size: 16px; color: #888;">🔇 隐藏</span>' : ''}
                        </div>
                        <span style="font-size: 20px; font-weight: bold; color: ${stage.color || '#A9A9A9'};">
                            ${value >= 0 ? `+${value}` : `${value}`}
                        </span>
                    </div>
                    
                    <div style="margin: 12px 0 8px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 0 5px;">
                            <span style="font-size: 16px; color: #8B0000;">-100</span>
                            <span style="font-size: 16px; color: #888;">-50</span>
                            <span style="font-size: 16px; color: #ffd700; font-weight: bold;">0</span>
                            <span style="font-size: 16px; color: #888;">+50</span>
                            <span style="font-size: 16px; color: #FF1493;">+100</span>
                        </div>
                        
                        <div style="
                            display: flex;
                            align-items: center;
                            background: rgba(0,0,0,0.5);
                            border-radius: 20px;
                            height: 14px;
                            overflow: hidden;
                            border: 1px solid rgba(255,255,255,0.1);
                        ">
                            <div style="width: 50%; height: 100%; background: #2a1a1a; display: flex; justify-content: flex-end; align-items: center;">
                                <div style="width: ${leftPercent}%; height: 100%; background: ${leftBarColor}; border-radius: ${isNegative ? '20px 0 0 20px' : '0'}; transition: width 0.3s ease;"></div>
                            </div>
                            <div style="width: 2px; height: 100%; background: #ffd700; box-shadow: 0 0 4px #ffd700; z-index: 2; flex-shrink: 0;"></div>
                            <div style="width: 50%; height: 100%; background: #1a2a1a; display: flex; align-items: center;">
                                <div style="width: ${rightPercent}%; height: 100%; background: ${rightBarColor}; border-radius: ${!isNegative ? '0 20px 20px 0' : '0'}; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: center; margin-top: 6px;">
                            <div style="background: ${stage.color || '#A9A9A9'}; border-radius: 20px; padding: 2px 12px; font-size: 16px; color: white; text-shadow: 0 0 2px black;">
                                ${isNegative ? `当前好感度 ${value}` : `当前好感度 +${value}`}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 10px; padding: 8px 12px; background: rgba(0,0,0,0.25); border-radius: 12px; font-size: 17px; color: #ccc; line-height: 1.4; border-left: 3px solid ${stage.color || '#A9A9A9'};">
                        💬 ${this.escapeHtml(description) || (isNegative ? '⚠️ 关系紧张，需要修复' : '✨ 关系正在发展')}
                    </div>
                </div>
            `;
        }
        
        return html || null;
    }
    // 获取栏目图标
    getSectionIcon(sectionName) {
        const iconMap = {
            '人物状态': '❤️',
            '角色属性': '⭐',
            '物品栏': '🎒',
            '人际关系': '💕',
            '装备栏': '⚔️',
            '武学栏': '📖',
            '任务栏': '📋',
            '俱乐部资金': '💰',
            '银行负债': '💸',
            '队员数量': '👥'
        };
        return iconMap[sectionName] || '📌';
    }

// 渲染单行状态数据
    renderStatusLine(line) {
        // 1. 分数格式：键：值/最大值
        let match = line.match(/^([^：:]+)[：:]\s*(\d+)\/(\d+)/);
        if (match) {
            let key = match[1].trim();
            const current = parseInt(match[2]);
            const max = parseInt(match[3]);
             // 限制范围：当前值不能超过最大值，最小为0
            // 计算百分比，并限制最大100%
            let percentage = max > 0 ? (current / max) * 100 : 0;
            percentage = Math.min(100, Math.max(0, percentage));  // 🔴 双重保险
            key = key.replace(/[❤️🧠🌀]/g, '');
            return `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 16px; color: #ddd;">${this.escapeHtml(key)}</span>
                        <span style="font-size: 16px;">${current}/${max}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border-radius: 10px; height: 8px;">
                        <div style="width: ${percentage}%; height: 100%; background: #ff69b4; border-radius: 10px;"></div>
                    </div>
                </div>
            `;
        }
        
        // 2. 数字格式：键：值
        match = line.match(/^([^：:]+)[：:]\s*(\d+)$/);
        if (match) {
            let key = match[1].trim();
            const value = match[2];
            key = key.replace(/[💰💸]/g, '');
            return `
                <div style="display: flex; justify-content: space-between; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="font-size: 16px; color: #ddd;">${this.escapeHtml(key)}</span>
                    <span style="font-size: 16px; font-weight: bold; color: #ffd700;">${value}</span>
                </div>
            `;
        }
        
        // 3. 带描述的格式：键：值 - 描述
        match = line.match(/^([^：:]+)[：:]\s*(\d+)\s*[-—]\s*(.+)$/);
        if (match) {
            let key = match[1].trim();
            const value = match[2];
            const desc = match[3];
            key = key.replace(/[💪🏃📚🩸👁️✨]/g, '');
            return `
                <div style="padding: 8px 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 16px; color: #ddd;">${this.escapeHtml(key)}</span>
                        <span style="font-size: 16px; font-weight: bold; color: #ffd700;">${value}</span>
                    </div>
                    <div style="font-size: 16px; color: #aaa; margin-top: 4px;">${this.escapeHtml(desc)}</div>
                </div>
            `;
        }
        
        // 4. 好感度格式
        match = line.match(/【([^|]+)\|([^|]+)\|([^|]+)\|好感度:(\d+)\/100】/);
        if (match) {
            const name = match[1];
            const gender = match[2];
            const visible = match[3];
            const value = match[4];
            const percentage = (parseInt(value) / 100) * 100;
            return `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 16px;">💕 ${this.escapeHtml(name)} ${gender === '女' ? '♀' : '♂'}</span>
                        <span style="font-size: 16px;">${value}/100</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); border-radius: 10px; height: 6px;">
                        <div style="width: ${percentage}%; height: 100%; background: #ff69b4; border-radius: 10px;"></div>
                    </div>
                </div>
            `;
        }
        
        // 5. 物品格式（带图标）
        match = line.match(/^([^：:]+)[：:]\s*(\d+)$/);
        if (match && (line.includes('🏆') || line.includes('💰') || line.includes('💸'))) {
            let key = match[1].trim();
            const value = match[2];
            return `
                <div style="display: flex; justify-content: space-between; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="font-size: 16px;">${key}</span>
                    <span style="font-size: 16px; font-weight: bold; color: #ffd700;">${value}</span>
                </div>
            `;
        }
        
        // 6. 普通键值对
        match = line.match(/^([^：:]+)[：:]\s*(.+)$/);
        if (match) {
            let key = match[1].trim();
            const value = match[2];
            key = key.replace(/[❤️🧠🌀💪🏃📚🩸👁️✨]/g, '');
            return `
                <div style="display: flex; justify-content: space-between; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="font-size: 16px; color: #ddd;">${this.escapeHtml(key)}</span>
                    <span style="font-size: 16px; color: #ffd700;">${this.escapeHtml(value)}</span>
                </div>
            `;
        }
        
        // 7. 纯文本（无法解析）
        if (line.length > 0) {
            return `
                <div style="padding: 6px 12px; color: #ccc; font-size: 17px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                    ${this.escapeHtml(line)}
                </div>
            `;
        }
        
        return null;
    }

    // ========== 辅助提取方法 ==========

    extractDay(text) {
        const match = text.match(/第\s*(\d+)\s*天/);
        return match ? match[1] : '1';
    }

    extractPhase(text) {
        const match = text.match(/(清晨|早晨|上午|中午|下午|傍晚|夜晚|深夜)/);
        return match ? match[1] : '未知';
    }

    extractWeather(text) {
        const match = text.match(/(晴天|阴天|雨天|暴雨|雪天|雾天)/);
        return match ? match[1] : '阴天';
    }

    extractLocation(text) {
        const match = text.match(/📍\s*[：:]?\s*(.+?)(?:\n|$)/);
        return match ? match[1].trim() : '未知地点';
    }

    extractStatsData(text) {
        const stats = [];
        const pattern = /(?:💪|🏃|📚|🩸|👁️|✨)?\s*([^：:\n]+)[：:]\s*(\d+)/g;
        let match;
        const statNames = ['力量', '敏捷', '智力', '体质', '感知', '魅力'];
        
        while ((match = pattern.exec(text)) !== null) {
            const key = match[1].trim().replace(/[💪🏃📚🩸👁️✨]/g, '');
            if (statNames.includes(key)) {
                stats.push({ key, value: match[2] });
            }
        }
        return stats;
    }

    extractItemsData(text) {
        const items = [];
        const lines = text.split('\n');
        let inItemsSection = false;
        
        for (const line of lines) {
            if (line.includes('物品栏')) {
                inItemsSection = true;
                continue;
            }
            if (inItemsSection && (line.includes('------') || line.includes('【'))) {
                break;
            }
            if (inItemsSection) {
                const match = line.trim().match(/^([^：:]+)[：:]\s*(\d+)/);
                if (match) {
                    items.push({ name: match[1].trim(), quantity: match[2] });
                }
            }
        }
        return items;
    }

    // 确保滚动条样式存在
    ensureScrollbarStyles() {
        if (document.getElementById('cinema-status-scroll-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'cinema-status-scroll-styles';
        style.textContent = `
            .cinema-status-container::-webkit-scrollbar {
                width: 5px;
            }
            .cinema-status-container::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            .cinema-status-container::-webkit-scrollbar-thumb {
                background: #ff69b4;
                border-radius: 10px;
            }
            
            .cinema-relationship-list::-webkit-scrollbar {
                width: 4px;
            }
            .cinema-relationship-list::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            .cinema-relationship-list::-webkit-scrollbar-thumb {
                background: #ff69b4;
                border-radius: 10px;
            }
            
            .cinema-relationship-card {
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .cinema-relationship-card:hover {
                transform: translateX(3px);
                background: rgba(255,255,255,0.08);
            }
        `;
        document.head.appendChild(style);
    }
    
   // 提取键值对（分离人物状态和角色属性）
    extractKeyValuePairs(text) {
        const statusData = [];
        const statsData = [];
        
        // 定义关键词
        const statusKeywords = ['体力', '理智', '生命', '血量', '混乱', '孤独', '误解', '饥饿', '口渴', '精力', '精神', '健康'];
        const statKeywords = ['力量', '敏捷', '智力', '体质', '感知', '魅力'];
        
        // 按行分割
        const lines = text.split('\n');
        let inStatusSection = false;
        let inStatsSection = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // 检测栏目
            if (trimmed.includes('人物状态') || trimmed.includes('当前状态')) {
                inStatusSection = true;
                inStatsSection = false;
                continue;
            }
            if (trimmed.includes('角色属性')) {
                inStatusSection = false;
                inStatsSection = true;
                continue;
            }
            if (trimmed.includes('物品栏') || trimmed.includes('人际关系')) {
                inStatusSection = false;
                inStatsSection = false;
                continue;
            }
            
            // 解析键值对
            const match = trimmed.match(/([^：:\n]+)[：:]\s*([^\n]+)/);
            if (match) {
                let key = match[1].trim();
                let value = match[2].trim();
                
                // 清理图标
                key = key.replace(/[❤️🧠🌀💪🏃📚🩸👁️✨]/g, '').trim();
                
                // 判断属于哪个栏目
                const isStatus = statusKeywords.some(kw => key.includes(kw) || key === kw);
                const isStat = statKeywords.some(kw => key === kw);
                
                if (inStatusSection && isStatus) {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        statusData.push({ key, value: numValue });
                    }
                } else if (inStatsSection && isStat) {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        statsData.push({ key, value: numValue });
                    }
                }
            }
        }
        
        return { statusData, statsData };
    }
    
    // 提取好感度数据（含描述）
    extractRelationshipData(text) {
        const relationships = [];
        
        // 匹配：【名字好感度:数字/100】后面的描述文字（直到换行或下一个【）
        // 支持中文冒号和英文冒号
        const pattern = /【([^】]+)好感度[：:]\s*(\d+)\/100】\s*([^【\n]*)/g;
        let match;
        
        while ((match = pattern.exec(text)) !== null) {
            relationships.push({
                key: match[1].trim(),
                value: match[2],
                description: match[3].trim() || ''  // 【】后面的描述
            });
        }
        
        // 方括号格式
        const altPattern = /\[([^\]]+)好感度[：:]\s*(\d+)\/100\]\s*([^\[\n]*)/g;
        while ((match = altPattern.exec(text)) !== null) {
            relationships.push({
                key: match[1].trim(),
                value: match[2],
                description: match[3].trim() || ''
            });
        }
        
        return relationships;
    }
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 移除包裹符号
    stripOptionWrapper(text) {
        return text.replace(/^\[\[\[|\]\]\]$/g, '');
    }
}

// ==================== 日志管理模块 ====================

// 日志存储
let gameLog = {
    entries: [],      // 日志条目数组
    maxEntries: 100   // 最大保留条目数
};

// 初始化日志
function initGameLog() {
    // 从 localStorage 加载日志
    const savedLog = localStorage.getItem('cinema_game_log');
    if (savedLog) {
        try {
            gameLog.entries = JSON.parse(savedLog);
            // 同步到UI
            const logTextarea = document.getElementById('sync-log');
            if (logTextarea) {
                logTextarea.value = formatLogForDisplay();
            }
        } catch(e) {
            gameLog.entries = [];
        }
    }
    
    // 如果没有日志，添加欢迎日志
    if (gameLog.entries.length === 0) {
        addLogEntry('✨ 游戏开始', 'system');
    }
}

// 添加日志条目（不包含时间戳）
function addLogEntry(message, type = 'system', itemName = null, action = null) {
    const entry = {
        id: Date.now(),
        timestamp: Date.now(),
        message: message,
        type: type,      // 'system', 'item', 'combat', 'dialogue', 'affection', 'player_action'
        itemName: itemName,
        action: action
    };
    
    gameLog.entries.unshift(entry);  // 最新在上方
    
    // 限制条目数量
    if (gameLog.entries.length > gameLog.maxEntries) {
        gameLog.entries = gameLog.entries.slice(0, gameLog.maxEntries);
    }
    
    // 保存到 localStorage
    saveGameLog();
    
    // 更新UI
    updateLogDisplay();
    
    console.log(`[日志] ${message}`);
}

// 清空日志（切换消息时调用）
function clearLogForNewMessage() {
    const oldEntries = [...gameLog.entries];
    
    // 清空日志
    gameLog.entries = [];
    
    // 添加一个分隔标记
    addLogEntry('', 'system');
    
    // 更新UI
    updateLogDisplay();
    
    console.log('[日志] 已清空，开始新章节');
    return oldEntries;
}

// 添加物品操作日志
function addItemLog(action, itemName, quantity = 1, result = null) {
    const actionMap = {
        'use': '使用',
        'drop': '丢弃',
        'obtain': '获得',
        'lost': '失去',
        'craft': '制作'
    };
    
    const actionText = actionMap[action] || action;
    
    let message = '';
    let type = 'item';
    
    switch(action) {
        case 'use':
            if (result === 'depleted') {
                message = `【物品操作】使用了 ${itemName}`;
            } else {
                message = `【物品操作】使用了 ${itemName}`;
            }
            break;
        case 'drop':
            message = `【物品操作】丢弃了 ${itemName}`;
            break;
        case 'obtain':
            message = `【物品操作】获得了 ${itemName}`;
            break;
        case 'lost':
            message = `【物品操作】失去了 ${itemName}`;
            break;
        default:
            message = `【物品操作】${actionText} ${itemName}`;
    }
    
    // 如果有数量且数量>1，附加数量信息
    if (quantity > 1 && action !== 'use') {
        message += ` x${quantity}`;
    }
    if (action === 'use' && quantity > 1 && result !== 'depleted') {
        message = `【物品操作】使用了 ${itemName} x${quantity}`;
    }
    
    addLogEntry(message, type, itemName, action);
}

// 添加玩家行动日志（供AI使用）
function addPlayerActionLog(actionText) {
    addLogEntry(`【玩家行动】${actionText}`, 'player_action');
}

// 保存日志到 localStorage
function saveGameLog() {
    localStorage.setItem('cinema_game_log', JSON.stringify(gameLog.entries));
}

// 格式化日志用于显示（UI显示用，不带时间戳）
function formatLogForDisplay() {
    if (gameLog.entries.length === 0) {
        return '暂无日志记录\n';
    }
    
    return gameLog.entries.map(entry => {
        return entry.message;
    }).join('\n');
}

// 获取日志用于AI提示词（只返回最近的N条，格式简洁）
function getLogForAI(maxEntries = 5) {
    if (gameLog.entries.length === 0) {
        return '';
    }
    
    // 获取最近的 maxEntries 条，按时间正序（最早的在前）
    const recentEntries = [...gameLog.entries].slice(0, maxEntries).reverse();
    
    return recentEntries.map(entry => entry.message).join('\n');
}

// 获取最近的操作日志（物品操作+玩家行动）
function getRecentActionsForAI(maxEntries = 5) {
    const actionTypes = ['item', 'player_action'];
    const recentActions = gameLog.entries
        .filter(entry => actionTypes.includes(entry.type))
        .slice(0, maxEntries)
        .reverse();
    
    if (recentActions.length === 0) {
        return '';
    }
    
    return recentActions.map(entry => entry.message).join('\n');
}

// 更新日志显示
function updateLogDisplay() {
    const logTextarea = document.getElementById('sync-log');
    if (logTextarea) {
        logTextarea.value = formatLogForDisplay();
    }
}

// 清除日志
function clearGameLog() {
    if (confirm('确定要清除所有日志记录吗？')) {
        gameLog.entries = [];
        saveGameLog();
        updateLogDisplay();
        addLogEntry('🗑️ 日志已被清空', 'system');
        showItemToast('日志已清空', 'success');
    }
}

// 导出日志
function exportGameLog() {
    if (gameLog.entries.length === 0) {
        showItemToast('没有日志可导出', 'warning');
        return;
    }
    
    const logText = formatLogForDisplay();
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinema_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showItemToast('日志已导出', 'success');
}


// ==================== 状态同步模块变量 ====================
let syncEnabled = true;
let syncPanelCreated = false;

// 游戏状态存储
let gameState = {
    day: 1,
    phase: '早晨',
    location: '',
    attributes: {}
};

// 角色数组
let characters = [];

// 属性配置
let attributeConfig = {
    displayOrder: [],
    colorMap: {},
    defaultValues: {}
};

// ==================== 工具函数 ====================

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getDefaultIcon(attrName) {
    const iconMap = {
        '混乱值': '🌪️', '孤独值': '😔', '误解值': '❓',
        '体力': '❤️', '理智': '🧠', '饥饿': '🍗', '口渴': '💧','魔力': '💙','卷力': '💜',
        '力量': '💪', '敏捷': '⚡', '智力': '📚', '体质': '🩸','信用值': '💷','上流值': '👔','暴露值': '🕵️',
        '感知': '👁️', '魅力': '✨', '金钱': '💰', '经验': '⭐',
        '生命值': '❤️', '士气': '🎯', '弹药': '🔫', '食物': '🍞', '队员数量': '🧳'
    };
    return iconMap[attrName] || '📊';
}

function normalizeName(name) {
    if (!name || typeof name !== 'string') return '';
    return name.trim().replace(/\s+/g, ' ');
}

// 计算消息哈希（用于去重）
function computeMessageHash(text) {
    const statusMatch = text.match(/```([\s\S]*?)```/);
    if (statusMatch) {
        return hashCode(statusMatch[1].substring(0, 500));
    }
    return hashCode(text.substring(0, 500));
}

// ==================== 智能状态解析器 ====================

// ==================== 增强版状态解析器 ====================

class SmartStateParser {
    constructor() {
        // 栏目识别关键词
        this.sectionKeywords = SECTION_KEYWORDS;
    }
    
    parse(text) {
        const results = {
            attributes: {},
            stats: {},
            items: [],
            characters: [],
            otherSections: {},
            day: null,
            phase: null,
            weather: null,
            location: null,
            hasUpdate: false
        };
        
        const statusMatch = text.match(/```([\s\S]*?)```/);
        if (!statusMatch) {
            console.log('[解析] 未找到状态栏');
            return results;
        }
        
        const content = statusMatch[1];
        console.log('[解析] 状态栏内容:', content.substring(0, 200));
        
        const sections = this.splitIntoSections(content);
        console.log('[解析] 分割后的栏目:', Object.keys(sections));
        
        for (const [sectionName, sectionContent] of Object.entries(sections)) {
            console.log(`[解析] 处理栏目: ${sectionName}, 内容长度: ${sectionContent.length}`);
            
            // 使用全局配置判断栏目类型
            if (SECTION_KEYWORDS['人物状态']?.some(kw => sectionName.includes(kw) || kw.includes(sectionName))) {
                this.parseStatusSection(sectionContent, results);
            }
            else if (SECTION_KEYWORDS['角色属性']?.some(kw => sectionName.includes(kw) || kw.includes(sectionName))) {
                this.parseAttributesSection(sectionContent, results);
            }
            else if (SECTION_KEYWORDS['物品栏']?.some(kw => sectionName.includes(kw) || kw.includes(sectionName))) {
                this.parseItemsSection(sectionContent, results);
            }
            else if (SECTION_KEYWORDS['人际关系']?.some(kw => sectionName.includes(kw) || kw.includes(sectionName))) {
                this.parseRelationsSection(sectionContent, results);
            }
            else {
                // 其他栏目保存到 otherSections
                results.otherSections[sectionName] = sectionContent;
                console.log(`[解析] ✅ 发现其他栏目: ${sectionName}`);
            }
        }
        
        this.parseHeaderInfo(content, results);
        
        results.hasUpdate = Object.keys(results.attributes).length > 0 || 
                           Object.keys(results.stats).length > 0 ||
                           results.items.length > 0 ||
                           results.characters.length > 0 ||
                           Object.keys(results.otherSections).length > 0;
        
        console.log('[解析] 最终 otherSections:', results.otherSections);
        
        return results;
    }
    
    // 按栏目分割内容
    // ==================== 修复 splitIntoSections 函数 ====================

    splitIntoSections(content) {
        const sections = {};
        const lines = content.split('\n');
        
        let currentSection = null;
        let currentContent = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (trimmed === '------' || trimmed === '---' || trimmed === '====') {
                continue;
            }
            
            // 检测栏目标题（带【】的标题）
            if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
                if (currentSection && currentContent.length > 0) {
                    sections[currentSection] = currentContent.join('\n');
                    console.log(`[分割] 保存栏目: ${currentSection}, 行数: ${currentContent.length}`);
                }
                currentSection = trimmed.replace(/[【】]/g, '');
                currentContent = [];
                console.log(`[分割] 发现新栏目: ${currentSection}`);
            } 
            // 也支持无【】的纯文本栏目检测
            else if (!currentSection && trimmed.length > 0 && trimmed.length < 30) {
                for (const [sectionName, keywords] of Object.entries(SECTION_KEYWORDS)) {
                    if (keywords.some(kw => trimmed.includes(kw))) {
                        if (currentSection && currentContent.length > 0) {
                            sections[currentSection] = currentContent.join('\n');
                        }
                        currentSection = sectionName;
                        currentContent = [];
                        console.log(`[分割] 发现栏目(无括号): ${currentSection}`);
                        break;
                    }
                }
            }
            else if (currentSection) {
                currentContent.push(line);
            }
        }
        
        if (currentSection && currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
            console.log(`[分割] 保存最后栏目: ${currentSection}, 行数: ${currentContent.length}`);
        }
        
        console.log('[分割] 最终栏目列表:', Object.keys(sections));
        return sections;
    }
    
    // 解析人物状态栏目
    // 在 SmartStateParser 类中修改 parseStatusSection 方法
    // 修改 SmartStateParser 类的 parseStatusSection 方法

parseStatusSection(content, results) {
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // 匹配格式：😢 悲伤值：0/100 或 悲伤值：0/100
        const slashMatch = trimmed.match(/^([\s\S]*?)[：:]\s*(\d+)\/(\d+)/);
        if (slashMatch) {
            let attrName = slashMatch[1].trim();
            const currentValue = parseInt(slashMatch[2]);
            const maxValue = parseInt(slashMatch[3]);
            
            attrName = attrName.trim();
            
            if (attrName && !isNaN(currentValue) && !isNaN(maxValue) && maxValue > 0) {
                // 存储为 "当前值/最大值" 格式
                results.attributes[attrName] = `${currentValue}/${maxValue}`;
                console.log(`[解析-生存] ${attrName} = ${currentValue}/${maxValue}`);
            }
            continue;
        }
        
        // 匹配普通数字格式：属性名：数字
        const normalMatch = trimmed.match(/^([\s\S]*?)[：:]\s*(\d+)$/);
        if (normalMatch) {
            let attrName = normalMatch[1].trim();
            const value = parseInt(normalMatch[2]);
            
            attrName = attrName.trim();
            
            // 过滤掉非数值属性（如包含文字的描述）
            if (attrName && !isNaN(value) && !attrName.includes('：') && !attrName.includes(':')) {
                results.attributes[attrName] = value;
                console.log(`[解析-生存] ${attrName} = ${value}`);
            }
        }
    }
}
    
    // 解析角色属性栏目
    parseAttributesSection(content, results) {
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // 匹配格式：💪 力量：6 - [描述]
            const match = trimmed.match(/(?:[💪🏃📚🩸👁️✨]?\s*)?([^：:\n-]+)[：:]\s*(\d+)\s*-?\s*\[?([^\]]*)/);
            if (match) {
                let attrName = match[1].trim();
                const value = parseInt(match[2]);
                const description = match[3]?.trim() || '';
                
                attrName = attrName.replace(/[💪🏃📚🩸👁️✨]/g, '').trim();
                
                if (attrName && !isNaN(value)) {
                    results.stats[attrName] = { value, description };
                    console.log(`[解析-属性] ${attrName} = ${value}`);
                }
            }
        }
    }
    
    // 解析物品栏栏目
    parseItemsSection(content, results) {
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // 跳过空行和分隔符
            if (trimmed === '------' || trimmed === '---' || trimmed === '====') continue;
            
            // ========== 方法1：[物品名(备注)]：数量 ==========
            // 示例：[生锈的钥匙(音乐准备室钥匙)]：1
            // 示例：[强效精力剂(恢复体力30点)]：3
            let match = trimmed.match(/^[\[\(]\s*([^\[\]\(\)\n]+?)\s*(?:[\(（]([^\)）]+)[\)）])?\s*[\]\)]\s*[：:]\s*(\d+)/);
            if (match) {
                let itemName = match[1].trim();
                const note = match[2] ? match[2].trim() : '';
                const quantity = parseInt(match[3]);
                
                itemName = itemName.replace(/[\[\]]/g, '').trim();
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: note
                });
                console.log(`[解析-物品] [格式1] ${itemName} x${quantity}${note ? ` (${note})` : ''}`);
                continue;
            }
            
            // ========== 方法2：⭐ 物品名：数量 ==========
            // 示例：⭐ 胜利积分：0
            match = trimmed.match(/^[⭐🌟✨🪙🏆]\s*([^：:]+)[：:]\s*(\d+)/);
            if (match) {
                const itemName = match[1].trim();
                const quantity = parseInt(match[2]);
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: '积分'
                });
                console.log(`[解析-物品] [格式2] ${itemName} x${quantity} (积分)`);
                continue;
            }
            
            // ========== 方法3：物品名：数量（备注）格式 ==========
            // 支持：手机：1（电量67%）
            // 支持：手机：1 (电量67%)
            match = trimmed.match(/^([^：:]+)[：:]\s*(\d+)\s*[（(]([^）)]+)[）)]/);
            if (match) {
                const itemName = match[1].trim();
                const quantity = parseInt(match[2]);
                const note = match[3].trim();
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: note
                });
                console.log(`[解析-物品] [格式3] ${itemName} x${quantity} (${note})`);
                continue;
            }
            
            // ========== 方法4：物品名：数量 格式 ==========
            match = trimmed.match(/^([^：:]+)[：:]\s*(\d+)$/);
            if (match) {
                const itemName = match[1].trim();
                const quantity = parseInt(match[2]);
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: ''
                });
                console.log(`[解析-物品] [格式4] ${itemName} x${quantity}`);
                continue;
            }
            
            // ========== 方法5：- 物品名 x 数量 格式 ==========
            match = trimmed.match(/^[-•*]\s*([^：:x×]+)[x×]\s*(\d+)/i);
            if (match) {
                const itemName = match[1].trim();
                const quantity = parseInt(match[2]);
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: ''
                });
                console.log(`[解析-物品] [格式5] ${itemName} x${quantity}`);
                continue;
            }
            
            // ========== 方法6：物品名（数量）格式 ==========
            match = trimmed.match(/^([^（(]+)[（(](\d+)[）)]/);
            if (match) {
                const itemName = match[1].trim();
                const quantity = parseInt(match[2]);
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: ''
                });
                console.log(`[解析-物品] [格式6] ${itemName} x${quantity}`);
                continue;
            }
            
            // ========== 方法7：物品名 x 数量（无标点） ==========
            match = trimmed.match(/^(.+?)\s*[x×]\s*(\d+)$/i);
            if (match) {
                const itemName = match[1].trim();
                const quantity = parseInt(match[2]);
                
                results.items.push({
                    name: itemName,
                    quantity: quantity,
                    note: ''
                });
                console.log(`[解析-物品] [格式7] ${itemName} x${quantity}`);
                continue;
            }
            
            // ========== 方法8：纯物品名（数量默认为1） ==========
            // 检查是否不是纯数字行，且长度合适
            if (!trimmed.match(/^\d+$/) && trimmed.length > 0 && trimmed.length < 50) {
                results.items.push({
                    name: trimmed,
                    quantity: 1,
                    note: ''
                });
                console.log(`[解析-物品] [格式8] ${trimmed} x1 (默认)`);
            }
        }
        
        // 去重合并相同物品
        const mergedItems = [];
        const itemMap = new Map();
        
        for (const item of results.items) {
            const key = `${item.name}|${item.note}`;
            if (itemMap.has(key)) {
                itemMap.get(key).quantity += item.quantity;
            } else {
                itemMap.set(key, { ...item });
            }
        }
        
        results.items = Array.from(itemMap.values());
        
        console.log(`[解析-物品] 解析完成，共 ${results.items.length} 种物品`);
        return results;
    }
        
// 在 SmartStateParser 类的 parseRelationsSection 方法中，确保 visible 正确赋值

    parseRelationsSection(content, results) {
        console.log('[解析-关系] 开始解析，内容长度:', content?.length);
        
        if (!content || content.length === 0) {
            console.log('[解析-关系] 内容为空，跳过');
            return results;
        }
        
        // 匹配格式：【XX|女|显|开心|好感度:100/100】-描述
        const pattern = /[【\[][^】\]]*?([^|【\]\[，,、\n]+)\|([男女]+)\|([显隐]+)\|([^|]+)\|好感度[：:]\s*(-?\d+)\/100[】\]]\s*-?\s*([^【\n]*)/g;
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            let charName = match[1].trim();
            let gender = match[2].trim();
            let visibility = match[3].trim();
            let mood = match[4].trim();
            const affectionValue = parseInt(match[5]);
            let description = match[6]?.trim() || '';
            
            charName = charName.replace(/[|｜]/g, '').trim();
            
            if (gender === '女') gender = '女';
            else if (gender === '男') gender = '男';
            else gender = '未知';
            
            // ========== 【修复】确保 visible 正确解析 ==========
            const isVisible = visibility === '显';
            
            console.log(`[解析-关系] 解析: ${charName} | 可见=${isVisible} (原始=${visibility})`);
            
            if (charName && charName.length > 0 && !isNaN(affectionValue)) {
                // 检查是否已存在，如果存在则更新
                const existing = results.characters.find(c => c.name === charName);
                if (existing) {
                    // 更新已有的角色信息（保留最新的 visible 状态）
                    existing.visible = isVisible;
                    existing.mood = mood;
                    existing.affection = affectionValue;
                    existing.description = description;
                    existing.note = description;
                    console.log(`[解析-关系] 更新已有角色: ${charName} 可见=${isVisible}`);
                } else {
                    results.characters.push({ 
                        name: charName, 
                        gender: gender,
                        mood: mood,
                        affection: affectionValue,
                        visible: isVisible,
                        description: description,
                        note: description
                    });
                    console.log(`[解析-关系] 添加角色: ${charName}(${gender}) 心情=${mood} 好感度=${affectionValue}, 可见=${isVisible ? '是' : '否'}`);
                }
            }
        }
        
        // 兼容无心情格式
        const noMoodPattern = /[【\[][^】\]]*?([^|【\]\[，,、\n]+)\|([男女]+)\|([显隐]+)\|好感度[：:]\s*(-?\d+)\/100[】\]]\s*-?\s*([^【\n]*)/g;
        while ((match = noMoodPattern.exec(content)) !== null) {
            let charName = match[1].trim();
            let gender = match[2].trim();
            let visibility = match[3].trim();
            const affectionValue = parseInt(match[4]);
            let description = match[5]?.trim() || '';
            
            charName = charName.replace(/[|｜]/g, '').trim();
            const isVisible = visibility === '显';
            
            const exists = results.characters.some(c => c.name === charName);
            if (!exists && charName && charName.length > 0 && !isNaN(affectionValue)) {
                results.characters.push({ 
                    name: charName, 
                    gender: gender,
                    mood: '日常',
                    affection: affectionValue,
                    visible: isVisible,
                    description: description,
                    note: description
                });
                console.log(`[解析-关系] 添加角色(无心情): ${charName} 可见=${isVisible}`);
            }
        }
        
        console.log(`[解析-关系] 最终解析出 ${results.characters.length} 个角色`);
        return results;
    }
    
    // 解析头部信息（日期、时间、天气、位置）
    parseHeaderInfo(content, results) {
        // 解析第X天
        const dayMatch = content.match(/第\s*(\d+)\s*天/);
        if (dayMatch) results.day = parseInt(dayMatch[1]);
        
        // 解析时段（清晨/早晨/上午/中午/下午/傍晚/夜晚/深夜）
        const phaseMatch = content.match(/(清晨|早晨|上午|中午|下午|傍晚|夜晚|深夜)/);
        if (phaseMatch) results.phase = phaseMatch[1];
        
        // 解析天气
        const weatherMatch = content.match(/(晴天|阴天|雨天|暴雨|雪天|雾天)/);
        if (weatherMatch) results.weather = weatherMatch[1];
        
        // 解析位置 📍
        const locationMatch = content.match(/📍\s*[：:]?\s*(.+?)(?:\n|$)/);
        if (locationMatch) {
            results.location = locationMatch[1].trim();
        } else {
            const altLocationMatch = content.match(/当前位置[：:]\s*(.+?)(?:\n|$)/);
            if (altLocationMatch) results.location = altLocationMatch[1].trim();
        }
    }
}

// ==================== 更新 StateUpdater 类 ====================

// ==================== 修复后的 StateUpdater 类 ====================

class StateUpdater {
    constructor() {
        this.updateCallbacks = [];
    }
    
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }
    
    // 人物状态属性 - 增量更新（因为AI可能只输出变化的属性）
    updateAttributes(newAttributes) {
        const changes = [];
        
        for (const [name, value] of Object.entries(newAttributes)) {
            // 确保值是有效数字
            let numericValue = value;
            let displayValue = value;
            
            // 如果是分数格式 "50/100"，提取数值用于进度条
            if (typeof value === 'string' && value.includes('/')) {
                const parts = value.split('/');
                const current = parseInt(parts[0]);
                const max = parseInt(parts[1]);
                if (!isNaN(current) && !isNaN(max) && max > 0) {
                    numericValue = Math.round((current / max) * 100); // 转换为百分比
                    displayValue = value;
                } else {
                    numericValue = 50; // 默认值
                    displayValue = value;
                }
            } else if (typeof value === 'number') {
                numericValue = value;
                displayValue = value;
            } else {
                // 非数字/分数格式，跳过
                console.warn(`[状态同步] 跳过非数值属性: ${name} = ${value}`);
                continue;
            }
            
            const currentValue = gameState.attributes[name];
            
            // 如果当前值不存在，或者值发生了变化
            if (currentValue === undefined) {
                gameState.attributes[name] = displayValue;
                // 存储数值版本用于进度条
                gameState.attributes[`${name}`] = numericValue;
                changes.push({ name, oldValue: undefined, newValue: displayValue, isNew: true, category: 'status' });
                console.log(`[状态同步] 发现新属性: ${name} = ${displayValue}`);
            } else if (currentValue !== displayValue) {
                changes.push({ name, oldValue: currentValue, newValue: displayValue, isNew: false, category: 'status' });
                gameState.attributes[name] = displayValue;
                gameState.attributes[`${name}`] = numericValue;
                console.log(`[状态同步] 属性更新: ${name} ${currentValue} → ${displayValue}`);
            }
            
            // 更新配置
            if (!attributeConfig.displayOrder.includes(name)) {
                attributeConfig.displayOrder.unshift(name);
            }
            if (!attributeConfig.colorMap[name]) {
                const hash = hashCode(name);
                const hue = hash % 360;
                attributeConfig.colorMap[name] = {
                    color: `hsl(${hue}, 70%, 60%)`,
                    icon: getDefaultIcon(name),
                    barGradient: `linear-gradient(90deg, hsl(${hue}, 70%, 60%), hsl(${hue}, 70%, 40%))`
                };
            }
        }
        
        return changes;
    }
    
    // 角色属性 - 替换模式（属性值应该直接替换）
    updateStats(newStats) {
        const changes = [];
        
        if (!gameState.stats) gameState.stats = {};
        
        for (const [name, data] of Object.entries(newStats)) {
            const value = typeof data === 'object' ? data.value : data;
            const description = typeof data === 'object' ? data.description : '';
            
            const oldValue = gameState.stats[name]?.value;
            
            if (oldValue !== value) {
                gameState.stats[name] = { value, description };
                changes.push({ name, oldValue, newValue: value, category: 'stat' });
                console.log(`[状态同步] 角色属性: ${name} = ${value} (原值: ${oldValue})`);
            }
        }
        
        return changes;
    }
    
    // 物品栏 - 完全替换模式（物品栏是完整快照，不是增量）
    updateItems(newItems) {
        if (!gameState.items) gameState.items = [];
        
        // 记录变化
        const oldCount = gameState.items.length;
        const newCount = newItems.length;
        
        // 完全替换
        gameState.items = [...newItems];
        
        console.log(`[状态同步] 物品栏已更新: ${oldCount} → ${newCount} 种物品`);
        
        // 打印具体变化
        for (const item of newItems) {
            console.log(`  📦 ${item.name} x${item.quantity}${item.note ? ` (${item.note})` : ''}`);
        }
        
        return gameState.items;
    }

    // 人际关系 - 智能更新（支持心情）
    updateCharacters(newCharacters) {
        const changes = [];
        
        for (const newChar of newCharacters) {
            const normalizedName = normalizeName(newChar.name);
            const existingChar = characters.find(c => normalizeName(c.name) === normalizedName);
            
            // ========== 【修复】确保 visible 正确传递 ==========
            const visible = newChar.visible !== undefined ? newChar.visible : true;
            const mood = newChar.mood || '日常';
            const description = newChar.description || newChar.note || '';
            
            if (!existingChar) {
                // 新角色 - 创建
                let affection = 30;
                if (newChar.affection !== undefined && newChar.affection !== null) {
                    affection = newChar.affection;
                }
                affection = Math.min(100, Math.max(-100, affection));
                
                characters.push({
                    id: Date.now(),
                    name: normalizedName,
                    tags: newChar.tags || [],
                    affection: affection,
                    gender: newChar.gender || '未知',
                    mood: mood,
                    visible: visible,  // 【修复】使用解析出的 visible
                    description: description,
                    note: newChar.note || description,
                    status: '正常'
                });
                changes.push({ 
                    name: newChar.name, 
                    action: 'created', 
                    affection: affection, 
                    mood: mood, 
                    visible: visible, 
                    description: description, 
                    category: 'character' 
                });
                console.log(`[状态同步] 新角色: ${newChar.name}, 好感度: ${affection}, 心情: ${mood}, 可见: ${visible ? '是' : '否'}`);
            } else {
                // ========== 【修复】显隐状态更新 - 无论是否变化都检查 ==========
                if (existingChar.visible !== visible) {
                    const oldVisible = existingChar.visible;
                    existingChar.visible = visible;
                    changes.push({ 
                        name: newChar.name, 
                        action: 'visibility_change', 
                        visible: visible, 
                        oldVisible: oldVisible, 
                        category: 'character' 
                    });
                    console.log(`[状态同步] 角色显隐变化: ${newChar.name} ${oldVisible ? '显示' : '隐藏'} → ${visible ? '显示' : '隐藏'}`);
                }
                
                // 更新好感度
                if (newChar.affection !== undefined && newChar.affection !== null && existingChar.affection !== newChar.affection) {
                    const delta = newChar.affection - existingChar.affection;
                    existingChar.affection = Math.min(100, Math.max(-100, newChar.affection));
                    changes.push({ name: newChar.name, action: 'affection_change', delta: delta, category: 'character' });
                    console.log(`[状态同步] 好感度变化: ${newChar.name} ${delta > 0 ? '+' : ''}${delta}`);
                }
                
                // 更新心情
                if (newChar.mood && existingChar.mood !== newChar.mood) {
                    const oldMood = existingChar.mood;
                    existingChar.mood = newChar.mood;
                    changes.push({ name: newChar.name, action: 'mood_change', oldMood: oldMood, newMood: newChar.mood, category: 'character' });
                    console.log(`[状态同步] 心情变化: ${newChar.name} ${oldMood} → ${newChar.mood}`);
                }
                
                // 更新描述
                if (description && existingChar.description !== description) {
                    const oldDescription = existingChar.description;
                    existingChar.description = description;
                    existingChar.note = description;
                    changes.push({ 
                        name: newChar.name, 
                        action: 'description_change', 
                        oldDescription: oldDescription, 
                        newDescription: description, 
                        category: 'character' 
                    });
                    console.log(`[状态同步] 描述更新: ${newChar.name} "${description.substring(0, 50)}"`);
                }
            }
        }
        
        // ========== 【新增】处理角色被标记为隐藏但不在新列表中 ==========
        // 注意：如果角色在状态栏中不再出现，但之前是可见的，我们保持原样
        // 只有在状态栏明确标记为"隐"时才隐藏
        
        return changes;
    }
    
    notifyUpdate(changes) {
        for (const callback of this.updateCallbacks) {
            callback(changes);
        }
    }

    // 在 StateUpdater 类中添加
    updateOtherSections(otherSections) {
        console.log('[同步] updateOtherSections 被调用，输入:', otherSections);
        
        if (!gameState.otherSections) {
            gameState.otherSections = {};
        }
        
        for (const [sectionName, content] of Object.entries(otherSections)) {
            gameState.otherSections[sectionName] = content;
            console.log(`[同步] 保存栏目: ${sectionName}，内容: ${content.substring(0, 100)}`);
        }
        
        console.log('[同步] 当前 gameState.otherSections:', gameState.otherSections);
        return otherSections;
    }

    // 获取其他栏目
    getOtherSections() {
        return gameState.otherSections || {};
    }
}

// ==================== 状态同步UI面板 ====================
// 添加浮动回顶按钮（如果不存在）
// 修改后的 addFloatingScrollTopButton 函数

function addFloatingScrollTopButton() {
    if (document.getElementById('cinema-floating-scroll-btn')) return;
    
    const floatingBtn = document.createElement('button');
    floatingBtn.id = 'cinema-floating-scroll-btn';
    floatingBtn.innerHTML = '⬆️';
    floatingBtn.title = '返回顶部';
    floatingBtn.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 380px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255,105,180,0.8), rgba(255,68,68,0.8));
        border: 2px solid rgba(255,255,255,0.3);
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 200010;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    `;
    
    floatingBtn.onmouseenter = () => {
        floatingBtn.style.transform = 'scale(1.1)';
        floatingBtn.style.background = 'linear-gradient(135deg, #ff69b4, #ff4444)';
    };
    floatingBtn.onmouseleave = () => {
        floatingBtn.style.transform = 'scale(1)';
    };
    floatingBtn.onclick = () => {
        // 滚动整个右侧面板容器
        const container = document.getElementById('cinema-sync-panel-container');
        if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // 同时滚动内部的其他滚动区域
        const otherContainer = document.getElementById('sync-other-sections');
        if (otherContainer) {
            const scrollDiv = otherContainer.querySelector('div[style*="overflow-y"]');
            if (scrollDiv) {
                scrollDiv.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        // 短暂动画
        floatingBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            floatingBtn.style.transform = 'scale(1)';
        }, 200);
    };
    
    document.body.appendChild(floatingBtn);
    
    // 监听整个右侧面板的滚动事件
    const container = document.getElementById('cinema-sync-panel-container');
    if (container) {
        // 添加滚动监听
        const checkScroll = () => {
            if (container.scrollTop > 200) {
                floatingBtn.style.opacity = '1';
                floatingBtn.style.visibility = 'visible';
            } else {
                floatingBtn.style.opacity = '0';
                floatingBtn.style.visibility = 'hidden';
            }
        };
        
        container.addEventListener('scroll', checkScroll);
        
        // 初始检查一次
        setTimeout(checkScroll, 500);
        
        // 也监听内容变化（当状态栏更新时重新检查）
        const observer = new MutationObserver(checkScroll);
        observer.observe(container, { childList: true, subtree: true, attributes: true });
        
        console.log('[回顶] 滚动监听已绑定到 cinema-sync-panel-container');
    } else {
        console.log('[回顶] 未找到 cinema-sync-panel-container，稍后重试');
        setTimeout(addFloatingScrollTopButton, 1000);
    }
}

function createSyncPanel() {
    if (syncPanelCreated) return;
    
    const container = document.getElementById('cinema-sync-panel-container');
    if (!container) {
        console.log('[状态同步] 等待容器创建...');
        setTimeout(() => createSyncPanel(), 500);
        return;
    }
    
    container.innerHTML = '';
    
    container.style.cssText = `
        width: 360px;
        background: linear-gradient(145deg, rgba(30,20,50,0.95), rgba(20,15,40,0.95));
        backdrop-filter: blur(10px);
        border-left: 2px solid rgba(255,105,180,0.5);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: 12px 15px;
        gap: 12px;
    `;
    
    // 标签页导航（新增"主题"选项卡）
    const tabsHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 5px;">
            <span style="font-size: 18px; font-weight: bold;">📖 状态栏</span>
            <div style="display: flex; gap: 8px;">
                <button id="sync-reset-btn" style="background: rgba(255,68,68,0.3); border: 1px solid #ff4444; color: #ff8888; border-radius: 20px; padding: 2px 8px; font-size: 16px; cursor: pointer;">🗑️ 重置</button>
                <span id="sync-status" style="font-size: 16px; color: #4ecdc4;">● 运行中</span>
            </div>
        </div>
        
        <!-- 标签页导航 -->
        <div style="display: flex; gap: 5px; margin-bottom: 5px; border-bottom: 1px solid rgba(255,105,180,0.3); padding-bottom: 8px; flex-wrap: nowrap;">
            <button class="sync-tab-btn active" data-tab="status">📊 状态</button>
            <button class="sync-tab-btn" data-tab="inventory">🎒 物品</button>
            <button class="sync-tab-btn" data-tab="relations">💕 关系</button>
            <button class="sync-tab-btn" data-tab="theme">🎨 主题</button>
            <button class="sync-tab-btn" data-tab="functions">🔧 功能</button>
            <button class="sync-tab-btn" data-tab="other">📦 其他</button>
        </div>
        
        <!-- 状态标签页 -->
        <div id="sync-tab-status" class="sync-tab-content active">
            <!-- 可编辑的角色卡片 -->
            <div id="sync-character-card" style="
                background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));
                border-radius: 16px;
                padding: 15px;
                margin-bottom: 12px;
                border: 1px solid rgba(255,105,180,0.3);
                position: relative;
                overflow: hidden;
            ">
                <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                    <!-- 图片区域（长方形） -->
                    <div id="sync-character-avatar" style="
                        width: 120px;
                        height: 160px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        border: 2px solid #ff69b4;
                        box-shadow: 0 0 10px rgba(255,105,180,0.3);
                        flex-shrink: 0;
                    ">
                        <span id="sync-character-avatar-emoji" style="font-size: 48px;">👤</span>
                        <img id="sync-character-avatar-img" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                    </div>
                    
                    <!-- 可编辑名字区域 -->
                    <div style="flex: 1; min-width: 100px;">
                        <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
                            <span style="font-size: 16px; color: #aaa;">角色名</span>
                            <input type="text" id="sync-character-name-input" value="探客" style="
                                background: rgba(0,0,0,0.5);
                                border: 1px solid rgba(255,105,180,0.5);
                                border-radius: 24px;
                                padding: 8px 16px;
                                color: #ffd700;
                                font-size: 18px;
                                font-weight: bold;
                                outline: none;
                                width: 100px;
                            ">
                        </div>
                        <div id="sync-character-title" style="font-size: 17px; color: #888; margin-top: 6px;">📖 玩家</div>
                    </div>
                </div>
            </div>
            
            <!-- 游戏信息 -->
            <div id="sync-game-info" style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 10px; text-align: center;">
                <span id="sync-day" style="font-size: 17px;">第1天</span> · 
                <span id="sync-phase" style="font-size: 17px;">早晨</span> · 
                <span id="sync-weather" style="font-size: 17px;">阴天</span>
                <div id="sync-location" style="font-size: 17px; color: #aaa; margin-top: 5px;">📍 未知地点</div>
            </div>
            
            <!-- 人物状态（进度条式） -->
            <div class="sync-section">
                <div class="sync-section-title" style="font-size: 17px;">❤️ 人物状态</div>
                <div id="sync-attributes" class="sync-attributes-progress"></div>
            </div>
            
            <!-- 角色属性 -->
            <div class="sync-section">
                <div class="sync-section-title" style="font-size: 17px;">⭐ 角色属性</div>
                <div id="sync-stats" class="sync-stats-grid"></div>
            </div>
            
            <!-- 日志容器（可编辑） -->
            <div class="sync-section" style="margin-top: 12px;">
                <div class="sync-section-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>📝 日志记录</span>
                    <div style="display: flex; gap: 8px;">
                        <button id="sync-log-clear" style="
                            background: rgba(255,68,68,0.3);
                            border: none;
                            border-radius: 15px;
                            padding: 2px 10px;
                            color: #ff8888;
                            font-size: 16px;
                            cursor: pointer;
                        " onmouseenter="this.style.background='rgba(255,68,68,0.5)'" 
                        onmouseleave="this.style.background='rgba(255,68,68,0.3)'">清空</button>
                        <button id="sync-log-export" style="
                            background: rgba(78,205,196,0.3);
                            border: none;
                            border-radius: 15px;
                            padding: 2px 10px;
                            color: #4ecdc4;
                            font-size: 16px;
                            cursor: pointer;
                        " onmouseenter="this.style.background='rgba(78,205,196,0.5)'" 
                        onmouseleave="this.style.background='rgba(78,205,196,0.3)'">导出</button>
                    </div>
                </div>
                <textarea id="sync-log" rows="6" style="
                    width: 100%;
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(255,105,180,0.3);
                    border-radius: 12px;
                    padding: 10px 12px;
                    color: #ccc;
                    font-size: 17px;
                    resize: vertical;
                    outline: none;
                    font-family: 'Courier New', monospace;
                    line-height: 1.5;
                " placeholder="暂无日志记录"></textarea>
            </div>
        </div>
        
        <!-- 物品标签页 -->
        <div id="sync-tab-inventory" class="sync-tab-content" style="display: none;">
            <div class="sync-section">
                <div class="sync-section-title">🎒 物品栏</div>
                <div id="sync-items" class="sync-items-list"></div>
            </div>
        </div>
        
        <!-- 关系标签页 -->
        <div id="sync-tab-relations" class="sync-tab-content" style="display: none;">
            <div class="sync-section">
                <div class="sync-section-title">💕 人际关系</div>
                <div id="sync-characters" class="sync-characters-list"></div>
            </div>
        </div>
        
        <!-- 主题标签页（新增） -->
        <div id="sync-tab-theme" class="sync-tab-content" style="display: none;">
            <div class="sync-section">
                <div class="sync-section-title">🎨 主题切换</div>
                <div id="sync-themes-container" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 10px;
                    padding: 8px 4px;
                ">
                    <!-- 主题按钮会动态渲染到这里 -->
                </div>
                <div style="
                    margin-top: 12px;
                    padding: 12px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    text-align: center;
                    font-size: 16px;
                    color: #888;
                ">
                    💡 点击主题预览切换，享受不同视觉风格
                </div>
            </div>
        </div>
        
        <!-- 功能标签页 -->
        <div id="sync-tab-functions" class="sync-tab-content" style="display: none;">
            <div class="sync-section">
                <div class="sync-section-title">🔧 功能中心</div>
                <div id="sync-functions-container" style="display: flex; flex-direction: column; gap: 10px; padding: 5px 0;">
                    <div style="text-align: center; padding: 30px 20px; color: rgba(255,255,255,0.4);">
                        <span style="font-size: 48px;">✨</span>
                        <div style="margin-top: 10px; font-size: 16px;">功能开发中...</div>
                        <div style="margin-top: 5px; font-size: 16px;">敬请期待更多有趣的功能</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 其他标签页 -->
        <div id="sync-tab-other" class="sync-tab-content" style="display: none;">
            <div id="sync-other-sections"></div>
        </div>
        
        <div style="font-size: 16px; color: rgba(255,255,255,0.3); text-align: center; padding-top: 5px;">
            📡 自动解析AI消息中的状态栏
        </div>
    `;
    
    container.innerHTML = tabsHtml;
    
    syncPanelCreated = true;
    addFloatingScrollTopButton();
    
    // 修复标签页切换逻辑

    // 标签页切换逻辑（包含新增的 theme）
    const tabs = ['status', 'inventory', 'relations', 'theme', 'functions', 'other'];
    tabs.forEach(tab => {
        const btn = container.querySelector(`.sync-tab-btn[data-tab="${tab}"]`);
        if (btn) {
            btn.onclick = () => {
                // 1. 移除所有按钮的 active 样式（通过修改内联样式）
                container.querySelectorAll('.sync-tab-btn').forEach(b => {
                    b.classList.remove('active');
                    // 恢复非激活状态的颜色
                    b.style.background = 'rgba(255,255,255,0.1)';
                    b.style.color = '#ccc';
                });
                
                // 2. 激活当前按钮
                btn.classList.add('active');
                btn.style.background = 'rgba(255,105,180,0.5)';
                btn.style.color = '#ffd700';
                
                // 3. 切换内容显示
                tabs.forEach(t => {
                    const content = container.querySelector(`#sync-tab-${t}`);
                    if (content) {
                        content.style.display = t === tab ? 'block' : 'none';
                    }
                });
                
                // 4. 如果切换到主题标签页，渲染主题
                if (tab === 'theme') {
                    renderThemePanel();
                }
            };
        }
    });
    
    // 绑定重置按钮
    const resetBtn = document.getElementById('sync-reset-btn');
    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.stopPropagation();
            confirmResetData();
        };
        resetBtn.onmouseenter = () => {
            resetBtn.style.background = 'rgba(255,68,68,0.5)';
            resetBtn.style.transform = 'scale(1.02)';
        };
        resetBtn.onmouseleave = () => {
            resetBtn.style.background = 'rgba(255,68,68,0.3)';
            resetBtn.style.transform = 'scale(1)';
        };
    }
    
    // 添加样式
    if (!document.getElementById('cinema-sync-panel-styles')) {
        const style = document.createElement('style');
        style.id = 'cinema-sync-panel-styles';
        style.textContent = `
            .sync-tab-btn {
                background: rgba(255,255,255,0.1);
                border: none;
                color: #ccc;
                padding: 5px 10px;
                border-radius: 0px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            }
            .sync-tab-btn:hover {
                background: rgba(255,105,180,0.3);
                color: #fff;
            }
            .sync-tab-btn.active {
                background: rgba(255,105,180,0.5);
                color: #ffd700;
                box-shadow: 0 0 5px rgba(255,105,180,0.5);
            }
            .sync-section {
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 8px 10px;
                margin-top: 10px;
            }
            .sync-section-title {
                font-size: 17px;
                color: #ffd700;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid rgba(255,105,180,0.3);
            }
            .sync-attributes-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .sync-attribute-item {
                background: rgba(0,0,0,0.3);
                border-radius: 20px;
                padding: 4px 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 17px;
            }
            .sync-stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
            }
            .sync-stat-item {
                background: rgba(0,0,0,0.3);
                border-radius: 10px;
                padding: 5px 8px;
                text-align: center;
            }
            .sync-stat-name {
                font-size: 16px;
                color: #aaa;
            }
            .sync-stat-value {
                font-size: 17px;
                font-weight: bold;
            }
            .sync-items-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                font-size: 17px;
                overflow-y: auto;
            }
            .sync-item-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 10px;
                background: rgba(0,0,0,0.2);
                border-radius: 8px;
            }
            .sync-characters-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
                overflow-y: auto;
            }
            .sync-character-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 10px;
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
            }
            .sync-character-name {
                width: 65px;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 17px;
            }
            .sync-character-affection {
                font-weight: bold;
                font-size: 17px;
            }
            .sync-character-bar {
                width: 80px;
                height: 5px;
                background: rgba(255,255,255,0.2);
                border-radius: 3px;
                overflow: hidden;
            }
            .sync-character-bar-fill {
                height: 100%;
                background: #ff69b4;
                border-radius: 3px;
                transition: width 0.3s;
            }
            #cinema-sync-panel-container::-webkit-scrollbar {
                width: 4px;
            }
            #cinema-sync-panel-container::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #cinema-sync-panel-container::-webkit-scrollbar-thumb {
                background: #ff69b4;
                border-radius: 10px;
            }
            .sync-character-desc {
                font-size: 16px;
                color: rgba(255,255,255,0.4);
                margin-top: 4px;
                padding-left: 4px;
                border-left: 2px solid #ff69b4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('[状态同步] 状态栏（RPG标签页版 + 主题选项卡）已渲染');
    
    renderSyncPanel();
}

// ==================== 重置数据函数 ====================


function resetSyncData() {
    console.log('[同步] 开始重置数据...');
    
    // 重置游戏状态
    gameState = {
        day: 1,
        phase: '早晨',
        weather: '阴天',
        location: '',
        attributes: {},
        stats: {},
        items: []
    };
    
    // 重置角色数组
    characters = [];
    
    // 重置属性配置（保留默认图标映射）
    attributeConfig = {
        displayOrder: [],
        colorMap: {},
        defaultValues: {}
    };
    
    // 清空 localStorage
    localStorage.removeItem('cinema_sync_data');
    
    // 重新加载默认数据
    loadSyncData();
    
    // 刷新UI
    renderSyncPanel();
    
    // 显示提示
    showResetToast();
    
    console.log('[同步] ✅ 数据已重置');
}

// 重置提示
function showResetToast(message = '数据已重置为默认值') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        border: 1px solid #ff69b4;
        border-radius: 30px;
        padding: 10px 25px;
        color: #ffd700;
        font-size: 16px;
        z-index: 200000;
        animation: fadeOutSync 2s ease;
        pointer-events: none;
        white-space: nowrap;
    `;
    toast.textContent = '🗑️ ' + message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// 确认重置对话框
function confirmResetData() {
    // 检查是否有数据需要重置
    const hasData = Object.keys(gameState.attributes).length > 0 || 
                    characters.length > 0 ||
                    Object.keys(gameState.stats).length > 0 ||
                    (gameState.items && gameState.items.length > 0);
    
    // if (!hasData) {
    //     showResetToast('暂无数据需要清理');
    //     return;
    // }
    
    // 创建确认对话框
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'sync-reset-confirm';
    // ⭐ 关键：添加内联样式
    confirmDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, rgba(40,20,30,0.98), rgba(30,15,25,0.98));
        backdrop-filter: blur(20px);
        border: 2px solid #ff4444;
        border-radius: 20px;
        padding: 20px;
        z-index: 200000;
        text-align: center;
        min-width: 280px;
        box-shadow: 0 0 30px rgba(255,68,68,0.3);
    `;
    confirmDiv.innerHTML = `
        <div style="margin-bottom: 15px;">
            <span style="font-size: 48px;">🗑️</span>
        </div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ff8888;">
            确认重置所有数据？
        </div>
        <div style="font-size: 16px; color: #aaa; margin-bottom: 20px;">
            这将清空所有状态数据、角色信息和物品栏
        </div>
        <div>
            <button id="reset-confirm-yes" style="
                background: rgba(255,68,68,0.3);
                border: 1px solid #ff4444;
                color: #ff8888;
            ">✅ 确认重置</button>
            <button id="reset-confirm-no" style="
                background: rgba(255,255,255,0.1);
                border: 1px solid #888;
                color: #ccc;
            ">❌ 取消</button>
        </div>
    `;
    
    document.body.appendChild(confirmDiv);
    
    // 绑定按钮事件
    const yesBtn = document.getElementById('reset-confirm-yes');
    const noBtn = document.getElementById('reset-confirm-no');
    
    yesBtn.onclick = () => {
        resetSyncData();
        confirmDiv.remove();
        // 同时刷新影院模式中的角色管理器（如果存在）
        if (typeof characterPortraitManager !== 'undefined' && characterPortraitManager) {
            characterPortraitManager.characterMap.clear();
            // characterPortraitManager.usedImages.clear();
            console.log('[同步] 已同步清空角色立绘映射');
        }
    };
    
    noBtn.onclick = () => {
        confirmDiv.remove();
    };
    
    // 点击外部关闭
    confirmDiv.onclick = (e) => {
        if (e.target === confirmDiv) {
            confirmDiv.remove();
        }
    };
}

function renderThemePanel() {
    const container = document.getElementById('sync-themes-container');
    if (!container) {
        console.log('[主题] 找不到主题容器');
        return;
    }
    
    // 初始化主题管理器
    initThemeManager();
    
    const themes = themeManager.getAllThemes();
    const currentTheme = themeManager.currentTheme;
    const currentThemeObj = themeManager.getCurrentTheme();
    const colors = currentThemeObj.colors;
    
    let html = '';
    
    for (const theme of themes) {
        const isActive = theme.id === currentTheme;
        const c = theme.colors;
        
        html += `
            <div class="cinema-theme-btn" data-theme="${theme.id}" style="
                background: ${isActive ? `linear-gradient(135deg, ${c.primary}44, ${c.secondary}44)` : 'rgba(255,255,255,0.05)'};
                border: 2px solid ${isActive ? c.primary : 'rgba(255,255,255,0.15)'};
                border-radius: 16px;
                padding: 14px 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                ${isActive ? `box-shadow: 0 0 20px ${c.glow};` : ''}
                position: relative;
                overflow: hidden;
            " onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.4)'" 
            onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='${isActive ? `0 0 20px ${c.glow}` : 'none'}'">
                
                <!-- 主题预览色块 -->
                <div style="
                    display: flex;
                    gap: 4px;
                    justify-content: center;
                    margin-bottom: 10px;
                    padding: 0 4px;
                ">
                    <div style="
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        background: ${c.primary};
                        border: 1px solid rgba(255,255,255,0.2);
                    "></div>
                    <div style="
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        background: ${c.secondary || c.primary};
                        border: 1px solid rgba(255,255,255,0.2);
                    "></div>
                    <div style="
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        background: ${c.accent || c.primary};
                        border: 1px solid rgba(255,255,255,0.2);
                    "></div>
                    <div style="
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                        background: ${c.bg};
                        border: 1px solid rgba(255,255,255,0.2);
                    "></div>
                </div>
                
                <!-- 主题图标和名称 -->
                <div style="
                    font-size: 28px;
                    display: block;
                    margin-bottom: 6px;
                ">${theme.icon}</div>
                
                <div style="
                    font-size: 17px;
                    font-weight: bold;
                    color: ${isActive ? c.primary : '#ddd'};
                    transition: color 0.3s;
                ">${theme.name}</div>
                
                <div style="
                    font-size: 16px;
                    color: ${isActive ? c.primary : '#888'};
                    margin-top: 4px;
                    transition: color 0.3s;
                ">${theme.description}</div>
                
                ${isActive ? `
                    <div style="
                        position: absolute;
                        top: 6px;
                        right: 8px;
                        font-size: 18px;
                        color: ${c.primary};
                    ">✓</div>
                ` : ''}
                
                <!-- 预览按钮 -->
                <div style="
                    margin-top: 10px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    background: ${isActive ? `${c.primary}44` : 'rgba(255,255,255,0.08)'};
                    font-size: 16px;
                    color: ${isActive ? c.primary : '#888'};
                    display: inline-block;
                    transition: all 0.3s;
                ">
                    ${isActive ? '当前使用' : '预览'}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // 绑定主题切换事件
    document.querySelectorAll('.cinema-theme-btn').forEach(btn => {
        btn.onclick = () => {
            const themeId = btn.dataset.theme;
            if (themeId === themeManager.currentTheme) {
                showCinemaToast(`已是当前主题: ${themeManager.getCurrentTheme().name}`, 'info');
                return;
            }
            
            // 应用主题
            const success = themeManager.applyTheme(themeId);
            if (success) {
                // 重新渲染主题面板以更新选中状态
                renderThemePanel();
                
                // 同时刷新其他UI元素
                refreshUIAfterThemeChange();
            }
        };
    });
}

// 主题切换后刷新UI
function refreshUIAfterThemeChange() {
    // 更新状态面板的样式
    const syncContainer = document.getElementById('cinema-sync-panel-container');
    if (syncContainer) {
        const theme = themeManager.getCurrentTheme();
        const colors = theme.colors;
        syncContainer.style.background = `linear-gradient(145deg, ${colors.cardBg}, rgba(0,0,0,0.7))`;
        syncContainer.style.borderLeft = `2px solid ${colors.border}`;
    }
    
    // 更新标签页样式
    document.querySelectorAll('.sync-tab-btn').forEach(btn => {
        const theme = themeManager.getCurrentTheme();
        if (btn.classList.contains('active')) {
            btn.style.background = `${theme.colors.primary}66`;
            btn.style.color = theme.colors.accent;
        } else {
            btn.style.color = theme.colors.text;
        }
    });
    
    // 更新状态栏标题
    document.querySelectorAll('.sync-section-title').forEach(title => {
        const theme = themeManager.getCurrentTheme();
        title.style.color = theme.colors.accent;
        title.style.borderBottom = `1px solid ${theme.colors.border}`;
    });
    
    // 更新角色卡片边框
    const charCard = document.getElementById('sync-character-card');
    if (charCard) {
        const theme = themeManager.getCurrentTheme();
        charCard.style.border = `1px solid ${theme.colors.border}`;
    }
    
    // 更新游戏信息背景
    const gameInfo = document.getElementById('sync-game-info');
    if (gameInfo) {
        const theme = themeManager.getCurrentTheme();
        gameInfo.style.background = `rgba(0,0,0,0.3)`;
    }
}

// 更新角色头像（根据名字从图库加载）
function updateCharacterAvatar() {
    const playerName = document.getElementById('sync-character-name-input')?.value || '探客';
    const avatarImg = document.getElementById('sync-character-avatar-img');
    const avatarEmoji = document.getElementById('sync-character-avatar-emoji');
    
    // 尝试加载图片
    const imgPath = `${BASE_PATH}images/portrait/player/${playerName}.png`;
    const testImg = new Image();
    testImg.onload = () => {
        if (avatarImg) {
            avatarImg.src = imgPath;
            avatarImg.style.display = 'block';
            if (avatarEmoji) avatarEmoji.style.display = 'none';
        }
    };
    testImg.onerror = () => {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarEmoji) {
            avatarEmoji.style.display = 'flex';
            avatarEmoji.textContent = '👤';
        }
    };
    testImg.src = imgPath;
}

// 初始化名字编辑功能
function initNameEdit() {
    const nameInput = document.getElementById('sync-character-name-input');
    const saveBtn = document.getElementById('sync-name-edit-btn');
    const logSaveBtn = document.getElementById('sync-log-save');
    const logTextarea = document.getElementById('sync-log');
    
    if (saveBtn && nameInput) {
        saveBtn.onclick = () => {
            const newName = nameInput.value.trim();
            if (newName) {
                // 保存到 gameState
                if (gameState) gameState.playerName = newName;
                localStorage.setItem('player_name', newName);
                updateCharacterAvatar();
                showSyncToast(`名字已更改为: ${newName}`);
            }
        };
    }
    
    // 日志保存
    if (logSaveBtn && logTextarea) {
        logSaveBtn.onclick = () => {
            const logContent = logTextarea.value;
            localStorage.setItem('sync_game_log', logContent);
            showSyncToast('日志已保存');
        };
        
        // 加载保存的日志
        const savedLog = localStorage.getItem('sync_game_log');
        if (savedLog) logTextarea.value = savedLog;
    }
    
    // 加载保存的名字
    const savedName = localStorage.getItem('player_name');
    if (savedName && nameInput) nameInput.value = savedName;
    
    // 更新头像
    updateCharacterAvatar();
}

// ==================== 功能中心 ====================

// 添加功能按钮
function addFunctionButton(config) {
    const container = document.getElementById('sync-functions-container');
    if (!container) return;
    
    // 如果已有占位符，先清除
    if (container.querySelector('.functions-placeholder')) {
        container.innerHTML = '';
    }
    
    const button = document.createElement('button');
    button.className = 'sync-function-btn';
    button.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">${config.icon || '🔧'}</span>
            <div style="flex: 1; text-align: left;">
                <div style="font-size: 16px; font-weight: bold; color: #ffd700;">${config.title}</div>
                <div style="font-size: 16px; color: #aaa;">${config.description || ''}</div>
            </div>
            <span style="font-size: 16px; color: #ff69b4;">➤</span>
        </div>
    `;
    button.style.cssText = `
        width: 100%;
        background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
        border: 1px solid rgba(255,105,180,0.3);
        border-radius: 16px;
        padding: 12px 15px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    `;
    button.onmouseenter = () => {
        button.style.transform = 'translateX(5px)';
        button.style.background = 'rgba(255,105,180,0.15)';
        button.style.borderColor = '#ff69b4';
    };
    button.onmouseleave = () => {
        button.style.transform = 'translateX(0)';
        button.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))';
        button.style.borderColor = 'rgba(255,105,180,0.3)';
    };
    button.onclick = config.onClick;
    
    container.appendChild(button);
}

// 初始化功能按钮（示例，后续可扩展）
function initFunctionButtons() {
    // 清除现有内容
    const container = document.getElementById('sync-functions-container');
    if (!container) return;
    
    // 示例功能按钮（后续可以在这里添加更多）
    // addFunctionButton({
    //     icon: '🎨',
    //     title: '主题切换',
    //     description: '切换影院模式主题',
    //     onClick: () => { console.log('主题切换功能'); }
    // });
    
    // 占位提示（如果没有功能按钮）
    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="functions-placeholder" style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.4);">
                <span style="font-size: 48px;">✨</span>
                <div style="margin-top: 10px; font-size: 17px;">功能开发中...</div>
                <div style="margin-top: 5px; font-size: 17px;">即将推出更多有趣的功能</div>
            </div>
        `;
    }
}

function renderSyncPanel() {
    // 确保面板存在
    if (!syncPanelCreated) {
        createSyncPanel();
    }
    
    // 渲染游戏信息
    renderGameInfo();
    
    // 渲染人物状态属性
    renderAttributes();
    
    // 渲染角色属性
    renderStats();
    
    // 渲染物品栏
    renderItems();
    
    // 渲染人际关系
    renderCharacters();
    
    // ========== 新增：渲染其他栏目 ==========
    renderOtherSections();

    renderSyncAttributes()

    // 初始化功能按钮
    initFunctionButtons();

    updateCharacterAvatar()// 更新角色头像（根据名字从图库加载）

    // 更新角色头像边框（跟随主题）
    const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = currentTheme ? currentTheme.colors : { primary: '#ff69b4', glow: 'rgba(255,105,180,0.3)' };
    
    const avatar = document.getElementById('sync-character-avatar');
    if (avatar) {
        avatar.style.border = `2px solid ${colors.primary}`;
        avatar.style.boxShadow = `0 0 15px ${colors.glow || 'rgba(255,105,180,0.3)'}`;
    }
    
    // 更新角色卡片中的立绘边框（如果有）
    document.querySelectorAll('.sync-character-avatar-mini, .sync-character-avatar').forEach(el => {
        el.style.border = `2px solid ${colors.primary}`;
    });
}

function renderOtherSections() {
    let container = document.getElementById('sync-other-sections');
    if (!container) {
        console.log('[同步] 创建 sync-other-sections 容器');
        const panel = document.getElementById('cinema-sync-panel-container');
        if (panel) {
            const newContainer = document.createElement('div');
            newContainer.id = 'sync-other-sections';
            newContainer.style.cssText = `
                display: block;
                width: 100%;
                margin-top: 10px;
            `;
            panel.appendChild(newContainer);
            container = newContainer;
        } else {
            console.log('[同步] 找不到 cinema-sync-panel-container');
            return;
        }
    }
    
    const otherSections = gameState.otherSections || {};
    const sectionKeys = Object.keys(otherSections);
    
    console.log('[同步] 其他栏目 keys:', sectionKeys);
    
    if (sectionKeys.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    container.style.display = 'block';
    let html = '';
    
    for (const sectionName of sectionKeys) {
        const content = otherSections[sectionName];
        console.log(`[同步] 渲染栏目: ${sectionName}`);
        
        const sectionIcon = getSectionIcon(sectionName);
        
        // 直接对原始内容进行美化，不删除任何符号
        const beautifiedContent = beautifyRawContent(content);
        
        html += `
            <div class="sync-section" style="margin-top: 12px; margin-bottom: 12px;">
                <div class="sync-section-title" style="
                    font-size: 17px;
                    color: #ffd700;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid rgba(255,105,180,0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span>${sectionIcon}</span>
                    <span>${escapeHtml(sectionName)}</span>
                </div>
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    overflow-y: auto;
                    padding: 4px;
                ">
                    ${beautifiedContent}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // 添加滚动条样式
    if (!document.getElementById('cinema-other-sections-styles')) {
        const style = document.createElement('style');
        style.id = 'cinema-other-sections-styles';
        style.textContent = `
            #sync-other-sections div[style*="max-height"]::-webkit-scrollbar {
                width: 4px;
            }
            #sync-other-sections div[style*="max-height"]::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            #sync-other-sections div[style*="max-height"]::-webkit-scrollbar-thumb {
                background: #ff69b4;
                border-radius: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('[同步] 其他栏目渲染完成');
}

function beautifyRawContent(content) {
    if (!content) return '<div style="color: #888; padding: 10px;">无内容</div>';
    
    const lines = content.split('\n');
    let html = '';
    let inGroup = false;
    let currentGroupHtml = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // 跳过分隔线
        if (trimmed === '------' || trimmed === '---' || trimmed === '====') continue;
        
        // 检测是否是分组标题（以表情符号开头，且不包含冒号）
        // 表情符号的 Unicode 范围：\u{1F300}-\u{1F6FF} 等
        const hasEmoji = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(trimmed);
        const hasColon = trimmed.includes('：') || trimmed.includes(':');
        const isGroupTitle = hasEmoji && !hasColon && trimmed.length < 30;
        
        if (isGroupTitle) {
            if (inGroup) {
                html += `
                    <div style="
                        margin: 8px 0 12px 0;
                        background: rgba(0,0,0,0.2);
                        border-radius: 12px;
                        overflow: hidden;
                    ">
                        ${currentGroupHtml}
                    </div>
                `;
                currentGroupHtml = '';
            }
            inGroup = true;
            currentGroupHtml += `
                <div style="
                    padding: 8px 12px;
                    background: linear-gradient(135deg, rgba(255,105,180,0.15), rgba(255,105,180,0.05));
                    border-left: 4px solid #ff69b4;
                    font-weight: bold;
                    color: #ffd700;
                    font-size: 18px;
                ">
                    ${escapeHtml(trimmed)}
                </div>
            `;
            continue;
        }
        
        // 处理内容行 - 保留所有原始符号
        let displayLine = trimmed;
        let lineClass = 'normal-line';
        
        // 根据行首的表情符号设置不同样式（可选美化，但不删除符号）
        const firstChar = trimmed.charAt(0);
        const isEmojiStart = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(firstChar);
        
        let bgColor = 'rgba(0,0,0,0.2)';
        let borderColor = 'transparent';
        let textColor = '#ccc';
        
        // 根据行内容关键词设置视觉提示（不删除任何内容）
        if (trimmed.includes('⬆️') || trimmed.includes('📈')) {
            borderColor = '#4ecdc4';
            textColor = '#4ecdc4';
        } else if (trimmed.includes('⬇️') || trimmed.includes('📉')) {
            borderColor = '#ff8888';
            textColor = '#ff8888';
        } else if (trimmed.includes('⚠️') || trimmed.includes('风险')) {
            borderColor = '#ffaa44';
            textColor = '#ffaa44';
        } else if (trimmed.includes('📜') || trimmed.includes('原因')) {
            borderColor = '#888';
        } else if (trimmed.includes('📢')) {
            borderColor = '#4ecdc4';
        }
        
        const lineHtml = `
            <div style="
                padding: 8px 12px;
                background: ${bgColor};
                border-left: 3px solid ${borderColor};
                border-radius: 8px;
                margin-bottom: 4px;
                color: ${textColor};
                font-size: 16px;
                line-height: 1.5;
                word-break: break-word;
                white-space: pre-wrap;
            ">
                ${escapeHtml(displayLine)}
            </div>
        `;
        
        if (inGroup) {
            currentGroupHtml += lineHtml;
        } else {
            html += lineHtml;
        }
    }
    
    // 关闭最后一个分组
    if (inGroup && currentGroupHtml) {
        html += `
            <div style="
                margin: 8px 0 12px 0;
                background: rgba(0,0,0,0.2);
                border-radius: 12px;
                overflow: hidden;
            ">
                ${currentGroupHtml}
            </div>
        `;
    }
    
    return html || `<div style="padding: 10px; color: #888;">${escapeHtml(content)}</div>`;
}
// ==================== 添加 getSectionIcon 函数 ====================

function getSectionIcon(sectionName) {
    const iconMap = {
        '人物状态': '❤️',
        '角色属性': '⭐',
        '物品栏': '🎒',
        '人际关系': '💕',
        '装备栏': '⚔️',
        '武学栏': '📖',
        '任务栏': '📋',
        '俱乐部资金': '💰',
        '银行负债': '💸',
        '队员数量': '👥',
        '技能栏': '🔮',
        '天赋栏': '✨',
        'buff栏': '🌀'
    };
    return iconMap[sectionName] || '📌';
}

function renderGameInfo() {
    const dayEl = document.getElementById('sync-day');
    const phaseEl = document.getElementById('sync-phase');
    const weatherEl = document.getElementById('sync-weather');
    const locationEl = document.getElementById('sync-location');
    
    if (dayEl) dayEl.textContent = `第${gameState.day || 1}天`;
    if (phaseEl) phaseEl.textContent = gameState.phase || '早晨';
    if (weatherEl) weatherEl.textContent = gameState.weather || '阴天';
    if (locationEl) locationEl.textContent = `📍 ${gameState.location || '未知地点'}`;
}

// 修改 renderSyncAttributes 函数

// ==================== 修改 renderSyncAttributes 函数（兼容现有数据格式） ====================

function renderSyncAttributes() {
    const container = document.getElementById('sync-attributes');
    if (!container) return;
    
    const attributes = gameState?.attributes || {};
    
    const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = currentTheme ? currentTheme.colors : { 
        primary: '#ff69b4', 
        text: '#ffffff',
        accent: '#ffd700'
    };
    
    // 获取所有属性键（排除以 _value 结尾的数值存储键）
    const attributeKeys = Object.keys(attributes).filter(k => !k.endsWith('_value'));
    
    if (attributeKeys.length === 0) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; padding: 10px;">暂无状态数据</div>';
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    
    for (const key of attributeKeys) {
        let displayValue = attributes[key];  // 显示值（如 "850/1000" 或 85）
        let numericValue = 50;               // 百分比值 (0-100)
        let icon = '📊';
        let name = key;
        let maxValue = 100;
        
        // ========== 尝试获取数值版本（用于进度条） ==========
        const numericKey = `${key}_value`;
        if (attributes[numericKey] !== undefined) {
            numericValue = Math.min(100, Math.max(0, parseFloat(attributes[numericKey]) || 50));
        } else {
            // 如果没有单独的数值存储，尝试从显示值解析
            if (typeof displayValue === 'string' && displayValue.includes('/')) {
                const parts = displayValue.split('/');
                const current = parseInt(parts[0]);
                const max = parseInt(parts[1]);
                if (!isNaN(current) && !isNaN(max) && max > 0) {
                    numericValue = Math.min(100, Math.max(0, (current / max) * 100));
                    maxValue = max;
                }
            } else if (typeof displayValue === 'number') {
                // 如果显示值是数字，且 <= 100，直接用作百分比
                if (displayValue <= 100) {
                    numericValue = Math.min(100, Math.max(0, displayValue));
                } else {
                    // 如果 > 100，按比例缩放（最大1000）
                    numericValue = Math.min(100, Math.max(0, (displayValue / 1000) * 100));
                }
            } else if (typeof displayValue === 'string' && !isNaN(parseFloat(displayValue))) {
                const num = parseFloat(displayValue);
                if (num <= 100) {
                    numericValue = Math.min(100, Math.max(0, num));
                } else {
                    numericValue = Math.min(100, Math.max(0, (num / 1000) * 100));
                }
            }
        }
        
        // 获取图标
        const emojiMatch = name.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])\s*(.+)/u);
        if (emojiMatch) {
            icon = emojiMatch[1];
            name = emojiMatch[2].trim();
        }
        if (!icon) {
            icon = getDefaultIcon(name) || '📊';
        }
        
        // 确保百分比在 0-100 范围内
        numericValue = Math.min(100, Math.max(0, numericValue));
        
        // 确定进度条颜色
        let barColor = colors.primary;
        if (numericValue > 70) {
            barColor = '#4ecdc4';
        } else if (numericValue > 40) {
            barColor = colors.accent || '#ffc107';
        } else {
            barColor = '#ff6b6b';
        }
        
        // 特殊处理：混乱值、误解值等（越低越好）
        if (name.includes('混乱') || name.includes('误解') || name.includes('孤独')) {
            if (numericValue > 70) barColor = '#ff6b6b';
            else if (numericValue > 40) barColor = colors.accent || '#ffc107';
            else barColor = '#4ecdc4';
        }
        
        // ========== 格式化显示值 ==========
        let displayText = String(displayValue);
        // 如果显示值包含 "/"，保留原始分数格式
        // 如果显示值是数字，显示精确值
        // 否则显示原始值
        
        html += `
            <div class="sync-attribute-progress-item">
                <div class="sync-attribute-label" style="color: ${colors.text};">
                    <span style="font-size: 16px;">${icon} ${escapeHtml(name)}</span>
                    <span style="font-size: 16px; font-weight: bold; color: ${barColor};">
                        ${escapeHtml(displayText)}%
                    </span>
                </div>
                <div class="sync-attribute-bar-bg" style="background: rgba(255,255,255,0.08); border-radius: 10px; height: 8px; overflow: hidden;">
                    <div class="sync-attribute-bar-fill" style="width: ${numericValue}%; height: 100%; background: ${barColor}; border-radius: 10px; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 同样修改 renderAttributes 函数
// 修改 renderAttributes 函数

function renderAttributes() {
    const container = document.getElementById('sync-attributes');
    if (!container) return;
    
    const attributes = gameState.attributes || {};
    const attributeKeys = Object.keys(attributes).filter(k => !k.endsWith('_value'));
    
    // 获取当前主题颜色
    const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = currentTheme ? currentTheme.colors : { 
        primary: '#ff69b4', 
        accent: '#ffd700', 
        text: '#ffffff'
    };
    
    if (attributeKeys.length === 0) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; padding: 10px;">暂无数据</div>';
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    for (const name of attributeKeys) {
        const value = attributes[name];
        
        let icon = '📊';
        let displayName = name;
        const emojiMatch = name.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])\s*(.+)/u);
        if (emojiMatch) {
            icon = emojiMatch[1];
            displayName = emojiMatch[2].trim();
        }
        
        let percentage = 50;
        let displayValue = value;
        let barColor = colors.primary;
        
        if (typeof value === 'number') {
            percentage = Math.min(100, Math.max(0, (value / 100) * 100));
            displayValue = value;
        } else if (typeof value === 'string' && value.includes('/')) {
            const parts = value.split('/');
            const current = parseInt(parts[0]);
            const max = parseInt(parts[1]);
            if (!isNaN(current) && !isNaN(max) && max > 0) {
                percentage = Math.min(100, Math.max(0, (current / max) * 100));
                displayValue = value;
            }
        }
        
        if (percentage > 70) barColor = '#4ecdc4';
        else if (percentage > 40) barColor = colors.accent || '#ffc107';
        else barColor = '#ff6b6b';
        
        if (displayName.includes('混乱') || displayName.includes('误解')) {
            if (percentage > 70) barColor = '#ff6b6b';
            else if (percentage > 40) barColor = colors.accent || '#ffc107';
            else barColor = '#4ecdc4';
        }
        
        html += `
            <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 16px; color: ${colors.text};">
                    <span>${icon} ${escapeHtml(displayName)}</span>
                    <span style="color: ${barColor}; font-weight: bold;">${displayValue}</span>
                </div>
                <div style="background: rgba(255,255,255,0.08); border-radius: 8px; height: 6px; overflow: hidden; margin-top: 2px;">
                    <div style="width: ${percentage}%; height: 100%; background: ${barColor}; border-radius: 8px; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderStats() {
    const container = document.getElementById('sync-stats');
    if (!container) return;
    
    const stats = gameState.stats || {};
    const statKeys = Object.keys(stats);
    
    if (statKeys.length === 0) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; width: 100%;">暂无数据</div>';
        return;
    }
    
    let html = '';
    for (const [name, data] of Object.entries(stats)) {
        const value = data.value || data;
        const iconMap = {
            '力量': '💪', '敏捷': '🏃', '智力': '📚',
            '体质': '🩸', '感知': '👁️', '魅力': '✨'
        };
        const icon = iconMap[name] || '⭐';
        
        html += `
            <div class="sync-stat-item">
                <div class="sync-stat-name">${icon} ${name}</div>
                <div class="sync-stat-value" style="color: #ffd700;">${value}</div>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ==================== 物品栏状态 ====================
let selectedItem = null;  // 当前选中的物品
let selectedItemIndex = -1;  // 当前选中的物品索引

// 渲染物品栏（格子型，带选中效果）

// 在 renderItems 函数中修改按钮绑定部分
function renderItems() {
    const container = document.getElementById('sync-items');
    if (!container) return;
    
    const items = gameState.items || [];
    
    // 获取当前主题色
    const currentTheme = themeManager ? themeManager.getCurrentTheme() : null;
    const colors = currentTheme ? currentTheme.colors : { 
        primary: '#ff69b4', 
        accent: '#ffd700', 
        text: '#ffffff',
        glow: 'rgba(255,105,180,0.4)'
    };
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="
                text-align: center; 
                padding: 60px 20px; 
                color: rgba(255,255,255,0.3);
                background: rgba(0,0,0,0.2);
                border-radius: 16px;
            ">
                <div style="font-size: 48px; margin-bottom: 15px;">🎒</div>
                <div style="font-size: 16px;">空空如也</div>
                <div style="font-size: 17px; margin-top: 8px;">还没有任何物品...</div>
            </div>
        `;
        return;
    }
    
    // 格子型布局
    let itemsHtml = `
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
            max-height: 450px;
            overflow-y: auto;
            padding: 8px 4px;
        ">
    `;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const icon = getItemIcon(item.name);
        const isSelected = selectedItemIndex === i;
        
        let noteHtml = '';
        if (item.note) {
            noteHtml = `<div style="
                font-size: 16px;
                color: #aaa;
                margin-top: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            " title="${escapeHtml(item.note)}">${escapeHtml(item.note.substring(0, 12))}${item.note.length > 12 ? '...' : ''}</div>`;
        }
        
        // 使用主题色
        const selectedBg = `linear-gradient(135deg, ${colors.primary}44, ${colors.primary}22)`;
        const normalBg = 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))';
        const selectedBorder = colors.primary;
        const normalBorder = `${colors.primary}33`;
        const selectedShadow = `0 0 20px ${colors.glow || 'rgba(255,105,180,0.4)'}`;
        
        itemsHtml += `
            <div class="cinema-item-card" data-item-index="${i}" style="
                background: ${isSelected ? selectedBg : normalBg};
                border: 2px solid ${isSelected ? selectedBorder : normalBorder};
                border-radius: 16px;
                padding: 12px 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                ${isSelected ? `box-shadow: ${selectedShadow};` : ''}
            " onmouseenter="this.style.transform='translateY(-3px)'; this.style.background='linear-gradient(135deg, ${colors.primary}33, ${colors.primary}11)'; this.style.borderColor='${colors.primary}'"
            onmouseleave="this.style.transform='translateY(0)'; this.style.background='${isSelected ? selectedBg : normalBg}'; this.style.borderColor='${isSelected ? selectedBorder : normalBorder}'">
                
                <div style="font-size: 48px; margin-bottom: 8px;">${icon}</div>
                
                <div style="
                    font-size: 16px;
                    font-weight: bold;
                    color: ${isSelected ? colors.accent : '#ddd'};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                " title="${escapeHtml(item.name)}">
                    ${escapeHtml(item.name)}
                </div>
                
                <div style="
                    font-size: 18px;
                    font-weight: bold;
                    color: ${isSelected ? colors.primary : '#ffd700'};
                    margin-top: 6px;
                ">
                    x${item.quantity}
                </div>
                
                ${noteHtml}
                
                ${isSelected ? `
                <div style="
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: ${colors.primary};
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: white;
                    box-shadow: 0 0 8px ${colors.glow || 'rgba(255,105,180,0.5)'};
                ">✓</div>
                ` : ''}
            </div>
        `;
    }
    
    itemsHtml += `</div>`;
    
    // 选中的物品信息面板 - 也使用主题色
    const selectedItemInfo = selectedItem ? 
        `<div style="
            background: ${colors.primary}22;
            border-radius: 12px;
            padding: 12px;
            margin: 12px 0;
            border-left: 3px solid ${colors.primary};
        ">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <span style="font-size: 24px;">${getItemIcon(selectedItem.name)}</span>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: ${colors.accent};">${escapeHtml(selectedItem.name)}</div>
                    <div style="font-size: 17px; color: #aaa;">数量: x${selectedItem.quantity}${selectedItem.note ? ` | ${selectedItem.note}` : ''}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="item-action-btn" data-action="use" style="
                        background: linear-gradient(135deg, #4ecdc4, #3ba89f);
                        border: none;
                        border-radius: 20px;
                        padding: 6px 16px;
                        color: white;
                        font-size: 17px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">✅ 使用</button>
                    <button class="item-action-btn" data-action="drop" style="
                        background: linear-gradient(135deg, #ff6b6b, #cc5555);
                        border: none;
                        border-radius: 20px;
                        padding: 6px 16px;
                        color: white;
                        font-size: 17px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">🗑️ 丢弃</button>
                </div>
            </div>
        </div>` :
        `<div style="
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 12px;
            margin: 12px 0;
            text-align: center;
            color: #888;
            font-size: 16px;
            border: 1px dashed ${colors.primary}44;
        ">
            <span style="font-size: 20px;">📦</span> 点击物品选中，可进行操作
        </div>`;
    
    // 操作按钮组 - 使用主题色
    const actionButtons = `
        <div style="
            display: flex;
            gap: 10px;
            margin-top: 15px;
            padding-top: 12px;
            border-top: 1px solid ${colors.primary}33;
            flex-wrap: wrap;
        ">
            <button id="item-sort-btn" style="
                background: rgba(255,255,255,0.1);
                border: 1px solid ${colors.primary}44;
                border-radius: 25px;
                padding: 6px 14px;
                color: #ccc;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            " onmouseenter="this.style.background='${colors.primary}33'; this.style.color='${colors.accent}'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#ccc'">
                🔄 排序
            </button>
            <button id="item-clear-selection" style="
                background: rgba(255,255,255,0.1);
                border: 1px solid ${colors.primary}44;
                border-radius: 25px;
                padding: 6px 14px;
                color: #ccc;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            " onmouseenter="this.style.background='${colors.primary}33'; this.style.color='${colors.accent}'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#ccc'">
                ✕ 取消选中
            </button>
            <button id="item-refresh-btn" style="
                background: rgba(255,255,255,0.1);
                border: 1px solid ${colors.primary}44;
                border-radius: 25px;
                padding: 6px 14px;
                color: #ccc;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            " onmouseenter="this.style.background='${colors.primary}33'; this.style.color='${colors.accent}'" 
            onmouseleave="this.style.background='rgba(255,255,255,0.1)'; this.style.color='#ccc'">
                🔄 刷新
            </button>
        </div>
    `;
    
    container.innerHTML = `
        <div style="max-height: 550px; overflow-y: auto; padding: 5px;">
            ${itemsHtml}
        </div>
        ${selectedItemInfo}
        ${actionButtons}
    `;
    
    // 绑定物品点击事件
    const itemCards = container.querySelectorAll('.cinema-item-card');
    itemCards.forEach(card => {
        card.onclick = (e) => {
            e.stopPropagation();
            const index = parseInt(card.dataset.itemIndex);
            if (!isNaN(index) && gameState.items && gameState.items[index]) {
                selectItem(index);
            }
        };
    });
    
    // 绑定操作按钮事件
    const actionBtns = container.querySelectorAll('.item-action-btn');
    actionBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            if (action === 'use') useSelectedItem();
            if (action === 'drop') dropSelectedItem();
        };
    });
    
    // 绑定排序按钮
    const sortBtn = document.getElementById('item-sort-btn');
    if (sortBtn) {
        sortBtn.onclick = () => sortItems();
    }
    
    // 绑定取消选中按钮
    const clearBtn = document.getElementById('item-clear-selection');
    if (clearBtn) {
        clearBtn.onclick = () => cancelItemSelection();
    }
    
    // 绑定刷新按钮
    const refreshBtn = document.getElementById('item-refresh-btn');
    if (refreshBtn) {
        refreshBtn.onclick = () => {
            renderItems();
            showItemToast('物品栏已刷新', 'info');
        };
    }
}

// 选中物品
// 选中物品
function selectItem(index) {
    const items = gameState.items || [];
    if (index < 0 || index >= items.length) return;
    
    selectedItemIndex = index;
    selectedItem = { ...items[index] };
    
    // 重新渲染物品栏
    renderItems();
    
    // 显示提示
    showItemToast(`已选中: ${selectedItem.name} x${selectedItem.quantity}`, 'success');
}

// 清除物品选中（不显示提示，用于内部调用）
function clearItemSelection(silent = true) {
    selectedItemIndex = -1;
    selectedItem = null;
    renderItems();
    if (!silent) {
        showItemToast('已取消选中', 'info');
    }
}

// 取消选中按钮（手动点击时显示提示）
function cancelItemSelection() {
    clearItemSelection(false);  // 显示提示
}

// ==================== 修改物品操作函数 ====================

// 使用选中物品
function useSelectedItem() {
    if (!selectedItem) {
        showItemToast('请先选中一个物品', 'warning');
        return;
    }
    
    const itemName = selectedItem.name;
    const currentQty = selectedItem.quantity;
    
    if (currentQty <= 0) {
        showItemToast(`物品 ${itemName} 数量不足`, 'error');
        clearItemSelection(true);
        return;
    }
    
    // 减少数量
    const newQty = currentQty - 1;
    
    if (newQty <= 0) {
        // 移除物品
        const items = gameState.items || [];
        const newItems = items.filter((_, idx) => idx !== selectedItemIndex);
        gameState.items = newItems;
        
        // 记录到日志（不带数量，因为物品已耗尽）
        addItemLog('use', itemName, currentQty, 'depleted');
        
        showItemToast(`使用了 ${itemName}，物品已耗尽`, 'success');
        clearItemSelection(true);
    } else {
        // 更新数量
        gameState.items[selectedItemIndex].quantity = newQty;
        selectedItem.quantity = newQty;
        
        // 记录到日志
        addItemLog('use', itemName, 1);
        
        showItemToast(`使用了 ${itemName}，剩余 x${newQty}`, 'success');
        renderItems();
    }
    
    // 保存数据
    saveSyncData();
}

// 丢弃选中物品
function dropSelectedItem() {
    if (!selectedItem) {
        showItemToast('请先选中一个物品', 'warning');
        return;
    }
    
    const itemName = selectedItem.name;
    const currentQty = selectedItem.quantity;
    
    // 确认对话框
    const confirmed = confirm(`确定要丢弃 ${itemName} x${currentQty} 吗？`);
    if (!confirmed) return;
    
    // 移除物品
    const items = gameState.items || [];
    const newItems = items.filter((_, idx) => idx !== selectedItemIndex);
    gameState.items = newItems;
    
    // 记录到日志
    addItemLog('drop', itemName, currentQty);
    
    showItemToast(`已丢弃 ${itemName} x${currentQty}`, 'warning');
    
    // 保存数据并刷新
    saveSyncData();
    clearItemSelection(true);
}

// 排序物品（按名称）
function sortItems() {
    const items = gameState.items || [];
    if (items.length === 0) return;
    
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    gameState.items = sorted;
    
    // 清除选中状态
    clearItemSelection(true);
    
    // 保存数据
    saveSyncData();
    
    // 记录到日志
    addLogEntry('【物品操作】物品栏已按名称排序', 'system');
    
    showItemToast('物品已按名称排序', 'success');
}

// ==================== 添加获得物品的辅助函数 ====================

// 获得物品（供外部调用）
function addItem(itemName, quantity = 1, note = '') {
    const items = gameState.items || [];
    
    // 查找是否已有相同物品
    const existingIndex = items.findIndex(i => i.name === itemName);
    
    if (existingIndex !== -1) {
        // 增加数量
        items[existingIndex].quantity += quantity;
        if (note && !items[existingIndex].note) {
            items[existingIndex].note = note;
        }
    } else {
        // 添加新物品
        items.push({
            name: itemName,
            quantity: quantity,
            note: note
        });
    }
    
    gameState.items = items;
    
    // 记录到日志
    addItemLog('obtain', itemName, quantity);
    
    // 保存并刷新
    saveSyncData();
    renderItems();
    
    // 显示提示
    showItemToast(`获得 ${itemName} x${quantity}`, 'success');
    
    return true;
}

// 移除物品（供外部调用）
function removeItem(itemName, quantity = 1) {
    const items = gameState.items || [];
    const existingIndex = items.findIndex(i => i.name === itemName);
    
    if (existingIndex === -1) {
        showItemToast(`未找到物品: ${itemName}`, 'warning');
        return false;
    }
    
    const currentQty = items[existingIndex].quantity;
    const newQty = currentQty - quantity;
    
    if (newQty <= 0) {
        items.splice(existingIndex, 1);
    } else {
        items[existingIndex].quantity = newQty;
    }
    
    gameState.items = items;
    
    // 记录到日志
    addItemLog('lost', itemName, quantity);
    
    // 保存并刷新
    saveSyncData();
    renderItems();
    
    // 如果当前选中的是被移除的物品，清除选中
    if (selectedItem && selectedItem.name === itemName) {
        clearItemSelection(true);
    }
    
    showItemToast(`失去 ${itemName} x${quantity}`, 'warning');
    
    return true;
}

// 物品操作提示
function showItemToast(message, type = 'info') {
    const toast = document.createElement('div');
    const icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : (type === 'error' ? '❌' : '📦'));
    
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        border: 1px solid ${type === 'success' ? '#4ecdc4' : (type === 'warning' ? '#ffc107' : '#ff69b4')};
        border-radius: 30px;
        padding: 8px 20px;
        color: ${type === 'success' ? '#4ecdc4' : (type === 'warning' ? '#ffc107' : '#ffd700')};
        font-size: 16px;
        z-index: 200000;
        animation: fadeOutSync 2s ease;
        pointer-events: none;
        white-space: nowrap;
        font-weight: bold;
    `;
    toast.textContent = `${icon} ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// 添加物品栏滚动条样式
function addItemStyles() {
    if (document.getElementById('cinema-item-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cinema-item-styles';
    style.textContent = `
        /* 物品栏滚动条美化 */
        #sync-items div[style*="max-height"]::-webkit-scrollbar {
            width: 6px;
        }
        
        #sync-items div[style*="max-height"]::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        
        #sync-items div[style*="max-height"]::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 10px;
        }
        
        /* 物品卡片动画 */
        .cinema-item-card {
            animation: itemFadeIn 0.2s ease;
        }
        
        @keyframes itemFadeIn {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        /* 物品栏操作按钮悬停效果 */
        .item-action-btn {
            transition: all 0.2s ease;
        }
        
        .item-action-btn:active {
            transform: scale(0.95) !important;
        }
    `;
    document.head.appendChild(style);
}

// 初始化物品栏样式
addItemStyles();

function renderCharacters() {
    const container = document.getElementById('sync-characters');
    if (!container) return;
    
    const charList = characters || [];
    
    if (charList.length === 0) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; padding: 20px;">✨ 等待邂逅... ✨</div>';
        return;
    }
    
    const sortedCharList = [...charList].sort((a, b) => {
        const aVisible = a.visible !== false;
        const bVisible = b.visible !== false;
        
        if (aVisible && !bVisible) return -1;
        if (!aVisible && bVisible) return 1;
        
        const aAffection = a.affection || 0;
        const bAffection = b.affection || 0;
        return bAffection - aAffection;
    });
    
    const portraitManager = window.characterPortraitManager || characterPortraitManager;
    
    let html = '';
    for (const char of sortedCharList.slice(0, 10)) {
        let affection = char.affection || 0;
        affection = Math.min(100, Math.max(-100, affection));
        
        const isNegative = affection < 0;
        const absValue = Math.abs(affection);
        const leftPercent = isNegative ? (absValue / 100) * 100 : 0;
        const rightPercent = !isNegative ? (affection / 100) * 100 : 0;
        
        const stage = getAffectionStage(affection);
        if (!stage) continue;
        
        const leftBarColor = isNegative ? (stage.barColor || '#A9A9A9') : '#333';
        const rightBarColor = !isNegative ? (stage.barColor || '#A9A9A9') : '#333';
        
        const mood = char.mood || char.emotion || '日常';
        const moodIcon = getMoodIcon(mood);
        
        const isVisible = char.visible !== false;
        const opacity = isVisible ? '1' : '0.45';
        const grayscaleFilter = isVisible ? 'none' : 'grayscale(0.7)';
        
        let avatarUrl = null;
        if (portraitManager && typeof portraitManager.getPortrait === 'function') {
            avatarUrl = portraitManager.getPortrait(char.name);
        }
        
        const statusIcon = isVisible ? '👁️' : '🔇';
        const statusText = isVisible ? '显示中' : '已隐藏';
        const statusColor = isVisible ? '#4ecdc4' : '#888';
        const borderColor = isVisible ? (stage.color || '#A9A9A9') : '#555';
        
        // ========== 确保描述存在，否则使用默认值 ==========
        let displayDescription = char.description || char.note || '';
        
        html += `
            <div style="
                background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
                border-radius: 16px;
                padding: 12px;
                margin-bottom: 12px;
                border-left: 4px solid ${borderColor};
                transition: all 0.2s ease;
                cursor: pointer;
                opacity: ${opacity};
                filter: ${grayscaleFilter};
            " onmouseenter="this.style.transform='translateX(5px)'; this.style.background='rgba(255,105,180,0.1)'; this.style.filter='none';"
               onmouseleave="this.style.transform='translateX(0)'; this.style.background='linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))'; this.style.filter='${grayscaleFilter}';">
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                    <div style="
                        width: 120px;
                        height: 160px;
                        background: rgba(0,0,0,0.3);
                        border-radius: 10%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        border: 2px solid ${borderColor};
                        flex-shrink: 0;
                        position: relative;
                    ">
                        ${avatarUrl ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; filter: ${grayscaleFilter};" onerror="this.style.display='none'; this.parentElement.querySelector('.char-avatar-fallback').style.display='flex';">` : ''}
                        <span class="char-avatar-fallback" style="font-size: 24px; display: ${avatarUrl ? 'none' : 'flex'};">${char.gender === '女' ? '👩' : '👤'}</span>
                    </div>
                    
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="font-size: 16px; font-weight: bold; color: #ffd700;">${stage.icon || '💔'} ${escapeHtml(char.name)}</span>
                            <span style="font-size: 16px; background: ${stage.color || '#A9A9A9'}22; color: ${stage.color || '#A9A9A9'}; padding: 2px 10px; border-radius: 20px;">${stage.text || '陌生'}</span>
                            <span style="font-size: 16px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 20px;">${moodIcon} ${escapeHtml(mood)}</span>
                            <span style="font-size: 18px; font-weight: bold; color: ${stage.color || '#A9A9A9'};">
                                好感度：${affection >= 0 ? `+${affection}` : `${affection}`}
                            </span>
                            <span style="
                                font-size: 16px; 
                                background: ${isVisible ? 'rgba(78,205,196,0.2)' : 'rgba(255,68,68,0.2)'}; 
                                color: ${statusColor}; 
                                padding: 2px 10px; 
                                border-radius: 20px;
                                display: inline-flex;
                                align-items: center;
                                gap: 4px;
                            ">
                                ${statusIcon} ${statusText}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="margin: 8px 0 6px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px; padding: 0 3px;">
                        <span style="font-size: 16px; color: #8B0000;">-100</span>
                        <span style="font-size: 16px; color: #ffd700;">0</span>
                        <span style="font-size: 16px; color: #FF1493;">+100</span>
                    </div>
                    <div style="display: flex; background: rgba(0,0,0,0.5); border-radius: 20px; height: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="width: 50%; height: 100%; background: #2a1a1a; display: flex; justify-content: flex-end;">
                            <div style="width: ${leftPercent}%; height: 100%; background: ${leftBarColor}; border-radius: ${isNegative ? '20px 0 0 20px' : '0'};"></div>
                        </div>
                        <div style="width: 2px; height: 100%; background: #ffd700; flex-shrink: 0;"></div>
                        <div style="width: 50%; height: 100%; background: #1a2a1a;">
                            <div style="width: ${rightPercent}%; height: 100%; background: ${rightBarColor}; border-radius: ${!isNegative ? '0 20px 20px 0' : '0'};"></div>
                        </div>
                    </div>
                </div>
                
                <!-- 描述区域 - 使用最新的 displayDescription -->
                <div style="margin-top: 10px; padding: 8px 12px; background: rgba(0,0,0,0.3); border-radius: 12px; font-size: 16px; color: #ccc; line-height: 1.5; border-left: 3px solid ${borderColor}; word-wrap: break-word;">
                    💬 ${displayDescription ? escapeHtml(displayDescription) : (isNegative ? '⚠️ 关系紧张，需要修复' : '✨ 关系正在发展')}
                </div>
            </div>
        `;
    }
    
    if (sortedCharList.length > 10) {
        html += `<div style="text-align: center; font-size: 16px; color: #888; padding: 8px;">✨ 还有 ${sortedCharList.length - 10} 位角色 ✨</div>`;
    }
    
    container.innerHTML = html;
}


function showSyncToast(changes) {
    if (!changes || changes.length === 0) return;
    
    const significantChanges = changes.filter(c => {
        if (c.action === 'affection_change') return Math.abs(c.delta) >= 3;
        if (c.isNew) return true;
        if (c.oldValue !== undefined && c.newValue !== undefined) return Math.abs(c.newValue - c.oldValue) >= 5;
        return false;
    });
    
    if (significantChanges.length === 0) return;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 320px;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(10px);
        border: 1px solid #ff69b4;
        border-radius: 20px;
        padding: 6px 14px;
        color: #ffd700;
        font-size: 16px;
        z-index: 199995;
        animation: fadeOutSync 2.5s ease;
        pointer-events: none;
    `;

    // 确保容器可以交互
    let container = document.getElementById('cinema-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cinema-toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 199995;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    let text = '';
    for (const change of significantChanges.slice(0, 2)) {
        if (change.action === 'affection_change') {
            text += `${change.name}好感度 ${change.delta > 0 ? '+' : ''}${change.delta} `;
        } else if (change.isNew) {
            text += `✨新属性:${change.name} `;
        } else {
            text += `${change.name}: ${change.oldValue}→${change.newValue} `;
        }
    }
    toast.textContent = '📊 ' + text;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ==================== 处理AI消息（状态同步） ====================

function processMessageForSync() {
    if (!syncEnabled) return;
    if (!context || !context.chat || context.chat.length === 0) return;
    
    const lastMessage = context.chat[context.chat.length - 1];
    if (!lastMessage || lastMessage.is_user !== false) return;
    
    const aiMessage = lastMessage.mes;
    
    if (!aiMessage.includes('```') && !aiMessage.includes('【')) {
        return;
    }
    
    const messageHash = computeMessageHash(aiMessage);
    if (lastProcessedMessageHash === messageHash) return;
    lastProcessedMessageHash = messageHash;
    
    if (!syncParser) syncParser = new SmartStateParser();
    if (!syncUpdater) syncUpdater = new StateUpdater();
    
    const parseResult = syncParser.parse(aiMessage);
    console.log('[同步] parseResult.otherSections:', parseResult.otherSections);
    
    // 【关键】直接保存 otherSections 到 gameState
    if (parseResult.otherSections && Object.keys(parseResult.otherSections).length > 0) {
        if (!gameState.otherSections) gameState.otherSections = {};
        
        for (const [sectionName, content] of Object.entries(parseResult.otherSections)) {
            // 跳过标题行（如"第1天 · 傍晚 · 阴天"这种不是栏目的）
            if (sectionName.includes('第') && sectionName.includes('天')) continue;
            gameState.otherSections[sectionName] = content;
            console.log(`[同步] 保存栏目: ${sectionName}`);
        }
    }
    if (!parseResult.hasUpdate) return;
    
    let allChanges = [];
    
    if (Object.keys(parseResult.attributes).length > 0) {
        const attrChanges = syncUpdater.updateAttributes(parseResult.attributes);
        allChanges.push(...attrChanges);
    }
    
    if (Object.keys(parseResult.stats).length > 0) {
        const statChanges = syncUpdater.updateStats(parseResult.stats);
        allChanges.push(...statChanges);
    }
    
    if (parseResult.items.length > 0) {
        syncUpdater.updateItems(parseResult.items);
        allChanges.push({ action: 'items_updated', count: parseResult.items.length });
    }
    
    if (parseResult.characters.length > 0) {
        const charChanges = syncUpdater.updateCharacters(parseResult.characters);
        allChanges.push(...charChanges);
    }
    
    // ========== 新增：处理其他栏目 ==========
    if (Object.keys(parseResult.otherSections).length > 0) {
        syncUpdater.updateOtherSections(parseResult.otherSections);
        allChanges.push({ action: 'other_sections_updated', sections: Object.keys(parseResult.otherSections) });
        console.log(`[状态同步] 其他栏目已更新: ${Object.keys(parseResult.otherSections).join(', ')}`);
    }
    
    if (parseResult.day && gameState.day !== parseResult.day) {
        gameState.day = parseResult.day;
    }
    if (parseResult.phase && gameState.phase !== parseResult.phase) {
        gameState.phase = parseResult.phase;
    }
    if (parseResult.location && gameState.location !== parseResult.location) {
        gameState.location = parseResult.location;
    }
    
    if (allChanges.length > 0) {
        renderSyncPanel();
        showSyncToast(allChanges);
        saveSyncData();
    } else {
        // 即使没有变化，也尝试渲染（确保其他栏目显示）
        renderSyncPanel();
    }
}

// ==================== 状态同步数据持久化 ====================

function saveSyncData() {
    const saveData = {
        gameState: {
            day: gameState.day,
            phase: gameState.phase,
            weather: gameState.weather,
            location: gameState.location,
            attributes: gameState.attributes,
            stats: gameState.stats,
            items: gameState.items,
            otherSections: gameState.otherSections
        },
        characters: characters.map(c => ({
            name: c.name,
            affection: c.affection,
            tags: c.tags,
            note: c.note || c.description || '',
            description: c.description || c.note || '',  // 确保保存描述
            gender: c.gender,
            mood: c.mood || '日常',
            visible: c.visible
        })),
        attributeConfig: {
            displayOrder: attributeConfig.displayOrder,
            colorMap: attributeConfig.colorMap
        }
    };
    localStorage.setItem('cinema_sync_data', JSON.stringify(saveData));
    console.log('[同步] 数据已保存，包含角色描述');
}

function loadSyncData() {
    const saved = localStorage.getItem('cinema_sync_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.gameState) {
                gameState.day = data.gameState.day || 1;
                gameState.phase = data.gameState.phase || '早晨';
                gameState.weather = data.gameState.weather || '阴天';
                gameState.location = data.gameState.location || '';
                gameState.attributes = data.gameState.attributes || {};
                gameState.stats = data.gameState.stats || {};
                gameState.items = data.gameState.items || [];
                gameState.otherSections = data.gameState.otherSections || {};
            }
            if (data.characters) {
                characters = data.characters.map(c => ({
                    id: Date.now(),
                    name: c.name,
                    gender: c.gender || '未知',
                    mood: c.mood || '日常',
                    affection: c.affection || 30,
                    tags: c.tags || [],
                    description: c.description || c.note || '',
                    note: c.note || c.description || '',
                    status: '正常',
                    visible: c.visible !== undefined ? c.visible : true
                }));
                console.log(`[同步] 加载了 ${characters.length} 个角色，包含描述信息`);
            }
            if (data.attributeConfig) {
                if (data.attributeConfig.displayOrder) attributeConfig.displayOrder = data.attributeConfig.displayOrder;
                if (data.attributeConfig.colorMap) attributeConfig.colorMap = data.attributeConfig.colorMap;
            }
        } catch(e) {
            console.error('[同步] 加载数据失败:', e);
        }
    }
    if (!gameState.otherSections) gameState.otherSections = {};
    if (Object.keys(gameState.attributes).length === 0) {
        gameState.attributes = {};
    }
    if (!gameState.stats) gameState.stats = {};
    if (!gameState.items) gameState.items = [];
}

// ==================== 导出API ====================
window.CinemaSync = {
    getGameState: () => ({ ...gameState }),
    getCharacters: () => [...characters],
    getAttributes: () => ({ ...gameState.attributes }),
    getStats: () => ({ ...gameState.stats }),
    getItems: () => [...(gameState.items || [])],
    setSyncEnabled: (enabled) => { syncEnabled = enabled; },
    refresh: () => {
        renderSyncPanel();
        processMessageForSync();
    },
    reset: () => {
        gameState = { day: 1, phase: '早晨', location: '', attributes: {} };
        characters = [];
        localStorage.removeItem('cinema_sync_data');
        loadSyncData();
        renderSyncPanel();
        resetSyncData();
        console.log('[状态同步] 数据已重置');
    }
};

// ==================== 添加美化样式 ====================

function injectStyles() {
    if (document.getElementById('cinema-mode-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cinema-mode-styles';
    style.textContent = `
        @keyframes cinemaFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        @keyframes portraitSlideIn {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        /* 控制按钮样式 */
        .cinema-control-btn {
            background: rgba(255,105,180,0.3);
            border: 1px solid #ff69b4;
            color: #ff69b4;
            padding: 8px 15px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        
        .cinema-control-btn:hover {
            background: rgba(255,105,180,0.6);
            transform: scale(1.05);
        }
        
        /* 消息列表样式 */
        .cinema-message-item {
            transition: all 0.2s;
        }
        
        .cinema-scroll::-webkit-scrollbar {
            width: 6px;
        }
        
        .cinema-scroll::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        
        .cinema-scroll::-webkit-scrollbar-thumb {
            background: #ff69b4;
            border-radius: 10px;
        }
        
        /* 状态栏美化样式 */
        .cinema-status-container {
            background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,40,0.8));
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 15px;
            border: 1px solid rgba(255,105,180,0.3);
            animation: slideIn 0.3s ease;
        }
        
        .cinema-status-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 12px;
            margin-bottom: 12px;
            border-bottom: 2px solid rgba(255,105,180,0.5);
        }
        
        .cinema-status-icon {
            font-size: 24px;
        }
        
        .cinema-status-title {
            font-size: 18px;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 0 0 5px rgba(255,105,180,0.5);
        }
        
        .cinema-status-section {
            margin-top: 15px;
        }
        
        .cinema-status-section-title {
            font-size: 16px;
            color: #ff69b4;
            margin-bottom: 10px;
            padding-left: 5px;
            border-left: 3px solid #ff69b4;
        }
        
        .cinema-status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
        }
        
        .cinema-status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            font-size: 17px;
        }
        
        .cinema-status-key {
            color: #aaa;
        }
        
        .cinema-status-value {
            color: #ffd700;
            font-weight: bold;
        }
        
        .cinema-status-value.value-high {
            color: #4ecdc4;
        }
        
        .cinema-status-value.value-low {
            color: #ff6b6b;
        }
        
        /* 好感度列表样式 */
        .cinema-relationship-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .cinema-relationship-item {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .cinema-relationship-name {
            width: 80px;
            font-size: 16px;
            color: #ffd700;
        }
        
        .cinema-relationship-bar-container {
            flex: 1;
            height: 24px;
            background: rgba(0,0,0,0.5);
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }
        
        .cinema-relationship-bar {
            height: 100%;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            transition: width 0.3s ease;
            position: relative;
        }
        
        .cinema-relationship-bar.bar-love {
            background: linear-gradient(90deg, #ff69b4, #ff1493);
        }
        
        .cinema-relationship-bar.bar-like {
            background: linear-gradient(90deg, #ffb6c1, #ff69b4);
        }
        
        .cinema-relationship-bar.bar-normal {
            background: linear-gradient(90deg, #98fb98, #3cb371);
        }
        
        .cinema-relationship-bar.bar-low {
            background: linear-gradient(90deg, #b0c4de, #4682b4);
        }
        
        .cinema-relationship-bar.bar-cold {
            background: linear-gradient(90deg, #d3d3d3, #808080);
        }
        
        .cinema-relationship-value {
            font-size: 16px;
            color: white;
            padding-right: 8px;
            text-shadow: 0 0 2px black;
        }
        
        /* 选项栏美化样式 */
        .cinema-options-container {
            background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(30,20,40,0.7));
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255,105,180,0.3);
            animation: slideIn 0.3s ease;
        }
        
        .cinema-options-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 12px;
            margin-bottom: 15px;
            border-bottom: 2px solid rgba(255,105,180,0.5);
        }
        
        .cinema-options-icon {
            font-size: 24px;
        }
        
        .cinema-options-title {
            font-size: 18px;
            font-weight: bold;
            color: #ffd700;
        }
        
        .cinema-options-description {
            margin-bottom: 20px;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            font-size: 16px;
            color: #ddd;
            line-height: 1.6;
        }
        
        .cinema-options-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .cinema-option-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            border-left: 4px solid;
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .cinema-option-item:hover {
            background: rgba(255,255,255,0.1);
            transform: translateX(5px);
        }
        
        .cinema-option-key {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: bold;
            font-size: 18px;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .cinema-option-text {
            flex: 1;
            font-size: 17px;
            color: #fff;
            line-height: 1.4;
        }
        
        /* 普通文本样式 */
        .cinema-paragraph {
            margin-bottom: 15px;
            line-height: 1.8;
            animation: slideIn 0.2s ease;
        }
        
        .cinema-quote {
            color: #ffd700;
            font-style: italic;
            text-shadow: 0 0 3px rgba(255,105,180,0.5);
        }
        
        .cinema-emphasis {
            color: #ff69b4;
            font-weight: bold;
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        /* 说话人样式增强 */
        #cinema-speaker {
            font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
            letter-spacing: 2px;
        }
        
        /* 内容区域滚动条 - 美化版 */
        #cinema-content {
            max-height: 280px;
            max-width: 1200px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #ff69b4 rgba(255,255,255,0.08);
        }

        #cinema-content::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        #cinema-content::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.06);
            border-radius: 10px;
            margin: 4px 0;
            border: 1px solid rgba(255,105,180,0.15);
        }

        #cinema-content::-webkit-scrollbar-track:hover {
            background: rgba(255,255,255,0.1);
        }

        #cinema-content::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 10px;
            transition: all 0.2s ease;
        }

        #cinema-content::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #ff88cc, #ff69b4);
            transform: scaleX(1.1);
        }

        #cinema-content::-webkit-scrollbar-corner {
            background: transparent;
        }

        /* 滚动条到达边缘时的效果 */
        #cinema-content::-webkit-scrollbar-thumb:active {
            background: linear-gradient(135deg, #ff1493, #ff69b4);
        }

        /* 给滚动条添加微光效果（可选） */
        @keyframes scrollbarGlow {
            0% { box-shadow: 0 0 0px rgba(255,105,180,0); }
            50% { box-shadow: 0 0 5px rgba(255,105,180,0.5); }
            100% { box-shadow: 0 0 0px rgba(255,105,180,0); }
        }

        #cinema-content::-webkit-scrollbar-thumb {
            animation: scrollbarGlow 2s ease-in-out infinite;
        }
        /* 新增样式 */
        .cinema-bold {
            color: #ffd700;
            font-weight: bold;
        }
        
        .cinema-italic {
            color: #ffb6c1;
            font-style: italic;
        }
        
        .cinema-ellipsis {
            color: #ff69b4;
            letter-spacing: 2px;
        }
        
        .cinema-options-hint {
            text-align: center;
            font-size: 16px;
            color: #888;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .cinema-option-item {
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .cinema-option-item:hover {
            background: rgba(255,255,255,0.15);
            transform: translateX(8px);
        }
        
        .cinema-option-item:active {
            transform: scale(0.98);
        }

        /* 选项面板样式 */
        .cinema-option-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 15px;
            margin-bottom: 15px;
            border-bottom: 2px solid rgba(255,105,180,0.3);
        }
        
        .cinema-option-panel-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #ffd700;
        }
        
        .cinema-option-panel-icon {
            font-size: 24px;
        }
        
        .cinema-option-panel-close {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 18px;
            color: #fff;
        }
        
        .cinema-option-panel-close:hover {
            background: rgba(255,68,68,0.5);
            transform: rotate(90deg);
        }
        
        .cinema-option-panel-content {
            max-height: 400px;
            overflow-y: auto;
            padding: 5px;
        }
        
        .cinema-option-description {
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.6;
            color: #ddd;
        }
        
        .cinema-option-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .cinema-option-panel-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 18px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 4px solid var(--option-color, #ff69b4);
        }
        
        .cinema-option-key-badge {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: bold;
            font-size: 20px;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .cinema-option-text {
            flex: 1;
            font-size: 17px;
            line-height: 1.4;
            color: #fff;
        }
        
        .cinema-option-select-hint {
            color: var(--option-color, #ff69b4);
            font-size: 18px;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .cinema-option-panel-item:hover .cinema-option-select-hint {
            opacity: 1;
            transform: translateX(5px);
        }
        
        .cinema-option-panel-footer {
            padding-top: 15px;
            margin-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
        }
        
        .cinema-option-hint {
            font-size: 16px;
            color: #888;
        }
        
        /* 选项占位符样式（显示在文本框中的提示） */
        .cinema-option-placeholder {
            text-align: center;
            padding: 20px;
        }
        
        .cinema-option-placeholder-icon {
            font-size: 48px;
            margin-bottom: 15px;
            animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .cinema-option-placeholder-text {
            font-size: 18px;
            color: #ffd700;
            margin-bottom: 10px;
        }
        
        .cinema-option-placeholder-hint {
            font-size: 16px;
            color: #888;
            margin-top: 15px;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
        }
        
        /* 滚动条美化 */
        .cinema-option-panel-content::-webkit-scrollbar {
            width: 6px;
        }
        
        .cinema-option-panel-content::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        
        .cinema-option-panel-content::-webkit-scrollbar-thumb {
            background: #ff69b4;
            border-radius: 10px;
        }
        
        /* 面板入场动画 */
        @keyframes panelSlideIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(100px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        .cinema-option-placeholder {
            text-align: center;
            padding: 30px 20px;
        }

        .cinema-option-placeholder-icon {
            font-size: 56px;
            margin-bottom: 15px;
            animation: bounce 1s ease infinite;
            display: inline-block;
        }

        .cinema-option-placeholder-text {
            font-size: 18px;
            font-weight: bold;
            color: #ffd700;
            margin-bottom: 8px;
        }

        .cinema-option-placeholder-subtext {
            font-size: 16px;
            color: #aaa;
            margin-bottom: 20px;
        }

        .cinema-option-placeholder-hint {
            font-size: 16px;
            color: #888;
            margin-top: 15px;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            text-align: left;
            word-break: break-all;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    `;
    
    document.head.appendChild(style);
}


// ==================== 添加动画样式 ====================
function injectSyncStyles() {
    if (document.getElementById('cinema-sync-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cinema-sync-styles';
    style.textContent = `
        @keyframes fadeOutSync {
            0% { opacity: 1; transform: translateX(0); }
            70% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(-20px); }
        }
        #cinema-sync-panel {
            transition: all 0.3s ease;
        }
        #cinema-sync-panel:hover {
            border-color: #ff88cc;
            box-shadow: 0 0 15px rgba(255,105,180,0.3);
        }
        #sync-attributes::-webkit-scrollbar {
            width: 3px;
        }
        #sync-attributes::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        #sync-attributes::-webkit-scrollbar-thumb {
            background: #ff69b4;
            border-radius: 10px;
        }
    `;
    document.head.appendChild(style);
}
// 在创建通知时添加全局样式
function addGlobalHoverStyles() {
    if (document.getElementById('cinema-notify-hover-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cinema-notify-hover-styles';
    style.textContent = `
        /* 基础悬停效果 */
        .cinema-notify-item {
            transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1) !important;
        }
        
        /* 角色项悬停 */
        .cinema-notify-item[data-type="character"]:hover {
            background: linear-gradient(135deg, rgba(255,105,180,0.35), rgba(255,105,180,0.15)) !important;
            transform: translateX(5px) scale(1.01) !important;
            border-left-width: 4px !important;
        }
        
        /* 好感度项悬停 */
        .cinema-notify-item[data-type="affection"]:hover {
            background: linear-gradient(135deg, rgba(255,105,180,0.25), rgba(255,105,180,0.1)) !important;
            transform: translateX(5px) scale(1.01) !important;
        }
        
        /* 物品项悬停 */
        .cinema-notify-item[data-type="item"]:hover {
            background: linear-gradient(135deg, rgba(78,205,196,0.25), rgba(78,205,196,0.08)) !important;
            transform: translateX(5px) scale(1.01) !important;
        }
        
        /* 属性项悬停 */
        .cinema-notify-item[data-type="attribute"]:hover {
            background: linear-gradient(135deg, rgba(255,105,180,0.2), rgba(255,105,180,0.08)) !important;
            transform: translateX(5px) scale(1.01) !important;
        }
        
        /* 位置项悬停 */
        .cinema-notify-item[data-type="location"]:hover {
            background: linear-gradient(135deg, rgba(78,205,196,0.25), rgba(78,205,196,0.08)) !important;
            transform: translateX(5px) scale(1.01) !important;
        }
        
        /* 时间项悬停 */
        .cinema-notify-item[data-type="time"]:hover {
            background: linear-gradient(135deg, rgba(255,193,7,0.25), rgba(255,193,7,0.08)) !important;
            transform: translateX(5px) scale(1.01) !important;
        }
        
        /* 图标悬停动画 */
        .cinema-notify-item:hover div:first-child {
            transform: scale(1.1) rotate(5deg) !important;
        }
        
        /* 数值标签悬停 */
        .cinema-notify-item:hover div:last-child {
            transform: scale(1.05) !important;
        }
        
        /* 进度条悬停 */
        .cinema-notify-item:hover .progress-bar {
            filter: brightness(1.2) !important;
        }
        .sync-attributes-progress {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .sync-attribute-progress-item {
            margin-bottom: 8px;
        }
        .sync-attribute-label {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            margin-bottom: 4px;
        }
        .sync-attribute-bar-bg {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            height: 8px;
            overflow: hidden;
        }
        .sync-attribute-bar-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s;
        }
        /* 覆盖样式增强 - 确认重置按钮 */
        #reset-confirm-yes {
            /* 增强悬停效果 */
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        #reset-confirm-yes:hover {
            background: rgba(255, 68, 68, 0.6) !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
            border-color: #ff6666 !important;
            color: #ffffff !important;
        }

        #reset-confirm-yes:active {
            transform: translateY(0px);
            background: rgba(255, 68, 68, 0.8) !important;
            box-shadow: 0 2px 6px rgba(255, 68, 68, 0.4);
        }

        /* 聚焦状态 - 可访问性 */
        #reset-confirm-yes:focus-visible {
            outline: 2px solid #ff4444;
            outline-offset: 3px;
            border-radius: 30px;
        }

        /* 波纹效果 */
        #reset-confirm-yes::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: translate(-50%, -50%);
            transition: width 0.4s ease, height 0.4s ease;
            pointer-events: none;
        }

        #reset-confirm-yes.ripple::after {
            width: 300%;
            height: 300%;
            opacity: 0;
            transition: width 0.4s ease, height 0.4s ease, opacity 0.3s ease;
        }

        /* ==================== 取消按钮样式 ==================== */
        #reset-confirm-no {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        #reset-confirm-no:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            border-color: #aaa !important;
            color: #fff !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        #reset-confirm-no:active {
            transform: translateY(0px);
            background: rgba(255, 255, 255, 0.15) !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        #reset-confirm-no:focus-visible {
            outline: 2px solid #888;
            outline-offset: 3px;
            border-radius: 30px;
        }

        /* 取消按钮波纹效果 */
        #reset-confirm-no::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: translate(-50%, -50%);
            transition: width 0.4s ease, height 0.4s ease;
            pointer-events: none;
        }

        #reset-confirm-no.ripple::after {
            width: 300%;
            height: 300%;
            opacity: 0;
            transition: width 0.4s ease, height 0.4s ease, opacity 0.3s ease;
        }
            
    `;
    document.head.appendChild(style);
}
// ==================== 初始化同步模块 ====================
function initSyncModule() {
    if (syncInitialized) return;
    
    syncParser = new SmartStateParser();
    syncUpdater = new StateUpdater();
    
    syncUpdater.onUpdate((changes) => {
        renderSyncPanel();
        showSyncToast(changes);
    });
    
    loadSyncData();
    createSyncPanel();
    renderSyncPanel();
    addGlobalHoverStyles();
    syncInitialized = true;
    console.log('[同步] 模块已初始化，UI面板已创建');
}
// ==================== 启动 ====================

injectStyles();
initSyncModule();
init();


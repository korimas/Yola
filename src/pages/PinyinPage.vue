<template>
  <q-page class="pinyin-page">
    <div class="container q-pa-md">
      <!-- 头部导航 -->
      <div class="header q-mb-lg">
        <h4 class="text-center q-my-md">拼音学习</h4>
        <q-tabs v-model="currentTab" class="text-primary" align="center">
          <q-tab name="shengmu" label="声母" />
          <q-tab name="yunmu" label="韵母" />
          <q-tab name="zhengti" label="整体认读" />
          <q-tab name="review" label="复习" />
        </q-tabs>
      </div>

      <!-- 学习进度 -->
      <div class="progress-section q-mb-lg">
        <q-linear-progress
          :value="learningProgress"
          color="primary"
          size="8px"
          class="q-mb-sm"
        />
        <div class="text-center text-caption">
          学习进度: {{ Math.round(learningProgress * 100) }}%
        </div>
      </div>

      <!-- 声母学习 -->
      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel name="shengmu">
          <div class="learning-section">
            <h5 class="text-center q-mb-md">
              声母学习 ({{ currentShengmuIndex + 1 }}/{{ shengmuList.length }})
            </h5>
            <q-card class="pinyin-card q-mb-lg" v-if="currentShengmu">
              <q-card-section class="text-center">
                <div class="pinyin-display q-mb-md">
                  <div class="pinyin-image">{{ currentShengmu.emoji }}</div>
                  <span class="pinyin-text">{{ currentShengmu.pinyin }}</span>
                </div>
                <div class="pinyin-info q-mb-md">
                  <p class="text-h6">{{ currentShengmu.name }}</p>
                  <p class="text-body2">{{ currentShengmu.description }}</p>
                </div>
                <div class="examples q-mb-md">
                  <p class="text-subtitle2">例字:</p>
                  <div class="example-words">
                    <q-chip
                      v-for="example in currentShengmu.examples"
                      :key="example"
                      color="primary"
                      text-color="white"
                      class="q-ma-xs"
                    >
                      {{ example }}
                    </q-chip>
                  </div>
                </div>
                <div class="audio-section q-mb-md">
                  <q-btn
                    @click="playAudio(currentShengmu.pinyin)"
                    color="secondary"
                    icon="volume_up"
                    label="发音"
                    class="q-mr-sm"
                  />
                </div>
              </q-card-section>
            </q-card>
            <div class="action-buttons text-center">
              <q-btn
                @click="markAsKnown('shengmu')"
                color="positive"
                label="认识"
                class="q-mr-md"
              />
              <q-btn
                @click="markAsUnknown('shengmu')"
                color="negative"
                label="不认识"
                class="q-mr-md"
              />
              <q-btn
                @click="nextItem('shengmu')"
                color="primary"
                label="下一个"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- 韵母学习 -->
        <q-tab-panel name="yunmu">
          <div class="learning-section">
            <h5 class="text-center q-mb-md">
              韵母学习 ({{ currentYunmuIndex + 1 }}/{{ yunmuList.length }})
            </h5>
            <q-card class="pinyin-card q-mb-lg" v-if="currentYunmu">
              <q-card-section class="text-center">
                <div class="pinyin-display q-mb-md">
                  <div class="pinyin-image">{{ currentYunmu.emoji }}</div>
                  <span class="pinyin-text">{{ currentYunmu.pinyin }}</span>
                </div>
                <div class="pinyin-info q-mb-md">
                  <p class="text-h6">{{ currentYunmu.name }}</p>
                  <p class="text-body2">{{ currentYunmu.description }}</p>
                </div>
                <div class="examples q-mb-md">
                  <p class="text-subtitle2">例字:</p>
                  <div class="example-words">
                    <q-chip
                      v-for="example in currentYunmu.examples"
                      :key="example"
                      color="primary"
                      text-color="white"
                      class="q-ma-xs"
                    >
                      {{ example }}
                    </q-chip>
                  </div>
                </div>
                <div class="audio-section q-mb-md">
                  <q-btn
                    @click="playAudio(currentYunmu.pinyin)"
                    color="secondary"
                    icon="volume_up"
                    label="发音"
                    class="q-mr-sm"
                  />
                </div>
              </q-card-section>
            </q-card>
            <div class="action-buttons text-center">
              <q-btn
                @click="markAsKnown('yunmu')"
                color="positive"
                label="认识"
                class="q-mr-md"
              />
              <q-btn
                @click="markAsUnknown('yunmu')"
                color="negative"
                label="不认识"
                class="q-mr-md"
              />
              <q-btn
                @click="nextItem('yunmu')"
                color="primary"
                label="下一个"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- 整体认读音节 -->
        <q-tab-panel name="zhengti">
          <div class="learning-section">
            <h5 class="text-center q-mb-md">
              整体认读音节 ({{ currentZhengtiIndex + 1 }}/{{
                zhengtiList.length
              }})
            </h5>
            <q-card class="pinyin-card q-mb-lg" v-if="currentZhengti">
              <q-card-section class="text-center">
                <div class="pinyin-display q-mb-md">
                  <div class="pinyin-image">{{ currentZhengti.emoji }}</div>
                  <span class="pinyin-text">{{ currentZhengti.pinyin }}</span>
                </div>
                <div class="pinyin-info q-mb-md">
                  <p class="text-h6">{{ currentZhengti.name }}</p>
                  <p class="text-body2">{{ currentZhengti.description }}</p>
                </div>
                <div class="examples q-mb-md">
                  <p class="text-subtitle2">例字:</p>
                  <div class="example-words">
                    <q-chip
                      v-for="example in currentZhengti.examples"
                      :key="example"
                      color="primary"
                      text-color="white"
                      class="q-ma-xs"
                    >
                      {{ example }}
                    </q-chip>
                  </div>
                </div>
                <div class="audio-section q-mb-md">
                  <q-btn
                    @click="playAudio(currentZhengti.pinyin)"
                    color="secondary"
                    icon="volume_up"
                    label="发音"
                    class="q-mr-sm"
                  />
                </div>
              </q-card-section>
            </q-card>
            <div class="action-buttons text-center">
              <q-btn
                @click="markAsKnown('zhengti')"
                color="positive"
                label="认识"
                class="q-mr-md"
              />
              <q-btn
                @click="markAsUnknown('zhengti')"
                color="negative"
                label="不认识"
                class="q-mr-md"
              />
              <q-btn
                @click="nextItem('zhengti')"
                color="primary"
                label="下一个"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- 复习模式 -->
        <q-tab-panel name="review">
          <div class="review-section">
            <h5 class="text-center q-mb-md">智能复习</h5>
            <div class="review-stats q-mb-lg">
              <q-card class="stats-card">
                <q-card-section>
                  <div class="row q-gutter-md">
                    <div class="col text-center">
                      <div class="text-h6">{{ reviewItems.length }}</div>
                      <div class="text-caption">待复习</div>
                    </div>
                    <div class="col text-center">
                      <div class="text-h6">{{ masteredCount }}</div>
                      <div class="text-caption">已掌握</div>
                    </div>
                    <div class="col text-center">
                      <div class="text-h6">{{ totalLearned }}</div>
                      <div class="text-caption">已学习</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div v-if="currentReviewItem" class="review-item">
              <q-card class="pinyin-card q-mb-lg">
                <q-card-section class="text-center">
                  <div class="pinyin-display q-mb-md">
                    <div class="pinyin-image">
                      {{ currentReviewItem.emoji }}
                    </div>
                    <span class="pinyin-text">{{
                      currentReviewItem.pinyin
                    }}</span>
                  </div>
                  <div class="review-question q-mb-md">
                    <p class="text-h6">这个拼音怎么读？</p>
                  </div>
                  <div class="audio-section q-mb-md" v-if="showAnswer">
                    <q-btn
                      @click="playAudio(currentReviewItem.pinyin)"
                      color="secondary"
                      icon="volume_up"
                      label="听发音"
                      class="q-mr-sm"
                    />
                  </div>
                  <div v-if="showAnswer" class="answer-section q-mb-md">
                    <p class="text-body1">{{ currentReviewItem.name }}</p>
                    <p class="text-body2">
                      {{ currentReviewItem.description }}
                    </p>
                  </div>
                </q-card-section>
              </q-card>

              <div class="review-actions text-center">
                <div v-if="!showAnswer">
                  <q-btn
                    @click="showAnswer = true"
                    color="primary"
                    label="显示答案"
                  />
                </div>
                <div v-else class="review-buttons">
                  <q-btn
                    @click="reviewAnswer(1)"
                    color="negative"
                    label="不记得"
                    class="q-mr-sm"
                  />
                  <q-btn
                    @click="reviewAnswer(3)"
                    color="warning"
                    label="有点难"
                    class="q-mr-sm"
                  />
                  <q-btn
                    @click="reviewAnswer(5)"
                    color="positive"
                    label="很简单"
                  />
                </div>
              </div>
            </div>

            <div v-else class="no-review text-center">
              <q-icon
                name="check_circle"
                size="4rem"
                color="positive"
                class="q-mb-md"
              />
              <p class="text-h6">太棒了！今天没有需要复习的内容</p>
              <p class="text-body2">继续学习新的拼音吧！</p>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 当前选中的标签页
const currentTab = ref('shengmu');

// 声母数据
const shengmuList = ref([
  {
    pinyin: 'b',
    name: '玻',
    description: '双唇音，发音时双唇紧闭然后突然张开',
    examples: ['爸爸', '白菜', '包子'],
    image: '👜',
    emoji: '👜',
  },
  {
    pinyin: 'p',
    name: '坡',
    description: '双唇音，发音时双唇紧闭然后突然张开，有气流',
    examples: ['苹果', '跑步', '朋友'],
    image: '🍎',
    emoji: '🍎',
  },
  {
    pinyin: 'm',
    name: '摸',
    description: '双唇鼻音，发音时双唇紧闭，气流从鼻腔出来',
    examples: ['妈妈', '马路', '米饭'],
    image: '🐴',
    emoji: '🐴',
  },
  {
    pinyin: 'f',
    name: '佛',
    description: '唇齿音，上齿轻触下唇',
    examples: ['飞机', '房子', '风筝'],
    image: '✈️',
    emoji: '✈️',
  },
  {
    pinyin: 'd',
    name: '得',
    description: '舌尖音，舌尖抵住上齿龈',
    examples: ['大象', '弟弟', '电话'],
    image: '🐘',
    emoji: '🐘',
  },
  {
    pinyin: 't',
    name: '特',
    description: '舌尖音，舌尖抵住上齿龈，有气流',
    examples: ['太阳', '兔子', '桃子'],
    image: '🐰',
    emoji: '🐰',
  },
  {
    pinyin: 'n',
    name: '讷',
    description: '舌尖鼻音，舌尖抵住上齿龈',
    examples: ['奶奶', '牛奶', '鸟儿'],
    image: '🐄',
    emoji: '🐄',
  },
  {
    pinyin: 'l',
    name: '勒',
    description: '舌尖边音，舌尖抵住上齿龈两侧',
    examples: ['老师', '蓝色', '狼'],
    image: '🐺',
    emoji: '🐺',
  },
  {
    pinyin: 'g',
    name: '哥',
    description: '舌根音，舌根抵住软腭',
    examples: ['哥哥', '狗狗', '高兴'],
    image: '🐕',
    emoji: '🐕',
  },
  {
    pinyin: 'k',
    name: '科',
    description: '舌根音，舌根抵住软腭，有气流',
    examples: ['可爱', '快乐', '看书'],
    image: '📚',
    emoji: '📚',
  },
  {
    pinyin: 'h',
    name: '喝',
    description: '舌根音，舌根接近软腭',
    examples: ['花朵', '红色', '好吃'],
    image: '🌺',
    emoji: '🌺',
  },
  {
    pinyin: 'j',
    name: '基',
    description: '舌面音，舌面前部抵住硬腭前部',
    examples: ['鸡蛋', '家里', '姐姐'],
    image: '🐔',
    emoji: '🐔',
  },
  {
    pinyin: 'q',
    name: '欺',
    description: '舌面音，舌面前部抵住硬腭前部，有气流',
    examples: ['气球', '铅笔', '青蛙'],
    image: '🎈',
    emoji: '🎈',
  },
  {
    pinyin: 'x',
    name: '希',
    description: '舌面音，舌面前部接近硬腭前部',
    examples: ['西瓜', '小鸟', '星星'],
    image: '🍉',
    emoji: '🍉',
  },
  {
    pinyin: 'zh',
    name: '知',
    description: '舌尖后音，舌尖上翘抵住硬腭前部',
    examples: ['知道', '竹子', '桌子'],
    image: '🎋',
    emoji: '🎋',
  },
  {
    pinyin: 'ch',
    name: '蚩',
    description: '舌尖后音，舌尖上翘抵住硬腭前部，有气流',
    examples: ['吃饭', '车子', '虫子'],
    image: '🚗',
    emoji: '🚗',
  },
  {
    pinyin: 'sh',
    name: '诗',
    description: '舌尖后音，舌尖上翘接近硬腭前部',
    examples: ['水果', '书本', '树叶'],
    image: '🌳',
    emoji: '🌳',
  },
  {
    pinyin: 'r',
    name: '日',
    description: '舌尖后音，舌尖上翘接近硬腭前部',
    examples: ['人们', '热水', '肉'],
    image: '☀️',
    emoji: '☀️',
  },
  {
    pinyin: 'z',
    name: '资',
    description: '舌尖前音，舌尖抵住下齿背',
    examples: ['字母', '紫色', '足球'],
    image: '⚽',
    emoji: '⚽',
  },
  {
    pinyin: 'c',
    name: '雌',
    description: '舌尖前音，舌尖抵住下齿背，有气流',
    examples: ['草地', '彩色', '聪明'],
    image: '🦔',
    emoji: '🦔',
  },
  {
    pinyin: 's',
    name: '思',
    description: '舌尖前音，舌尖接近下齿背',
    examples: ['三个', '颜色', '森林'],
    image: '☂️',
    emoji: '☂️',
  },
]);

// 韵母数据
const yunmuList = ref([
  {
    pinyin: 'a',
    name: '啊',
    description: '单韵母，口张大，舌位低',
    examples: ['阿姨', '大家', '妈妈'],
    image: '👩‍👧',
    emoji: '👩‍👧',
  },
  {
    pinyin: 'o',
    name: '喔',
    description: '单韵母，口微张，唇形圆',
    examples: ['哦', '波浪', '多少'],
    image: '🌊',
    emoji: '🌊',
  },
  {
    pinyin: 'e',
    name: '鹅',
    description: '单韵母，口半开，舌位中',
    examples: ['鹅毛', '河水', '什么'],
    image: '🦢',
    emoji: '🦢',
  },
  {
    pinyin: 'i',
    name: '衣',
    description: '单韵母，口微开，舌位高前',
    examples: ['衣服', '一起', '米饭'],
    image: '👕',
    emoji: '👕',
  },
  {
    pinyin: 'u',
    name: '乌',
    description: '单韵母，口微开，舌位高后，唇形圆',
    examples: ['乌鸦', '木头', '书包'],
    image: '🐦‍⬛',
    emoji: '🐦‍⬛',
  },
  {
    pinyin: 'ü',
    name: '迂',
    description: '单韵母，口微开，舌位高前，唇形圆',
    examples: ['鱼儿', '绿色', '女孩'],
    image: '🐟',
    emoji: '🐟',
  },
  {
    pinyin: 'ai',
    name: '哀',
    description: '复韵母，由a滑向i',
    examples: ['爱心', '白色', '海洋'],
    image: '❤️',
    emoji: '❤️',
  },
  {
    pinyin: 'ei',
    name: '诶',
    description: '复韵母，由e滑向i',
    examples: ['美丽', '黑色', '飞机'],
    image: '🌸',
    emoji: '🌸',
  },
  {
    pinyin: 'ui',
    name: '威',
    description: '复韵母，由u滑向i',
    examples: ['水果', '回家', '最好'],
    image: '💧',
    emoji: '💧',
  },
  {
    pinyin: 'ao',
    name: '熬',
    description: '复韵母，由a滑向o',
    examples: ['好吃', '小鸟', '跑步'],
    image: '🐦',
    emoji: '🐦',
  },
  {
    pinyin: 'ou',
    name: '欧',
    description: '复韵母，由o滑向u',
    examples: ['头发', '走路', '口水'],
    image: '👤',
    emoji: '👤',
  },
  {
    pinyin: 'iu',
    name: '优',
    description: '复韵母，由i滑向u',
    examples: ['牛奶', '六个', '秋天'],
    image: '🥛',
    emoji: '🥛',
  },
  {
    pinyin: 'ie',
    name: '耶',
    description: '复韵母，由i滑向e',
    examples: ['叶子', '写字', '姐姐'],
    image: '🍃',
    emoji: '🍃',
  },
  {
    pinyin: 'üe',
    name: '约',
    description: '复韵母，由ü滑向e',
    examples: ['月亮', '雪花', '学习'],
    image: '🌙',
    emoji: '🌙',
  },
  {
    pinyin: 'er',
    name: '儿',
    description: '特殊韵母，卷舌音',
    examples: ['儿子', '花儿', '鸟儿'],
    image: '👶',
    emoji: '👶',
  },
  {
    pinyin: 'an',
    name: '安',
    description: '前鼻韵母，a+n',
    examples: ['安全', '山上', '蓝色'],
    image: '⛰️',
    emoji: '⛰️',
  },
  {
    pinyin: 'en',
    name: '恩',
    description: '前鼻韵母，e+n',
    examples: ['人们', '很好', '门口'],
    image: '🚪',
    emoji: '🚪',
  },
  {
    pinyin: 'in',
    name: '因',
    description: '前鼻韵母，i+n',
    examples: ['音乐', '心里', '金鱼'],
    image: '🎵',
    emoji: '🎵',
  },
  {
    pinyin: 'un',
    name: '温',
    description: '前鼻韵母，u+n',
    examples: ['春天', '问题', '昆虫'],
    image: '🌸',
    emoji: '🌸',
  },
  {
    pinyin: 'ün',
    name: '晕',
    description: '前鼻韵母，ü+n',
    examples: ['云朵', '军人', '群体'],
    image: '☁️',
    emoji: '☁️',
  },
  {
    pinyin: 'ang',
    name: '昂',
    description: '后鼻韵母，a+ng',
    examples: ['房子', '长大', '阳光'],
    image: '🏠',
    emoji: '🏠',
  },
  {
    pinyin: 'eng',
    name: '亨',
    description: '后鼻韵母，e+ng',
    examples: ['灯光', '风筝', '朋友'],
    image: '🪁',
    emoji: '🪁',
  },
  {
    pinyin: 'ing',
    name: '英',
    description: '后鼻韵母，i+ng',
    examples: ['星星', '听话', '明天'],
    image: '⭐',
    emoji: '⭐',
  },
  {
    pinyin: 'ong',
    name: '轰',
    description: '后鼻韵母，o+ng',
    examples: ['红色', '东西', '空气'],
    image: '🔴',
    emoji: '🔴',
  },
]);

// 整体认读音节数据
const zhengtiList = ref([
  {
    pinyin: 'zhi',
    name: '知',
    description: '整体认读音节，不能拼读',
    examples: ['知道', '蜘蛛', '纸张'],
    image: '🕷️',
    emoji: '🕷️',
  },
  {
    pinyin: 'chi',
    name: '吃',
    description: '整体认读音节，不能拼读',
    examples: ['吃饭', '池塘', '尺子'],
    image: '🍽️',
    emoji: '🍽️',
  },
  {
    pinyin: 'shi',
    name: '诗',
    description: '整体认读音节，不能拼读',
    examples: ['石头', '狮子', '十个'],
    image: '🦁',
    emoji: '🦁',
  },
  {
    pinyin: 'ri',
    name: '日',
    description: '整体认读音节，不能拼读',
    examples: ['日子', '热水', '人们'],
    image: '☀️',
    emoji: '☀️',
  },
  {
    pinyin: 'zi',
    name: '字',
    description: '整体认读音节，不能拼读',
    examples: ['字母', '孩子', '桌子'],
    image: '📝',
    emoji: '📝',
  },
  {
    pinyin: 'ci',
    name: '刺',
    description: '整体认读音节，不能拼读',
    examples: ['刺猬', '词语', '瓷器'],
    image: '🦔',
    emoji: '🦔',
  },
  {
    pinyin: 'si',
    name: '思',
    description: '整体认读音节，不能拼读',
    examples: ['思考', '丝绸', '四个'],
    image: '🤔',
    emoji: '🤔',
  },
  {
    pinyin: 'yi',
    name: '衣',
    description: '整体认读音节，不能拼读',
    examples: ['衣服', '一起', '椅子'],
    image: '👕',
    emoji: '👕',
  },
  {
    pinyin: 'wu',
    name: '乌',
    description: '整体认读音节，不能拼读',
    examples: ['乌鸦', '五个', '舞蹈'],
    image: '🐦‍⬛',
    emoji: '🐦‍⬛',
  },
  {
    pinyin: 'yu',
    name: '鱼',
    description: '整体认读音节，不能拼读',
    examples: ['鱼儿', '雨水', '语言'],
    image: '🐟',
    emoji: '🐟',
  },
  {
    pinyin: 'ye',
    name: '叶',
    description: '整体认读音节，不能拼读',
    examples: ['叶子', '夜晚', '爷爷'],
    image: '🍃',
    emoji: '🍃',
  },
  {
    pinyin: 'yue',
    name: '月',
    description: '整体认读音节，不能拼读',
    examples: ['月亮', '音乐', '约定'],
    image: '🌙',
    emoji: '🌙',
  },
  {
    pinyin: 'yuan',
    name: '圆',
    description: '整体认读音节，不能拼读',
    examples: ['圆形', '花园', '远方'],
    image: '⭕',
    emoji: '⭕',
  },
  {
    pinyin: 'yin',
    name: '因',
    description: '整体认读音节，不能拼读',
    examples: ['音乐', '银色', '因为'],
    image: '🎵',
    emoji: '🎵',
  },
  {
    pinyin: 'yun',
    name: '云',
    description: '整体认读音节，不能拼读',
    examples: ['云朵', '运动', '韵母'],
    image: '☁️',
    emoji: '☁️',
  },
  {
    pinyin: 'ying',
    name: '英',
    description: '整体认读音节，不能拼读',
    examples: ['英雄', '鹰', '影子'],
    image: '🦅',
    emoji: '🦅',
  },
]);

// 当前学习索引
const currentShengmuIndex = ref(0);
const currentYunmuIndex = ref(0);
const currentZhengtiIndex = ref(0);

// 当前学习项目
const currentShengmu = computed(
  () => shengmuList.value[currentShengmuIndex.value]
);
const currentYunmu = computed(() => yunmuList.value[currentYunmuIndex.value]);
const currentZhengti = computed(
  () => zhengtiList.value[currentZhengtiIndex.value]
);

// 学习记录
interface LearningRecord {
  id: string;
  type: 'shengmu' | 'yunmu' | 'zhengti';
  pinyin: string;
  name: string;
  description: string;
  examples: string[];
  easeFactor: number; // 记忆难度系数
  interval: number; // 复习间隔（天）
  repetitions: number; // 重复次数
  nextReview: Date; // 下次复习时间
  lastReview: Date; // 上次复习时间
  isLearned: boolean; // 是否已学习
  isMastered: boolean; // 是否已掌握
  emoji: string; // 对应的emoji
}

const learningRecords = ref<LearningRecord[]>([]);

// 复习相关
const currentReviewItem = ref<LearningRecord | null>(null);
const showAnswer = ref(false);

// 计算属性
const learningProgress = computed(() => {
  const totalItems =
    shengmuList.value.length +
    yunmuList.value.length +
    zhengtiList.value.length;
  const learnedItems = learningRecords.value.filter(
    (record) => record.isLearned
  ).length;
  return totalItems > 0 ? learnedItems / totalItems : 0;
});

const reviewItems = computed(() => {
  const now = new Date();
  return learningRecords.value.filter(
    (record) =>
      record.isLearned && !record.isMastered && record.nextReview <= now
  );
});

const masteredCount = computed(() => {
  return learningRecords.value.filter((record) => record.isMastered).length;
});

const totalLearned = computed(() => {
  return learningRecords.value.filter((record) => record.isLearned).length;
});

// 拼音音频文件路径映射表
const getAudioPath = (
  pinyin: string,
  type: 'initials' | 'finals' | 'syllables'
): string => {
  const baseUrl = '/pinyin/';

  switch (type) {
    case 'initials':
      return `${baseUrl}1/${pinyin}.mp3`;
    case 'finals':
      // 处理特殊韵母映射
      const finalMap: Record<string, string> = {
        ü: 'v',
        üe: 've',
        ün: 'vn',
      };
      const finalFile = finalMap[pinyin] || pinyin;
      return `${baseUrl}2/${finalFile}.mp3`;
    case 'syllables':
      return `${baseUrl}3/${pinyin}1.mp3`;
    default:
      return '';
  }
};

// 方法
const playAudio = (pinyin: string) => {
  // 确定拼音类型并获取对应的音频文件路径
  let audioPath = '';

  // 声母列表
  const initials = [
    'b',
    'p',
    'm',
    'f',
    'd',
    't',
    'n',
    'l',
    'g',
    'k',
    'h',
    'j',
    'q',
    'x',
    'zh',
    'ch',
    'sh',
    'r',
    'z',
    'c',
    's',
    'y',
    'w',
  ];

  // 整体认读音节列表
  const syllables = [
    'zhi',
    'chi',
    'shi',
    'ri',
    'zi',
    'ci',
    'si',
    'yi',
    'wu',
    'yu',
    'ye',
    'yue',
    'yuan',
    'yin',
    'yun',
    'ying',
  ];

  if (syllables.includes(pinyin)) {
    audioPath = getAudioPath(pinyin, 'syllables');
  } else if (initials.includes(pinyin)) {
    audioPath = getAudioPath(pinyin, 'initials');
  } else {
    // 默认为韵母
    audioPath = getAudioPath(pinyin, 'finals');
  }

  // 播放音频文件
  if (audioPath) {
    const audio = new Audio(audioPath);
    audio.volume = 0.8;
    audio.play().catch((error) => {
      console.warn('音频播放失败:', error);
      // 如果音频文件播放失败，回退到语音合成
      fallbackToSpeechSynthesis(pinyin);
    });
  }
};

// 回退到语音合成的方法
const fallbackToSpeechSynthesis = (pinyin: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(pinyin);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.6;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }
};

const markAsKnown = (type: 'shengmu' | 'yunmu' | 'zhengti') => {
  const currentItem = getCurrentItem(type);
  if (currentItem) {
    updateLearningRecord(currentItem, type, true);
    nextItem(type);
  }
};

const markAsUnknown = (type: 'shengmu' | 'yunmu' | 'zhengti') => {
  const currentItem = getCurrentItem(type);
  if (currentItem) {
    updateLearningRecord(currentItem, type, false);
    nextItem(type);
  }
};

const getCurrentItem = (type: 'shengmu' | 'yunmu' | 'zhengti') => {
  switch (type) {
    case 'shengmu':
      return currentShengmu.value;
    case 'yunmu':
      return currentYunmu.value;
    case 'zhengti':
      return currentZhengti.value;
    default:
      return null;
  }
};

const nextItem = (type: 'shengmu' | 'yunmu' | 'zhengti') => {
  switch (type) {
    case 'shengmu':
      if (currentShengmuIndex.value < shengmuList.value.length - 1) {
        currentShengmuIndex.value++;
      } else {
        currentShengmuIndex.value = 0;
      }
      break;
    case 'yunmu':
      if (currentYunmuIndex.value < yunmuList.value.length - 1) {
        currentYunmuIndex.value++;
      } else {
        currentYunmuIndex.value = 0;
      }
      break;
    case 'zhengti':
      if (currentZhengtiIndex.value < zhengtiList.value.length - 1) {
        currentZhengtiIndex.value++;
      } else {
        currentZhengtiIndex.value = 0;
      }
      break;
  }
};

interface PinyinItem {
  pinyin: string;
  name: string;
  description: string;
  examples: string[];
  emoji: string; // 对应的emoji
}

const updateLearningRecord = (
  item: PinyinItem,
  type: 'shengmu' | 'yunmu' | 'zhengti',
  isKnown: boolean
) => {
  const recordId = `${type}-${item.pinyin}`;
  let record = learningRecords.value.find((r) => r.id === recordId);

  if (!record) {
    record = {
      id: recordId,
      type,
      pinyin: item.pinyin,
      name: item.name,
      description: item.description,
      examples: item.examples,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
      lastReview: new Date(),
      isLearned: false,
      isMastered: false,
      emoji: item.emoji,
    };
    learningRecords.value.push(record);
  }

  record.isLearned = true;
  record.lastReview = new Date();

  if (isKnown) {
    record.repetitions++;
    if (record.repetitions >= 3 && record.easeFactor >= 2.5) {
      record.isMastered = true;
    }
    // 计算下次复习时间（简化的SM-2算法）
    if (record.repetitions === 1) {
      record.interval = 1;
    } else if (record.repetitions === 2) {
      record.interval = 6;
    } else {
      record.interval = Math.round(record.interval * record.easeFactor);
    }
  } else {
    record.repetitions = 0;
    record.interval = 1;
    record.easeFactor = Math.max(1.3, record.easeFactor - 0.2);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + record.interval);
  record.nextReview = nextReviewDate;

  saveLearningRecords();
};

const reviewAnswer = (quality: number) => {
  if (currentReviewItem.value) {
    const record = currentReviewItem.value;

    // SM-2算法更新
    if (quality >= 3) {
      record.repetitions++;
      if (record.repetitions === 1) {
        record.interval = 1;
      } else if (record.repetitions === 2) {
        record.interval = 6;
      } else {
        record.interval = Math.round(record.interval * record.easeFactor);
      }
    } else {
      record.repetitions = 0;
      record.interval = 1;
    }

    record.easeFactor = Math.max(
      1.3,
      record.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    if (record.repetitions >= 3 && record.easeFactor >= 2.5) {
      record.isMastered = true;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + record.interval);
    record.nextReview = nextReviewDate;
    record.lastReview = new Date();

    saveLearningRecords();
    loadNextReviewItem();
  }
};

const loadNextReviewItem = () => {
  const items = reviewItems.value;
  if (items.length > 0) {
    currentReviewItem.value = items[0];
  } else {
    currentReviewItem.value = null;
  }
  showAnswer.value = false;
};

const saveLearningRecords = () => {
  localStorage.setItem(
    'pinyin-learning-records',
    JSON.stringify(learningRecords.value)
  );
};

const loadLearningRecords = () => {
  const saved = localStorage.getItem('pinyin-learning-records');
  if (saved) {
    const records = JSON.parse(saved);
    // 转换日期字符串为Date对象
    learningRecords.value = records.map((record: LearningRecord) => ({
      ...record,
      nextReview: new Date(record.nextReview),
      lastReview: new Date(record.lastReview),
    }));
  }
};

// 生命周期
onMounted(() => {
  loadLearningRecords();
  loadNextReviewItem();
});
</script>

<style scoped>
.pinyin-page {
  max-width: 800px;
  margin: 0 auto;
}

.pinyin-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pinyin-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem 0;
}

.pinyin-text {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.pinyin-image {
  font-size: 5rem;
  margin-bottom: 1rem;
  line-height: 1;
}

.example-words {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.action-buttons {
  padding: 1rem;
}

.stats-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
}

.review-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.no-review {
  padding: 2rem;
}

@media (max-width: 600px) {
  .pinyin-text {
    font-size: 3rem;
  }

  .review-buttons {
    flex-direction: column;
    align-items: center;
  }

  .review-buttons .q-btn {
    width: 200px;
  }
}
</style>

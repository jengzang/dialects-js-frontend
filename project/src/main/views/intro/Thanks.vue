<template>
  <div class="thanks-container">
    <h2 class="tabs-title">{{ $t('home.intro.thanks.aboutTitle') }}</h2>
    <p style=" text-align: left;">{{ $t('home.intro.thanks.aboutDesc') }}</p>
    <ul class="customlist">
      <li v-html="$t('home.intro.thanks.feature1')"></li>
      <li v-html="$t('home.intro.thanks.feature2')"></li>
      <li v-html="$t('home.intro.thanks.feature3')"></li>
      <li v-html="$t('home.intro.thanks.feature4')"></li>
      <li v-html="$t('home.intro.thanks.feature5')"></li>
      <li v-html="$t('home.intro.thanks.feature6')"></li>
      <li v-html="$t('home.intro.thanks.feature7')"></li>
      <li v-html="$t('home.intro.thanks.feature8')"></li>
    </ul>
    <p style=" text-align: left;font-weight: bold;text-decoration: underline">{{ $t('home.intro.thanks.welcomeText') }}</p>

    <h2 class="tabs-title" style="margin-top: 20px">{{ $t('home.intro.thanks.devTitle') }}</h2>
    <p class="thoughts" style="text-align: left">{{ $t('home.intro.thanks.devPara1') }}</p>
    <p class="thoughts" style="text-align: left">{{ $t('home.intro.thanks.devPara2') }}</p>
    <p class="thoughts" style="text-align: left">{{ $t('home.intro.thanks.devPara3') }}</p>
    <p class="thoughts" v-html="$t('home.intro.thanks.devPara4')"></p>

    <h2 class="tabs-title" style="margin-top: 20px">🙏 {{ $t('home.intro.thanks.thanksTitle') }}</h2>
    <ul class="thanks-list">
      <li>
        ✔ <a href="https://mcpdict.vear.vip/" target="_blank" rel="noopener noreferrer" class="thanks-link">{{ $t('home.intro.thanks.mcpdict') }}</a>
        - {{ $t('home.intro.thanks.mcpdictDesc') }}<a href="https://github.com/osfans/MCPDict/tree/master/tools/tables/output"
                                 target="_blank" rel="noopener noreferrer" class="thanks-link">{{ $t('home.intro.thanks.mcpdictData') }}</a>
      </li>
      <li>
        ✔ <a href="https://jyutjam.org/" target="_blank" rel="noopener noreferrer"
           class="thanks-link">{{ $t('home.intro.thanks.jyutjam') }}</a> - {{ $t('home.intro.thanks.jyutjamDesc') }}<a href="https://jyutdict.org/"
              target="_blank" rel="noopener noreferrer" class="thanks-link">{{ $t('home.intro.thanks.jyutdict') }}</a>
      </li>
      <li>
        ✔ <a href="https://zhongguoyuyan.cn/" target="_blank" rel="noopener noreferrer"
           class="thanks-link">{{ $t('home.intro.thanks.yubao') }}</a> - {{ $t('home.intro.thanks.yubaoDesc') }}
      </li>
      <li>
        ✔ <a href="https://xiaoxue.iis.sinica.edu.tw/ccrdata/" target="_blank" rel="noopener noreferrer"
           class="thanks-link">{{ $t('home.intro.thanks.xiaoxue') }}</a> - {{ $t('home.intro.thanks.xiaoxueDesc') }}
      </li>
      <li>
        ✔ <a href="http://1.14.238.88:8099/dialect/main/about.html" target="_blank" rel="noopener noreferrer"
           class="thanks-link">{{ $t('home.intro.thanks.yueminke') }}</a> - {{ $t('home.intro.thanks.yueminkeDesc') }}
      </li>
      <li>
        ✔ <a href="#" class="thanks-link">{{ $t('home.intro.thanks.testers') }}</a> - {{ $t('home.intro.thanks.testersDesc') }}
      </li>
      <li style="margin-bottom: 0">
        ✔ <a href="#" class="thanks-link">{{ $t('home.intro.thanks.friends') }}</a> - {{ $t('home.intro.thanks.friendsDesc') }}
      </li>
      <li>
        ✔ <a href="#" class="thanks-link">{{ $t('home.intro.thanks.you') }}</a> - {{ $t('home.intro.thanks.youDesc') }}
      </li>
    </ul>
    <p style="font-size:2rem;margin-top:0.5rem;margin-bottom: 3rem">💖🌟🥳</p>
  </div>
</template>

<style scoped>
.thanks-list li {
  margin-bottom: 0.5rem;
}
p {
  font-family: 'Arial', sans-serif; /* 使用清晰的字體 */
  line-height: 1.6; /* 行高，讓文本更通透 */
  font-size: 16px;
  color: #333; /* 深色文字，更易讀 */
  margin-bottom: 20px; /* 每個段落底部的間距 */
}

strong {
  font-weight: bold;
  color: #007aff; /* 強調文字的顏色 */
}

em {
  font-style: italic;
}

p a {
  color: #007aff; /* 超鏈接文字顏色 */
  text-decoration: none; /* 去除下劃線 */
}

p a:hover {
  text-decoration: underline; /* 鼠標懸停時顯示下劃線 */
}

/* 提高段落間距 */
p + p {
  margin-top: 8px;
}

/* 當提到的功能文本是超鏈接時（例如查中古、查音位）可以加入高亮背景 */
p strong {
  background-color: rgba(0, 122, 255, 0.1); /* 淺藍背景 */
  padding: 2px 6px; /* 給強調文字增加內邊距 */
  border-radius: 4px; /* 圓角 */
}

/* 添加 Emoji 樣式 */
p em.emoji {
  font-size: 1.2em; /* 放大 emoji */
  margin-left: 5px;
}
/* 自定義列表樣式 */
.customlist {
  list-style-type: disc;  /* 點狀符號 */
  margin-left: 20px;      /* 左側縮進 */
  padding-left: 20px;     /* 內邊距調整 */
  font-size: 16px;        /* 字體大小 */
  color: #333;            /* 字體顏色 */
}

.customlist ol {
  list-style-type: decimal;  /* 有序列表使用數字 */
}

.customlist ul {
  list-style-type: square;  /* 無序列表使用方塊符號 */
}

/* 自定義列表項目樣式 */
.customlist li {
  margin-bottom: 6px;  /* 每個項目的底部間距 */
  line-height: 1.5;    /* 行高設置 */
  text-align: left; /* 列表文字居左 */
}

.customlist li a {
  color: #007aff;      /* 連結文字顏色 */
  text-decoration: none; /* 去除下劃線 */
}

.customlist li a:hover {
  text-decoration: underline; /* 鼠標懸停顯示下劃線 */
}
/* 整體文字樣式 */
.thoughts p {
  font-family: 'Georgia', serif; /* 優雅的襯線字體 */
  line-height: 1.8; /* 增加行間距，使文本更易讀 */
  font-size: 18px; /* 設置較大的字體 */
  color: #333; /* 深灰色文字 */
  max-width: 800px; /* 限制最大寬度，防止行太長 */
  margin: 40px auto; /* 居中顯示 */
  padding: 20px;
  border-radius: 8px; /* 圓角邊框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 輕微陰影效果 */
  text-align:left;
}
/* 加強感悟部分的樣式，設置背景色和文字效果 */
.thoughts em {
  font-weight: bold;
  text-decoration: underline;
  color: #000000; /* 橙色文字強調 */
}
</style>

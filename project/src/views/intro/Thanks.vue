<template>
  <div class="thanks-container">
    <h2 class="tabs-title">ℹ️ 關於網站</h2>
    <p style=" text-align: left;">「方音圖鑑」是一個專注於中古地位分析、方言比較、地理語言學的線上工具，致力於以清晰、互動的方式呈現各方言點聲韻層次及音位分合。</p>
    <ul class="customlist">
      <li>功能1：<strong>查中古</strong>（按中古地位整理讀音）。
        使用者可輸入各種組合進行分析，目前支持攝、韻、等、呼、調、系、組、母、清濁、發音部位、發聲方式等類別。
        網站會按輸入的組合分析聲母/韻母/聲調，並把結果呈現在表格和地圖中。</li>
      <li>功能2：<strong>查音位</strong>（分析音位的中古來源）。
        使用者可輸入上述類別，網站會分析輸入的音值（音位）對應字的中古來源，並把結果呈現在表格和地圖中。</li>
      <li>功能3：<strong>查調</strong>（查詢調值、調類）。
        網站會根據用戶選擇的分區、地點，整理調值、調類，不同的調類標上了不同的顏色。</li>
      <li>功能4：<strong>查字</strong>（查詢字音、地位）。
        根據用戶輸入漢字進行查詢，最終呈現各個地點的音值、注釋以及漢字中古地位</li>
      <li>功能5：<strong>分區繪圖</strong>（按地圖集二分區/音典分區繪製方言地圖）。</li>
      <li>功能6：<strong>自定義繪圖</strong>（用戶添加個人數據進行繪圖）。
        用戶可以自己在地圖上選點、標註，網站會根據特徵值自定分配顏色</li>
      <li>表格裡的<strong>藍色字</strong>（地位、音值等）一般都是可以點擊的，點擊後即在新的彈窗中進行細分查詢，方便與原結果對比分析</li>
      <li>地圖上的點也可以點擊，點擊後即可查詢詳細信息。</li>
    </ul>
    <p style=" text-align: left;font-weight: bold;text-decoration: underline">歡迎探索《方音圖鑑》，一起觸摸方言的歷史層次！</p>

    <h2 class="tabs-title" style="margin-top: 20px">🧑‍💻 開發感悟</h2>
    <p class="thoughts" style="text-align: left">    最初，我只想為自己的研究製作稱手的工具，卻在不知不覺間，探索了廣袤的星空。
      從第一行代碼到第一個功能，從稚嫩的構想到漸豐的體系，昼夜在鍵盤上更迭，我的構想也逐漸從虛無中落地生根。
      我看著這個網站，就如同看著自家的孩子蹣跚學步，一步步走出自己的輪廓。
      每一個按鈕、每一次交互，都烙印著一段時光。我曾為如果實現想要的查詢邏輯而精疲力竭，也曾為視覺效果的成功呈現而雀躍不已
      ——這些點滴，匯成了她的血與肉、魂與靈。</p>
    <p class="thoughts" style="text-align: left">    其實，這亦是自我蛻變的歷程。從對前端一無所知，到摸索DOM、嘗試虛擬滾動，進階至運用框架，乃至領略JWT、ORM的精妙。
      我在建造中學習，在錯誤中成熟。最迷人之處在於，我用以搭建這一切的磚石，正是我渴望學習的知識本身：
      網站的搭建深化了我對音韻的理解，而鑽研音韻又驅動著代碼的迭代。
      技術於我，不再是冷冰冰的指令，而是承載文化的舟楫；文化於我，亦不再是遙遠的文獻，逐步化為可交互、可追溯、可觸摸的實體。</p>
    <p class="thoughts" style="text-align: left">    這便是我用代碼與熱愛寫就的答卷，一個普通學生獻給方言領域最誠摯的禮物。
      感謝每一位與它相遇的你。希望這份仍顯稚拙的創作，能激起你心中一絲好奇的漣漪，
      或為你節省資料翻檢的片刻光陰，這便是她存在的意義。</p>
    <p class="thoughts"><em>願八方鄉音，生生不息；<br>願漢字之美，永被珍惜；<br>願文明薪火，長存於每一次交互與共鳴之中。</em></p>

    <h2 class="tabs-title" style="margin-top: 20px">🙏 特別鳴謝</h2>
    <ul class="thanks-list">
      <li>
        ✔ <a href="https://mcpdict.vear.vip/" target="_blank" rel="noopener noreferrer" class="thanks-link">漢字音典</a>
        - 本網站大部分資料來自<a href="https://github.com/osfans/MCPDict/tree/master/tools/tables/output"
                                 target="_blank" rel="noopener noreferrer" class="thanks-link">音典開源數據</a>
      </li>
      <li>
        ✔ <a href="https://jyutjam.org/" target="_blank" rel="noopener noreferrer"
           class="thanks-link">嶺南粵音</a> - 提供了交流的平台 及<a href="https://jyutdict.org/"
              target="_blank" rel="noopener noreferrer" class="thanks-link">泛粵大典</a>
      </li>
      <li>
        ✔ <a href="https://zhongguoyuyan.cn/" target="_blank" rel="noopener noreferrer"
           class="thanks-link">語保</a> - 篩選了部分資料
      </li>
      <li>
        ✔ <a href="https://xiaoxue.iis.sinica.edu.tw/ccrdata/" target="_blank" rel="noopener noreferrer"
           class="thanks-link">小學堂</a> - 篩選了部分資料
      </li>
      <li>
        ✔ <a href="http://1.14.238.88:8099/dialect/main/about.html" target="_blank" rel="noopener noreferrer"
           class="thanks-link">粵閩客方言系統</a> - 篩選了部分資料
      </li>
      <li>
        ✔ <a href="#" class="thanks-link">測試人員</a> - 正式上線之前測試、提建議的網友！
      </li>
      <li style="margin-bottom: 0">
        ✔ <a href="#" class="thanks-link">朋友 ❤️</a> - 在項目開發過程中，
        所有支持、鼓勵、幫助過我的朋友！
      </li>
      <li>
        ✔ <a href="#" class="thanks-link">你 ❤️</a> - 當然，還有看到這裡的你！
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
<script setup lang="ts">
</script>
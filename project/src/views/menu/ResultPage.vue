<template>
  <div id="resultPanel" class="Panel">
    <h2 class="tabs-title">結果（測試中）</h2>
    <div
        id="resultPanelContent"
        class="panel-content"
        ref="scrollContainerRef"
        style="overflow-y: auto; position: relative;"
    >
      <div class="result-panel-vue" :style="{ height: panelHeight }">
        <div v-for="(item, index) in displayedData" :key="index" class="data-row-vue">
          <p v-if="shouldShowLocation(item, index)" class="locations-vue">
            {{ item.地點 }}
          </p>

          <div class="feature-row">
            <p>
              <span
                  class="feature-value-clickable"
                  style="cursor: pointer; color: #007bff"
                  @click="(e) => triggerPopup('feature', item, getFeatureKey(item), getFeatureVal(item), e)"
              >
                {{ getFeatureKey(item) }}
              </span>
              <span> ☞ </span>
              <span
                  class="feature-value-clickable"
                  style="cursor: pointer; color: #007bff"
                  @click="(e) => triggerPopup('value', item, getFeatureKey(item), getFeatureVal(item), e)"
              >
                {{ String(getFeatureVal(item)) }}
              </span>
            </p>
            <p>字數/佔比: {{ item.字數 }} ║ {{ (item.佔比 * 100).toFixed(1) }}%</p>
          </div>

          <p :class="isCondensedMode ? 'characters-vue-condensed' : 'characters-vue'">
            <template v-for="(charNode, cIndex) in getCorrespondingCharacters(item)" :key="cIndex">
               <span
                   v-if="charNode.type === 'span'"
                   :class="charNode.props.class"
                   :datatitle="charNode.props.datatitle"
               >
                {{ charNode.children }}
              </span>
            </template>
          </p>
        </div>
      </div>
    </div>

    <div id="stickyContextBar2" class="sticky-label2" style="display: block;">
      <div class="sticky-bar-inner ">
        <span id="stickyContextText2">📍 {{ currentStickyLocation }}</span>
        <div class="stickybar-filter-wrapper" ref="filterWrapperRef">
          <div class="stickybar-filter-trigger" @click.stop="toggleFilterDropdown">
            {{ filterTriggerText }}
          </div>
          <div class="stickybar-filter-dropdown" :class="{ open: isFilterOpen }">
            <label
                v-for="stat in availableValueStats"
                :key="stat.value"
                class="stickybar-filter-option"
            >
              <input
                  type="checkbox"
                  :value="stat.value"
                  v-model="selectedValues"
              />
              {{ stat.value }}
            </label>
          </div>
        </div>
        <div id="toggleColumnsBtn2" @click="toggleColumns" class="custom-switch-container">
          <div class="custom-switch" :class="{ open: !isCondensedMode }">
            <div class="custom-slider "></div>
          </div>
          <span id="switch-text2" class="switch-text">{{ !isCondensedMode ? '全顯' : '主體' }}</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
          v-if="showPopup"
          ref="popupRef"
          class="popup-vue popup-animated"
          :style="{ position: 'fixed', top: `${popupPosition.top}px`, left: `${popupPosition.left}px`, zIndex: 999999 }"
      >
        <div class="popup-content">
          <p>📍 地點: {{ popupData.location }}</p>
          <p>🧩 特征: {{ getCheckedFeatures() }}</p>

          <span>
               {{ getModeLabels()[0] }}:
               {{ shouldApplyFontSize(getModeLabels()[0], parseFeatureString(popupData.feature)) ? getModeText(getModeLabels()[0], popupData.value) : (getModeLabels()[0] === '音本位' ? '查詢所有音節分佈' : getModeLabels()[0] === '字本位' ? '按 聲母/韻攝/清濁 整理' : '出問題了') }}
            </span>
          <span>
               {{ getModeLabels()[1] }}:
               {{ shouldApplyFontSize(getModeLabels()[1], parseFeatureString(popupData.feature)) ? getModeText(getModeLabels()[1], popupData.value) : (getModeLabels()[1] === '音本位' ? '查詢所有音節的分佈' : getModeLabels()[1] === '字本位' ? '按 聲母/韻攝/清濁 整理' : '出問題了') }}
            </span>

          <button
              class="mini-button"
              :style="shouldApplyFontSize(getModeLabels()[0], parseFeatureString(popupData.feature)) ? { fontSize: '17px' } : {}"
              @click="handlePopupAction(getModeLabels()[0])"
          >
            🔍{{ getModeLabels()[0] }}
          </button>

          <button
              class="mini-button"
              :style="shouldApplyFontSize(getModeLabels()[1], parseFeatureString(popupData.feature)) ? { fontSize: '17px' } : {}"
              @click="handlePopupAction(getModeLabels()[1])"
          >
            🔍{{ getModeLabels()[1] }}
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
          v-if="showPopup2"
          ref="popupRef2"
          class="popup-vue popup-animated"
          :style="{ position: 'fixed', top: `${popupPosition.top}px`, left: `${popupPosition.left}px`, zIndex: 999999 }"
      >
        <div class="popup-content">
          <p>📍 地點: {{ popupData2.location }}</p>
          <p>🧩 特征: {{ getCheckedFeatures() }}</p>
          <p>🔍 查詢: {{ popupData2.feature }} + (單擊按鈕選擇)</p>

          <template v-for="field in getUnmatchedFields(popupData2.feature)" :key="field">
            <button
                class="mini-button"
                style="font-size: 16px; margin-right: 2px; margin-left: 2px;"
                @click="handleFeatureFieldClick(field)"
            >
              {{ field }}
            </button>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, h } from 'vue';
window.latestResults =
    [{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"au"},"字數":6,"佔比":0.0208,"對應字":["驟","吼","矛","肘","猱","牡"],"多音字詳情":"吼:hau1|hɐu5"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ei"},"字數":2,"佔比":0.0069,"對應字":["痞","否"],"多音字詳情":"痞:mɐu1|pʰei3; 否:fɐu3|pʰei3"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iu"},"字數":5,"佔比":0.0173,"對應字":["調","溜","舀","彪","廖"],"多音字詳情":"調:tiu6|tʰiu2; 溜:liu1|lɐu2|lɐu6"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ou"},"字數":9,"佔比":0.0311,"對應字":["菩","聱","姆","婦","拇","母","部","戊","浮"],"多音字詳情":"婦:fu4|pʰou4; 浮:fɐu2|pʰou2"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"u"},"字數":5,"佔比":0.0173,"對應字":["負","副","婦","仆","富"],"多音字詳情":"婦:fu4|pʰou4; 仆:fu6|pʰʊk7a"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ui"},"字數":2,"佔比":0.0069,"對應字":["培","莓"],"多音字詳情":""},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"y"},"字數":1,"佔比":0.0035,"對應字":["揄"],"多音字詳情":""},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɐi"},"字數":2,"佔比":0.0069,"對應字":["馗","龜"],"多音字詳情":"龜:kʰɐu1|kʷɐi1|kʷɐn1"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɐn"},"字數":1,"佔比":0.0035,"對應字":["龜"],"多音字詳情":"龜:kʰɐu1|kʷɐi1|kʷɐn1"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɐt"},"字數":1,"佔比":0.0035,"對應字":["不"],"多音字詳情":""},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɐu"},"字數":249,"佔比":0.8616,"對應字":["蚯","媾","瘤","構","叟","手","幽","龜","耦","虯","鞦","搜","謀","朽","擻","荳","游","榴","夠","流","球","蔻","宿","壽","邱","啁","劉","售","鰍","斗","鍪","咻","厚","婁","紂","冑","剖","臼","赳","舅","收","憂","蹂","酒","否","紬","袖","后","鱟","篌","鳩","侑","黝","寇","嗽","脩","久","鏤","螻","鈕","區","囚","猴","奏","髏","候","右","餾","宙","蜉","誘","悠","陋","溝","疇","猶","丑","搆","友","嘔","休","垢","句","晝","酋","鬥","遛","由","樓","貿","胄","九","喉","簍","走","揉","謳","籌","嘍","涪","購","藪","浮","毆","透","瘻","謬","猷","修","偸","裘","缶","餿","苟","牛","鉤","惆","羞","口","秀","繡","褸","糗","溜","秋","罘","糾","遊","柔","臭","頭","漏","逑","祐","醜","丘","藕","宥","抽","守","柚","瀏","油","兜","韭","授","竇","琇","偶","遘","首","侯","幼","呦","留","枸","稠","袤","騮","廏","茂","遒","鷲","綬","湊","洲","阜","狩","漱","疣","狗","鄒","毬","受","疚","究","紐","逗","鞣","投","灸","俅","牟","懋","逅","繆","咎","舊","酬","叩","柩","柳","尤","鷗","啾","躊","求","痞","瘦","貅","莠","摟","蝣","摳","骰","佑","囿","就","扣","歐","州","篝","獸","蒐","豆","畝","詬","郵","陡","後","救","愁","某","庥","攸","優","芣","硫","舟","縐","扭","吼","仇","周","犰","有","抖","酉","漚","玖","皺","眸","泅","謅","甌","颼","又","綢","蚪"],"多音字詳情":"龜:kʰɐu1|kʷɐi1|kʷɐn1; 擻:sɐu3|sɐu5; 宿:sɐu5|sʊk7a; 咻:hɵy3|jɐu1; 否:fɐu3|pʰei3; 區:kʰɵy1|ʔɐu1; 嘔:ʔɐu1|ʔɐu3; 句:kɐu1|kɵy5|ŋɐu1; 浮:fɐu2|pʰou2; 褸:lɐu1|lɵy4; 溜:liu1|lɐu2|lɐu6; 糾:kɐu3|tɐu3; 守:sɐu3|sɐu5; 竇:tɐu5|tɐu6; 繆:mɐu2|mɐu6; 痞:mɐu1|pʰei3; 摟:lɐu2|lɐu3; 吼:hau1|hɐu5; 仇:kʰɐu2|sɐu2; 有:jɐu4|jɐu6"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔ"},"字數":1,"佔比":0.0035,"對應字":["囮"],"多音字詳情":""},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔk"},"字數":1,"佔比":0.0035,"對應字":["欶"],"多音字詳情":""},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔŋ"},"字數":1,"佔比":0.0035,"對應字":["莽"],"多音字詳情":""},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɵy"},"字數":7,"佔比":0.0242,"對應字":["褸","取","區","句","佝","咻","趣"],"多音字詳情":"褸:lɐu1|lɵy4; 區:kʰɵy1|ʔɐu1; 句:kɐu1|kɵy5|ŋɐu1; 咻:hɵy3|jɐu1"},{"地點":"廣州","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ʊk"},"字數":10,"佔比":0.0346,"對應字":["伏","復","宿","複","祝","仆","畜","妯","輻","覆"],"多音字詳情":"伏:fʊk8|pʊk8; 復:fʊk7a|fʊk8; 宿:sɐu5|sʊk7a; 仆:fu6|pʰʊk7a"},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"au"},"字數":78,"佔比":0.7222,"對應字":["手","幽","母","榴","球","流","壽","劉","斗","厚","收","酒","否","袖","后","嗽","久","囚","候","右","溝","婦","友","嘔","休","由","樓","貿","九","喉","走","籌","修","偸","牛","鉤","口","繡","秋","柔","臭","頭","漏","丘","藕","抽","油","兜","韭","偶","首","留","湊","狗","鄒","受","究","紐","舊","柳","鷗","求","瘦","就","歐","豆","獸","畝","救","愁","某","扭","周","仇","有","漚","又","綢"],"多音字詳情":"斗:ɗau3|ɗou3; 袖:θau4|θiu4; 候:hau2|hau4; 由:zau2|ziu2; 柳:lau2|liu2"},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"i"},"字數":4,"佔比":0.037,"對應字":["取","句","趣","區"],"多音字詳情":""},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iu"},"字數":8,"佔比":0.0741,"對應字":["秀","調","舀","憂","彪","袖","柳","由"],"多音字詳情":"調:tʰiu2|tʰiu4; 袖:θau4|θiu4; 柳:lau2|liu2; 由:zau2|ziu2"},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ou"},"字數":8,"佔比":0.0741,"對應字":["矛","抖","扣","斗","奏","猴","謀","透"],"多音字詳情":"斗:ɗau3|ɗou3"},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"u"},"字數":6,"佔比":0.0556,"對應字":["負","陡","副","部","浮","富"],"多音字詳情":""},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uaŋ"},"字數":1,"佔比":0.0093,"對應字":["莽"],"多音字詳情":""},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ui"},"字數":2,"佔比":0.0185,"對應字":["培","龜"],"多音字詳情":""},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uk"},"字數":1,"佔比":0.0093,"對應字":["祝"],"多音字詳情":""},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔ"},"字數":1,"佔比":0.0093,"對應字":["剖"],"多音字詳情":""},{"地點":"三亞邁話","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔʔ"},"字數":3,"佔比":0.0278,"對應字":["伏","覆","畜"],"多音字詳情":"伏:pʰɔʔ7a|vɔʔ8"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"a"},"字數":2,"佔比":0.0102,"對應字":["扣","叩"],"多音字詳情":"扣:kʰa3|kʰau3; 叩:kʰa3|kʰau3"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"au"},"字數":56,"佔比":0.2857,"對應字":["口","寇","褸","嗽","投","溜","瘤","區","猴","奏","候","叩","臭","頭","漏","鷗","藕","溝","矛","兜","摳","嘔","垢","扣","歐","鬮","晝","豆","鬥","樓","夠","流","陡","九","喉","後","簍","謳","侯","走","劉","斗","耨","留","厚","毆","透","扭","吼","抖","漚","偸","狗","鉤","紐","逗"],"多音字詳情":"寇:kʰau3|kʰou3; 褸:lau1|lu2; 溜:lau3|liu1|liu3; 瘤:lau5|liu5; 區:au1|kʰu1; 叩:kʰa3|kʰau3; 臭:hiũ3|tsʰau3; 漏:lau3|lau7; 鷗:au1|ou1; 垢:kau2|kou3; 扣:kʰa3|kʰau3; 晝:tau3|tiu6; 鬥:tau3|tou3; 夠:kau3|kou3; 流:lau5|liu5; 九:kau2|kiu2; 後:au6|hau6; 侯:hau7|hou5|kau5; 耨:dʑiok8|nau7|no3; 留:lau5|liu5; 毆:au1|au2; 扭:nau6|niu2; 漚:au1|au3; 紐:nau6|niu2"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"aŋ"},"字數":2,"佔比":0.0102,"對應字":["莽","瘦"],"多音字詳情":"瘦:saŋ2|sou2"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iau"},"字數":7,"佔比":0.0357,"對應字":["搜","調","餿","颼","皺","廖","縐"],"多音字詳情":"調:tiau7|tʰiau3|tʰiau5; 颼:sou1|ɕiau1; 皺:niau3|tsou3; 縐:dʑiau3|niau3"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"io"},"字數":1,"佔比":0.0051,"對應字":["舀"],"多音字詳情":""},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iok"},"字數":2,"佔比":0.0102,"對應字":["耨","畜"],"多音字詳情":"耨:dʑiok8|nau7|no3"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iu"},"字數":82,"佔比":0.4184,"對應字":["瘤","手","龜","彪","榴","球","流","宿","壽","售","紂","收","憂","酒","袖","鳩","囚","右","宙","誘","悠","丑","友","晝","由","九","揉","籌","謬","修","羞","秀","繡","又","溜","秋","糾","遊","柔","祐","醜","丘","宥","抽","守","柚","油","授","首","留","稠","洲","漱","受","究","紐","帚","繆","咎","酬","柩","柳","尤","求","莠","讎","就","州","獸","郵","救","優","硫","舟","扭","周","仇","酉","有","肘","猶","綢"],"多音字詳情":"瘤:lau5|liu5; 龜:kiu1|ku1|kuŋ1|kʰiu1; 流:lau5|liu5; 宿:sok4|suaʔ4|ɕiu3|ɕiu7; 悠:hiũ1|iu1; 晝:tau3|tiu6; 九:kau2|kiu2; 謬:miu6|niu6; 溜:lau3|liu1|liu3; 醜:tɕʰiu2|tʰiu2; 丘:kʰiu1|kʰu1; 留:lau5|liu5; 漱:sok4|tɕʰiu3; 紐:nau6|niu2; 繆:niu5|niu6; 就:tsu6|tɕiu6; 扭:nau6|niu2; 有:iu2|u6"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iũ"},"字數":6,"佔比":0.0306,"對應字":["幼","休","幽","臭","朽","悠"],"多音字詳情":"臭:hiũ3|tsʰau3; 悠:hiũ1|iu1"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"m̩"},"字數":1,"佔比":0.0051,"對應字":["母"],"多音字詳情":"母:m̩2|ᵐbo2"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"o"},"字數":4,"佔比":0.0204,"對應字":["菩","母","耨","拇"],"多音字詳情":"菩:pʰo6|pʰu5; 母:m̩2|ᵐbo2; 耨:dʑiok8|nau7|no3"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ok"},"字數":6,"佔比":0.0306,"對應字":["伏","宿","複","祝","漱","覆"],"多音字詳情":"宿:sok4|suaʔ4|ɕiu3|ɕiu7; 複:hok4|hok8; 漱:sok4|tɕʰiu3"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ou"},"字數":34,"佔比":0.1735,"對應字":["寇","媾","構","叟","鷗","陋","瘦","摟","彀","垢","謀","鬥","偶","畝","貿","夠","驟","蔻","侯","愁","某","購","牡","茂","湊","剖","后","鄒","眸","苟","皺","戊","部","颼"],"多音字詳情":"寇:kʰau3|kʰou3; 鷗:au1|ou1; 瘦:saŋ2|sou2; 垢:kau2|kou3; 鬥:tau3|tou3; 夠:kau3|kou3; 侯:hau7|hou5|kau5; 剖:pʰou1|pʰou2; 皺:niau3|tsou3; 颼:sou1|ɕiau1"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"oũ"},"字數":1,"佔比":0.0051,"對應字":["否"],"多音字詳情":""},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"u"},"字數":23,"佔比":0.1173,"對應字":["副","褸","久","灸","區","舊","龜","丘","趣","取","婦","就","韭","句","浮","富","負","有","菩","臼","阜","舅","牛"],"多音字詳情":"褸:lau1|lu2; 區:au1|kʰu1; 龜:kiu1|ku1|kuŋ1|kʰiu1; 丘:kʰiu1|kʰu1; 婦:hu6|pu6; 就:tsu6|tɕiu6; 有:iu2|u6; 菩:pʰo6|pʰu5"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uaʔ"},"字數":1,"佔比":0.0051,"對應字":["宿"],"多音字詳情":"宿:sok4|suaʔ4|ɕiu3|ɕiu7"},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ue"},"字數":1,"佔比":0.0051,"對應字":["培"],"多音字詳情":""},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uk"},"字數":1,"佔比":0.0051,"對應字":["不"],"多音字詳情":""},{"地點":"汕頭","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uŋ"},"字數":1,"佔比":0.0051,"對應字":["龜"],"多音字詳情":"龜:kiu1|ku1|kuŋ1|kʰiu1"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"au"},"字數":2,"佔比":0.0085,"對應字":["矛","褸"],"多音字詳情":""},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"e"},"字數":1,"佔比":0.0043,"對應字":["姆"],"多音字詳情":""},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"eu"},"字數":85,"佔比":0.3632,"對應字":["媾","構","叟","搜","謀","擻","荳","斗","牡","厚","婁","否","后","鳩","篌","寇","嗽","螻","區","猴","奏","髏","候","陋","溝","鬮","嘔","垢","鬥","樓","喉","簍","走","謳","嘍","購","藪","浮","毆","透","瘻","偸","餿","苟","鉤","口","糾","頭","漏","藕","兜","竇","偶","侯","枸","湊","漱","狗","鄒","紐","逗","投","牟","繆","叩","鷗","瘦","摳","扣","歐","篝","豆","畝","陡","驟","酘","後","愁","某","扭","抖","漚","眸","颼","甌"],"多音字詳情":"區:eu1|kʰi1; 嘍:leu2|leu5; 浮:feu2=|pʰiau2-; 口:heu3|kʰeu3; 紐:neu3|ŋiu3; 繆:meu2|miau3; 扭:neu3|ŋiu3|ŋiu5"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"i"},"字數":6,"佔比":0.0256,"對應字":["痞","取","區","培","句","趣"],"多音字詳情":"區:eu1|kʰi1"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iau"},"字數":10,"佔比":0.0427,"對應字":["調","剖","謬","舀","貿","繆","彪","浮","廖","茂"],"多音字詳情":"調:tiau5|tʰiau2|tʰiau5; 剖:pʰiau3|pʰo5; 繆:meu2|miau3; 浮:feu2=|pʰiau2-"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iu"},"字數":86,"佔比":0.3675,"對應字":["瘤","幽","鞦","朽","游","榴","球","流","邱","劉","鰍","咻","臼","舅","憂","酒","黝","袖","久","鼬","囚","餾","右","宙","誘","悠","友","休","酋","由","九","揉","修","裘","牛","羞","秀","繡","又","溜","秋","遊","柔","臭","逑","丘","宥","柚","瀏","油","韭","幼","揫","留","鷲","遒","疚","究","紐","灸","俅","咎","舊","柩","柳","尤","啾","求","莠","佑","就","郵","救","攸","優","硫","縐","扭","酉","有","肘","玖","謅","泅","皺","猶"],"多音字詳情":"溜:liu1|liu5; 臭:hiu3|tsʰu5; 紐:neu3|ŋiu3; 柳:liu1|liu3; 扭:neu3|ŋiu3|ŋiu5; 有:iu1-|iu3="},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iuk"},"字數":2,"佔比":0.0085,"對應字":["宿","畜"],"多音字詳情":""},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"o"},"字數":1,"佔比":0.0043,"對應字":["剖"],"多音字詳情":"剖:pʰiau3|pʰo5"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"oi"},"字數":1,"佔比":0.0043,"對應字":["莓"],"多音字詳情":""},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"u"},"字數":38,"佔比":0.1624,"對應字":["帚","手","酬","臭","蜉","醜","疇","咮","抽","守","丑","婦","授","母","晝","州","獸","胄","首","壽","籌","售","富","稠","舟","負","紂","周","仇","菩","洲","阜","狩","收","殕","受","部","綢"],"多音字詳情":"臭:hiu3|tsʰu5; 授:su3|su5"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ui"},"字數":2,"佔比":0.0085,"對應字":["馗","龜"],"多音字詳情":""},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uk"},"字數":6,"佔比":0.0256,"對應字":["伏","復","複","祝","仆","覆"],"多音字詳情":"伏:fuk8|pʰuk8; 覆:fuk7|pʰuk7"},{"地點":"梅縣","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ut"},"字數":1,"佔比":0.0043,"對應字":["不"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"au"},"字數":8,"佔比":0.0465,"對應字":["搜","揉","籌","糾","牡","柔","颼","茂"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"i"},"字數":7,"佔比":0.0407,"對應字":["舀","摳","區","句","苟","枸","瞘"],"多音字詳情":"摳:sɔt8|xi1"},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"iɔu"},"字數":22,"佔比":0.1279,"對應字":["又","幽","右","尤","丘","悠","柚","莠","油","友","休","佑","彪","朽","郵","由","游","優","酉","有","謬","猶"],"多音字詳情":"又:jiɔu4|mɔi1; 優:jiɔu3|ʔɔu1"},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"o"},"字數":1,"佔比":0.0058,"對應字":["取"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"u"},"字數":7,"佔比":0.0407,"對應字":["負","副","丑","部","臭","浮","富"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ui"},"字數":2,"佔比":0.0116,"對應字":["培","龜"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uɔŋ"},"字數":1,"佔比":0.0058,"對應字":["耦"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"uʔ"},"字數":8,"佔比":0.0465,"對應字":["伏","宿","祝","婦","仆","畜","漱","覆"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɐu"},"字數":41,"佔比":0.2384,"對應字":["嗽","投","構","猴","奏","酬","候","頭","漏","誘","藕","陋","溝","瘦","摟","兜","耬","扣","豆","偶","鳩","樓","喉","簍","走","侯","愁","斗","厚","透","仇","抖","瘊","漚","鉤","偸","餿","狗","后","紐","逗"],"多音字詳情":"簍:lɐu1|lɔu1"},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔ"},"字數":1,"佔比":0.0058,"對應字":["剖"],"多音字詳情":""},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔi"},"字數":1,"佔比":0.0058,"對應字":["又"],"多音字詳情":"又:jiɔu4|mɔi1"},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔt"},"字數":1,"佔比":0.0058,"對應字":["摳"],"多音字詳情":"摳:sɔt8|xi1"},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɔu"},"字數":75,"佔比":0.436,"對應字":["牛","寇","久","帚","溜","灸","秋","叟","手","舊","究","叩","餾","柩","宙","柳","醜","抽","求","守","拇","嘔","就","歐","授","母","晝","州","謀","獸","韭","畝","榴","球","流","陡","九","簍","壽","救","首","幼","驟","劉","售","某","購","綢","優","留","硫","稠","舟","毆","縐","吼","周","湊","洲","阜","舅","收","憂","修","酒","甌","皺","否","泅","受","戊","袖","鄒","掫","羞"],"多音字詳情":"簍:lɐu1|lɔu1; 優:jiɔu3|ʔɔu1"},{"地點":"儋州白讀","特徵類別":"韻母","特徵值":"流","分組值":{"流":"ɛ"},"字數":1,"佔比":0.0058,"對應字":["調"],"多音字詳情":"調:hɛ2|ʔɛ3"}]
;
// 接收外部传入的 props，模拟 initVue 的参数
const props = defineProps({
  mountTarget: {
    type: String,
    default: '#resultPanelContent'
  },
  data: {
    type: Array,
    default: () => window.latestResults || []
  },
  isCondensed: {
    type: Boolean,
    default: true
  }
});

// ==========================================
// 1. 全局工具函数 (保留原逻辑)
// ==========================================

function clearLoadingMessage_new() {
  const loadingBox = document.getElementById('tempLoadingBox');
  if (loadingBox) {
    loadingBox.remove();
    console.log("已移除加载提示框");
  }
  const table = document.querySelector('#resultTable');
  if (table) {
    table.style.display = 'block';
    console.log("表格显示");
  }
}

function buildReverseMap() {
  const map = {};
  const conflictSet = new Set();
  if (typeof column_values === 'undefined') return { map, conflictSet };
  for (const [field, values] of Object.entries(column_values)) {
    for (const val of values) {
      if (!map[val]) {
        map[val] = field;
      } else {
        conflictSet.add(val);
        map[val] = null;
      }
    }
  }
  return { map, conflictSet };
}

function parseFeatureString(featureStr) {
  const matched_fields = {};
  const usedChars = new Set();
  const { map: reverseMap, conflictSet } = buildReverseMap();
  const allFieldNames = Object.keys(column_values);
  const allValues = Object.values(column_values).flat();

  const hasAnyValue = allValues.some(val => featureStr.includes(val));
  if (!hasAnyValue) {
    return { matched_fields: null, unmatched_fields: allFieldNames };
  }

  const usedFields = new Set();
  for (const field of allFieldNames) {
    const fieldIdx = featureStr.indexOf(field);
    if (fieldIdx !== -1) {
      usedFields.add(field);
      const possibleVal = featureStr.slice(Math.max(0, fieldIdx - 2), fieldIdx);
      let foundVal = null;
      for (let len = 2; len >= 1; len--) {
        const val = possibleVal.slice(-len);
        if (column_values[field].includes(val)) {
          foundVal = val;
          break;
        }
      }
      if (foundVal) {
        matched_fields[field] = foundVal;
        usedChars.add(field);
        usedChars.add(foundVal);
      } else {
        matched_fields[field] = null;
        usedChars.add(field);
      }
    }
  }
  let remaining = featureStr;
  for (const val of usedChars) {
    remaining = remaining.replace(val, '');
  }
  for (let i = 0; i < remaining.length; i++) {
    const char = remaining[i];
    if (!char.trim()) continue;
    const field = reverseMap[char];
    if (field && !matched_fields[field]) {
      matched_fields[field] = char;
      usedFields.add(field);
    }
  }
  const unmatched_fields = allFieldNames.filter(f => !usedFields.has(f));
  return { matched_fields, unmatched_fields };
}

// ==========================================
// 2. 组件核心数据与状态
// ==========================================

const tableData = ref(props.data || []);
// 当 props.data 改变时，更新 tableData
watch(() => props.data, (newData) => {
  tableData.value = newData;
}, { immediate: true });

const visibleRows = ref(20);
const changeDiaplayRows = () => { visibleRows.value = visibleRows.value + 20 }
const totalRows = ref(tableData.value.length);
const panelHeight = ref('auto');
const scrollContainerRef = ref(null); // 滚动容器引用

// 筛选与统计
const availableValues = ref([]);
const availableValueStats = ref([]);
const selectedValues = ref([]);

// Sticky Bar 状态
const currentStickyLocation = ref(''); // 当前吸顶显示的地点
const isFilterOpen = ref(false);       // 筛选下拉框开关
const filterWrapperRef = ref(null);    // 筛选容器引用用于点击外部关闭

// 计算筛选按钮文字
const filterTriggerText = computed(() => {
  if (selectedValues.value.length === 0) {
    return '🎯 篩選';
  } else {
    const recent = selectedValues.value.slice(-3);
    const overflow = selectedValues.value.length > 3 ? '…' : '';
    return `🎯 已選：${recent.join('|')}${overflow}`;
  }
});


// 弹窗状态
const showPopup = ref(false);
const popupData = ref({ location: '', feature: '', value: '' });
const popupRef = ref(null);
const showPopup2 = ref(false);
const popupData2 = ref({ location: '', feature: '', value: '' });
const popupRef2 = ref(null);
const popupPosition = ref({ top: 100, left: 100 });

// 模式状态
const isCondensedMode = ref(props.isCondensed);

// ==========================================
// 3. 事件处理：点击外部关闭弹窗/下拉菜单
// ==========================================
const handleGlobalClick = (event) => {
  // 1. 处理弹窗关闭
  const clickedInsidePopup1 = popupRef.value && popupRef.value.contains(event.target);
  const clickedInsidePopup2 = popupRef2.value && popupRef2.value.contains(event.target);
  const clickedOnFeatureValue = event.target.closest('.feature-value-clickable');

  if (!clickedInsidePopup1 && !clickedInsidePopup2 && !clickedOnFeatureValue) {
    if (showPopup.value) showPopup.value = false;
    if (showPopup2.value) showPopup2.value = false;
  }

  // 2. 处理筛选下拉菜单关闭
  const clickedInsideFilter = filterWrapperRef.value && filterWrapperRef.value.contains(event.target);
  if (!clickedInsideFilter && isFilterOpen.value) {
    isFilterOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});

// ==========================================
// 4. 数据计算属性 (Filter & Sort)
// ==========================================

const filteredData = computed(() => {
  const selected = selectedValues.value;
  return tableData.value.filter(item => {
    const groupValues = item.分組值 || {};
    const feature = Object.keys(groupValues)[0] || '';
    const value = groupValues[feature];

    if (selected.length > 0 && !selected.includes(value)) return false;

    if (!isCondensedMode.value) return true;

    const 字數 = item.字數 || 0;
    const 佔比 = item.佔比 || 0;
    if (佔比 < 0.05 || 字數 === 1) return false;
    if (佔比 > 0.10 || 字數 >= 8) return true;
    else if ((佔比 * 字數) < 0.4) return false;
    return true;
  });
});

const sortedData = computed(() => {
  return filteredData.value.sort((a, b) => {
    if (a.地點 !== b.地點) return a.地點.localeCompare(b.地點);
    const featureA = Object.keys(a.分組值 || {})[0] || '';
    const featureB = Object.keys(b.分組值 || {})[0] || '';
    if (featureA !== featureB) return featureA.localeCompare(featureB);
    return b.佔比 - a.佔比;
  });
});

const displayedData = computed(() => {
  const totalVisibleRows = Math.min(visibleRows.value, sortedData.value.length);
  return sortedData.value.slice(0, totalVisibleRows);
});

// ==========================================
// 5. 交互逻辑 (Trigger & Actions)
// ==========================================

const toggleFilterDropdown = () => {
  isFilterOpen.value = !isFilterOpen.value;
};

const triggerPopup = (type, item, feature, value, e) => {
  const dataObj = {
    location: item.地點,
    feature,
    value: String(value).replace(/·/g, '')
  };
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const popupWidth = 250;
  const popupHeight = 100;
  const offsetTop = 5;
  const offsetLeft = 10;

  // 简单的位置计算，可根据实际需求优化
  const finalPos = {
    top: Math.max(mouseY - popupHeight - offsetTop, 20),
    left: Math.min(Math.max(mouseX + popupWidth / 2 - offsetLeft, 20), window.innerWidth - 0.5 * popupWidth)
  };

  if (type === 'value') {
    popupData.value = dataObj;
    showPopup.value = true;
    showPopup2.value = false;
    popupPosition.value = finalPos;
  } else if (type === 'feature') {
    popupData2.value = dataObj;
    showPopup2.value = true;
    showPopup.value = false;
    popupPosition.value = finalPos;
  }
};

const getFeatureKey = (item) => Object.keys(item.分組值 || {})[0];
const getFeatureVal = (item) => (item.分組值 || {})[getFeatureKey(item)];

const getCorrespondingCharacters = (item) => {
  const multiCharDetails = {};
  if (item.多音字詳情) {
    item.多音字詳情.split(';').forEach(s => {
      const [ch, detail] = s.split(':').map(str => str.trim());
      if (ch && detail) multiCharDetails[ch] = detail;
    });
  }
  if (item.多地位詳情) {
    item.多地位詳情.split(';').forEach(s => {
      const [ch, detail] = s.split(':').map(str => str.trim());
      if (ch && detail) multiCharDetails[ch] = detail;
    });
  }
  return item.對應字.map(ch => ({
    type: 'span',
    props: multiCharDetails[ch]
        ? { class: 'char-vue multi-vue', datatitle: multiCharDetails[ch] }
        : { class: 'char-vue' },
    children: ch
  }));
};

const shouldShowLocation = (item, index) => {
  if (index === 0) return true;
  return item.地點 !== displayedData.value[index - 1].地點;
};

// ==========================================
// 6. 滚动监听与 Sticky Logic (重构版)
// ==========================================
const initScrollObserver = () => {
  const content = scrollContainerRef.value;
  if (!content) return;

  let lastScrollTop = 0;
  const visibleLocations = []; // 闭包存储可见地点

  const handleScroll = (event) => {
    const tableBody = event.target;
    const scrollDirection = tableBody.scrollTop > lastScrollTop ? 'down' : 'up';
    lastScrollTop = tableBody.scrollTop;

    // 触底加载更多
    const isNearBottom = Math.abs(tableBody.scrollHeight - tableBody.scrollTop - tableBody.clientHeight) < 10;
    if (isNearBottom && visibleRows.value < totalRows.value) {
      changeDiaplayRows();
    }

    // 计算当前 Sticky 的地点
    const contentRect = content.getBoundingClientRect();
    const locations = [...content.querySelectorAll('.locations-vue')];
    let lastVisibleLocation = null;

    for (let i = 0; i < locations.length; i++) {
      const rect = locations[i].getBoundingClientRect();
      if (rect.top >= contentRect.top && rect.top <= contentRect.bottom) {
        lastVisibleLocation = locations[i];
      }
    }

    if (lastVisibleLocation) {
      // 更新当前显示的地点
      const locName = lastVisibleLocation.textContent.trim();
      currentStickyLocation.value = locName;

      // 记录历史位置供回滚使用
      if (!visibleLocations.some(l => l.name === locName)) {
        visibleLocations.push({ name: locName, scrollHeight: content.scrollTop });
      }
    } else {
      // 向上滚动时如果没有 visible location，回退到上一个
      if (scrollDirection === 'up') {
        for (let i = visibleLocations.length - 1; i >= 0; i--) {
          const location = visibleLocations[i];
          if (content.scrollTop > location.scrollHeight - 50) {
            currentStickyLocation.value = location.name;
            break;
          }
        }
      }
    }
  };

  content.addEventListener('scroll', handleScroll);
  // 立即触发一次以初始化
  content.dispatchEvent(new Event('scroll'));
};

// ==========================================
// 7. 辅助功能 (Features, Mode, Toggle)
// ==========================================
const getCheckedFeatures = () => {
  return Array.from(document.querySelectorAll('#features-group input:checked'))
      .map(cb => cb.value).join('·') || '（無）';
};

const getModeLabels = () => {
  const modeInput = document.querySelector('input[name="mode"]:checked');
  const mode = modeInput ? modeInput.value : '';
  if (mode === 'p2s') return ['音本位', '字本位'];
  if (mode === 's2p') return ['字本位', '音本位'];
  return ['模式未知', '模式未知'];
};

const toggleColumns = () => {
  isCondensedMode.value = !isCondensedMode.value;
};

// 监听筛选结果为空时自动切换模式
watch([displayedData, selectedValues], ([newDisplayed, newSelected]) => {
  if (newSelected.length > 0 && newDisplayed.length === 0 && isCondensedMode.value) {
    isCondensedMode.value = false;
    if (typeof showToast === 'function') {
      showToast('⚠️ 當前篩選結果在「主體模式」下為空\n已自動切換為「全顯模式」');
    }
  }
});

watch(displayedData, () => {
  nextTick(() => {
    const content = scrollContainerRef.value;
    if (content) {
      // 手动触发一次 scroll 事件，让 Observer 重新计算当前显示的地点
      content.dispatchEvent(new Event('scroll'));
    }
  });
});

// ==========================================
// 8. 初始化 (Mounted)
// ==========================================
onMounted(() => {
  if (props.mountTarget !== '#resultPanelContent') return;
  // 检查是否没有传入外部 data，才使用 window.latestResults
  if (!props.data || props.data.length === 0) {
    tableData.value = window.latestResults || [];
  }

  // 统计特征值占比
  const totals = new Map();
  tableData.value.forEach(item => {
    const groupValues = item.分組值 || {};
    const val = Object.values(groupValues)[0];
    const share = Number(item.佔比) || 0;
    if (val) totals.set(val, (totals.get(val) || 0) + share);
  });

  availableValueStats.value = [...totals.entries()]
      .map(([value, totalShare]) => ({ value, totalShare }))
      .sort((a, b) => b.totalShare - a.totalShare);
  availableValues.value = availableValueStats.value.map(x => x.value);

  // 设置高度
  nextTick(() => {
    const firstRow = document.querySelector('.data-row-vue');
    if (firstRow) {
      const rowHeight = firstRow.offsetHeight;
      panelHeight.value = `${tableData.value.length * rowHeight}px`;
    }
  });

  clearLoadingMessage_new();
  initScrollObserver();
});

// ==========================================
// 9. 弹窗按钮逻辑
// ==========================================
const getModeText = (label, value) => {
  if (label === '字本位') return `中古地位輸入 ${value}`;
  if (label === '音本位') return `待查音節輸入 ${value}`;
  return `未知模式輸入 ${value}`;
};

const shouldApplyFontSize = (label, parseResult) => {
  return (label === '字本位' && parseResult?.matched_fields === null) ||
      (label === '音本位' && parseResult?.matched_fields !== null);
};

// Popup 1 按钮动作 (修正版)
const handlePopupAction = (label) => {
  // 1. 先把 Ref 里的对象取出来
  const currentData = popupData.value;

  // 2. 打印日志调试 (按 F12 看控制台)
  console.log("🔥 准备调用 get_detail");
  console.log("👉 完整数据对象:", currentData);
  console.log("👉 尝试获取 location:", currentData.location);
  console.log("👉 尝试获取 value:", currentData.value); // 这里的 .value 是属性名，不是 Ref 的 .value

  // 3. 安全校验
  if (!currentData || !currentData.value) {
    console.error("❌ 错误：popupData 中没有 value 数据！", currentData);
    return;
  }

  const mountTarget_new = createNewVuePanel();

  // 4. 调用本地的 get_detail 函数
  // 注意：这里传入的是 currentData.value (即字符串值)
  if (typeof get_detail === 'function') {
    get_detail(
        currentData.location,
        currentData.value,  // ✅ 传入具体的字符串值
        false,
        true,
        mountTarget_new
    );
  } else {
    console.error("❌ 严重错误：组件内找不到 get_detail 函数，请检查拼写或定义位置！");
  }

  showPopup.value = false;
};

const getUnmatchedFields = (featureStr) => parseFeatureString(featureStr).unmatched_fields || [];

const handleFeatureFieldClick = (field) => {
  const parseResult = parseFeatureString(popupData2.value.feature);
  const mountTarget_new = createNewVuePanel();
  if (parseResult.matched_fields === null) {
    get_detail(popupData2.value.location, popupData2.value.feature, false, true, mountTarget_new, [field]);
  } else {
    get_detail(popupData2.value.location, `${popupData2.value.feature.replace(/·/g, '')}-${field}`, false, true, mountTarget_new);
  }
  showPopup2.value = false;
};


// ==========================================
// 10. 布局管理器 (Layout Manager - Global)
// ==========================================
// (此处保持原有的 Grid/Drag 逻辑不变，代码同上一版)
const ROW_GAP_PX = 120;
const ROW_BOTTOM_START = 10;
const PANEL_HEIGHT = '50vh';
const EXTRA_EMPTY_ROWS = 3;
const panelSlots = [];
const panelsList = [];
let currentCols = getCurrentCols();
let gridOverlays = [];

function getLayoutSpec() {
  const w = window.innerWidth;
  if (w >= 1200) return { cols: 4, widthPct: 24, gapPct: 1 };
  if (w >= 768)  return { cols: 2, widthPct: 49, gapPct: 1 };
  return            { cols: 1, widthPct: 99, gapPct: 0 };
}
function getCurrentCols() { return getLayoutSpec().cols; }

function slotToRB(idx) {
  const { cols, widthPct, gapPct } = getLayoutSpec();
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const leftPct = col * (widthPct + gapPct);
  const isVertical = cols === 1;

  const pos = { left: `${leftPct}%`, width: `${widthPct}%`, height: isVertical ? '33vh' : PANEL_HEIGHT };
  if (isVertical) pos.top = `${ROW_BOTTOM_START + row * ROW_GAP_PX}px`;
  else pos.bottom = `${ROW_BOTTOM_START + row * ROW_GAP_PX}px`;
  return pos;
}

function slotRectPx(idx) {
  const rb = slotToRB(idx);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const widthPx = (parseFloat(rb.width) / 100) * vw;
  const heightPx = rb.height.endsWith('vh') ? (parseFloat(rb.height) / 100) * vh : parseFloat(rb.height);
  const left = (parseFloat(rb.left) / 100) * vw;
  let top;
  if (rb.top !== undefined) top = parseFloat(rb.top);
  else top = vh - parseFloat(rb.bottom) - heightPx;
  return { left, top, width: widthPx, height: heightPx };
}

function applySlotPosition(container, idx) {
  const rb = slotToRB(idx);
  Object.assign(container.style, {
    position: 'fixed', display: 'flex', transform: 'none',
    right: 'auto', left: rb.left, width: rb.width, height: rb.height, zIndex: ''
  });
  if (rb.top !== undefined) { container.style.top = rb.top; container.style.bottom = 'auto'; }
  else { container.style.bottom = rb.bottom; container.style.top = 'auto'; }
  container.dataset.slotIndex = String(idx);
}

function allocateSlot() {
  for (let i = 0; i < panelSlots.length; i++) if (!panelSlots[i]) return i;
  panelSlots.push(null);
  return panelSlots.length - 1;
}
function releaseSlot(index) { if (index >= 0 && index < panelSlots.length) panelSlots[index] = null; }

function showGridOverlays(origSlotIndex) {
  hideGridOverlays();
  const { cols } = getLayoutSpec();
  const maxIndex = Math.max(panelSlots.length + EXTRA_EMPTY_ROWS * cols - 1, cols - 1);
  const frag = document.createDocumentFragment();
  gridOverlays = [];
  for (let i = 0; i <= maxIndex; i++) {
    if (panelSlots[i] && i !== origSlotIndex) continue;
    const o = document.createElement('div');
    o.className = 'grid-slot';
    const rb = slotToRB(i);
    Object.assign(o.style, {
      position: 'fixed', pointerEvents: 'none', left: rb.left, bottom: rb.bottom,
      width: rb.width, height: rb.height, border: '2px dashed rgba(0,123,255,0.35)',
      borderRadius: '12px', boxSizing: 'border-box', zIndex: 9998, background: 'transparent'
    });
    o.dataset.slotIndex = String(i);
    frag.appendChild(o);
    gridOverlays.push(o);
  }
  document.body.appendChild(frag);
}

function hideGridOverlays() { gridOverlays.forEach(el => el.remove()); gridOverlays = []; }
function highlightGridSlot(idx) {
  gridOverlays.forEach(el => {
    const active = Number(el.dataset.slotIndex) === idx;
    el.style.borderColor = active ? 'rgba(0,123,255,0.9)' : 'rgba(0,123,255,0.35)';
    el.style.boxShadow = active ? '0 0 18px rgba(0,123,255,0.35)' : 'none';
  });
}

function findNearestFreeSlot(cx, cy, origSlotIndex) {
  const { cols } = getLayoutSpec();
  const maxIndex = Math.max(panelSlots.length + EXTRA_EMPTY_ROWS * cols - 1, cols - 1);
  let bestIdx = null; let bestDist = Infinity;
  for (let i = 0; i <= maxIndex; i++) {
    const isFree = !panelSlots[i] || i === origSlotIndex;
    if (!isFree) continue;
    const r = slotRectPx(i);
    const dist = Math.pow((r.left + r.width / 2) - cx, 2) + Math.pow((r.top + r.height / 2) - cy, 2);
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  return bestIdx;
}

function enableDragSnap(container) {
  let dragging = false; let startX = 0, startY = 0; let offsetX = 0, offsetY = 0;
  let origSlot = Number(container.dataset.slotIndex); let currentCandidate = origSlot;
  const preventDefault = e => e.preventDefault();

  const onPointerDown = (e) => {
    if (e.target.closest('.close-btn')) return;
    const rect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
    const timeout = setTimeout(() => {
      dragging = true; container.classList.add('dragging');
      Object.assign(container.style, { right: 'auto', bottom: 'auto', left: `${rect.left}px`, top: `${rect.top}px`, zIndex: 10001 });
      releaseSlot(origSlot); showGridOverlays(origSlot);
      document.body.style.userSelect = 'none';
      document.addEventListener('selectstart', preventDefault); document.addEventListener('dragstart', preventDefault);
      document.addEventListener('mousemove', onPointerMove); document.addEventListener('mouseup', onPointerUp);
    }, 300);
    document.addEventListener('mouseup', function cancelEarly() { clearTimeout(timeout); document.removeEventListener('mouseup', cancelEarly); });
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    Object.assign(container.style, { left: `${e.clientX - offsetX}px`, top: `${e.clientY - offsetY}px` });
    const rect = container.getBoundingClientRect();
    const target = findNearestFreeSlot(rect.left + rect.width/2, rect.top + rect.height/2, origSlot);
    if (target !== null) { currentCandidate = target; highlightGridSlot(target); }
  };
  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false; container.classList.remove('dragging'); hideGridOverlays();
    document.removeEventListener('mousemove', onPointerMove); document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener("selectstart", preventDefault); document.removeEventListener("dragstart", preventDefault);
    document.body.style.userSelect = '';
    const snapTo = currentCandidate ?? origSlot;
    if (snapTo >= panelSlots.length) for(let i=0; i < snapTo - panelSlots.length + 1; i++) panelSlots.push(null);
    applySlotPosition(container, snapTo); panelSlots[snapTo] = container;
    container.dataset.slotIndex = String(snapTo); origSlot = snapTo; container.style.zIndex = '';
  };
  container.addEventListener('mousedown', onPointerDown);
}

function createNewVuePanel() {
  const slotIndex = allocateSlot();
  const id = `vue_detail_panel_${Date.now()}`;
  const container = document.createElement('div');
  container.id = id; container.classList.add('query-detail-panel');
  applySlotPosition(container, slotIndex);
  const content = document.createElement('div'); content.classList.add('panel-content');
  container.appendChild(content);
  const closeBtn = document.createElement('button'); closeBtn.classList.add('close-btn');
  closeBtn.innerText = '×';
  closeBtn.addEventListener('click', () => {
    content.innerHTML = ''; container.remove();
    releaseSlot(Number(container.dataset.slotIndex));
    const pIdx = panelsList.indexOf(container); if (pIdx >= 0) panelsList.splice(pIdx, 1);
  });
  container.appendChild(closeBtn);
  document.body.appendChild(container);
  panelSlots[slotIndex] = container; panelsList.push(container);
  enableDragSnap(container);
  return `#${id} .panel-content`;
}

// ② debounce：消抖函數
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ③ showToast：watch 里会调用（条件触发时）
function showToast(message, color) {
  const toast = document.getElementById("toast");
  // 替換換行符為 <br>
  toast.innerHTML = message.replace(/\n/g, "<br>");

  // 如果提供了颜色，就使用；否则保留原样
  if (color) {
    toast.style.color = color;
  } else {
    toast.style.color = ""; // 恢复默认样式表颜色
  }

  toast.className = "show";

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 5000);
}


// ④ get_detail：弹窗按钮会调用（用于新面板加载详情）
async function get_detail(location,feature_value,bool=false,vue = false,
                          mountTarget, group_inputs = []){
  if(!location || !feature_value){
    return
  }
  let status_inputs = [];
  let pho_values = [""];
  let regions = [""];
  let mode = document.querySelector('input[name="mode"]:checked').value;
  const features = Array.from(document.querySelectorAll('#features-group input:checked')).map(cb => cb.value);
  // console.log("feature_value",features)
  const locations = Array.isArray(location)
      ? location
      : [location];
  const region_mode = window.regionusing;
  // console.log("locations",locations)
  if (bool) {
    if (mode === 'p2s') {
      // ❗检查是否是合法汉字（+允许 -）
      if (!/^[\u4e00-\u9fa5\-\s]+$/.test(feature_value)) {
        status_inputs = []; // 清空
      } else {
        status_inputs = [feature_value];
      }
      mode = 's2p';
    } else if (mode === 's2p') {
      pho_values = [feature_value];
      mode = 'p2s';
    }
  } else {
    if (mode === 's2p') {
      if (!/^[\u4e00-\u9fa5\-\s]+$/.test(feature_value)) {
        status_inputs = [];
      } else {
        status_inputs = [feature_value];
      }
    } else if (mode === 'p2s') {
      pho_values = [feature_value];
    }
  }

  const payload = {
    mode,
    locations,
    regions,
    features,
    status_inputs,
    group_inputs,
    pho_values,
    region_mode
  };
  // console.log(payload);
  try {
    const token = localStorage.getItem("ACCESS_TOKEN");  // 或從你儲存 token 的地方取出
    const res = await window.fetch(`${window.API_BASE}/phonology`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})  // ✅ 若存在則加入 Authorization
      },
      body: JSON.stringify(payload)
    });
    if (res.ok && token) {
      await update_userdatas_bytoken(token)
    }

    const result = await res.json();

    if (!res.ok || !result.success || !Array.isArray(result.results)) {
      console.error("❌ 回傳錯誤", result);
      showToast("輸入的中古地位不正確！",'darkred');
      return;
    }
    const data = result.results;
    // 清除字數为0的數據
    window.latestdetailResults = data.filter(item => item.字數 !== 0);
    // console.log(window.latestdetailResults);
    if(!vue) {
      await js_table_render(true, bool);
      window.latestdetailResults = [];
    }
    else{
      // console.log("vue")
      await initVue(mountTarget,window.latestdetailResults,false);
    }
  } catch (error) {
    console.error("分析失敗", error);
    // 优先显示 error.response.detail（如果有）
    if (error.response && error.response.detail) {
      alert("❌ 错误信息：" + error.response.detail);
    } else {
      // 如果没有 `detail` 字段，显示 error.message
      alert("❌ 请求后端错误：" + error.message);
    }
    clearLoadingMessage();
  }
}

// 表格模式渲染總函數
async function js_table_render(small = false, number = false) {
  if (small) {
    let latestResults = window.latestdetailResults;
    if (!Array.isArray(latestResults) || latestResults.length === 0) {
      showToast("⚠️ 沒有有效的結果可渲染");
      clearLoadingMessage();
      return;
    }

    const tableId = number ? "detailTable2" : "detailTable";
    const resultPanelContent = document.getElementById(
        number ? "display-detail2" : "display-detail"
    );

    const resultTable = createResultTable(tableId, resultPanelContent);
    renderResults(latestResults, resultTable);

  } else {
    let latestResults = window.latestResults;
    if (!Array.isArray(latestResults) || latestResults.length === 0) {
      showToast("⚠️ 沒有有效的結果可渲染");
      clearLoadingMessage();
      return;
    }

    const resultPanelContent = document.getElementById("resultPanelContent");
    const resultTable = createResultTable("resultTable", resultPanelContent);

    setLoadingMessage("📊 表格整理中…");
    const renderStart = performance.now();
    renderResults(latestResults);
    const renderEnd = performance.now();
    console.log(`🖥️ 表格渲染耗時：${(renderEnd - renderStart).toFixed(2)} ms`);
    clearLoadingMessage();
  }
}

const handleResize = debounce(() => {
  const spec = getLayoutSpec(); if (spec.cols === currentCols) return;
  currentCols = spec.cols;
  const alivePanels = panelsList.slice(); panelSlots.length = 0; for(let i=0; i<alivePanels.length; i++) panelSlots.push(null);
  alivePanels.forEach((container, i) => { applySlotPosition(container, i); panelSlots[i] = container; container.dataset.slotIndex = String(i); });
}, 150);
window.addEventListener('resize', handleResize);

</script>

<style scoped>
.Panel{
  position: fixed;
  resize: both;        /* ✅ 允许横向和纵向都可以调整大小 */
  overflow: auto;      /* ✅ 必须有 overflow 才能启用 resize */
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1;
  top: 10dvh;
  left: 0vw;
  width: 100dvw;
  height: 90dvh;
}
@media (orientation: portrait) {
  .Panel{
    top:16dvh;
    height: 84dvh;
  }
}

/* 🍏 Apple 风格液态玻璃弹窗背景和基本样式 */
.query-detail-panel {
  position: fixed;
  resize: both;
  overflow: auto;
  top: 50%;
  left: 0.5%;
  transform: translateY(-50%);
  width: 40%;
  height: 60vh;

  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(5px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 0.5px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.1);

  display: none;
  flex-direction: column;
  padding: 12px 0;
  z-index: 90000;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
  transition: all 0.4s ease;
  opacity: 1;
}

.query-detail-panel2 {
  position: fixed;
  resize: both;
  overflow: auto;
  top: 50%;
  left: 1%;
  transform: translateY(-50%);
  width: 21%;
  height: 60vh;

  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(5px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 0.5px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.1);

  display: none;
  flex-direction: column;
  padding: 12px 0;
  z-index: 90000;
  font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
  transition: all 0.4s ease;
  opacity: 1;
}

/* 鼠标悬停时：提升亮度 + 发光 + 不透明 */
.query-detail-panel:hover, .query-detail-panel2:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3), 0 0 20px rgba(0, 123, 255, 0.4);
  border-color: rgba(0, 123, 255, 0.6);
  opacity: 1;
  transform: translateY(-50%) scale(1.01);
  transition: all 0.3s ease;
}

/* 弹窗的基本样式 */
.popup-vue {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(5px) saturate(180%);
  -webkit-backdrop-filter: blur(5px) saturate(180%);
  padding: 6px 10px;
  max-width: 300px;
  border-radius: 12px;
  box-shadow: inset 0 0 1px rgba(255, 255, 255, 0.3), 0 4px 14px rgba(0, 0, 0, 0.2), 0 0 8px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 90000;
  text-align: center;
  color: #222;
  font-weight: 500;
  opacity: 1;
  visibility: visible;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.popup-vue p {
  font-size: 14px;
  font-weight: bold;
  margin-top: 1px;
  margin-bottom: 2px;
  line-height: 1.2;
  display: block;
}

.popup-vue span {
  font-size: 13px;
  font-weight: normal;
  margin-top: 1px;
  margin-bottom: 1px;
  line-height: 1.1;
  display: block;
}

/* 弹窗入场动画 */
.popup-animated {
  animation: popup-bounce-in 0.4s ease-out forwards;
}

@keyframes popup-bounce-in {
  0% {
    transform: translateX(-50%) translateY(0px) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateX(-50%) translateY(10px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(20px) scale(1);
  }
}

/* 🌀 鼠标悬停时：提升亮度 + 发光 + 不透明 */
.feature-value-clickable {
  cursor: pointer;
  text-decoration: none;
  color: #007bff;
  display: inline-block;
  transition: transform 0.2s ease, color 0.2s ease, text-shadow 0.3s ease;
}

.feature-value-clickable:hover {
  transform: scale(1.3);
  text-decoration: underline;
  color: #3c8dbc;
  text-shadow: 0 0 8px rgba(60, 141, 188, 0.6);
}

/* 各种弹窗的关闭按钮 */
.close-btn {
  position: absolute;
  top: 8px;
  right: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  font-size: 20px;
  color: #444;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  z-index: 999;
}

.close-btn:hover {
  color: #000;
  transform: scale(1.4) rotate(10deg);
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.4), 0 0 14px rgba(255, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.3);
}

.close-btn:active {
  transform: scale(0.9);
  box-shadow: 0 0 18px rgba(255, 0, 0, 0.6);
}

/* 地图、特征点击小弹窗 */
.popup,
.popup2 {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05));
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  padding: 6px 10px;
  max-width: 180px;
  border-radius: 12px;
  box-shadow: inset 0 0 1px rgba(255,255,255,0.3), 0 4px 14px rgba(0, 0, 0, 0.2), 0 0 8px rgba(255,255,255,0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 99999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease;
  text-align: center;
  color: #222;
  font-weight: 500;
}

.popup.active {
  opacity: 1;
  z-index: 99999;
  visibility: visible!important;
  transform: translateX(-50%) translateY(20px);
}

.popup-content {
  font-family: 'Arial', sans-serif;
  color: #333;
  text-align: center;
}

.popup h4 {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px;
}

.popup p,.popup2 p {
  margin: 2px 0;
  font-size: 13px;
  padding: 0;
  border-radius: 5px;
  font-weight: bold;
  display: block;
}

.popup ul,.popup2 ul {
  padding: 0;
  list-style-type: none;
  margin: 0;
}

.popup li ,.popup2 li {
  margin: 2px 0;
  font-size: 12px;
  font-weight: bold;
  padding: 1px 6px;
  background: linear-gradient(135deg, rgba(240,240,240,0.4), rgba(255,255,255,0.2));
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1), inset 0 0 1px rgba(255,255,255,0.5);
  color: #333;
}

.popup-close-btn {
  background-color: #007aff;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.popup-close-btn:hover {
  background-color: #005bb5;
}

/* 声调弹窗 */
.popup-tones {
  position: absolute;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  padding: 15px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 0 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  min-width: 150px;
  font-size: 14px;
  color: #000000;
  z-index: 10000;
  display: none;
  white-space: pre-wrap;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.popup-tones h3 {
  margin-top: 0;
  font-size: 16px;
  color: #333;
}

#toast {
  visibility: hidden;
  min-width: 220px;
  max-width: 80%;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #c28f00;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  text-align: center;
  border-radius: 12px;
  padding: 20px 28px;
  position: fixed;
  z-index: 99999;
  left: 50%;
  top: 70%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  line-height: 1.5;
  opacity: 0;
  transition: opacity 0.4s ease, transform 0.4s ease;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}

#toast.show {
  visibility: visible;
  opacity: 1;
}
.panel-content {
  flex: 1;
  overflow: visible;
  padding: 13px;
  box-sizing: border-box;
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 15px;  /* 自動控制表單行間距 */
  /*flex-grow: 1;  !* 使表單填滿可用空間 *!*/
  overflow-y: auto;  /* 如果內容過多，可以滾動 */
}
/* 針對 Vue 渲染的內容進行樣式設置 */

/* 對應字的樣式 */
.char-vue {
  display: inline-flex;
  padding: 1px 3px; /* 小的內邊距，避免字之間太擁擠 */
  margin-right: 2px; /* 右邊間隔 */
  font-size: 15px; /* 字體大小 */
  color: #333; /* 普通字顏色 */

  /*cursor: pointer; !* 鼠標懸停時顯示可點擊狀態 *!*/
}

/* 多音字的特殊樣式 */
.char-vue.multi-vue {
  color: darkred; /* 多音字顏色，紅色以區別 */
  font-weight: bold; /* 讓多音字加粗 */
  position: relative; /* 使得 tooltip 可相對定位 */
  cursor: pointer; /* 鼠標懸停時顯示可點擊狀態 */
}

/* 多音字的 hover 提示樣式 */
.char-vue.multi-vue:hover {
  background-color: #f9f9f9; /* 背景色變化 */
  border-radius: 4px; /* 圓角效果 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 輕微陰影 */
}

/* 提示框樣式 */
.char-vue.multi-vue[datatitle]:hover::after {
  content: attr(datatitle); /* 顯示 title 屬性的內容 */
  position: absolute;
  bottom: 100%; /* 顯示在字上方 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  background-color: #333; /* 提示框背景 */
  color: #fff; /* 文字顏色 */
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap; /* 防止文本換行 */
  font-size: 12px; /* 提示框的字體 */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease; /* 動畫效果 */
}



/* 鼠標懸停時顯示提示框 */
.char-vue.multi-vue[datatitle]:hover::after {
  opacity: 1;
  visibility: visible;
  z-index: 10000;
}

/* 針對整體的字體和排版 */
.data-row-vue {
  margin-bottom: 15px; /* 行間距 */
  display: block; /* 默認使用垂直排列 */
  text-align: center
}


/* feature-row 设置为 flex 确保在同一行显示 */
.data-row-vue .feature-row {
  display: flex;  /* 确保整个行显示 */
  justify-content: space-between; /* 左右分开 */
  align-items: center; /* 垂直居中 */
  width: 100%; /* 占满一整行 */
  flex-wrap: nowrap; /* 防止换行 */
  white-space: nowrap;  /* 确保所有子元素都在一行显示 */
}

/* 子元素（p）使用 inline-block 排列，避免换行 */
.data-row-vue .feature-row p {
  display: inline-block;
}

/* 特徵和值的顯示 */
.data-row-vue .feature-row p:nth-child(1) {
  left:auto;
  width: 60%;  /* 特徵-值占据 80% 的宽度 */
  font-size: 18px;
  text-align: left;  /* 字數/佔比靠右 */
  font-weight: bold; /* 讓特徵-值加粗 */
  color: #007bff; /* 使用藍色顯示特徵-值 */
  margin: 1px;
}

.data-row-vue .feature-row p:nth-child(2) {
  font-size: 13px;
  font-style: italic; /* 讓字數/佔比顯示為斜體 */
  text-align: right;  /* 字數/佔比靠右 */
  width: 40%;  /* 字數/佔比占据 20% 的宽度 */
  /*margin-left: auto;*/
  color: #6c757d; /* 較淡的顏色 */
  margin: 1px;
}

.characters-vue {
  text-align: center;
  font-size: 15px;
  border: 2px solid #333; /* 添加边框，2px 宽度，颜色为 #333 */
  padding: 5px; /* 增加内边距，让边框更清晰 */
  display: inline-block; /*隱藏模式改這裡！！ */
  margin-top: 0; /* 设置上边距为 0，确保没有额外的空间 */
}

.characters-vue-condensed {
  text-align: center;
  font-size: 15px;
  border-bottom: 2px solid #333; /* 添加边框，2px 宽度，颜色为 #333 */
  padding: 5px; /* 增加内边距，让边框更清晰 */
  display: flex; /*隱藏模式改這裡！！ */
  margin-top: 0; /* 设置上边距为 0，确保没有额外的空间 */
}

.locations-vue{
  font-size: 20px;
  font-family: "SimHei", "黑体", sans-serif;
  font-weight: bold;
  margin-top: 20px; /* 设置上边距加大为 20px，可以根据需要调整 */
  margin-bottom: 0; /* 设置下边距为 0，确保没有额外的空间 */
}

#resultPanelContent {
  overflow-y: auto;
  height: 500px;
}

/* sticky 標籤 */
.sticky-label2 {
  position: absolute;  /* 固定定位，使元素浮动 */
  bottom: 0;        /* 固定在页面底部 */
  background: rgba(255, 255, 255, 0.3); /* 半透明背景 */
  left: 0;         /* 左对齐 */
  right: 0;        /* 右对齐 */
  /*width: 100%;     !* 让它充满整个父元素的宽度 *!*/
  backdrop-filter: blur(2px); /* 毛玻璃效果 */
  padding: 9px 18px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid rgba(204, 204, 204, 0.6); /* 边框颜色稍微透明 */
  z-index: 999;
  color: #333;
  display: flex;              /* 让内容横向排列 */
  align-items: center;        /* 垂直置中 */
  justify-content: space-between;  /* 左右分散，或用 start + margin-left 可微调 */
  border-radius: 10px;        /* 增加圆角效果 */
  transition: background 0.3s ease, box-shadow 0.3s ease; /* 动画过渡效果 */
}

/* hover 效果 */
.sticky-label2:hover {
  background: rgba(240, 240, 240, 0.9); /* 改变背景色，增加透明度 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
  /*transform: scale(1.05); !* 微小放大效果 *!*/
}

/* 滚动时透明度变化 */
.sticky-label2.sticky-scrolled {
  background: rgba(255, 255, 255, 0.1); /* 滚动时增加透明度 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); /* 滚动时阴影更强 */
}

/* 让毛玻璃效果更加明显 */
.sticky-label2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  z-index: -1; /* 使背景色和毛玻璃效果在内容后面 */
}
.sticky-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%; /* 匹配 sticky-label2 高度 */
  position: relative;
}

/* 🌟 筛选容器（水平居中） */
.stickybar-filter-wrapper {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  z-index: 1;
}

/* 🎯 触发按钮 */
.stickybar-filter-trigger {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 4px 12px;
  color: #007aff;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  border: 1px solid rgba(0, 122, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.25s ease;
}

.stickybar-filter-trigger:hover {
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.4);
}

/* 📋 下拉菜单 */
.stickybar-filter-dropdown {
  position: absolute;
  bottom: 110%; /* 向上弹出 */
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 8px;
  display: none;
  max-height: 200px;
  overflow-y: auto;
  min-width: 70px;
  z-index: 9999;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ✅ 显示状态 */
.stickybar-filter-dropdown.open {
  display: block;
}

/* ✅ 滚动条 */
.stickybar-filter-dropdown::-webkit-scrollbar {
  width: 6px;
}
.stickybar-filter-dropdown::-webkit-scrollbar-thumb {
  background-color: rgba(0, 122, 255, 0.3);
  border-radius: 3px;
}

/* 每项 label */
.stickybar-filter-option {
  display: flex;
  align-items: center;
  margin: 6px 0;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.stickybar-filter-option:hover {
  color: #007aff;
}

.stickybar-filter-option input[type="checkbox"] {
  margin-right: 6px;
}



/*!* 左侧 20% 的 span *!*/
/*.sticky-label2 span {*/
/*    position: absolute;  !* 绝对定位 *!*/
/*    left: 0;             !* 将它固定在左侧 *!*/
/*    width: 15%;          !* 限制宽度为父元素的 20% *!*/
/*    padding: 6px 12px;   !* 填充 *!*/
/*    border: 2px solid rgba(204, 204, 204, 0.6);  !* 边框 *!*/
/*    border-radius: 5px;  !* 圆角效果 *!*/
/*    background: rgba(255, 255, 255, 1);  !* 半透明背景 *!*/
/*    color: #333;         !* 文字颜色 *!*/
/*    display: flex;*/
/*    justify-content: center;*/
/*    align-items: center;*/
/*    transition: background 0.3s, border-color 0.3s;  !* hover 效果的平滑过渡 *!*/
/*}*/


.login-tabs {
  display: inline-flex;
  border: 1px solid #d0d0d0;
  border-radius: 12px;
  padding: 2px;
  background-color: #f0f0f5;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.login-tabs button {
  appearance: none;
  background: none;
  border: none;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
  color: #333;
}

.login-tabs button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.login-tabs button.active {
  background-color: white;
  color: #000;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  font-weight: 600;
}

.api-log-list {
  margin: 4px 0 0 16px;
  padding: 0;
}

.api-log-item {
  list-style: none;
  font-size: 15px;
  /*font-weight: lighter;*/
  color: #333;
  padding: 0 8px;
  border-radius: 4px;
  cursor: default;
  transition: background-color 0.2s, color 0.2s;
  margin:0;
}

.api-log-item:hover {
  background-color: #f0f0f0;
  color: #409EFF;
  font-weight: bold;
}

.query-detail-panel.border-breath {
  animation: border-breath 1.5s ease-in-out;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.6);
  border: 2px solid transparent; /* 防止 layout shift */
  border-radius: 12px;
}

@keyframes border-breath {
  0% {
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.6);
  }
  50% {
    box-shadow: 0 0 12px 4px rgba(0, 122, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.6);
  }
}


/* 整个容器样式 */
.custom-switch-container {
  position: absolute;
  /*top: 50%;*/
  right: 5%;  /* 定位到父容器的 70% 位置 */
  transform: translateX(-50%);  /* 居中对齐 */
  display: flex;
  align-items: center;  /* 垂直居中 */
  justify-content: center;  /* 水平居中 */
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  /*width: 100%;  !* 确保容器占满父容器 *!*/
  /*height: 100%;  !* 使容器高度填充父容器 *!*/
}

/* 自定义开关容器 */
.custom-switch {
  position: relative;
  cursor: pointer;
  width: 50px;
  height: 30px;
  background-color: #ccc;  /* 灰色背景 */
  border-radius: 30px;  /* 圆角效果 */
  display: flex;
  align-items: center;  /* 垂直居中 */
  justify-content: center;  /* 水平居中 */
  transition: background-color 0.3s ease;
}

/* 小圆点 */
.custom-slider:before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  background-color: white;
  border-radius: 50%;  /* 小圆点 */
  transition: all 0.3s ease;
}


.custom-switch.open .custom-slider:before {
  transform: translateX(20px); /* 小圆点向右移动 */
}

/* 增加炫酷的hover效果：仅背景变化 */
.custom-switch:hover {
  background-color: dimgray; /* 悬停时背景变为绿色渐变 */
  box-shadow: 0 0 10px 4px rgba(0, 123, 255, 0.7);  /* 添加发光效果 */
  transform: scale(1.3); /* 悬停时轻微放大 */
}

/* 悬停时小圆点保持原位置，不移动 */
.custom-switch:hover .custom-slider:before {
  background-color: white;  /* 保持白色滑块 */
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);  /* 添加小圆点的发光效果 */
}

/* 开启状态时的背景和小圆点位置 */
.custom-switch.open {
  background-color: #007aff;  /* 苹果蓝 */
  animation: blueGlow 2s infinite ease-in-out;
}

/* 开启状态下的悬停效果：背景颜色变化 + 炫酷渐变 */
.custom-switch.open:hover {
  background: linear-gradient(135deg, #00bfff, #66ccff); /* 温和蓝色渐变 */
  transform: scale(1.3); /* 悬停时按钮放大 */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2); /* 适度阴影 */
}

/* 蓝色发光动画 */
@keyframes blueGlow {
  0% {
    box-shadow:
        0 0 5px rgba(0, 122, 255, 0.4),
        0 0 10px rgba(0, 122, 255, 0.6),
        0 0 20px rgba(0, 122, 255, 0.8),
        0 0 30px rgba(0, 122, 255, 0.9);
  }
  50% {
    box-shadow:
        0 0 10px rgba(102, 204, 255, 0.6),
        0 0 20px rgba(102, 204, 255, 0.8),
        0 0 30px rgba(102, 204, 255, 1),
        0 0 40px rgba(102, 204, 255, 1);
  }
  100% {
    box-shadow:
        0 0 5px rgba(0, 122, 255, 0.4),
        0 0 10px rgba(0, 122, 255, 0.6),
        0 0 20px rgba(0, 122, 255, 0.8),
        0 0 30px rgba(0, 122, 255, 0.9);
  }
}



/* 开启状态下滑块悬停效果 */
.custom-switch.open:hover .custom-slider:before {
  /*background-color: #fff;  !* 保持白色滑块 *!*/
  /*transform: scale(1.1); !* 滑块轻微放大 *!*/
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* 添加阴影 */
}


/* 按钮内的文字 */
.switch-text {
  color: black;  /* 黑色文字 */
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;  /* 文字大写 */
  position: absolute;
  z-index: 1;  /* 确保文字位于圆点之上 */
  transition: transform 0.3s ease, color 0.3s ease;
  pointer-events: none;  /* 禁止文字的点击事件 */
  top: 50%;  /* 垂直居中 */
  transform: translateY(-50%);  /* 通过 translateY 将文字向上移动自身高度的 50% */
}


/* 开启状态时文字的颜色变化 */
.custom-switch.open .switch-text {
  color: black;  /* 保持文字为黑色 */
  transform: translateX(-25px) translateY(-50%);  /* 让文本略微移动并确保上下居中 */
  top: 50%;  /* 确保文字垂直居中 */
  position: absolute;
  z-index: 1;  /* 确保文字位于圆点之上 */
  pointer-events: none;  /* 禁止文字的点击事件 */
  transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;

  /* 动态光环旋转效果 */
  animation: glowing 2s infinite linear;
  white-space: nowrap;  /* 禁止换行 */
}
.mini-button {
  margin-top: 2px;
  padding: 1px 2px;
  font-size: 11px;
  background-color: #007aff;  /* 苹果蓝 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.mini-button:hover {
  background-color: #005fcc;  /* 深苹果蓝 */
  transform: scale(1.2);
}


</style>

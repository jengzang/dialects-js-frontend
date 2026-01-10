// 启用或禁用地图点击事件
function enableMapClickForCoordinates() {
    // 如果面板展开，则监听地图点击事件
    if (window.isPanelOpen) {
        // 监听地图点击事件，获取经纬度
        map.on('click', function(e) {
            const lng = e.lnglat.getLng();
            const lat = e.lnglat.getLat();

            console.log(`您点击的坐标是：经度 ${lng}, 纬度 ${lat}`);

            // 自动填入经纬度输入框
            document.getElementById("coordinates-input").value = `${lng}, ${lat}`;
        });
    } else {
        // 如果面板收起，则移除地图点击事件
        map.off('click');
    }
}

// 监听加号按钮点击事件，切换面板展开状态
document.getElementById("expandButton").addEventListener("click", function() {
    const panel = document.getElementById("rightPanel");
    const button = document.getElementById("expandButton");

    // 切换面板的展开/收起状态
    panel.classList.toggle("open");
    button.classList.toggle("open");

    // 更新面板展开状态
    window.isPanelOpen = !window.isPanelOpen;

    // 根据面板展开状态激活或停用地图点击
    enableMapClickForCoordinates();  // 判断是否启用点击地图功能
});

// 获取 "地点（简称）" 输入框和提示框元素
const inputadd = document.getElementById("location-input");  // “地点（简称）”输入框的 ID
const suggestionadd = document.getElementById("inlineSuggestion");  //
const regionInput = document.getElementById("region-input");  // 音典分区输入框

// 监听输入框的 keyup 事件
inputadd.addEventListener("keyup", debounce(locations2regions, 300));
async function locations2regions(){
    if (!window.isPanelOpen) {
        return;  // 如果面板没有展开，则不执行输入框逻辑
    }
    const { queryStart, cursorPos, value } = getQueryStart(inputadd);

    const query = value.slice(queryStart, cursorPos).trim();

    if (!query) {
        suggestionadd.style.display = "none";
        return;
    }
    const token = localStorage.getItem("ACCESS_TOKEN")
// 请求匹配的地名数据
    fetch(`${window.API_BASE}/batch_match?input_string=${encodeURIComponent(query)}&filter_valid_abbrs_only=false`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    })
        .then(res => res.json())
        .then(results => {
            if (!results.length) {
                suggestionadd.style.display = "none";
                return;
            }

            const r = results[0];
            suggestionadd.innerHTML = "";

                const allValues = value.split(/[ ,;/，；、\n\t]+/).filter(Boolean);
                const currentQuery = value.slice(queryStart, cursorPos).trim();
                const exclusionSet = new Set(allValues.filter(v => v !== currentQuery));
                const filtered = Array.from(new Set(r.items)).filter(item => !exclusionSet.has(item));

                if (!filtered.length) {
                    suggestionadd.style.display = "none";
                    return;
                }

                // 渲染过滤后的建议项
                filtered.forEach(item => {
                    const div = document.createElement("div");
                    div.className = "suggest-line";
                    div.textContent = item;

                    // 绑定点击事件，插入选中的地点（简称）到输入框
                    div.addEventListener("mousedown",  async (e) => {
                        e.preventDefault();  // 阻止默认行为，防止焦点丢失

                        const before = value.slice(0, queryStart);
                        const after = value.slice(cursorPos);
                        inputadd.value = before + item + after;  // 替换为选中的建议项

                        // 更新光标位置
                        const newPos = before.length + item.length;
                        inputadd.setSelectionRange(newPos, newPos);
                        suggestionadd.style.display = "none";  // 关闭建议框
                        // 发送请求到后端获取音典分区
                        try {
                            const token = localStorage.getItem("ACCESS_TOKEN")
                            // 使用 GET 请求
                            const response = await fetch(`${window.API_BASE}/get_regions?input_data=${encodeURIComponent(item)}`, {
                                method: "GET",  // 使用 GET 请求
                                headers: { "Content-Type": "application/json",
                                    ...(token ? { Authorization: `Bearer ${token}` } : {})}
                            });

                            // 确保返回的是 JSON 格式
                            const data = await response.json();

                            // 检查返回的对象是否包含 "音典分區" 键
                            if (data && data["音典分區"]) {
                                regionInput.value = data["音典分區"];  // 将返回的音典分区赋值给输入框
                            } else {
                                regionInput.value = "未找到对应的音典分区";  // 如果没有找到音典分区，显示提示
                            }
                        } catch (error) {
                            console.error("请求失败:", error);
                            regionInput.value = "请求失败，请稍后再试";  // 如果请求失败，显示错误信息
                        }
                    });

                    suggestionadd.appendChild(div);
                });


            // 显示建议框，位置根据输入框计算
            const rect = inputadd.getBoundingClientRect();
            suggestionadd.style.left = `${rect.left + window.scrollX}px`;
            suggestionadd.style.top = `${rect.bottom + 6 + window.scrollY}px`;
            suggestionadd.style.display = "block";
        });
};

// 🔻 自動隱藏：若输入框失去焦点（但点击 suggestionadd 例外）
inputadd.addEventListener("blur", () => {
    setTimeout(() => {
        suggestionadd.style.display = "none";
    }, 200);
});

// 用戶提交自定義數據
document.getElementById("infoForm").addEventListener("submit", async function (event) {
    event.preventDefault();  // 防止表單的默認提交行為
    // 🔒 登錄攔截
    const auth = await ensureAuthenticated(event);
    if (!auth){
        // console.log("攔截")
        showToast("💡 提交個人數據需登錄！")
    }  // 🚫 未登入 → 已經 preventDefault 並提示，直接退出
    else
    {
        // 獲取表單元素
        const location_submit = document.getElementById("location-input").value.trim();
        const region_submit = document.getElementById("region-input").value.trim();
        const coordinates = document.getElementById("coordinates-input").value.trim();
        const feature = document.getElementById("feature-input").value.trim();
        const value = document.getElementById("value-input").value.trim();
        const description = document.getElementById("description-input").value.trim();

        // 表單驗證
        if (!location_submit || !region_submit || !coordinates || !feature || !value) {
            showToast("❌ 所有字段（除說明）必須填寫！",'darkred');
            return;  // 如果有空的字段，則不提交
        }

        // 構建表單數據對象
        const formData = {
            location: location_submit,
            region: region_submit,
            coordinates: coordinates,
            feature: feature,
            value: value,
            description: description || null // 如果說明為空，設置為 null
        };
        const token = localStorage.getItem("ACCESS_TOKEN")
        // console.log("準備發給後端")
        // 發送數據到後端（使用 fetch API）
        fetch(`${window.API_BASE}/submit_form`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                // 根據後端返回的結果處理
                if (data.success) {
                    const locations_input = document.getElementById('locations').value.trim().split(/\s+/);
                    const regions_input = document.getElementById('regions').value.trim().split(/\s+/);
                    // 检查 locations_input 和 location_submit
                    function checkLocation() {
                        return locations_input.includes(location_submit);
                    }
                    // 检查 regions_input 和 region_submit
                    function checkRegion() {
                        // 拆分 region_submit
                        let regionParts = region_submit.split('-');
                        // 检查 region_submit 中的每一部分是否能与 regions_input 中的任何元素匹配
                        return regions_input.some(region => {
                            // 将 regions_input 中的元素按 - 拆分成多个部分
                            let regionPartsInRegion = region.split('-');
                            // 检查 region_submit 的任意一部分是否能在 regions_input 中找到
                            return regionParts.some(part => regionPartsInRegion.includes(part));
                        });
                    }
                    const customOpen = window.isCustomOn;
                    let HowToClick = "🎉👌";
                    let clickTimes = 0; // 默认点击次数为0

                    if (customOpen) {
                        // HowToClick = "<br>請雙擊自定義按鈕(關閉再打開)<br>進而刷新數據並查看<br>按鈕在地圖頁面的頂部";
                        clickTimes = 2; // 如果 customOpen 为 true，点击两次
                    } else {
                        // HowToClick = "<br>請打開自定義按鈕，進而查看數據<br>按鈕在地圖頁面的頂部";
                        clickTimes = 1; // 如果 customOpen 为 false，点击一次
                    }

                    if (checkLocation() || checkRegion()) {
                        const message = data.message + HowToClick;
                        showToast(message, 'darkgreen', 50);

                        // 根据 clickTimes 决定点击按钮的次数
                        for (let i = 0; i < clickTimes; i++) {
                            document.getElementById('custom-toggle').click();  // 自动点击按钮
                        }
                    } else {
                        const notice = `<br>當前輸入框的分區是${regions_input.join(',')},地點是${locations_input.join(',')}<br>` +
                            "無法與您提交的匹配，需更改地點/分區輸入，並重新打開地圖頁面頂部的自定義按鈕，方可顯示";
                        const message = data.message + notice + HowToClick;
                        showToast(message, 'darkgoldenrod', 30);

                        // 根据 clickTimes 决定点击按钮的次数
                        for (let i = 0; i < clickTimes; i++) {
                            document.getElementById('custom-toggle').click();  // 自动点击按钮
                        }
                    }


                    // 可以選擇清空表單或其他操作
                    // document.getElementById("infoForm").reset();  // 清空表單
                } else {
                    showToast("提交失敗：" + data.message,'darkred');
                }
            })
            .catch(error => {
                console.error("提交失敗:", error);
                showToast("提交時發生錯誤！",'darkred');
            });
    }
});


// 获取切换按钮和文本元素
const customToggle = document.getElementById('custom-toggle');
const customLabel  = document.getElementById('switch-text');

// 全局旗標
window.isCustomOn = window.isCustomOn || false;

// ✅ 只保留一個 click 監聽，最前面做登入攔截
customToggle.addEventListener('click', async function (e) {

    const auth = await ensureAuthenticated(e);
    if (!auth) {
        showToast("💡 自定義數據庫需要登錄")
        return;
    } // 🚫 未登入直接退出

    // ✅ 已登入 → 正常執行原本邏輯
    window.isCustomOn = !window.isCustomOn;

    // 切换 open 类
    customToggle.classList.toggle('open', window.isCustomOn);

    // 根據開關狀態顯示或隱藏自定義信息
    if (window.isCustomOn) {
        customLabel.innerText = '顯示自定';
        // 顯示自定義資訊...
    } else {
        customLabel.innerText = '隱藏';
        // 隱藏自定義資訊...
    }

    if (window.isRun) {
        if (window.plotted === false) {
            await create_map1(true);
            // console.log("來了")
        } else {
            await func_mergeData();
            await triggerDrawingFunction();
        }
    }  else{
        // console.log("進來了！");
        const featureContainer = document.getElementById("featureContainer");
        // 1) 用 children 判空，避免空白/註釋干扰
        if (featureContainer.children.length === 0) {
            const input = document.createElement("input");
            input.type = "text";
            input.id = "tipinput2";
            input.placeholder = "請輸入自定義特徵...";
            input.autocomplete = "off";
            input.spellcheck = false;

            // 防止任何上层全局 listener 抢走焦点/键盘
            const forceFocus = (e) => {
                // 不要 preventDefault，避免阻断浏览器的默认聚焦行为
                e.stopPropagation(); // 阻断冒泡到 document 的全局拦截器
                // 双保险：下一帧把焦点抢回
                requestAnimationFrame(() => {
                    if (document.activeElement !== input) input.focus({ preventScroll: true });
                });
            };
            input.addEventListener("pointerdown", forceFocus, true); // 捕获阶段
            input.addEventListener("mousedown", forceFocus, true);   // 兼容性
            input.addEventListener("keydown", (e) => e.stopPropagation(), true); // 键盘事件不让出

            // 输入时 → 调接口（防抖）
            input.addEventListener("input", debounce(() => {
                get_custom_feature();
            }, 300));

            featureContainer.appendChild(input);
            input.focus();
        }
    }
});



// 頂部小面板（查字、查調）的拖動等控製邏輯
document.addEventListener("DOMContentLoaded", function () {
    const expansionPanelSearch = document.querySelector('.expansion-panel-search');
    const expandBtn = document.getElementById('expand-btn');
    const footerSearch = document.querySelector('.footer-search');
    const charactersBtn = document.getElementById('characters-btn');
    const tonesBtn = document.getElementById('tones-btn');

    let isDragging = false;
    let initialHeight = expansionPanelSearch.offsetHeight;
    let startY = 0;
    let isExpanded = false; // 默认面板未展开

    // 点击按钮时，根据当前状态展开或收回
    expandBtn.addEventListener('click', () => {
        const footerHeight = footerSearch.offsetHeight;

        if (isExpanded) {
            // 如果当前是展开状态，点击按钮收回
            expansionPanelSearch.style.height = `${footerHeight}px`;  // 收回到只漏出 footer-search 的高度
            expandBtn.textContent = "▼";  // 修改按钮文本为 "展开"
        } else {
            // 如果当前是收回状态，点击按钮展开
            expansionPanelSearch.style.height = '50%';  // 展开至页面高度的50%（或者根据需求调整）
            expandBtn.textContent = "▲";  // 修改按钮文本为 "收回"
        }

        // 切换状态
        isExpanded = !isExpanded;
    });
    // 点击 "查字" 按钮时，自动展开面板
    charactersBtn.addEventListener('click', () => {
        if (!isExpanded) {
            const footerHeight = document.querySelector('.footer-search').offsetHeight;
            expansionPanelSearch.style.height = '50%'; // 展开至页面的50%
            expandBtn.textContent = "▲";  // 修改按钮文本为 "收回"
            isExpanded = true;
        }
    });

    // 点击 "查调" 按钮时，自动展开面板
    tonesBtn.addEventListener('click', () => {
        if (!isExpanded) {
            const footerHeight = document.querySelector('.footer-search').offsetHeight;
            expansionPanelSearch.style.height = '50%'; // 展开至页面的50%
            expandBtn.textContent = "▲";  // 修改按钮文本为 "收回"
            isExpanded = true;
        }
    });


    // 长按展开按钮时，允许拖动调整面板的高度
    expandBtn.addEventListener('mousedown', (e) => {
        if (isExpanded) {
            isDragging = true;
            startY = e.clientY;
            initialHeight = expansionPanelSearch.offsetHeight;
            document.body.style.cursor = 'ns-resize'; // 改变光标样式，表示可以拖动
        }
    });

    // 监听鼠标移动事件，进行面板的拖动
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const newHeight = initialHeight + deltaY;

        // 设置最大高度和最小高度限制
        const maxHeight = window.innerHeight - 30; // 页面底部距离
        const minHeight = 0;

        // 调整面板的高度
        if (newHeight >= minHeight && newHeight <= maxHeight) {
            expansionPanelSearch.style.height = `${newHeight}px`;
        }
    });

    // 监听鼠标松开事件，结束拖动
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    });


    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const newHeight = initialHeight + deltaY;

        const maxHeight = window.innerHeight - 50; // 页面底部距离
        const minHeight = 0;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
            expansionPanelSearch.style.height = `${newHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    });
});


// 查字邏輯，帶注釋
document.addEventListener("DOMContentLoaded", function () {
    const charactersBtn = document.getElementById('characters-btn');
    const inputBox = document.querySelector('.input-search'); // 获取输入框
    const locationsInput = document.getElementById('locations'); // 获取 locations 输入框
    const regionsInput = document.getElementById('regions');   // 获取 regions 输入框
    const contentSearch = document.querySelector('.content-search');

    let lastCharDiv = null;
    let lastPositionsDiv = null;

    charactersBtn.addEventListener('click', async () => {

        // await create_map1();
        // 获取输入框中的汉字
        const chars = inputBox.value.trim().split(""); // 将输入框内容拆分成字符数组
        const locations = locationsInput.value.trim().split(/\s+/); // 获取并拆分 locations
        const regions = regionsInput.value.trim().split(/\s+/); // 获取并拆分 regions

        if (chars.length === 0) {
            showToast("❌ 请输入汉字！",'darkred');
            document.getElementById('loading-overlay').classList.add('loading-hidden');
            return;
        }
        if (isEmptyInput(locations) && isEmptyInput(regions)) {
            showToast("❌ 請輸入地點或分區！",'darkred');
            return;
        }

        if (window.userRole !== 'admin'){
            if (chars.length > 10) {
                showToast("❌ 一次最多查詢 10 个汉字！", 'darkred');
                document.getElementById('loading-overlay').classList.add('loading-hidden');
                return;
            }
            // 🔒 冷卻控制只針對分析主邏輯
            if (window.runCooldown) {
                showToast("⏳ 分析已啟動，請等待 3 秒後再試！");
                return;
            }
            // ✅ 真正執行分析 → 開始冷卻計時
            window.runCooldown = true;
            setTimeout(() => {
                window.runCooldown = false;
            }, 3000);
        }
        document.getElementById('loading-overlay').classList.remove('loading-hidden');

        // 構造查詢字符串
        const params = new URLSearchParams();
        chars.forEach(c => params.append("chars", c));
        locations.forEach(loc => params.append("locations", loc));
        regions.forEach(reg => params.append("regions", reg));
        params.set("region_mode", window.regionusing);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN")
            // 判断用户身份
            let userRole = "anonymous"; // 默认身份是匿名用户
            if (token) {
                const user = await update_userdatas_bytoken(token, console_log = true);
                if (user && user.role === "admin") {
                    userRole = "admin";
                } else {
                    userRole = "user";
                }
            }
            const query = new URLSearchParams();
            locations.forEach(loc => query.append("locations", loc));
            regions.forEach(reg => query.append("regions", reg));
            query.set("region_mode", window.regionusing);
            const res = await fetch(`${window.API_BASE}/get_locs/?${query.toString()}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });

            const loc_data = await res.json();
            // 🚫 判斷返回的地點數是否超過 限制
            const limit_anonymous =300
            const limit_users =800
            if (userRole === "anonymous"){
                if (loc_data.locations_result && loc_data.locations_result.length > limit_anonymous) {
                    showToast(`🚫 由於服務器限制，未登錄用戶查字只能選擇 ${limit_anonymous} 個地點。\n⚠️ 本次查詢了 ${loc_data.locations_result.length} 個地點。`);
                    showAuthPopup();
                    document.getElementById('loading-overlay').classList.add('loading-hidden');
                    return;
                }
            }else if (userRole === "user") {
                if (loc_data.locations_result && loc_data.locations_result.length > limit_users) {
                    const userConfirmed = confirm(`⚠️ 本次選擇了超過800個地點（${loc_data.locations_result.length}個）\n⚠️ 可能會很卡。\n\n是否繼續？`);
                    if (!userConfirmed) {
                        document.getElementById('loading-overlay').classList.add('loading-hidden');
                        return;  // 如果用户点击“取消”，停止后续操作
                    }
                }

            }
            // 發送 GET 請求到後端
            const response = await fetch(`${window.API_BASE}/search_chars/?${params.toString()}`, {
                method: 'GET',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})  // ✅ 若存在則加入 Authorization
                }
            });
            const data = await response.json();
            if (!response.ok  || !Array.isArray(data.result)){
                if (data.detail.includes("登錄")) {
                    showToast(data.detail);
                    showAuthPopup();
                }else
                {showToast(data.detail)}
                document.getElementById('loading-overlay').classList.add('loading-hidden');
            }
            // 处理返回的 JSON 数据
            if (response.ok) {
                if (token) {
                    await update_userdatas_bytoken(token)
                }
                const resultData = data.result; // 提取 `result` 数组

                // 在前端控制台输出返回的数据
                // console.log('从后端返回的数据:', resultData);
                // 🔍 找出所有未匹配到音节的汉字
                const charsWithoutSyllables = resultData
                    .filter(item => Array.isArray(item["音节"]) && item["音节"].length === 0)
                    .map(item => item.char);

                // 🚨 如果所有都未匹配，或者有部分未匹配的
                if (charsWithoutSyllables.length === resultData.length) {
                    showToast(`❌ 所有漢字「${charsWithoutSyllables.join(' ')}」均未找到對應音節！`,'darkred');
                    document.getElementById('loading-overlay').classList.add('loading-hidden');
                    return;
                }
                // else if (charsWithoutSyllables.length > 0) {
                //     showToast(`⚠️ 以下漢字未找到對應音節：「${charsWithoutSyllables.join(' ')}」`);
                // }

                if (Array.isArray(resultData)) {
                    if (window.innerHeight >= window.innerWidth) {
                        const inputpanel = document.getElementById("inputpanel");
                        const resultpanel = document.getElementById("resultPanel");
                        const mappanel = document.getElementById("mapPanel");
                        v_togglePanel(inputpanel, 15, 0, 1);
                        v_togglePanel(resultpanel, 15, 15, 2);
                        v_togglePanel(mappanel, 70, 30, 3);
                    }
                    resultData.forEach((item) => {
                        // 如果音节或 location 为空，则跳过当前元素
                        if (!item.音节.length|| !item.location) {
                            return; // 跳过当前元素
                        }
                        // 创建 charDiv，如果和上一个不一样
                        const charDiv = document.createElement('div');
                        charDiv.classList.add('char');
                        charDiv.textContent = item.char;

                        // 如果当前的 charDiv 和上一个不一样，才添加到 DOM 中
                        if (!lastCharDiv || lastCharDiv.textContent !== charDiv.textContent) {
                            contentSearch.appendChild(charDiv);
                            lastCharDiv = charDiv;  // 更新 lastCharDiv
                        }

                        // 创建 positionsDiv，如果和上一个不一样
                        const positionsDiv = document.createElement('div');
                        positionsDiv.classList.add('positions');
                        item.positions.forEach(position => {
                            const positionPara = document.createElement('p');
                            positionPara.textContent = position;
                            positionsDiv.appendChild(positionPara);
                        });

                        // 如果当前的 positionsDiv 和上一个不一样，才添加到 DOM 中
                        if (!lastPositionsDiv || lastPositionsDiv.innerHTML !== positionsDiv.innerHTML) {
                            contentSearch.appendChild(positionsDiv);
                            lastPositionsDiv = positionsDiv;  // 更新 lastPositionsDiv
                        }

                        const infoContainer = document.createElement('div');
                        infoContainer.style.display = 'flex';  // 使用 flex 布局
                        infoContainer.style.justifyContent = 'center'; // 水平居中
                        infoContainer.style.alignItems = 'center'; // 垂直居中

                        // 创建并添加 locationDiv
                        const locationDiv = document.createElement('div');
                        locationDiv.classList.add('location');
                        locationDiv.textContent = item.location;
                        infoContainer.appendChild(locationDiv);

                        // 创建并添加 syllablesDiv
                        const syllablesDiv = document.createElement('div');
                        syllablesDiv.classList.add('syllables');

                        // 判断 notes 是否存在且包含非空字符串
                        if (Array.isArray(item.notes) && item.notes.some(note => note !== "_")) {
                            syllablesDiv.classList.add('multi');
                            syllablesDiv.style.fontFamily = "Times New Roman";
                            // syllablesDiv.style.fontWeight = 'bold';
                            syllablesDiv.setAttribute('data-title', item.notes.join(' / '));
                        }

                        syllablesDiv.innerHTML = item.音节.join(' <span>·</span> ');

                        infoContainer.appendChild(syllablesDiv);

                        // 将整个容器添加到 DOM 中
                        contentSearch.appendChild(infoContainer);
                    });
                    document.getElementById('loading-overlay').classList.add('loading-hidden');
                    // 提取 char 字段作为特征
                    const uniqueChars = [...new Set(resultData.map(item => item.char))];
                    const featureData = uniqueChars.map(char => ({ 特徵值: char }));
                    mapFeatureSelection(featureData);  // 这里传入的是 featureData 数组
                    await create_map1();
                    window.mergedData = []
                    generateCharsMergedData(resultData, window.locations_data);
                    lastCharDiv = [];
                    lastPositionsDiv = [];
                } else {
                    document.getElementById('loading-overlay').classList.add('loading-hidden');
                    console.error("返回的数据不是一个数组:", resultData);
                }
            } else {
                const error = await response.json();
                document.getElementById('loading-overlay').classList.add('loading-hidden');
                console.error('Error:', error);
            }
        } catch (error) {
            document.getElementById('loading-overlay').classList.add('loading-hidden');
            console.error('请求失败:', error);
        }
    });
});

// 查聲調邏輯
document.addEventListener("DOMContentLoaded",  function () {
    const locationsInput = document.getElementById('locations'); // 获取 locations 输入框
    const regionsInput = document.getElementById('regions');   // 获取 regions 输入框
    const tonesBtn = document.getElementById('tones-btn');
    const contentSearch = document.querySelector('.content-search');

    tonesBtn.addEventListener('click', async (e) => {
        const locations = locationsInput.value.trim().split(/\s+/); // 获取并拆分 locations
        const regions = regionsInput.value.trim().split(/\s+/); // 获取并拆分 regions
        if (isEmptyInput(locations) && isEmptyInput(regions)) {
            showToast("❌ 請輸入地點或分區！",'darkred');
            return;
        }
        if (window.userRole !== 'admin'){
            // 🔒 冷卻控制只針對分析主邏輯
            if (window.runCooldown) {
                showToast("⏳ 分析已啟動，請等待 3 秒後再試！");
                return;
            }
            // ✅ 真正執行分析 → 開始冷卻計時
            window.runCooldown = true;
            setTimeout(() => {
                window.runCooldown = false;
            }, 3000);
        }
        document.getElementById('loading-overlay').classList.remove('loading-hidden');
        // 获取输入框中的汉字
        await ensureAuthenticated(e,false)

        // 構造查詢字符串
        const params = new URLSearchParams();
        locations.forEach(loc => params.append("locations", loc));
        regions.forEach(reg => params.append("regions", reg));
        params.set("region_mode", window.regionusing);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN")
            // 發送 GET 請求到後端
            const response = await fetch(`${window.API_BASE}/search_tones/?${params.toString()}`, {
                method: 'GET',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})  // ✅ 若存在則加入 Authorization
                }
            });
            const data = await response.json();
            if (!response.ok || !Array.isArray(data.tones_result)) {
                if (data.detail.includes("登錄")) {
                    showToast(data.detail);
                    showAuthPopup();
                } else {
                    showToast(data.detail)
                }
                document.getElementById('loading-overlay').classList.add('loading-hidden');
            }
            // 处理返回的 JSON 数据
            if (response.ok) {
                if (token) {
                    await update_userdatas_bytoken(token)
                }
                const resultData = data.tones_result; // 提取 `result` 数组
                if (window.innerHeight >= window.innerWidth) {
                    const inputpanel = document.getElementById("inputpanel");
                    const resultpanel = document.getElementById("resultPanel");
                    const mappanel = document.getElementById("mapPanel");
                    v_togglePanel(inputpanel, 15, 0, 1);
                    v_togglePanel(resultpanel, 15, 15, 2);
                    v_togglePanel(mappanel, 70, 30, 3);
                }
                // // 在前端控制台输出返回的数据
                // console.log('从后端返回的数据:', resultData);
                const headers = ['地點', '陰平', '陽平', '陰上', '陽上', '陰去', '陽去', '陰入', '陽入', '其他調', '輕聲'];
                const colorArray = [
                    { name: "Orange", hex: "#f58231" },
                    { name: "Yellow", hex: "#ffe119" },
                    { name: "Green", hex: "#3cb44b" },
                    { name: "Cyan", hex: "#42d4f4" },
                    { name: "Blue", hex: "#CCFFFF" },
                    { name: "Magenta", hex: "#9999FF" },
                    { name: "Pink", hex: "#fabed4" },
                    { name: "Beige", hex: "#fffac8" },
                    { name: "Mint", hex: "#aaffc3" },
                    { name: "Lavender", hex: "#dcbfff" }
                ];
                // 创建表格元素
                const table = document.createElement('table');
                table.classList.add('table-tones'); // 添加表格样式类

                // 创建表格头部
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');

                // 填充表头并设置颜色
                headers.forEach((headerText, index) => {
                    const th = document.createElement('th');
                    th.textContent = headerText;

                    // 设置表头颜色，跳过 "地點名稱"
                    if (index > 0) {
                        th.style.backgroundColor = colorArray[index - 1].hex;
                    }

                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // 创建表格内容
                const tbody = document.createElement('tbody');
                // 创建弹窗
                const popup = document.createElement('div');
                popup.classList.add('popup-tones');  // 用来显示弹窗
                document.body.appendChild(popup);
                popup.style.display = 'none';  // 初始时隐藏弹窗

                // 填充表格数据
                resultData.forEach(item => {
                    const row = document.createElement('tr');

                    // 添加地点名称列
                    const locationCell = document.createElement('td');
                    locationCell.classList.add('location-tones'); // 添加地点名称列样式类
                    locationCell.textContent = item["簡稱"];
                    row.appendChild(locationCell);

                    // 给“簡稱”添加点击事件
                    locationCell.addEventListener('click', function(event) {
                        // 弹窗内容设置为該行的總數據
                        popup.innerHTML = item["總數據"].join('<br>');
                        // 显示弹窗
                        popup.style.display = 'block';

                        // 获取鼠标点击位置并定位弹窗
                        popup.style.left = event.pageX + 'px';
                        popup.style.top = event.pageY + 'px';
                    });

                    // 添加音调数据列，并填充颜色
                    item.tones.forEach((tone, index) => {
                        const td = document.createElement('td');
                        td.classList.add('tones-cell-tones'); // 添加音调列样式类
                        const toneKey = Object.keys(tone)[0]; // 获取键 (T1, T2, T3 ...)
                        const toneValue = tone[toneKey];
                        // console.log(toneValue)

                        // // 填充颜色：跳过 "無" 或以"T"开头的单元格
                        // if (toneValue !== "無" && !toneValue.startsWith("T")) {
                        //     // console.log("填色！！")
                        //     td.style.backgroundColor = colorArray[index].hex; // 使用对应列的颜色
                        // }
                        // 如果是 "無"，则清空单元格并添加斜线
                        if (toneValue === "無") {
                            td.textContent = ""; // 清空单元格内容
                            td.style.position = 'relative'; // 设置相对定位
                            td.style.backgroundColor = 'transparent'; // 背景色透明
                            td.style.border = '1px solid #000'; // 给单元格加个边框
                            td.style.backgroundImage = 'linear-gradient(45deg, transparent 49%, #000 50%, transparent 51%)'; // 设置斜线背景
                            td.style.backgroundSize = '15px 15px'; // 控制斜线的大小
                        }

                        // 如果以 T 开头，读取对应列的颜色（T1 ~ T10）
                        else if (toneValue.startsWith("T")) {
                            const columnIndex = parseInt(toneValue.substring(1)) -1; // T1 -> 0, T2 -> 1, ..., T10 -> 9
                            // console.log("columnindex",columnIndex)
                            td.style.backgroundColor = colorArray[columnIndex].hex;
                        }
                        // 如果值是数字开头的，显示数字值并填充颜色
                        else if (/^\d/.test(toneValue)) { // 如果是以数字开头
                            td.style.backgroundColor = colorArray[index].hex;
                            td.textContent = toneValue; // 显示实际音调值
                            td.style.fontFamily = 'Courier New, sans-serif';  // 设置字体为 Impact
                            td.style.fontWeight = 'bold';  // 设置加粗
                        }
                        // 如果值是 ` 开头，去除 ` 并添加下划线
                        else if (/^`/.test(toneValue)) {  // 如果是以 ` 开头
                            td.style.backgroundColor = colorArray[index].hex;
                            td.textContent = toneValue.replace(/`/g, ''); // 去除所有的 `，显示剩余部分
                            // td.style.fontStyle = "italic";  // 设置斜体
                            td.style.fontFamily = 'Times New Roman , sans-serif';  // 设置字体为 Impact
                            // td.style.textDecoration = "underline"; // 添加下划线
                            // td.style.textDecorationStyle = 'dotted';  /* 点划线 */
                        }

                        // td.textContent = toneValue;
                        row.appendChild(td);
                    });

                    tbody.appendChild(row);
                });
                const toneMapping = {
                    "T1": "陰平",
                    "T2": "陽平",
                    "T3": "陰上",
                    "T4": "陽上",
                    "T5": "陰去",
                    "T6": "陽去",
                    "T7": "陰入",
                    "T8": "陽入",
                    "T9": "其他調",
                    "T10": "輕聲"
                };
                const processedData = [];
                resultData.forEach(locationData => {
                    const { 簡稱, tones } = locationData;

                    // 遍历每个音调（T1 到 T10）
                    tones.forEach(toneData => {
                        // 提取音调的键（T1, T2, ...）
                        const toneName = Object.keys(toneData)[0];
                        let toneValue = toneData[toneName];
                        let notes = "";
                        // 将 "無" 转为空字符串
                        if (toneValue === "無") {
                            toneValue = "無";
                        } else {
                            toneValue = toneValue.replace(/`/g, "");
                        }
                        // 使用 toneMapping 对应表将 T1, T2, ... 转换为中文音调
                        const chineseToneName = toneMapping[toneName] || toneName; // 如果找不到映射则保留原名称
                        // 如果是 T 开头的音调，查找对应的值并替换
                        if (toneValue.startsWith("T")) {
                            const chineseToneName2 = toneMapping[toneValue] || toneValue; // 如果找不到映射则保留原名称
                            notes = toneValue.startsWith("T") ? `與${chineseToneName2}合併` : "";
                            // const correspondingTone = toneMapping[toneValue];  // 获取对应的中文音调名称
                            const toneObj = locationData.tones.find(item => item[toneValue]);
                            if (toneObj) {
                                toneValue = toneObj[toneValue];  // 取得 T1 对应的数值
                            } else {
                                toneValue = "";  // 如果找不到，设置为空字符串
                            }
                        }
                        // 推入结果数据
                        processedData.push({
                            location: 簡稱,  // 使用 "簡稱" 作为地点名称
                            tone: chineseToneName,  // 使用对应的中文音调名称
                            value: toneValue,  // 音调的数值或为空字符串
                            notes: notes  // 默认备注为空
                        });
                    });
                });
                // console.log(processedData);
                const toneNames = ["陰平", "陽平", "陰上", "陽上","陰去","陽去", "陰入","陽入","其他調", "輕聲"];
                const featureData = toneNames.map(char => ({ 特徵值: char }));
                mapFeatureSelection(featureData);
                await create_map1();
                window.mergedData = []
                generateTonesMergedData(processedData, window.locations_data);
                // console.log(window.mergedData)
                table.appendChild(tbody);

                // 将表格添加到页面中的 .content-search 元素
                contentSearch.appendChild(table);
                document.getElementById('loading-overlay').classList.add('loading-hidden');
                // 关闭弹窗的功能：点击页面其他地方
                document.addEventListener('click', function(event) {
                    if (!popup.contains(event.target) && !event.target.classList.contains('location-tones')) {
                        popup.style.display = 'none';  // 点击页面其他地方时关闭弹窗
                    }
                });
            }
        } catch (error) {
            document.getElementById('loading-overlay').classList.add('loading-hidden');
            console.log("报错报错",error)
        }
    })
})


// 清空整個小面板
document.addEventListener("DOMContentLoaded", function () {
    const clearBtn = document.getElementById('clear-btn');
    const contentSearch = document.querySelector('.content-search');

    // 获取清空按钮本身，避免清空按钮
    const clearButton = document.querySelector('.clear-btn');

    clearBtn.addEventListener('click', function () {
        // 清空除了按钮以外的内容
        contentSearch.querySelectorAll(':scope > *:not(.clear-btn):not(#loading-overlay)').forEach(el => el.remove());
        // console.log("内容已清空，按钮未受影响");
    });
});








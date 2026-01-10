// 切換數據顯示模式（表格/海量數據）
document.getElementById('button-masschange').addEventListener('click', async function() {
    const buttonText = document.getElementById('button-text-masschange');
    const buttonIcon = document.querySelector('.button-icon-masschange');
    const button = document.getElementById('button-masschange');

    // 根據全局變量控制按鈕的開關狀態
    if (window.isButtonClosed) {
        // 如果當前為關閉狀態，切換為開啟狀態
        window.isButtonClosed = false;  // 更新全局狀態為開啟
        buttonText.textContent = '海量數據';  // 顯示開啟狀態的文字
        buttonIcon.innerHTML = '↻';  // 顯示旋轉圖標
        button.classList.remove('closed');  // 移除關閉狀態的類
        console.log("切換到開啟狀態");
    } else {
        // 如果當前為開啟狀態，切換為關閉狀態
        window.isButtonClosed = true;  // 更新全局狀態為關閉
        buttonText.textContent = '表格模式';  // 顯示關閉狀態的文字
        buttonIcon.innerHTML = '↺';  // 顯示旋轉圖標
        button.classList.add('closed');  // 移除關閉狀態的類
        console.log("切換到關閉狀態");
    }
});

const checkboxes = document.querySelectorAll('#features-group input[type="checkbox"]');

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            // ✅ 勾选一个时，取消其他所有
            checkboxes.forEach(other => {
                if (other !== checkbox) {
                    other.checked = false;
                }
            });
        } else {
            // ⛔ 禁止取消当前唯一选中项
            const isAnyChecked = Array.from(checkboxes).some(cb => cb.checked);
            if (!isAnyChecked) {
                checkbox.checked = true;
            }
        }
    });
});

// 選擇分析模式（音本位還是字本位）
function updateVisibility() {
    const mode = document.querySelector('input[name="mode"]:checked')?.value;
    document.getElementById("status_input_button").style.display = mode === "s2p" ? "flex" : "none";
    document.getElementById("group_inputs_group").style.display = mode === "p2s" ? "block" : "none";
    // 遍历所有的 .input-section 元素，检查是否为空，空的隐藏
    document.querySelectorAll('.input-section').forEach(function(section) {
        if (!section.textContent.trim()) {
            section.style.display = 'none';  // 如果为空，隐藏元素
        } else {
            section.style.display = 'block'; // 如果有内容，显示元素
        }
    });
}

// 監聽Mode
document.querySelectorAll('input[name="mode"]').forEach(r => {
    r.addEventListener("change", updateVisibility);
});
updateVisibility();

/*
分區的選擇
 */
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("partitionBtn");
    const textarea = document.getElementById("regions");
    window.partitionPopupOpen = false;
    window.regionusing = 'map';

    document.querySelectorAll('.tab-btn').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            const selectedType = tabBtn.getAttribute('data-tab');
            const isSame = window.regionusing === selectedType;

            // ✅ 如果是點選音典或地圖，且已選中 → toggle popup
            if ((selectedType === 'yindian' || selectedType === 'map') && isSame) {
                const existing = document.querySelector('#popupLayer .partition-container');
                if (existing) {
                    existing.remove();
                } else {
                    showRegionSelector?.(textarea, selectedType);
                }
                return;
            }

            // 切換 tab 狀態
            window.regionusing = selectedType;
            document.getElementById('regions').value = '';
            window.partitionPopupOpen = false; // 👈 这里设才对！

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');

            textarea.placeholder = selectedType === 'map'
                ? '請輸入或選擇「地圖集」分區'
                : '請輸入或選擇「音典」分區';

            // ⛔ 切到非音典或地圖時，保險起見自動關 popup
            if (selectedType !== 'yindian' && selectedType !== 'map') {
                const existing = document.querySelector('#popupLayer .partition-container');
                existing?.remove();
            }
        });
    });

    // ▼ 點擊 → 當前是音典或地圖時才 toggle
    btn?.addEventListener("click", () => {
        if (window.regionusing === 'yindian' || window.regionusing === 'map') {
            const existing = document.querySelector('#popupLayer .partition-container');
            if (existing) {
                existing.remove();
            } else {
                showRegionSelector?.(textarea, window.regionusing);
            }
        }
    });
})



// 獲取匹配到的分區列表
function getSubregions(parentLabel, mode = 'yindian') {
    if (mode === 'map') {
        const tree = STATIC_REGION_TREE;

        function search(node) {
            if (!node || typeof node !== 'object') return null;
            for (const key in node) {
                if (key === parentLabel) {
                    return node[key];
                }
                const found = search(node[key]);
                if (found) return found;
            }
            return null;
        }

        if (parentLabel === null) {
            const top = Object.keys(tree);
            return Promise.resolve(top.map(k => {
                const v = tree[k];
                const hasChildren = (
                    (Array.isArray(v) && v.length > 0) ||
                    (typeof v === 'object' && v !== null && Object.keys(v).length > 0)
                );
                return { label: k, hasChildren };
            }));
        }

        const childrenNode = search(tree);
        if (!childrenNode) return Promise.resolve([]);

        let result = [];
        if (Array.isArray(childrenNode)) {
            result = childrenNode.map(k => ({ label: k, hasChildren: false }));
        } else if (typeof childrenNode === 'object') {
            result = Object.keys(childrenNode).map(k => {
                const child = childrenNode[k];
                const hasChildren = (
                    (Array.isArray(child) && child.length > 0) ||
                    (typeof child === 'object' && child !== null && Object.keys(child).length > 0)
                );
                return { label: k, hasChildren };
            });
        }
        return Promise.resolve(result);
    }

    else if (mode === 'yindian') {
        const CACHE_KEY = '__YINDIAN_TREE_CACHE__';
        // 初始化快取
        if (!sessionStorage.getItem(CACHE_KEY)) {
            return fetch(`${window.API_BASE}/partitions`)
                .then(res => res.json())
                .then(tree => {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(tree));
                    return getSubregions(parentLabel, mode); // 再跑一次
                });
        }

        const tree = JSON.parse(sessionStorage.getItem(CACHE_KEY));

        function search(node) {
            if (!node || typeof node !== 'object') return null;
            for (const key in node) {
                if (key === parentLabel) {
                    return node[key];
                }
                const found = search(node[key]);
                if (found) return found;
            }
            return null;
        }

        if (parentLabel === null) {
            return Promise.resolve(top_yindian.map(k => {
                const v = tree[k];
                const hasChildren = (
                    (Array.isArray(v) && v.length > 0) ||
                    (typeof v === 'object' && v !== null && Object.keys(v).length > 0)
                );
                return { label: k, hasChildren };
            }));
        }

        const childrenNode = search(tree);
        if (!childrenNode) return Promise.resolve([]);

        let result = [];
        if (Array.isArray(childrenNode)) {
            result = childrenNode.map(k => ({ label: k, hasChildren: false }));
        } else if (typeof childrenNode === 'object') {
            result = Object.keys(childrenNode).map(k => {
                const child = childrenNode[k];
                const hasChildren = (
                    (Array.isArray(child) && child.length > 0) ||
                    (typeof child === 'object' && child !== null && Object.keys(child).length > 0)
                );
                return { label: k, hasChildren };
            });
        }

        return Promise.resolve(result);
    }
    // return Promise.resolve([]);
}


function registerPopupCloseHandler(container, clearCallback, extraAllowedTargets = []) {
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            clearCallback();
            window.partitionPopupOpen = false; // 👈 这里设才对！
        }
    };

    const outsideClickHandler = (e) => {
        const isInsideContainer = container.contains(e.target);
        const isInsideExtras = extraAllowedTargets.some(target => target.contains(e.target));
        if (!isInsideContainer && !isInsideExtras) {
            clearCallback();
            // window.partitionPopupOpen = false; // 👈 这里也要设
        }
    };

    document.addEventListener('keydown', escHandler);
    document.addEventListener('mousedown', outsideClickHandler);

    return () => {
        document.removeEventListener('keydown', escHandler);
        document.removeEventListener('mousedown', outsideClickHandler);
    };
}


// 分區渲染顯示總入口
function showRegionSelector (textarea, mode='yindian') {
    // ✅ 若已開，則關閉並 return（toggle）
    if (window.partitionPopupOpen) {
        document.querySelector('#popupLayer .partition-container')?.remove();
        window.partitionPopupOpen = false;
        return;
    }

    window.partitionPopupOpen = true; // ⬅️ 開啟時標記

    const container = document.createElement('div');
    container.className = 'partition-container';
    const panelRect = document.getElementById('panelContent').getBoundingClientRect();
    const isPortrait = window.innerWidth < window.innerHeight;
    container.style.position = 'fixed';
    container.style.top = isPortrait ? `10px` : `${panelRect.top}px`;
    container.style.left = isPortrait ? `10px` : `${panelRect.right}px`;

    const lvl1 = document.createElement('div');
    const lvl2 = document.createElement('div');
    const lvl3 = document.createElement('div');

    lvl1.className = 'partition-popup partition-lvl1';
    lvl2.className = 'partition-popup partition-lvl2';
    lvl3.className = 'partition-popup partition-lvl3';
    lvl2.style.display = 'none';
    lvl3.style.display = 'none';

    container.append(lvl1, lvl2, lvl3);
    const popupLayer = document.getElementById('popupLayer');
    popupLayer.innerHTML = "";
    popupLayer.appendChild(container);

    const clearAll = () => {
        container.remove();
        unregister();
    };

    const unregister = registerPopupCloseHandler(container, clearAll,[container]);

    // 🔁 改這一行：改成 async 拿一級分區
    getSubregions(null,mode).then(topLevel => {
        renderList(topLevel, lvl1, null, textarea, clearAll, lvl2, lvl3,mode);
    });
}


// 渲染分區提示框，可點擊
function renderList(items, container, parentLabel, textarea, onClose, lvl2 = null, lvl3 = null,mode='yindian') {
    container.innerHTML = "";
    let activeItem = null;

    if (items && typeof items === "object" && !Array.isArray(items)) {
        const firstKey = Object.keys(items)[0];
        const firstVal = items[firstKey];
        if (!firstVal || !Array.isArray(firstVal) || firstVal.length === 0) {
            container.style.display = "none";
            return;
        }
        items = firstVal;
    }

    if (!Array.isArray(items) || items.length === 0) {
        container.style.display = "none";
        return;
    }
    items.forEach(item => {
        const label = typeof item === 'string' ? item : item.label;
        const hasChildren = typeof item === 'object' && !!item.hasChildren;

        const line = document.createElement('div');
        line.className = 'partition-line';
        line.style.display = 'flex';
        line.style.justifyContent = 'space-between';
        line.style.alignItems = 'center';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'partition-item';
        itemDiv.textContent = label;
        itemDiv.style.flexGrow = '1'; // 佔滿左側空間

        line.appendChild(itemDiv);

        if (hasChildren) {
            const arrow = document.createElement('div');
            arrow.className = 'partition-arrow';
            arrow.textContent = '⌵';
            // ✅ 改成完全等效 hover：模拟 mouseenter 行为
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                itemDiv.dispatchEvent(new Event('mouseenter', { bubbles: true }));
            });
            line.appendChild(arrow);
        }

        // 狀態變數
        let hoverTimeout;
        let isLongPress = false;
        let touchTimer = null;
        let startY = 0;
        let startX = 0;
        let hasMoved = false;

        // 🐭 hover 展開
        line.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(async () => {
                if (!isLongPress) {
                    await popup_box(label, line, parentLabel, textarea, onClose, lvl2, lvl3, mode);
                }
            }, 100);

            if (activeItem && activeItem !== line) {
                activeItem.classList.remove('active');
            }
            line.classList.add('active');
            activeItem = line;
        });

        line.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });
        // 📱 Touch 長按
        itemDiv.addEventListener('touchstart', (e) => {
            isLongPress = false;
            hasMoved = false;

            const touch = e.touches[0];
            startY = touch.clientY;
            startX = touch.clientX;

            touchTimer = setTimeout(async () => {
                if (!hasMoved) {
                    isLongPress = true;
                    const result = await popup_box(label, line, parentLabel, textarea, onClose, lvl2, lvl3, mode);
                    if (result !== false) {
                        if (activeItem && activeItem !== line) {
                            activeItem.classList.remove('active');
                        }
                        line.classList.add('active');
                        activeItem = line;
                    }
                }
            }, 500);
        }, { passive: false }); // ⬅️ 改 1：非被动

        itemDiv.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const deltaY = Math.abs(touch.clientY - startY);
            const deltaX = Math.abs(touch.clientX - startX);
            if (deltaY > 10 || deltaX > 10) {
                hasMoved = true;
                clearTimeout(touchTimer);
            }
        }, { passive: false }); // ⬅️ 改 1：非被动

        itemDiv.addEventListener('touchend', (e) => {
            clearTimeout(touchTimer);
            if (isLongPress || hasMoved) return;

            // ⬅️ 改 2：阻止默认/冒泡，降低合成 click/穿透风险
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();

            // ✅ 白名单判断：不允许箭头
            const touchPoint = e.changedTouches[0];
            const realTarget = document.elementFromPoint(touchPoint.clientX, touchPoint.clientY);
            if (realTarget?.closest('.partition-arrow')) return;

            // ⬅️ 改 3：必须仍命中当前 itemDiv（防止手指松开时落在别处）
            if (!realTarget || !itemDiv.contains(realTarget)) return;
            window.partitionPopupOpen = false; // 👈 这里设才对！
            const existing = textarea.value.trim();
            const parts = existing ? existing.split(/\s+/) : [];
            if (!parts.includes(label)) {
                parts.push(label);
                textarea.value = parts.join(' ');
            }
            onClose();
        }, { passive: false }); // ⬅️ 改 1：非被动


        itemDiv.addEventListener('touchcancel', () => {
            clearTimeout(touchTimer);
        });

        // 🖱 Click 添加標籤
        itemDiv.addEventListener('click', (e) => {
            // console.log("點擊了")
            if (isLongPress) {
                e.stopImmediatePropagation();
                e.preventDefault();
                return;
            }
            const clickedItem = e.target.closest('.partition-item');
            const clickedArrow = e.target.closest('.partition-arrow');
            // console.log(clickedArrow)
            // console.log(clickedItem)
            if (clickedArrow || clickedItem !== itemDiv) return;
            window.partitionPopupOpen = false; // 👈 这里设才对！
            const existing = textarea.value.trim();
            const parts = existing ? existing.split(/\s+/) : [];
            if (!parts.includes(label)) {
                parts.push(label);
                textarea.value = parts.join(' ');
            }
            onClose();
        });

        container.appendChild(line);
    });
}


// 總的渲染子級分區提示框函數
async function popup_box(label, item, parentLabel, textarea, onClose, lvl2, lvl3,mode='yindian') {
    // 清空 popup 位置，保證 hover/click 不殘留內容
    if (lvl2 && parentLabel == null) {
        lvl2.innerHTML = "";
        lvl2.style.display = 'none'; // <-- ✅ 保證舊內容清除
    }
    if (lvl3 && parentLabel != null) {
        lvl3.innerHTML = "";
        lvl3.style.display = 'none'; // <-- ✅ 保證舊內容清除
    }

    const subs = await getSubregions(label,mode);
    if (!subs || subs.length === 0) {
        // ✅ 沒有子分區，不做任何展示，return false 表示沒展開
        return false;
    }

    const rect = item.getBoundingClientRect();
    const popupLeft = rect.right;
    const popupHeight = 200;
    let popupTop = rect.top;

    const lvl1Items = document.querySelectorAll('.partition-lvl1 > div');
    const firstItem = lvl1Items[0];
    const lastItem = lvl1Items[lvl1Items.length - 1];
    const anchorTop = firstItem?.getBoundingClientRect().top ?? 0;
    const anchorBottom = lastItem?.getBoundingClientRect().bottom ?? window.innerHeight;

    if (popupTop + popupHeight > anchorBottom) popupTop = anchorBottom - popupHeight;
    if (popupTop < anchorTop) popupTop = anchorTop;

    popupTop = Math.max(popupTop, 0);
    popupTop = Math.min(popupTop, window.innerHeight - popupHeight);

    if (lvl2 && parentLabel == null) {
        lvl3.innerHTML = "";
        lvl3.style.display = 'none';
        lvl2.style.position = 'fixed';
        lvl2.style.top = `${popupTop}px`;
        lvl2.style.left = `${popupLeft}px`;
        lvl2.style.display = 'block';
        renderList(subs, lvl2, label, textarea, onClose, null, lvl3,mode);
    } else if (lvl3 && parentLabel != null) {
        lvl3.style.position = 'fixed';
        lvl3.style.top = `${popupTop}px`;
        lvl3.style.left = `${popupLeft}px`;
        lvl3.style.display = 'block';
        renderList(subs, lvl3, label, textarea, onClose,mode);
    }
}


/*
地点输入框的匹配
 */
const inputEl = document.getElementById("locations");
const suggestion = document.getElementById("inlineSuggestion");

// 地點輸入框的獲取後端、顯示下拉框、點擊完成匹配
const fetchSuggestion = () => {
    const { queryStart, cursorPos, value } = getQueryStart(inputEl);
    const query = value.slice(queryStart, cursorPos).trim();

    if (!query) {
        suggestion.style.display = "none";
        return;
    }
    const token = localStorage.getItem("ACCESS_TOKEN")
    fetch(`${window.API_BASE}/batch_match?input_string=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    })

        .then(res => res.json())
        .then(results => {
            if (!results.length) {
                suggestion.style.display = "none";
                return;
            }

            const r = results[0];
            suggestion.innerHTML = "";

            if (r.success) {
                suggestion.innerHTML = `<div class="success">✅ ${r.message}</div>`;
            } else {
                // 取得目前輸入框值的「所有已完成地點」
                const allValues = value.split(/[ ,;/，；、\n\t]+/).filter(Boolean);
                const currentQuery = value.slice(queryStart, cursorPos).trim();
                const exclusionSet = new Set(allValues.filter(v => v !== currentQuery));
                const filtered = Array.from(new Set(r.items)).filter(item => !exclusionSet.has(item));
                if (!filtered.length) {
                    suggestion.style.display = "none";
                    return;
                }

                filtered.forEach(item => {
                    const div = document.createElement("div");
                    div.className = "suggest-line";
                    div.textContent = item;

                    div.addEventListener("mousedown", e => {
                        e.preventDefault();
                        const before = value.slice(0, queryStart);
                        const after = value.slice(cursorPos);
                        inputEl.value = before + item + ' ' + after;

                        const newPos = before.length + item.length + 1;
                        inputEl.setSelectionRange(newPos, newPos);
                        suggestion.style.display = "none";
                    });

                    suggestion.appendChild(div);
                });
            }

            const rect = inputEl.getBoundingClientRect();
            suggestion.style.left = `${rect.left + window.scrollX}px`;
            suggestion.style.top = `${rect.bottom + 6 + window.scrollY}px`;
            suggestion.style.display = "block";
        });
};

// ✅ 绑定 keyup + 防抖
inputEl.addEventListener("keyup", debounce(fetchSuggestion, 300));

// 🔻 自動隱藏：若輸入框失去焦點（但點擊 suggestion 例外）
inputEl.addEventListener("blur", () => {
    setTimeout(() => {
        suggestion.style.display = "none";
    }, 200);
});


const feedbackBtn = document.getElementById("feedbackBtn");

feedbackBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(window.WEB_BASE + "/intro?tab=suggestions","_blank");
});

document.getElementById('refreshBtn').addEventListener('click', function() {
    showToast("開始刷新，請稍等頁面加載", 'darkgreen');
    setTimeout(() => {
        // 获取页面上的所有 <script> 和 <link> 标签（CSS 文件）
        var scripts = document.getElementsByTagName('script');
        var links = document.getElementsByTagName('link');

        // 强制重新加载所有 <script> 标签的资源
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src) {
                // 删除并重新添加 <script> 标签来强制重新加载资源
                var newScript = document.createElement('script');
                newScript.src = src + '?t=' + new Date().getTime();  // 添加时间戳避免缓存
                document.body.appendChild(newScript);
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
        // 强制重新加载所有 <link> 标签（CSS 文件）
        for (var i = 0; i < links.length; i++) {
            var href = links[i].href;
            if (href && links[i].rel === 'stylesheet') {
                // 删除并重新添加 <link> 标签来强制重新加载资源
                var newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = href + '?t=' + new Date().getTime();  // 添加时间戳避免缓存
                document.head.appendChild(newLink);
                links[i].parentNode.removeChild(links[i]);
            }
        }

        // 不清除 localStorage 和 sessionStorage
        // location.reload();  // 如果不想清除 storage，直接刷新页面
        window.location.reload();  // 重新加载页面，但不清除 localStorage 和 sessionStorage
    }, 1000);  // 延迟 1000 毫秒（1 秒）
});


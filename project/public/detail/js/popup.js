// 監聽點擊，關閉彈窗
document.addEventListener('click', (e) => {
    const popup = document.getElementById('popup');
    const popup2 = document.getElementById('popup2');
    const popup3 = document.getElementById('popup3');
    // const popup = document.getElementById('popup');  // 确保弹窗的 id 或类名正确/
    // map裡的---监听点击事件，点击外部关闭弹窗
    // 如果点击的不是弹窗和按钮，就关闭弹窗
    if (!popup.contains(e.target) && !e.target.closest('.amap-overlay-text-container')) {
        popup.classList.remove("active");
        // popup.style.opacity = '0';            // 隐藏弹窗
        // popup.style.visibility = 'hidden';    // 确保弹窗不可见
        // popup.style.display = 'none';         // 确保弹窗隐藏
        clearPopup();
    }
    if(!popup2.contains(e.target) && !e.target.closest('.amap-layer')) {
        popup2.classList.remove("active");
    }

    // 表格模式---點擊外部關閉彈窗
    if(!popup3.contains(e.target)){
        popup3.classList.remove("active");
    }
});

// map---清空弹窗的函数
function clearPopup() {
    // 清空弹窗内容
    const locationNameEl = document.getElementById("location-name");
    const featureEl = document.getElementById("feature");
    const detailContentEl = document.getElementById("detail-content");
    const noteEl = document.getElementById("notes1");
    // const locationNameEl2 = document.getElementById("location-name2");
    // const featureEl2 = document.getElementById("feature2");

    // 清空内容
    if (locationNameEl) locationNameEl.textContent = '';
    if (featureEl) featureEl.textContent = '';
    if (detailContentEl) detailContentEl.innerHTML = '';  // 清空HTML内容
    if (noteEl) noteEl.innerHTML = '';  // 清空HTML内容
    // if (locationNameEl2) locationNameEl2.textContent = '';
    // if (featureEl2) featureEl2.textContent = '';
}


// 彈窗定位與顯示
function positionAndShowPopup({ popupEl, event, offsetTop = 30, offsetLeft = 30, fallbackSize = { width: 300, height: 150 } }) {
    if (!popupEl) return;

    const nativeEvent = event.originalEvent || event;
    const originEvent = nativeEvent.originEvent || nativeEvent;

    const mouseY = originEvent.clientY;
    const mouseX = originEvent.clientX;

    // 取實際 popup 尺寸，否則 fallback
    let popupWidth = popupEl.offsetWidth || fallbackSize.width;
    let popupHeight = popupEl.offsetHeight || fallbackSize.height;

    // 垂直位置
    const popupTop = mouseY - popupHeight - offsetTop;
    const maxTop = 20;
    popupEl.style.top = `${Math.max(popupTop, maxTop)}px`;

    // 水平位置
    const popupLeft = mouseX - popupWidth / 2 - offsetLeft;
    const maxLeft = 20;
    const maxRight = window.innerWidth - popupWidth - 20;
    popupEl.style.left = `${Math.min(Math.max(popupLeft, maxLeft), maxRight)}px`;

    // 樣式處理
    popupEl.style.position = 'fixed';
    popupEl.classList.add('active');

    // 阻止冒泡
    if (nativeEvent && typeof nativeEvent.stopPropagation === 'function') {
        nativeEvent.stopPropagation();
    }
}


function showToast(message, color, top) {
    const toast = document.getElementById("toast");
    // 替換換行符為 <br>
    toast.innerHTML = message.replace(/\n/g, "<br>");

    // 如果提供了颜色，就使用；否则保留原样
    if (color) {
        toast.style.color = color;
    } else {
        toast.style.color = ""; // 恢复默认样式表颜色
    }
    if (top){
        toast.style.top = top+'%'
    }
    else{
        toast.style.top = ''
    }
    toast.className = "show";

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}

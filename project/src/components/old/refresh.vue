<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goToLike = ()=>{
  router.push('/intro?tab=like')
}

const handleRefresh = () => {
  // 重新加載所有的 CSS
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  styles.forEach(style => {
    if (style.href) {
      const newStyle = style.cloneNode();
      // 添加時間戳避免緩存
      newStyle.href = `${style.href.split('?')[0]}?t=${new Date().getTime()}`;
      style.parentNode.replaceChild(newStyle, style);
    }
  });
  // 重新加載所有的 JS
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  scripts.forEach(script => {
    if (script.src) {
      const newScript = script.cloneNode();
      // 添加時間戳避免緩存
      newScript.src = `${script.src.split('?')[0]}?t=${new Date().getTime()}`;
      script.parentNode.replaceChild(newScript, script);
    }
  });
};

</script>

<template>
  <div class="refresh-button-container">
    <button @click="handleRefresh" class="refresh-button">
      刷新
    </button>
    <button @click="goToLike" class="refresh-button" style="background: rgba(139,0,0,0.64)">
      喜歡作者
    </button>
  </div>
</template>

<style scoped>
.refresh-button-container {
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
  gap:10px;
  margin-top: 3dvh;
}

.refresh-button {
  padding: 6px 10px;
  font-size: 16px;
  background-color: rgba(76, 175, 80, 0.69);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.refresh-button:hover {
  background-color: #45a049;
}
</style>
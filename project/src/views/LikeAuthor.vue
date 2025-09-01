<template>
  <div>
    <div class="cards-container">
    <h2 class="tabs-title" style="margin-bottom: 0.5rem">❤️ 喜歡作者</h2>
    <p style="margin: 0">如果你覺得項目不錯，可以給個 star ⭐️ 嗎！</p>

      <a
          class="project-card"
          v-for="project in projects"
          :key="project.name"
          :href="project.url"
          target="_blank"
          rel="noopener noreferrer"
      >
        <div class="card-header">
          <img class="github-icon" src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" />
          <span class="thanks-link" style="font-weight: bold">{{ project.name }}</span>
        </div>
        <p>{{ project.description }}</p>
        <div class="glow-border"></div>
      </a>

    </div>
  </div>
</template>

<script setup>
const projects = [
  {
    name: 'dialects-js-frontend',
    url: 'https://github.com/jengzang/dialects-js-frontend',
    description: '前端倉庫 - 使用原生js和vue開發'
  },
  {
    name: 'dialects-backend',
    url: 'https://github.com/jengzang/dialects-backend',
    description: '後端倉庫 - 基於fastapi'
  },
  {
    name: 'dialects-build',
    url: 'https://github.com/jengzang/dialects-build',
    description: '字表預處理倉庫 - 提取各種格式字表的聲韻調'
  },
]
</script>

<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  text-align: center;
}

.project-card {
  position: relative;
  display: block;
  flex: 1 1 300px;
  max-width: 350px;
  background-color: #ffffff; /* 主體白色 */
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  z-index: 0;
  border: 2px solid transparent; /* 邊框起手設置 */
}

.project-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 0 12px rgba(63, 142, 255, 0.2);
}

/* 呼吸邊框效果 */
.project-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 14px;
  background: linear-gradient(45deg, #7ec8ff, #d0eaff, #7ec8ff);
  background-size: 400% 400%;
  animation: breathing 6s ease infinite;
  z-index: -1;
  filter: blur(4px);
  opacity: 0.5;
}

@keyframes breathing {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #3f8eff; /* 蘋果藍，清爽版 */
}

.github-icon {
  width: 22px;
  height: 22px;
  margin-right: 0.5rem;
}

.project-card p {
  color: #444;
  line-height: 1.6;
  margin: 0.5rem 0.5rem 0.2rem;
  font-size: 1rem;
  white-space: nowrap;
}

/* ✅ 手機版適配 */
@media (max-width: 600px) {
  .project-card {
    padding: 1.5rem;
  }

  .card-header {
    font-size: 1.4rem;
  }

  .project-card p {
    font-size: 1.1rem;
  }

  .github-icon {
    width: 24px;
    height: 24px;
  }
}

</style>

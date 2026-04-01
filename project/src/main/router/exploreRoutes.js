const CheckTool = () => import('@/main/views/explore/tools/CheckTool.vue')
const Jyut2IpaTool = () => import('@/main/views/explore/tools/Jyut2IpaTool.vue')
const MergeTool = () => import('@/main/views/explore/tools/MergeTool.vue')
const PraatPage = () => import('@/main/views/Praat.vue')
const YuBaoPage = () => import('@/main/views/explore/word/YuBaoPage.vue')

export const exploreRoutes = [
  {
    path: '/explore/tools/check',
    component: CheckTool
  },
  {
    path: '/explore/tools/jyut2ipa',
    component: Jyut2IpaTool
  },
  {
    path: '/explore/tools/merge',
    component: MergeTool
  },
  {
    path: '/explore/tools/praat',
    component: PraatPage
  },
  {
    path: '/explore/yubao',
    component: YuBaoPage
  }
]

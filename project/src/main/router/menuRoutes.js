const PhoPage = () => import('@/main/views/menu/PhoPage.vue')
const AboutPage = () => import('@/main/views/menu/support/AboutPage.vue')

export const menuRoutes = [
  {
    path: '/pho/:section(matrix|custom|count|evolution)',
    component: PhoPage
  },
  {
    path: '/about/:section(intro|suggestion|like|settings)',
    component: AboutPage
  }
]

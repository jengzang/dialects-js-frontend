import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRouteQueryState(key, options = {}) {
  const {
    defaultValue = null,
    parse = (value) => value,
    serialize = (value) => value,
    replace = false,
    removeIf = (value) => value === null || value === undefined || value === '',
  } = options

  const route = useRoute()
  const router = useRouter()

  function normalizeFromRoute(value) {
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }

    const parsedValue = parse(value)
    if (parsedValue === undefined || parsedValue === null || parsedValue === '') {
      return defaultValue
    }

    return parsedValue
  }

  const state = ref(normalizeFromRoute(route.query[key]))

  watch(() => route.query[key], (value) => {
    const nextValue = normalizeFromRoute(value)
    if (state.value !== nextValue) {
      state.value = nextValue
    }
  })

  async function set(value) {
    const nextQuery = { ...route.query }
    const serialized = serialize(value)

    if (removeIf(serialized)) {
      delete nextQuery[key]
    } else {
      nextQuery[key] = serialized
    }

    const navigation = {
      query: nextQuery,
    }

    state.value = value
    if (replace) {
      await router.replace(navigation)
      return
    }

    await router.push(navigation)
  }

  return {
    state,
    set,
  }
}

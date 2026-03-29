<template>
  <Teleport :to="teleportTo">
    <Transition :name="transitionName">
      <div
        v-if="modelValue"
        :class="overlayClasses"
        :style="overlayStyle"
        @mousedown.self="handleBackdropClose"
      >
        <div
          :class="surfaceClasses"
          :style="surfaceStyle"
          :role="dialogRole"
          :aria-modal="dialogRole === 'dialog' ? 'true' : undefined"
          @click.stop
        >
          <div
            v-if="hasHeader"
            :class="headerClasses"
            :style="headerStyle"
          >
            <slot name="header">
              <component
                :is="titleTag"
                v-if="title"
                :class="titleClasses"
                :style="titleStyle"
              >
                {{ title }}
              </component>
              <button
                v-if="showClose"
                type="button"
                :class="resolvedCloseButtonClass"
                :aria-label="closeLabel"
                @click="close"
              >
                {{ closeText }}
              </button>
            </slot>
          </div>

          <div
            :class="bodyClasses"
            :style="bodyStyle"
          >
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'query'
  },
  title: {
    type: String,
    default: ''
  },
  titleTag: {
    type: String,
    default: 'h3'
  },
  transitionName: {
    type: String,
    default: 'modal-fade'
  },
  teleportTo: {
    type: String,
    default: 'body'
  },
  overlayClass: {
    type: [String, Array, Object],
    default: ''
  },
  overlayStyle: {
    type: [String, Array, Object],
    default: ''
  },
  surfaceClass: {
    type: [String, Array, Object],
    default: ''
  },
  surfaceStyle: {
    type: [String, Array, Object],
    default: ''
  },
  headerClass: {
    type: [String, Array, Object],
    default: ''
  },
  headerStyle: {
    type: [String, Array, Object],
    default: ''
  },
  bodyClass: {
    type: [String, Array, Object],
    default: ''
  },
  bodyStyle: {
    type: [String, Array, Object],
    default: ''
  },
  titleClass: {
    type: [String, Array, Object],
    default: ''
  },
  titleStyle: {
    type: [String, Array, Object],
    default: ''
  },
  closeButtonClass: {
    type: [String, Array, Object],
    default: ''
  },
  closeLabel: {
    type: String,
    default: 'Close'
  },
  closeText: {
    type: String,
    default: '\u00D7'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  dialogRole: {
    type: String,
    default: 'dialog'
  }
})

const emit = defineEmits(['update:modelValue', 'close'])
const slots = useSlots()

const defaultCloseButtonClassMap = {
  query: 'close-btn close-btn-sm close-btn-inline',
  tool: 'close-btn close-btn-lg close-btn-inline',
  glass: 'close-btn close-btn-lg close-btn-inline',
  crud: 'close-btn close-btn-lg close-btn-inline'
}

const hasHeader = computed(() => Boolean(slots.header) || Boolean(props.title) || props.showClose)

const overlayClasses = computed(() => [
  'app-modal__overlay',
  props.overlayClass
])

const surfaceClasses = computed(() => [
  'app-modal__surface',
  `app-modal__surface--${props.variant}`,
  props.surfaceClass
])

const headerClasses = computed(() => [
  'app-modal__header',
  `app-modal__header--${props.variant}`,
  props.headerClass
])

const bodyClasses = computed(() => [
  'app-modal__body',
  'u-scrollbar',
  `app-modal__body--${props.variant}`,
  props.bodyClass
])

const titleClasses = computed(() => [
  'app-modal__title',
  `app-modal__title--${props.variant}`,
  props.titleClass
])

const resolvedCloseButtonClass = computed(() => {
  if (props.closeButtonClass) {
    return props.closeButtonClass
  }

  return defaultCloseButtonClassMap[props.variant] || defaultCloseButtonClassMap.query
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClose() {
  if (!props.closeOnBackdrop) {
    return
  }

  close()
}
</script>

<style scoped lang="scss">
@use '../../styles/global/scrollbars' as scrollbars;

.app-modal__overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--overlay-z-index, 10000);
  padding: var(--overlay-padding, 18px);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.app-modal__surface {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.app-modal__title {
  margin: 0;
  line-height: 1.3;
}

.app-modal__body {
  flex: 1;
  min-height: 0;
  @include scrollbars.visible-scrollbar;
  @include scrollbars.visible-scrollbar-webkit;
}

.app-modal__surface--query {
  width: var(--main-query-modal-width, min(720px, 94vw));
  max-height: var(--main-query-modal-max-height, min(70vh, 640px));
  background: var(--main-query-modal-background, var(--glass-lighter2));
  border: 1px solid var(--main-query-modal-border-color, var(--border-gray-lighter));
  border-radius: var(--main-query-modal-radius, 18px);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

.app-modal__header--query {
  padding: var(--main-query-modal-header-padding, 12px 14px);
  border-bottom: 1px solid var(--border-gray-lightest);
}

.app-modal__title--query {
  font-size: 15px;
  font-weight: 650;
  color: var(--text-dark-light);
}

.app-modal__body--query {
  padding: var(--main-query-modal-body-padding, 12px 14px 16px);
  overflow: auto;
  max-height: calc(
    var(--main-query-modal-max-height, min(70vh, 640px)) -
    var(--main-query-modal-body-offset, 100px)
  );
}

.app-modal__surface--tool {
  width: var(--main-tool-modal-width, min(90vw, 700px));
  max-height: var(--main-tool-modal-max-height, 85vh);
  background: var(--main-tool-modal-background, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--main-tool-modal-border-color, rgba(255, 255, 255, 0.6));
  border-radius: var(--main-tool-modal-radius, 24px);
  box-shadow: var(--main-tool-modal-shadow, 0 16px 64px rgba(0, 0, 0, 0.2));
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
}

.app-modal__header--tool {
  padding: var(--main-tool-modal-header-padding, 20px 24px);
  border-bottom: 1px solid var(--main-tool-modal-header-border-color, rgba(255, 255, 255, 0.5));
}

.app-modal__title--tool {
  font-size: 20px;
  font-weight: 600;
  color: #0b2540;
}

.app-modal__body--tool {
  padding: var(--main-tool-modal-body-padding, 20px 24px);
  overflow-y: var(--main-tool-modal-body-overflow-y, auto);
  overflow-x: hidden;
}

.app-modal__surface--glass {
  width: var(--main-glass-modal-width, min(720px, 94vw));
  max-height: var(--main-glass-modal-max-height, min(70vh, 640px));
  background: var(--main-glass-modal-background, rgba(255, 255, 255, 0.85));
  border: var(--main-glass-modal-border, 1px solid rgba(255, 255, 255, 0.5));
  border-radius: var(--main-glass-modal-radius, 18px);
  box-shadow: var(--main-glass-modal-shadow, 0 20px 60px rgba(0, 0, 0, 0.3));
  backdrop-filter: var(--main-glass-modal-backdrop-filter, blur(18px) saturate(160%));
  -webkit-backdrop-filter: var(--main-glass-modal-backdrop-filter, blur(18px) saturate(160%));
}

.app-modal__header--glass {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.app-modal__title--glass {
  font-size: 15px;
  font-weight: 650;
  color: #1d1d1f;
}

.app-modal__body--glass {
  padding: 12px 14px 16px;
  overflow: auto;
}

.app-modal__surface--crud {
  width: 100%;
  max-width: var(--main-crud-modal-width, min(800px, 100%));
  max-height: var(--main-crud-modal-max-height, 90vh);
  background: var(--main-crud-modal-background, rgba(255, 255, 255, 0.95));
  border: var(--main-crud-modal-border, 1px solid rgba(255, 255, 255, 0.3));
  border-radius: var(--main-crud-modal-radius, 18px);
  box-shadow: var(--main-crud-modal-shadow, 0 20px 60px rgba(0, 0, 0, 0.3));
  backdrop-filter: var(--main-crud-modal-backdrop-filter, blur(40px) saturate(180%));
  -webkit-backdrop-filter: var(--main-crud-modal-backdrop-filter, blur(40px) saturate(180%));
}

.app-modal__header--crud {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.app-modal__title--crud {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.app-modal__body--crud {
  overflow: auto;
}
</style>

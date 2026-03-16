// @vitest-environment jsdom
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CharactersPagination from '../app/components/characters/CharactersPagination.vue'

const UButtonStub = defineComponent({
  name: 'UButton',
  props: {
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  template: `<button :disabled="disabled" @click="$emit('click')">{{ label }}</button>`
})

describe('CharactersPagination', () => {
  it('emits goToPage when clicking visible page and next', async () => {
    const wrapper = mount(CharactersPagination, {
      props: {
        currentPage: 2,
        totalPages: 5,
        visiblePages: [1, 2, 3]
      },
      global: {
        components: {
          UButton: UButtonStub
        }
      }
    })

    const buttons = wrapper.findAll('button')
    const pageThree = buttons.find(button => button.text() === '3')
    const next = buttons.find(button => button.text() === 'Next')

    expect(pageThree).toBeDefined()
    expect(next).toBeDefined()

    await pageThree!.trigger('click')
    await next!.trigger('click')

    expect(wrapper.emitted('goToPage')).toEqual([[3], [3]])
  })

  it('disables previous/next at boundaries', () => {
    const firstPage = mount(CharactersPagination, {
      props: {
        currentPage: 1,
        totalPages: 3,
        visiblePages: [1, 2, 3]
      },
      global: {
        components: {
          UButton: UButtonStub
        }
      }
    })

    const firstButtons = firstPage.findAll('button')
    expect(firstButtons.find(button => button.text() === 'Previous')?.attributes('disabled')).toBeDefined()
    expect(firstButtons.find(button => button.text() === 'Next')?.attributes('disabled')).toBeUndefined()

    const lastPage = mount(CharactersPagination, {
      props: {
        currentPage: 3,
        totalPages: 3,
        visiblePages: [1, 2, 3]
      },
      global: {
        components: {
          UButton: UButtonStub
        }
      }
    })

    const lastButtons = lastPage.findAll('button')
    expect(lastButtons.find(button => button.text() === 'Previous')?.attributes('disabled')).toBeUndefined()
    expect(lastButtons.find(button => button.text() === 'Next')?.attributes('disabled')).toBeDefined()
  })
})

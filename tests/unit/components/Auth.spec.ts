import { flushPromises, mount } from '@vue/test-utils'
import Auth from '@/views/Auth.vue'
import * as utils from '@/utils'
import { addresses } from '../mock/accounts'
import { capacityCells } from '../mock/cells'
import { message } from 'ant-design-vue'

describe("View Render", () => {

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  })

  it("show connect button", done => {
    const wrapper = mount(Auth)
    wrapper.vm.$nextTick(() => {
      expect(wrapper.html()).toContain("Connect Wallet")
      expect(wrapper.html()).toContain("Free CKB")
      expect(wrapper.html()).toContain("CKB")
      expect(wrapper.html()).toContain("Address")
      done()
    }) })

  it("displays wallet info after first connect", done => {
    jest.spyOn(utils, "requestAuth").mockResolvedValue({ token: "688f3bc1-8779-4928-8a28-5a11ea727370:1608811335854:0.09858373898619299", networkId: "ckt" })
    jest.spyOn(utils, "queryAddresses").mockResolvedValue(addresses)
    jest.spyOn(utils, "getCells").mockResolvedValue(capacityCells)

    const messageWrapper = mount(message)
    const wrapper = mount(Auth)
    wrapper.vm.$nextTick(async () => {
      wrapper.find('a-button').trigger('click')
      await flushPromises()
      expect(wrapper.html()).toContain("Connected(Testnet)")
      expect(wrapper.html()).toContain(addresses.addresses[0].address)
      expect(wrapper.html()).toContain("11000.00000000")

      done()
    })
  })
})

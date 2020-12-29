import { UnderscoreScript } from '@/interface'
import * as utils from '@/utils'
import { combineInputCells, getBiggestCapacityCell, isKeyperingConnected, showTransactionModal } from '@/utils'
import { ComponentPublicInstance } from 'vue'
import { capacityCells, hybridCells } from '../mock/cells'
import { addresses } from '../mock/accounts'

describe('combineInputCells', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns [] when no cells', async () => {
    jest.spyOn(utils, "getCells").mockResolvedValue([])

    await expect(combineInputCells()).resolves.toEqual([])
  })

  it('returns [] when sudtCells length equal 0', async () => {
    jest.spyOn(utils, "getCells").mockResolvedValue(capacityCells)

    await expect(combineInputCells()).resolves.toEqual([])
  })

  it('returns hybrid cells', async () => {
    jest.spyOn(utils, "getCells").mockResolvedValue(hybridCells)

    await expect(combineInputCells()).resolves.toEqual(hybridCells)
  })
})

describe('getBiggestCapacityCell', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns biggest cell', async () => {
    jest.spyOn(utils, "getCells").mockResolvedValue(capacityCells)
    const lockScript: UnderscoreScript = {
      code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
      hash_type: "type",
      args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
    }

    await expect(getBiggestCapacityCell(lockScript)).resolves.toEqual(capacityCells[1])
  })
})

describe('showTransactionModal', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns false when address is undefined', async () => {
    const fn = jest.fn() as unknown as ComponentPublicInstance
    fn.$t = jest.fn()
    jest.spyOn(utils, "getTransaction").mockResolvedValue({ tx_status: { status: "committed" } })

    await expect(showTransactionModal("0xtx", fn)).resolves.toEqual(undefined)
  })
})

describe('isKeyperingConnected', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  const fn = jest.fn() as unknown as ComponentPublicInstance

  it('returns false when address is undefined', async () => {
    jest.spyOn(utils, "queryAddresses").mockResolvedValue(undefined)

    await expect(isKeyperingConnected(fn)).resolves.toBeFalsy
  })

  it('returns false when address is exist', async () => {
    jest.spyOn(utils, "queryAddresses").mockResolvedValue(addresses)

    await expect(isKeyperingConnected(fn)).resolves.toBeTruthy
  })

  it("returns false when error is 'Failed to fetch'", async () => {
    jest.spyOn(utils, "queryAddresses").mockImplementation(() => {
      throw new Error("Failed to fetch")
    })

    await expect(isKeyperingConnected(fn)).resolves.toBeFalsy
  })

  it("returns false when error is other", async () => {
    jest.spyOn(utils, "queryAddresses").mockImplementation(() => {
      throw new Error("Unkown Error")
    })

    await expect(isKeyperingConnected(fn)).resolves.toBeTruthy
  })
})

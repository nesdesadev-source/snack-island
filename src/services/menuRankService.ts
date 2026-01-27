import { supabase } from '../supabase'

export interface MenuRank {
  id: string
  menu_id: string
  rank: number
  created_at?: string
  updated_at?: string
}

export const menuRankService = {
  async getMenuRanks(): Promise<MenuRank[]> {
    const { data, error } = await supabase.rpc('get_menu_ranks')
    if (error) throw error
    return data as MenuRank[]
  },

  async updateMenuRank(menuId: string, rank: number): Promise<boolean> {
    const { error } = await supabase.rpc('update_menu_rank', {
      p_menu_id: menuId,
      p_rank: rank
    })
    if (error) throw error
    return true
  },

  async swapRanks(menuId1: string, menuId2: string): Promise<boolean> {
    const { error } = await supabase.rpc('swap_menu_ranks', {
      p_menu_id_1: menuId1,
      p_menu_id_2: menuId2
    })
    if (error) throw error
    return true
  },

  async moveRankUp(menuId: string, ranks: MenuRank[]): Promise<boolean> {
    const currentRank = ranks.find(r => r.menu_id === menuId)
    if (!currentRank) {
      throw new Error('Menu item rank not found')
    }

    const targetRank = ranks.find(r => r.rank === currentRank.rank - 1)
    if (!targetRank) {
      throw new Error('Cannot move up: already at top')
    }

    return await this.swapRanks(menuId, targetRank.menu_id)
  },

  async moveRankDown(menuId: string, ranks: MenuRank[]): Promise<boolean> {
    const currentRank = ranks.find(r => r.menu_id === menuId)
    if (!currentRank) {
      throw new Error('Menu item rank not found')
    }

    const targetRank = ranks.find(r => r.rank === currentRank.rank + 1)
    if (!targetRank) {
      throw new Error('Cannot move down: already at bottom')
    }

    return await this.swapRanks(menuId, targetRank.menu_id)
  },

  async initializeRanks(): Promise<number> {
    const { data, error } = await supabase.rpc('initialize_menu_ranks')
    if (error) throw error
    return data as number
  }
}

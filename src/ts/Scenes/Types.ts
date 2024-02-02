// TODO
/*

Tile
Item
Hero
Npc

*/

export type CellType = 'v-wall' | 'h-wall' | 'tree' | 'grass' | 'lightgrass' | 'grove' | 'bush'

export type ItemType = 'pen' | 'ability' | 'mud'

export type Item = {
    typ: ItemType
}

export type Cell = {
    typ: CellType
    item: Item | undefined
}

export type Hero = {
    x: number
    y: number
}

export type MudSnapperGame = {
    board: Cell[][]
    hero: Hero
}

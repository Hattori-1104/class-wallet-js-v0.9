import { useState } from "react"

export type useMapStateOperatorType<K, V> = { set: (key: K, value: V) => Map<K, V>; delete: (key: K) => boolean; clear: () => void }
export type useMapStateType<K, V> = [Map<K, V>, useMapStateOperatorType<K, V>]

export const useMapState = <K, V>(initialState: Map<K, V>): useMapStateType<K, V> => {
  const [mapState, setMapState] = useState<Map<K, V>>(initialState)

  const operator = {
    set: (key: K, value: V): Map<K, V> => {
      let newMap: Map<K, V> = new Map()
      setMapState((prevMap) => {
        newMap = new Map(prevMap)
        newMap.set(key, value)
        return newMap
      })
      return newMap
    },

    delete: (key: K): boolean => {
      let deleted = false
      setMapState((prevMap) => {
        const newMap = new Map(prevMap)
        deleted = newMap.delete(key)
        return newMap
      })
      return deleted
    },

    clear: (): void => {
      setMapState(new Map())
    },
  }
  return [mapState, operator]
}

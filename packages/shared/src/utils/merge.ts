/**
 * 合并对象，只有当源对象的属性不是 undefined 时才覆盖目标对象的属性
 * @param target 目标对象（默认配置）
 * @param source 源对象（用户配置）
 * @returns 合并后的新对象
 */
export function merge<T extends Record<string, any>, U extends Partial<T>>(
  target: T,
  source: U,
): T & U {
  const result = { ...target } as T & U

  for (const key in source) {
    if (source[key] !== undefined) {
      ;(result as any)[key] = source[key]
    }
  }

  return result
}

/**
 * 深度合并对象，只有当源对象的属性不是 undefined 时才覆盖目标对象的属性
 * @param target 目标对象（默认配置）
 * @param source 源对象（用户配置）
 * @returns 合并后的新对象
 */
export function deepMerge<T extends Record<string, any>, U extends Partial<T>>(
  target: T,
  source: U,
): T & U {
  const result = { ...target } as T & U

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object'
        && source[key] !== null
        && !Array.isArray(source[key])
        && typeof target[key] === 'object'
        && target[key] !== null
        && !Array.isArray(target[key])
      ) {
        // 递归深度合并对象
        ;(result as any)[key] = deepMerge(target[key], source[key])
      }
      else {
        ;(result as any)[key] = source[key]
      }
    }
  }

  return result
}

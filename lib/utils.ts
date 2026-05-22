export const formatCurrency = (n: number) => `$${n.toLocaleString()}`

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

export const generateId = () => `0000000${Math.floor(Math.random() * 16 ** 8).toString(16)}`.slice(-8)

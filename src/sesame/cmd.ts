export const SesameCMD = {
    Toggle: 88,
    Lock: 82,
    UnLock: 83
} as const;

export type SesameCMD = typeof SesameCMD[keyof typeof SesameCMD];
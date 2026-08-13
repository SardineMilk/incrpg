// new file: structures/modifierDefs.js
import { resolveFormulas } from "./formulaDefs.js";

export const MODIFIER_DEFS = {
  amount: {
    create: (amount) => ({ type: "amount", amount }),
    apply: (resolved, m) => ({ ...resolved, amount: resolved.amount + m.amount }),
  },
  amountMult: {
    create: (amount) => ({ type: "amountMult", amount }),
    apply: (resolved, m) => ({ ...resolved, amount: resolved.amount * m.amount }),
  },
  statLayer: {
    create: ({ flat = 0, percent = 0, multiplier = 1 } = {}) => ({ type: "statLayer", flat, percent, multiplier }),
    apply: (resolved, m) => ({
      ...resolved,
      flat: (resolved.flat ?? 0) + m.flat,
      percent: (resolved.percent ?? 1) + m.percent,
      multiplier: (resolved.multiplier ?? 1) * m.multiplier,
    }),
  },
  cancel: {
    create: () => ({ type: "cancel" }),
    apply: (resolved) => ({ ...resolved, cancelled: true }),
  },
};

export const mod = Object.fromEntries(
  Object.entries(MODIFIER_DEFS).map(([key, def]) => [key, def.create]),
);
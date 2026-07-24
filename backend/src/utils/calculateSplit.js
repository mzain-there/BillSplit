export const calculateSplitAmounts = (amount, members, splitType, customSplits = []) => {
  const splits = []

  if (splitType === "equal") {
    const shareAmount = parseFloat((amount / members.length).toFixed(2))
    members.forEach((userId) => {
      splits.push({ user: userId, amount: shareAmount, isPaid: false })
    })
  }

  if (splitType === "custom") {
    customSplits.forEach(({ userId, amount: customAmount }) => {
      splits.push({ user: userId, amount: customAmount, isPaid: false })
    })
  }

  if (splitType === "percentage") {
    customSplits.forEach(({ userId, percentage }) => {
      const shareAmount = parseFloat(((percentage / 100) * amount).toFixed(2))
      splits.push({ user: userId, amount: shareAmount, isPaid: false })
    })
  }

  return splits
}


// Calculate who owes who in a group
export const calculateBalances = (expenses, currentUserId) => {
  const balances = {}

  expenses.forEach((expense) => {
    if (!expense.paidBy) return
    const paidBy = (expense.paidBy._id || expense.paidBy).toString()

    if (!expense.splits || !Array.isArray(expense.splits)) return

    expense.splits.forEach((split) => {
      if (!split.user) return
      const owedBy = (split.user._id || split.user).toString()

      // Skip if same person
      if (paidBy === owedBy) return
      // Skip if already settled
      if (split.isPaid) return

      if (!balances[owedBy]) balances[owedBy] = {}
      if (!balances[owedBy][paidBy]) balances[owedBy][paidBy] = 0

      balances[owedBy][paidBy] += split.amount
    })
  })

  return balances
}


// Simplify debts — reduce transactions to minimum
export const simplifyDebts = (balances) => {
  const simplified = []
  const netBalance = {}

  // Calculate net balance for each person
  Object.entries(balances).forEach(([owedBy, creditors]) => {
    Object.entries(creditors).forEach(([paidBy, amount]) => {
      if (!netBalance[owedBy]) netBalance[owedBy] = 0
      if (!netBalance[paidBy]) netBalance[paidBy] = 0
      netBalance[owedBy] -= amount
      netBalance[paidBy] += amount
    })
  })

  // Separate debtors and creditors
  const debtors = []
  const creditors = []

  Object.entries(netBalance).forEach(([userId, balance]) => {
    if (balance < 0) debtors.push({ userId, amount: -balance })
    if (balance > 0) creditors.push({ userId, amount: balance })
  })

  // Match debtors with creditors
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const settleAmount = Math.min(debtor.amount, creditor.amount)

    simplified.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(settleAmount.toFixed(2)),
    })

    debtor.amount -= settleAmount
    creditor.amount -= settleAmount

    if (debtor.amount === 0) i++
    if (creditor.amount === 0) j++
  }

  return simplified
}
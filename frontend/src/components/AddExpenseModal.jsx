import React, { useEffect, useMemo, useState } from 'react'

export default function AddExpenseModal({
  open = true,
  onClose = () => {},
  onSubmit = () => {},
  loading = false,
  initialData = null,
  groups = [],
  selectedGroupId = '',
  onGroupChange = () => {},
  members = [],
}) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    groupId: selectedGroupId || groups[0]?._id || '',
  })
  const [splitType, setSplitType] = useState('equal')
  const [customSplits, setCustomSplits] = useState([])
  const [formError, setFormError] = useState('')

  const memberList = useMemo(() => {
    if (members?.length) return members

    if (groups?.length && form.groupId) {
      const selectedGroup = groups.find((group) => group._id === form.groupId)
      return (selectedGroup?.members || []).map((member) => member.user || member)
    }

    return []
  }, [members, groups, form.groupId])

  // Initialize form inputs ONLY when opening modal or changing initialData/selectedGroupId
  useEffect(() => {
    if (open) {
      const nextGroupId = selectedGroupId || initialData?.groupId || groups[0]?._id || ''
      const dateVal = initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      setForm({
        title: initialData?.title || '',
        amount: initialData?.amount != null ? String(initialData.amount) : '',
        notes: initialData?.notes || '',
        date: dateVal,
        groupId: nextGroupId,
      })
      setSplitType(initialData?.splitType || 'equal')
      setFormError('')
    }
  }, [open, initialData, selectedGroupId, groups])

  // Initialize custom splits state when modal opens or members list is available
  useEffect(() => {
    if (open && memberList.length) {
      const defaultSplits = memberList.map((member) => {
        const userId = member._id || member.id || member.user?._id || member.user?.id
        const existingSplit = initialData?.splits?.find((split) => {
          const splitUserId = split.user?._id || split.user || split.userId
          return splitUserId === userId
        })

        return {
          userId,
          amount: existingSplit?.amount != null ? String(existingSplit.amount) : '',
          percentage: existingSplit?.percentage != null ? String(existingSplit.percentage) : '',
        }
      })
      setCustomSplits(defaultSplits)
    }
  }, [open, initialData, memberList])

  // Auto-calculate equal shares when amount or splitType changes
  useEffect(() => {
    if (splitType !== 'equal' || !memberList.length) return

    const numericAmount = Number(form.amount)
    const share = form.amount && !isNaN(numericAmount) && numericAmount > 0
      ? (numericAmount / memberList.length).toFixed(2)
      : ''

    setCustomSplits((prev) => {
      if (!prev.length) {
        return memberList.map((member) => ({
          userId: member._id || member.id || member.user?._id || member.user?.id,
          amount: share,
          percentage: '',
        }))
      }
      return prev.map((item) => ({ ...item, amount: share }))
    })
  }, [splitType, form.amount, memberList])

  if (!open) return null

  const handleSplitInputChange = (userId, field, value) => {
    setCustomSplits((prev) => prev.map((split) => (split.userId === userId ? { ...split, [field]: value } : split)))
  }

  const validateAndSubmit = (e) => {
    e.preventDefault()
    setFormError('')

    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Please enter a valid expense amount.')
      return
    }

    const payload = {
      title: form.title.trim(),
      amount,
      notes: form.notes.trim(),
      date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
      splitType,
      groupId: form.groupId || selectedGroupId || initialData?.groupId || groups[0]?._id || '',
    }

    if (splitType === 'custom') {
      const totalCustom = customSplits.reduce((sum, split) => sum + Number(split.amount || 0), 0)
      if (Math.abs(totalCustom - amount) > 0.01) {
        setFormError('Custom amounts must add up to the total expense amount.')
        return
      }

      payload.splits = customSplits
        .filter((split) => split.amount && Number(split.amount) > 0)
        .map((split) => ({ userId: split.userId, amount: Number(split.amount) }))
    }

    if (splitType === 'percentage') {
      const totalPercentage = customSplits.reduce((sum, split) => sum + Number(split.percentage || 0), 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setFormError('Percentages must add up to 100%.')
        return
      }

      payload.splits = customSplits
        .filter((split) => split.percentage && Number(split.percentage) > 0)
        .map((split) => ({ userId: split.userId, percentage: Number(split.percentage) }))
    }

    onSubmit(payload, payload.groupId)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-4 py-6">
      <div className="absolute inset-0 bg-surface/60 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-3xl border border-outline-variant/30 bg-background p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Expense</p>
            <h3 className="mt-2 font-headline-md text-headline-md">{initialData ? 'Edit Expense' : 'Add Expense'}</h3>
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-full glass-card hover:bg-surface-container" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="space-y-4 max-h-[75vh] overflow-y-auto pr-2" onSubmit={validateAndSubmit}>
          {!initialData && groups.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-semibold">Group</label>
              <select
                className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, groupId: e.target.value }))
                  onGroupChange(e.target.value)
                }}
                value={form.groupId}
              >
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">Title</label>
            <input
              className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Dinner, groceries, transport..."
              required
              value={form.title}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Amount (Rs.)</label>
              <input
                className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
                min="0.01"
                step="any"
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="500"
                required
                type="number"
                value={form.amount}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Date</label>
              <input
                className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
                type="date"
                value={form.date}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Split type</label>
            <div className="flex flex-wrap gap-2">
              {['equal', 'custom', 'percentage'].map((type) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${splitType === type ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                  key={type}
                  onClick={() => setSplitType(type)}
                  type="button"
                >
                  {type === 'equal' ? 'Equal' : type === 'custom' ? 'Custom amount' : 'Percentage'}
                </button>
              ))}
            </div>
          </div>

          {splitType === 'custom' && memberList.length > 0 && (
            <div className="space-y-3 rounded-2xl bg-surface-container-low p-4">
              <p className="text-sm font-semibold text-on-surface-variant">Assign amounts to each member</p>
              {customSplits.map((split) => {
                const member = memberList.find((item) => (item._id || item.id || item.user?._id || item.user?.id) === split.userId)
                const label = member?.name || member?.username || 'Member'
                return (
                  <div key={split.userId} className="flex items-center gap-3">
                    <div className="min-w-[120px] text-sm font-semibold">{label}</div>
                    <input
                      className="flex-1 rounded-xl border border-outline-variant/40 bg-background px-4 py-2.5 outline-none focus:border-primary"
                      onChange={(e) => handleSplitInputChange(split.userId, 'amount', e.target.value)}
                      placeholder="0"
                      type="number"
                      step="any"
                      value={split.amount}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {splitType === 'percentage' && memberList.length > 0 && (
            <div className="space-y-3 rounded-2xl bg-surface-container-low p-4">
              <p className="text-sm font-semibold text-on-surface-variant">Assign percentages to each member</p>
              {customSplits.map((split) => {
                const member = memberList.find((item) => (item._id || item.id || item.user?._id || item.user?.id) === split.userId)
                const label = member?.name || member?.username || 'Member'
                return (
                  <div key={split.userId} className="flex items-center gap-3">
                    <div className="min-w-[120px] text-sm font-semibold">{label}</div>
                    <input
                      className="flex-1 rounded-xl border border-outline-variant/40 bg-background px-4 py-2.5 outline-none focus:border-primary"
                      max="100"
                      min="0"
                      onChange={(e) => handleSplitInputChange(split.userId, 'percentage', e.target.value)}
                      placeholder="0%"
                      type="number"
                      step="any"
                      value={split.percentage}
                    />
                  </div>
                )
              })}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">Notes</label>
            <textarea
              className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional note"
              rows="3"
              value={form.notes}
            />
          </div>

          {formError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{formError}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button className="rounded-xl border border-outline-variant/40 px-5 py-3 font-semibold hover:bg-surface-container" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-70 hover:opacity-90" disabled={loading} type="submit">
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import GroupCard from '../components/GroupCard'
import axiosInstance from '../api/axios'

export default function Groups() {
  const navigate = useNavigate()
  const location = useLocation()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/groups')
      setGroups(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch groups:', err)
      setError('Unable to load your groups right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('A group name is required.')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      if (avatar) formData.append('avatar', avatar)

      const res = await axiosInstance.post('/groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSuccess(res.data.message || 'Group created successfully')
      setName('')
      setDescription('')
      setAvatar(null)
      fetchGroups()
      navigate(`/groups/${res.data.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create group.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-8 py-12 md:py-20">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary font-label-md uppercase tracking-[0.2em]">Groups</p>
            <h1 className="font-display-xl text-display-xl text-on-surface leading-tight mt-2">
              Manage your shared expenses
            </h1>
          </div>
          <div className="text-sm text-on-surface-variant">
            {location.pathname === '/groups/create' ? 'Create a fresh group' : 'Create, view, and manage all your groups'}
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-8 mb-12">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-headline-md text-headline-md mb-4">Create Group</h2>
            <p className="text-on-surface-variant mb-6">Start a new shared space for your trips, house expenses, or projects.</p>

            {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}
            {success && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">{success}</div>}

            <form className="space-y-4" onSubmit={handleCreateGroup}>
              <div>
                <label className="mb-2 block text-sm font-semibold">Group name</label>
                <input
                  className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
                  placeholder="Summer trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Description</label>
                <textarea
                  className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
                  placeholder="Add a short description"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Group image</label>
                <input
                  className="w-full rounded-xl border border-dashed border-outline-variant/40 bg-background px-4 py-3"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                />
              </div>
              <button
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>

          <div>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-headline-md text-headline-md">Your Groups</h2>
              <span className="text-sm text-on-surface-variant">{groups.length} total</span>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-container" />)}
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 p-10 text-center text-on-surface-variant">
                You have not joined any groups yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {groups.map((group) => (
                  <GroupCard
                    key={group._id}
                    image={group.avatar || 'https://via.placeholder.com/150'}
                    title={group.name}
                    membersText={`${group.members?.length || 0} members`}
                    amount={`Rs. 0.00`}
                    variant="settled"
                    onClick={() => navigate(`/groups/${group._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

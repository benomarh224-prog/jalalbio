'use client'

import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/admin-dashboard'

export default function DashboardPage() {
  const router = useRouter()

  return <AdminDashboard onExit={() => router.push('/')} />
}

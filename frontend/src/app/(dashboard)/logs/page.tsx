import api from '@/lib/axios'
import { EmailLog, EmailStatus } from '@/types/types'

import React, { useCallback, useRef, useState } from 'react'


interface LogsUpdateResponse {
  logs: EmailLog[]
  serverTime: string
}

const STATUS_FILTERS: ("ALL" | EmailStatus)[] = ["ALL", 'BOUNCED', 'DELIVERED', 'FAILED', 'PENDING', 'SENT']

const logsPage = () => {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | EmailStatus>("ALL")
  const sinceRef = useRef<string>(new Date().toISOString())

  const getEmailLogs = useCallback(async () => {
    try {
      const data = await api.get("/email/logs/updates")
      setLogs(data.data.data)
    } catch (error) {

    }



  }, [])

  return (
    <div>

    </div>
  )
}

export default logsPage
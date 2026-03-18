"use client"

import { PhoneMissed, Clock, DollarSign, AlertCircle } from "lucide-react"
import { QueueItemCard } from "./queue-item-card"
import type { QueueItem, User } from "@/lib/types"

interface MobileQueueViewProps {
  queue: QueueItem[]
  user: User
  exceptions: { missed: number; late: number; overdue: number; complaints: number }
  activeFilter: string | null
  onFilterClick: (filter: string) => void
  onAction: (action: string) => void
}

export function MobileQueueView({
  queue,
  user,
  exceptions,
  activeFilter,
  onFilterClick,
  onAction,
}: MobileQueueViewProps) {
  const exceptionCards = [
    { id: "missed", label: "Miss", value: exceptions.missed, icon: PhoneMissed, color: "text-red-600" },
    { id: "late", label: "Late", value: exceptions.late, icon: Clock, color: "text-amber-600" },
    { id: "overdue", label: "$", value: `$${exceptions.overdue}`, icon: DollarSign, color: "text-orange-600" },
    { id: "complaints", label: "!", value: exceptions.complaints, icon: AlertCircle, color: "text-red-600" },
  ]

  const hotItems = queue.filter((i) => i.priority === "hot")
  const dueItems = queue.filter((i) => i.priority === "due")
  const waitingItems = queue.filter((i) => i.priority === "waiting")

  return (
    <div className="p-4">
      {/* Exception chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {exceptionCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onFilterClick(card.id)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${
              activeFilter === card.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <card.icon className="h-3.5 w-3.5" />
            <span>{card.value}</span>
          </button>
        ))}
      </div>

      {/* Queue sections */}
      <div className="space-y-4">
        {hotItems.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold uppercase text-red-600 dark:text-red-400">Hot Now</span>
            </div>
            <div className="space-y-2">
              {hotItems.map((item) => (
                <QueueItemCard key={item.id} item={item} user={user} onAction={onAction} />
              ))}
            </div>
          </div>
        )}

        {dueItems.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold uppercase text-amber-600 dark:text-amber-400">Due Today</span>
            </div>
            <div className="space-y-2">
              {dueItems.map((item) => (
                <QueueItemCard key={item.id} item={item} user={user} onAction={onAction} />
              ))}
            </div>
          </div>
        )}

        {waitingItems.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <span className="text-sm font-semibold uppercase text-muted-foreground">Waiting</span>
            </div>
            <div className="space-y-2">
              {waitingItems.map((item) => (
                <QueueItemCard key={item.id} item={item} user={user} onAction={onAction} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

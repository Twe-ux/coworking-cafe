import React from 'react'

interface EmployeeListSkeletonProps {
  className?: string
}

export function EmployeeListSkeleton({ className }: EmployeeListSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="animate-pulse">
        <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

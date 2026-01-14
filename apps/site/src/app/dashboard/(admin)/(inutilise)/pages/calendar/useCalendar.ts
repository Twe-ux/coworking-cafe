'use client'
import { DateInput, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import { DateClickArg, Draggable, type DropArg } from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'

import { defaultEvents } from './data'

export type SubmitEventType = {
  title: string
  category: string
}

const useCalendar = () => {
  const [show, setShow] = useState<boolean>(false)

  const onOpenModal = () => setShow(true)
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [events, setEvents] = useState<EventInput[]>([...defaultEvents])
  const [eventData, setEventData] = useState<EventInput>()
  const [dateInfo, setDateInfo] = useState<DateClickArg>()

  const onCloseModal = () => {
    setEventData(undefined)
    setDateInfo(undefined)
    setShow(false)
  }

  useEffect(() => {
    // create draggable events
    const draggableEl = document.getElementById('external-events')
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: '.external-event',
      })
    }
  }, [])

  const onDateClick = (arg: DateClickArg) => {
    setDateInfo(arg)
    onOpenModal()
    setIsEditable(false)
  }

  const onEventClick = (arg: EventClickArg) => {
    const event = {
      id: String(arg.event.id),
      title: arg.event.title,
      className: arg.event.classNames[0],
    }
    setEventData(event)
    setIsEditable(true)
    onOpenModal()
  }

  const onDrop = (arg: DropArg) => {
    const dropEventData = arg
    const title = dropEventData.draggedEl.title
    if (title) {
      const newEvent = {
        id: String(events.length + 1),
        title: title,
        start: dropEventData ? dropEventData.dateStr : new Date(),
        className: dropEventData.draggedEl.dataset.class,
      }
      const modifiedEvents = [...events]
      modifiedEvents.push(newEvent)

      setEvents(modifiedEvents)
    }
  }

  const onAddEvent = (data: SubmitEventType) => {
    const modifiedEvents = [...events]
    const event = {
      id: String(modifiedEvents.length + 1),
      title: data.title,
      start: Object.keys(dateInfo ?? {}).length !== 0 ? dateInfo?.date : new Date(),
      className: data.category,
    }
    modifiedEvents.push(event)
    setEvents(modifiedEvents)
    onCloseModal()
  }

  const onUpdateEvent = (data: SubmitEventType) => {  }

  const createNewEvent = () => {
    onOpenModal()
    setIsEditable(false)
  }

  const onEventDrop = (arg: EventDropArg) => {
    const modifiedEvents = [...events]
    const idx = modifiedEvents.findIndex((e) => e.id === arg.event.id)
    if (idx !== -1) {
      modifiedEvents[idx].start = arg.event.start as DateInput
      modifiedEvents[idx].end = arg.event.end as DateInput
      setEvents(modifiedEvents)
    }
  }

  const onRemoveEvent = () => {
    if (eventData) {
      const modifiedEvents = events.filter((e) => e.id !== eventData.id)
      setEvents(modifiedEvents)
      onCloseModal()
    }
  }

  return {
    createNewEvent,
    show,
    onDateClick,
    onEventClick,
    onDrop,
    onEventDrop,
    events,
    onCloseModal,
    isEditable,
    eventData,
    onUpdateEvent,
    onRemoveEvent,
    onAddEvent,
  }
}

export default useCalendar

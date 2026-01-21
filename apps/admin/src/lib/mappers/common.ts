import type { Types } from 'mongoose'

/**
 * Common Mongoose Mappers - Generic utilities for transforming documents
 */

/**
 * Type guard to check if a value is a Mongoose ObjectId
 */
function isObjectId(value: unknown): value is Types.ObjectId {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toString' in value &&
    '_bsontype' in value &&
    (value as { _bsontype: string })._bsontype === 'ObjectId'
  )
}

/**
 * Convert a Mongoose ObjectId to string
 * Returns the string representation if it's an ObjectId, otherwise returns the value as string
 */
export function objectIdToString(
  id: Types.ObjectId | string | null | undefined
): string {
  if (id === null || id === undefined) {
    return ''
  }
  if (isObjectId(id)) {
    return id.toString()
  }
  return String(id)
}

/**
 * Base interface for documents with _id
 */
interface WithId {
  _id: Types.ObjectId | string
}

/**
 * Transform a single Mongoose document to a plain object with string id
 * Replaces _id with id as string
 *
 * @example
 * const doc = await Model.findById(id).lean()
 * const result = mapDocumentToApi(doc)
 * // { id: '...', ...rest }
 */
export function mapDocumentToApi<T extends WithId>(
  doc: T | null
): (Omit<T, '_id'> & { id: string }) | null {
  if (!doc) return null

  const { _id, ...rest } = doc
  return {
    id: objectIdToString(_id),
    ...rest,
  } as Omit<T, '_id'> & { id: string }
}

/**
 * Transform an array of Mongoose documents to plain objects with string ids
 *
 * @example
 * const docs = await Model.find().lean()
 * const results = mapDocumentsToApi(docs)
 */
export function mapDocumentsToApi<T extends WithId>(
  docs: T[]
): Array<Omit<T, '_id'> & { id: string }> {
  return docs.map((doc) => mapDocumentToApi(doc)!)
}

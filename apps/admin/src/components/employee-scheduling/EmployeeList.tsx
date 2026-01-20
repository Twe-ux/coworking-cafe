/**
 * EmployeeList - Compatibility Wrapper
 *
 * This file maintains backward compatibility with existing imports.
 * The actual implementation has been refactored into modular components
 * in the ./employee-list/ directory.
 *
 * Original file: 444 lines
 * New structure: Multiple files < 200 lines each
 *
 * @see ./employee-list/ for the modular implementation
 */

import { EmployeeListMain } from './employee-list'

export type { EmployeeListProps } from './employee-list'

export default EmployeeListMain

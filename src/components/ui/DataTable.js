import * as React from 'react';

// Import your custom UI components from their respective paths.
// Adjust these paths to match your actual project structure.
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table'; // Assuming table components are here
import { Button } from './button'; // Assuming button component is here
import { ScrollArea, ScrollBar } from './scroll-area'; // Assuming scroll-area components are here
import { Checkbox } from './checkbox'; // Assuming checkbox component is here
import { cn } from '../../lib/utils'; // Assuming your utility function 'cn' is here

// --- JSDoc Type Definitions ---
/**
 * @template T
 * @typedef {Object} ColumnDef
 * @property {keyof T | string} accessorKey
 * @property {React.ReactNode | ((context: any) => React.ReactNode)} header - Can be a ReactNode or a function that returns ReactNode.
 * @property {(row: T) => React.ReactNode} cell
 * @property {number} [size]
 */

/**
 * @template T
 * @typedef {Object} DataTableProps
 * @property {ColumnDef<T>[]} columns
 * @property {T[]} data
 * @property {(row: T) => void} [onRowClick]
 * @property {string} [noResultsMessage="No results found."]
 * @property {boolean} [isSelectable=false]
 * @property {Record<string, boolean>} [rowSelection={}]
 * @property {(selection: Record<string, boolean>) => void} [onRowSelectionChange]
 */

/**
 * A generic data table component with pagination and optional row selection.
 *
 * @template T - The type of data rows, must extend { id: string }.
 * @param {DataTableProps<T>} props
 */
export function DataTable({
  columns,
  data,
  onRowClick,
  noResultsMessage = "No results found.",
  isSelectable = false,
  rowSelection = {},
  onRowSelectionChange,
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /**
   * Handles the click event for the "select all" checkbox in the table header.
   * @param {boolean | 'indeterminate'} checked - The new checked state.
   */
  const handleSelectAllClick = React.useCallback((checked) => {
    if (!onRowSelectionChange) return;
    const newSelection = { ...rowSelection };
    paginatedData.forEach(row => {
      if (checked === true) {
        newSelection[row.id] = true;
      } else {
        // If unchecking, remove from selection or set to false explicitly
        delete newSelection[row.id]; 
      }
    });
    onRowSelectionChange(newSelection);
  }, [paginatedData, rowSelection, onRowSelectionChange]);

  /**
   * Handles the click event for individual row selection checkboxes.
   * @param {string} rowId - The ID of the row being selected/deselected.
   * @param {boolean} checked - The new checked state for the row.
   */
  const handleRowSelectClick = React.useCallback((rowId, checked) => {
    if (!onRowSelectionChange) return;
    const newSelection = { ...rowSelection };
    if (checked) {
      newSelection[rowId] = true;
    } else {
      delete newSelection[rowId];
    }
    onRowSelectionChange(newSelection);
  }, [rowSelection, onRowSelectionChange]);

  // Calculate selection states for the current page
  const paginatedDataIds = paginatedData.map(row => row.id);
  const numSelectedOnPage = paginatedDataIds.filter(id => rowSelection[id]).length;
  const allSelectedOnPage = paginatedData.length > 0 && numSelectedOnPage === paginatedData.length;
  const someSelectedOnPage = numSelectedOnPage > 0 && !allSelectedOnPage;

  // Memoize the columns to prevent unnecessary re-renders
  const tableColumns = React.useMemo(() => {
    if (!isSelectable) return columns;

    /** @type {ColumnDef<T>} */
    const selectionColumn = {
      accessorKey: 'select',
      header: () => (
        <Checkbox
          checked={allSelectedOnPage}
          // The data-state attribute is specific to Radix UI components (like Checkbox)
          // to manage appearance based on internal state (checked, indeterminate).
          // If your Checkbox component doesn't use Radix UI, this might not have an effect
          // or needs to be handled differently based on its API.
          data-state={someSelectedOnPage ? 'indeterminate' : (allSelectedOnPage ? 'checked' : 'unchecked')}
          onCheckedChange={handleSelectAllClick}
          aria-label="Select all rows on this page"
        />
      ),
      cell: (row) => (
        <Checkbox
          checked={!!rowSelection[row.id]}
          onCheckedChange={(checked) => handleRowSelectClick(row.id, !!checked)}
          aria-label={`Select row ${row.id}`}
          onClick={(e) => e.stopPropagation()} // Prevent row click event when interacting with checkbox
        />
      ),
      size: 50, // Fixed width for the selection column
    };
    return [selectionColumn, ...columns];
  }, [columns, isSelectable, rowSelection, paginatedData, allSelectedOnPage, someSelectedOnPage, handleSelectAllClick, handleRowSelectClick]);


  return (
    <div className="w-full space-y-4">
      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map((column, index) => (
                <TableHead
                  key={String(column.accessorKey) + index}
                  style={{ width: column.size ? `${column.size}px` : undefined }}
                >
                  {/* If header is a function (like for the checkbox), call it. Otherwise, render directly. */}
                  {typeof column.header === 'function' ? column.header(null) : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={`row-${row.id || rowIndex}`}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    onRowClick ? 'cursor-pointer hover:bg-muted/50' : '',
                    rowSelection[row.id] ? 'bg-muted/50' : '' // Apply selected style if row is selected
                  )}
                  data-state={rowSelection[row.id] ? 'selected' : undefined} // For CSS styling based on Radix state
                >
                  {tableColumns.map((column, colIndex) => (
                    <TableCell key={`cell-${row.id || rowIndex}-${colIndex}`}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" /> {/* For horizontal scrolling if table is too wide */}
      </ScrollArea>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";
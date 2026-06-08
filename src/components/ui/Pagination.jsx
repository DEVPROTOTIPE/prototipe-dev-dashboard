import React from 'react'
import { motion } from 'framer-motion'

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showAlways = false
}) {
  if (totalPages <= 1 && !showAlways) return null
  const pagesCount = totalPages || 1

  // Rango de páginas a mostrar
  const range = (start, end) => {
    let length = Math.max(0, end - start + 1)
    return Array.from({ length }, (_, idx) => idx + start)
  }

  const fetchPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 5
    const totalBlocks = totalNumbers + 2

    if (pagesCount > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount)
      const endPage = Math.min(pagesCount - 1, currentPage + siblingCount)
      let pages = range(startPage, endPage)

      const hasLeftSpill = startPage > 2
      const hasRightSpill = pagesCount - endPage > 1
      const spillOffset = totalNumbers - (pages.length + 1)

      switch (true) {
        // Caso 1: Spill a la derecha
        case !hasLeftSpill && hasRightSpill: {
          const extraPages = range(endPage + 1, endPage + spillOffset)
          pages = [...pages, ...extraPages]
          return [1, ...pages, '...', pagesCount]
        }

        // Caso 2: Spill a la izquierda
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = range(startPage - spillOffset, startPage - 1)
          pages = [...extraPages, ...pages]
          return [1, '...', ...pages, pagesCount]
        }

        // Caso 3: Spill a ambos lados
        case hasLeftSpill && hasRightSpill:
        default: {
          return [1, '...', ...pages, '...', pagesCount]
        }
      }
    }

    return range(1, pagesCount)
  }

  const pageNumbers = fetchPageNumbers()

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 mb-4 select-none">
      {/* Botón Anterior */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] disabled:opacity-40 hover:bg-[var(--color-surface-2)] transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Números de Página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-[var(--color-text-muted)] font-bold"
              >
                &bull;&bull;&bull;
              </span>
            )
          }

          const isSelected = page === currentPage

          return (
            <motion.button
              key={`page-${page}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center border cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-indigo-600 hover:bg-[var(--color-surface-2)]'
              }`}
            >
              {page}
            </motion.button>
          )
        })}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={() => currentPage < pagesCount && onPageChange(currentPage + 1)}
        disabled={currentPage === pagesCount}
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] disabled:opacity-40 hover:bg-[var(--color-surface-2)] transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Página siguiente"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

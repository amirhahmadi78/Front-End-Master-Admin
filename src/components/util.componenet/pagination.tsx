export default function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="flex items-center justify-center gap-4 my-1! rtl">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`
          px-2! py-1! rounded-xl font-small transition-all duration-200
          ${page === 1
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:-translate-y-0.5 hover:shadow-lg text-white'
          }
        `}
      >
        قبلی
      </button>

      <span className="px-2! py-1! bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 font-small shadow-sm">
        صفحه {page} از {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className={`
          px-2! py-1! rounded-xl font-small transition-all duration-200
          ${page === totalPages
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:-translate-y-0.5 hover:shadow-lg text-white'
          }
        `}
      >
        بعدی
      </button>
    </div>
  );
}
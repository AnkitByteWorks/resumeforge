export const ui = {
  page: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
  header: 'border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
  card: 'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
  heading: 'text-slate-900 dark:text-slate-50',
  muted: 'text-slate-600 dark:text-slate-400',
  label: 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300',
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/30',
  primary:
    'rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500',
  secondary:
    'rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  iconBtn:
    'rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
  link: 'font-medium text-blue-700 hover:underline dark:text-blue-400',
  brand: 'text-lg font-bold text-blue-700 dark:text-blue-400',
  error:
    'whitespace-pre-wrap rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300',
  notice:
    'rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  selected: 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40',
  unselected:
    'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
} as const

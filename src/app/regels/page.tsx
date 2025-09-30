import { ContentManager } from '@/lib/content'
import { FineService } from '@/lib/services/fineService'

export default async function RegelsPage() {
  const regelsPage = await ContentManager.getPageBySlug('regels')
  const fineTypes = await FineService.getFineTypes()
  
  return (
        <main className="min-h-screen p-8">
          {regelsPage && (
            <section className="mb-8">
              <div 
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: regelsPage.content }} 
              />
            </section>
          )}
          
          {/* Simple hardcoded table */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Boete Overzicht
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-rose-500 dark:text-rose-500 uppercase tracking-wider">
                      Overtreding
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-rose-500 dark:text-rose-500 uppercase tracking-wider">
                      Boete
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-rose-500 dark:text-rose-500 uppercase tracking-wider">
                      Opmerkingen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fineTypes.map((fineType) => (
                    <tr key={fineType.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {fineType.fine_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        €{fineType.fine_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {fineType.fine_description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
  )
}

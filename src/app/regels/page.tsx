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
          
          {/* Boete overzicht table with generic styles */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Boete Overzicht
            </h2>
            <div className="table-container">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell-primary">
                      Overtreding
                    </th>
                    <th className="table-header-cell-primary">
                      Boete
                    </th>
                    <th className="table-header-cell-primary">
                      Opmerkingen
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {fineTypes.map((fineType) => (
                    <tr key={fineType.id} className="table-row">
                      <td className="table-cell">
                        {fineType.fine_type}
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          €{fineType.fine_amount}
                        </span>
                      </td>
                      <td className="table-cell-secondary">
                        {fineType.fine_description || '-'}
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

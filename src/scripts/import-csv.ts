import { readFileSync } from 'fs'
import { csvImportService } from '@/lib/csv-import-service'

/**
 * Import CSV data from the downloaded file
 * Usage: npx ts-node src/scripts/import-csv.ts
 */
async function importCSV() {
  try {
    console.log('Starting CSV import process...')
    
    // Read the CSV file
    const csvPath = 'C:\\Users\\romar\\Downloads\\June & July ITAs - PR Tracker - All.csv'
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    console.log(`Read CSV file: ${csvPath}`)
    console.log(`File size: ${csvContent.length} characters`)
    
    // Import the data
    const result = await csvImportService.importCSVData(csvContent)
    
    // Generate and display report
    const report = csvImportService.generateImportReport(result)
    console.log(report)
    
    if (result.success) {
      console.log('✅ Import completed successfully!')
    } else {
      console.log('❌ Import completed with errors. Check the report above.')
    }
    
  } catch (error) {
    console.error('Fatal error during import:', error)
    process.exit(1)
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  importCSV()
}

export { importCSV }
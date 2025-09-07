import { NextRequest, NextResponse } from 'next/server'
import { csvImportService } from '@/lib/csv-import-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }
    
    const csvContent = await file.text()
    const result = await csvImportService.importCSVData(csvContent)
    const report = csvImportService.generateImportReport(result)
    
    return NextResponse.json({
      success: result.success,
      progress: result.progress,
      importedFeedbacks: result.importedFeedbacks,
      report
    })
    
  } catch (error) {
    console.error('Import API error:', error)
    return NextResponse.json(
      { error: `Import failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
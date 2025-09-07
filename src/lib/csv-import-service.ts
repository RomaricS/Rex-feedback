/* eslint-disable @typescript-eslint/no-explicit-any */
import { feedbackService, Feedback, ProcessStep } from "@/lib/feedback-service"

export interface CSVRow {
  Username: string
  STREAM: string
  ITA: string
  Complexity: string
  AOR: string
  "ADR\nReceived": string
  "AOR to BIL": string
  "Bio Req": string
  Medical: string
  "Eligibility Check": string
  "BG Check": string
  "Final Decision": string
  P1: string
  P2: string
  eCOPR: string
  "ITA to FD": string
  "AOR to FD": string
  "BIL to FD": string
  "FD to P1": string
  "P1 to P2": string
  "P2 to eCOPR": string
  "AOR to P2": string
  "AOR to eCoPR": string
  "IRCC Last Update": string
}

export interface ImportProgress {
  total: number
  processed: number
  successful: number
  failed: number
  errors: string[]
  warnings: string[]
}

export interface ImportResult {
  success: boolean
  progress: ImportProgress
  importedFeedbacks: string[]
}

class CSVImportService {
  private readonly SYSTEM_USER_ID = "csv-import-system-user"
  
  // Stream to Program mapping
  private readonly STREAM_TO_PROGRAM: Record<string, string> = {
    "CEC": "Express Entry - CEC (Canadian Experience Class)",
    "CEC Edu": "Express Entry - CEC (Canadian Experience Class)",
    "Healthcare": "Express Entry - General",
    "Education": "Express Entry - General",
    "French": "Express Entry - General",
    "EE-PNP": "Express Entry - PNP (Provincial Nominee Program)",
  }

  // CSV step to ProcessStep mapping
  private readonly STEP_MAPPING: Record<string, { stepType: string; stepName: string }> = {
    "ITA": { stepType: "ITA", stepName: "Invitation to Apply" },
    "AOR": { stepType: "AOR", stepName: "Acknowledgment of Receipt" },
    "Bio Req": { stepType: "BIL", stepName: "Biometric Instruction Letter" },
    "Medical": { stepType: "MEDICAL_PASSED", stepName: "Medical Examination" },
    "Eligibility Check": { stepType: "BACKGROUND_CHECK", stepName: "Eligibility Check" },
    "BG Check": { stepType: "BACKGROUND_CHECK", stepName: "Background Check" },
    "Final Decision": { stepType: "PPR", stepName: "Passport Request" },
    "P1": { stepType: "COPR", stepName: "Confirmation of Permanent Residence" },
    "P2": { stepType: "ECOPR", stepName: "Electronic COPR" },
    "eCOPR": { stepType: "LANDING", stepName: "Landing/eCOPR" },
  }

  /**
   * Parse CSV content into structured data
   */
  parseCSVContent(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 4) {
      throw new Error('CSV file appears to be empty or malformed')
    }

    // Skip the first few header lines and get the actual column headers
    const headerLine = lines.find(line => line.startsWith('Username,STREAM'))
    if (!headerLine) {
      throw new Error('Could not find valid CSV headers')
    }

    const headerIndex = lines.indexOf(headerLine)
    const headers = this.parseCSVLine(headerLine)
    const dataLines = lines.slice(headerIndex + 1)

    return dataLines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const values = this.parseCSVLine(line)
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row as CSVRow
      })
      .filter(row => row.Username && row.Username.trim() !== '')
  }

  /**
   * Parse a single CSV line handling quoted values and commas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  /**
   * Parse date from various formats in the CSV
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') {
      return null
    }

    // Handle negative Excel serial dates
    if (dateStr.startsWith('-')) {
      return null
    }

    // Clean the date string
    const cleanDate = dateStr.trim().split('\n')[0].split('(')[0].trim()
    
    // Try parsing YYYY/MM/DD format
    const match = cleanDate.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
    if (match) {
      const [, year, month, day] = match
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }

    // Try parsing other common formats
    const date = new Date(cleanDate)
    if (!isNaN(date.getTime())) {
      return date
    }

    return null
  }

  /**
   * Get application type from complexity field
   */
  private getApplicationType(complexity: string): string {
    if (!complexity) return "inland"
    
    const lowerComplexity = complexity.toLowerCase()
    if (lowerComplexity.includes('outland')) {
      return "outland"
    }
    return "inland"
  }

  /**
   * Map CSV program stream to our program list
   */
  private mapProgram(stream: string): string {
    const cleanStream = stream.trim()
    return this.STREAM_TO_PROGRAM[cleanStream] || "Express Entry - General"
  }

  /**
   * Extract process steps from CSV row
   */
  private extractProcessSteps(row: CSVRow): ProcessStep[] {
    const steps: ProcessStep[] = []
    const stepFields = [
      { csv: "ITA", key: "ITA" },
      { csv: "AOR", key: "AOR" },
      { csv: "Bio Req", key: "Bio Req" },
      { csv: "Medical", key: "Medical" },
      { csv: "Eligibility Check", key: "Eligibility Check" },
      { csv: "BG Check", key: "BG Check" },
      { csv: "Final Decision", key: "Final Decision" },
      { csv: "P1", key: "P1" },
      { csv: "P2", key: "P2" },
      { csv: "eCOPR", key: "eCOPR" },
    ]

    stepFields.forEach(({ csv, key }) => {
      const dateValue = (row as any)[csv]
      if (!dateValue) return

      const mapping = this.STEP_MAPPING[key]
      if (!mapping) return

      const completedAt = this.parseDate(dateValue)
      
      // Only add step if we have a valid date or it's marked as completed
      if (completedAt || this.isStepCompleted(dateValue)) {
        steps.push({
          stepType: mapping.stepType,
          stepName: mapping.stepName,
          completedAt,
          comment: this.extractStepComment(dateValue)
        })
      }
    })

    return steps
  }

  /**
   * Check if a step is marked as completed even without a date
   */
  private isStepCompleted(value: string): boolean {
    const lowerValue = value.toLowerCase()
    return lowerValue.includes('passed') || 
           lowerValue.includes('completed') || 
           lowerValue.includes('upfront')
  }

  /**
   * Extract comment from step value
   */
  private extractStepComment(value: string): string | undefined {
    if (!value) return undefined
    
    const lines = value.split('\n')
    if (lines.length > 1) {
      return lines.slice(1).join(' ').trim()
    }
    
    if (value.includes('(') && value.includes(')')) {
      const match = value.match(/\(([^)]+)\)/)
      if (match) return match[1]
    }
    
    return undefined
  }

  /**
   * Transform CSV row to Feedback object
   */
  transformToFeedback(row: CSVRow): Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> {
    const steps = this.extractProcessSteps(row)
    
    return {
      title: row.Username.trim(), // Use username as title as requested
      program: this.mapProgram(row.STREAM),
      applicationType: this.getApplicationType(row.Complexity),
      country: "Canada", // Default as not specified in CSV
      userId: this.SYSTEM_USER_ID,
      steps: steps,
      isActive: true,
    }
  }

  /**
   * Import CSV file content
   */
  async importCSVData(csvContent: string): Promise<ImportResult> {
    const progress: ImportProgress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: []
    }

    const importedFeedbacks: string[] = []

    try {
      // Parse CSV data
      const rows = this.parseCSVContent(csvContent)
      progress.total = rows.length

      console.log(`Starting import of ${rows.length} records...`)

      // Process in batches
      const batchSize = 10
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        
        for (const row of batch) {
          try {
            progress.processed++
            
            // Skip empty or invalid rows
            if (!row.Username || !row.STREAM) {
              progress.warnings.push(`Row ${progress.processed}: Missing required fields (Username or STREAM)`)
              continue
            }

            // Transform to feedback
            const feedbackData = this.transformToFeedback(row)
            
            // Import to database
            const feedbackId = await feedbackService.createFeedback(feedbackData)
            
            progress.successful++
            importedFeedbacks.push(feedbackId)
            
            console.log(`Imported: ${row.Username} (${feedbackId})`)
            
          } catch (error) {
            progress.failed++
            const errorMsg = `Row ${progress.processed} (${row.Username}): ${error instanceof Error ? error.message : String(error)}`
            progress.errors.push(errorMsg)
            console.error(errorMsg)
          }
        }

        // Add small delay between batches to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      return {
        success: progress.failed === 0,
        progress,
        importedFeedbacks
      }

    } catch (error) {
      progress.errors.push(`Import failed: ${error instanceof Error ? error.message : String(error)}`)
      return {
        success: false,
        progress,
        importedFeedbacks
      }
    }
  }

  /**
   * Generate import report
   */
  generateImportReport(result: ImportResult): string {
    const { progress } = result
    
    let report = `\n=== CSV Import Report ===\n`
    report += `Total records: ${progress.total}\n`
    report += `Processed: ${progress.processed}\n`
    report += `Successful: ${progress.successful}\n`
    report += `Failed: ${progress.failed}\n`
    report += `Success rate: ${((progress.successful / progress.total) * 100).toFixed(1)}%\n`
    
    if (progress.warnings.length > 0) {
      report += `\nWarnings (${progress.warnings.length}):\n`
      progress.warnings.forEach(warning => {
        report += `- ${warning}\n`
      })
    }
    
    if (progress.errors.length > 0) {
      report += `\nErrors (${progress.errors.length}):\n`
      progress.errors.forEach(error => {
        report += `- ${error}\n`
      })
    }
    
    report += `\nImported feedback IDs:\n`
    result.importedFeedbacks.forEach(id => {
      report += `- ${id}\n`
    })
    
    return report
  }
}

export const csvImportService = new CSVImportService()
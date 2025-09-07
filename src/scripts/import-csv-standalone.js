const fs = require('fs')
const path = require('path')

// Simple CSV parser
function parseCSVContent(csvContent) {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 4) {
    throw new Error('CSV file appears to be empty or malformed')
  }

  // The header is actually on line 4-5, let's reconstruct it
  // Line 4: Username,STREAM,ITA,Complexity,AOR,"ADR
  // Line 5: Received",AOR to BIL,Bio Req,Medical,Eligibility Check,BG Check,Final Decision,P1,P2,eCOPR,ITA to FD,AOR to FD,BIL to FD,FD to P1,P1 to P2,P2 to eCOPR,AOR to P2,AOR to eCoPR,IRCC Last Update
  
  const headerLine1 = lines[3] // Username,STREAM,ITA,Complexity,AOR,"ADR
  const headerLine2 = lines[4] // Received",AOR to BIL,Bio Req,...
  
  // Combine the header lines properly
  const combinedHeader = headerLine1.replace('"ADR', 'ADR Received') + ',' + headerLine2.substring(9) // Remove 'Received",' from start of line 2
  const headers = parseCSVLine(combinedHeader)
  
  const dataLines = lines.slice(5) // Data starts from line 6 (index 5)

  return dataLines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const values = parseCSVLine(line)
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })
    .filter(row => row.Username && row.Username.trim() !== '')
}

function parseCSVLine(line) {
  const result = []
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

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') {
    return null
  }

  // Handle negative Excel serial dates (skip them)
  if (dateStr.startsWith('-') || dateStr.includes('-45')) {
    return null
  }

  // Clean the date string
  const cleanDate = dateStr.trim().split('\n')[0].split('(')[0].trim()
  
  // Skip if it's a status word instead of a date
  if (['Passed', 'Completed', 'In Process', 'Not Started', 'upfront'].includes(cleanDate)) {
    return null
  }
  
  // Try parsing YYYY/MM/DD format
  const match = cleanDate.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (match) {
    const [, year, month, day] = match
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    // Sanity check - reject dates before 2020 or after 2030
    if (date.getFullYear() < 2020 || date.getFullYear() > 2030) {
      return null
    }
    
    return date
  }

  // Try parsing other common formats
  const date = new Date(cleanDate)
  if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
    return date
  }

  return null
}

// Stream to Program mapping
const STREAM_TO_PROGRAM = {
  "CEC": "Express Entry - CEC (Canadian Experience Class)",
  "CEC Edu": "Express Entry - CEC (Canadian Experience Class)",
  "Healthcare": "Express Entry - General",
  "Education": "Express Entry - General",
  "French": "Express Entry - General",
  "EE-PNP": "Express Entry - PNP (Provincial Nominee Program)",
}

// CSV step to ProcessStep mapping
const STEP_MAPPING = {
  "ITA": { stepType: "ITA", stepName: "Invitation to Apply" },
  "AOR": { stepType: "AOR", stepName: "Acknowledgment of Receipt" },
  "Bio Req": { stepType: "BIOMETRICS_PASSED", stepName: "Biometrics Completed" },
  "Medical": { stepType: "MEDICAL_PASSED", stepName: "Medical Examination" },
  "Eligibility Check": { stepType: "BIL", stepName: "Biometric Instruction Letter" },
  "BG Check": { stepType: "BACKGROUND_CHECK", stepName: "Background Check" },
  "Final Decision": { stepType: "PPR", stepName: "Passport Request" },
  "P1": { stepType: "COPR", stepName: "Confirmation of Permanent Residence" },
  "P2": { stepType: "ECOPR", stepName: "Electronic COPR" },
  "eCOPR": { stepType: "LANDING", stepName: "Landing/eCOPR" },
}

function getApplicationType(complexity) {
  if (!complexity) return "inland"
  
  const lowerComplexity = complexity.toLowerCase()
  if (lowerComplexity.includes('outland')) {
    return "outland"
  }
  return "inland"
}

function mapProgram(stream) {
  const cleanStream = stream.trim()
  return STREAM_TO_PROGRAM[cleanStream] || "Express Entry - General"
}

function isStepCompleted(value) {
  const lowerValue = value.toLowerCase()
  return lowerValue.includes('passed') || 
         lowerValue.includes('completed') || 
         lowerValue.includes('upfront')
}

function extractStepComment(value) {
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

function extractProcessSteps(row) {
  const steps = []
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
    const dateValue = row[csv]
    if (!dateValue) return

    const mapping = STEP_MAPPING[key]
    if (!mapping) return

    const completedAt = parseDate(dateValue)
    
    // Only add step if we have a valid date or it's marked as completed
    if (completedAt || isStepCompleted(dateValue)) {
      steps.push({
        stepType: mapping.stepType,
        stepName: mapping.stepName,
        completedAt,
        comment: extractStepComment(dateValue)
      })
    }
  })

  return steps
}

function transformToFeedback(row) {
  const steps = extractProcessSteps(row)
  
  return {
    title: row.Username.trim(), // Use username as title as requested
    program: mapProgram(row.STREAM),
    applicationType: getApplicationType(row.Complexity),
    country: "Canada", // Default as not specified in CSV
    userId: "csv-import-system-user",
    steps: steps,
    isActive: true,
  }
}

// Main function
async function main() {
  try {
    console.log('Starting CSV analysis...')
    
    // Read the CSV file
    const csvPath = 'C:\\Users\\romar\\Downloads\\June & July ITAs - PR Tracker - All.csv'
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    console.log(`Read CSV file: ${csvPath}`)
    console.log(`File size: ${csvContent.length} characters`)
    
    // Parse CSV data
    const rows = parseCSVContent(csvContent)
    console.log(`Parsed ${rows.length} records`)
    
    // Show column headers
    console.log('\n=== Column Headers ===')
    if (rows.length > 0) {
      const headers = Object.keys(rows[0])
      console.log(`Found ${headers.length} columns:`)
      headers.forEach((header, index) => {
        console.log(`${index + 1}: "${header}"`)
      })
      
      // Show first data row values to debug
      console.log('\n=== First Data Row ===')
      const firstDataRow = rows[1] // Skip header row
      if (firstDataRow) {
        Object.entries(firstDataRow).slice(0, 15).forEach(([key, value]) => {
          console.log(`${key}: "${value}"`)
        })
      }
    }
    
    // Analyze and transform first few records
    console.log('\n=== Sample Analysis ===')
    const sampleSize = Math.min(5, rows.length)
    
    for (let i = 0; i < sampleSize; i++) {
      const row = rows[i]
      const feedback = transformToFeedback(row)
      
      console.log(`\n--- Record ${i + 1}: ${row.Username} ---`)
      console.log(`Program: ${feedback.program}`)
      console.log(`Application Type: ${feedback.applicationType}`)
      console.log(`Steps: ${feedback.steps.length} process steps`)
      
      feedback.steps.forEach(step => {
        const dateStr = step.completedAt ? step.completedAt.toISOString().split('T')[0] : 'No date'
        console.log(`  - ${step.stepName} (${step.stepType}): ${dateStr}`)
      })
    }
    
    // Generate statistics
    console.log('\n=== Statistics ===')
    const programStats = {}
    const stepStats = {}
    
    rows.forEach(row => {
      const feedback = transformToFeedback(row)
      
      // Count programs
      programStats[feedback.program] = (programStats[feedback.program] || 0) + 1
      
      // Count steps
      feedback.steps.forEach(step => {
        stepStats[step.stepType] = (stepStats[step.stepType] || 0) + 1
      })
    })
    
    console.log('\nProgram Distribution:')
    Object.entries(programStats).forEach(([program, count]) => {
      console.log(`  ${program}: ${count}`)
    })
    
    console.log('\nStep Distribution:')
    Object.entries(stepStats).forEach(([step, count]) => {
      console.log(`  ${step}: ${count}`)
    })
    
    console.log(`\n✅ Analysis complete! Ready to import ${rows.length} records.`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
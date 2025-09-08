import jsPDF from 'jspdf'
import { Feedback } from './feedback-service'
import { format } from 'date-fns'

class ExportService {
  exportToCSV(feedbacks: Feedback[]): void {
    if (feedbacks.length === 0) {
      alert('No data to export')
      return
    }

    const headers = [
      'Title',
      'Program',
      'Country',
      'Application Type',
      'Step Type',
      'Step Name',
      'Completion Date',
      'Comment',
      'Feedback Created'
    ]

    const rows: string[][] = []

    feedbacks.forEach(feedback => {
      if (feedback.steps.length === 0) {
        // Add feedback without steps
        rows.push([
          feedback.title,
          feedback.program,
          feedback.country || 'N/A',
          feedback.applicationType || 'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          format(feedback.createdAt, 'MMM d, yyyy')
        ])
      } else {
        // Add each step as a separate row
        feedback.steps.forEach(step => {
          rows.push([
            feedback.title,
            feedback.program,
            feedback.country || 'N/A',
            feedback.applicationType || 'N/A',
            step.stepType,
            step.stepName,
            step.completedAt ? format(step.completedAt, 'MMM d, yyyy') : 'Not completed',
            step.comment || 'N/A',
            format(feedback.createdAt, 'MMM d, yyyy')
          ])
        })
      }
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `my-immigration-data-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  exportToPDF(feedbacks: Feedback[]): void {
    if (feedbacks.length === 0) {
      alert('No data to export')
      return
    }

    const pdf = new jsPDF()
    const pageHeight = pdf.internal.pageSize.height
    let yPosition = 20

    // Title
    pdf.setFontSize(20)
    pdf.text('My Immigration Journey', 20, yPosition)
    yPosition += 15

    pdf.setFontSize(12)
    pdf.text(`Exported on: ${format(new Date(), 'MMMM d, yyyy')}`, 20, yPosition)
    yPosition += 15

    feedbacks.forEach((feedback, feedbackIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = 20
      }

      // Feedback title
      pdf.setFontSize(16)
      pdf.text(`${feedbackIndex + 1}. ${feedback.title}`, 20, yPosition)
      yPosition += 10

      // Basic info
      pdf.setFontSize(10)
      pdf.text(`Program: ${feedback.program}`, 25, yPosition)
      yPosition += 8
      
      if (feedback.country) {
        pdf.text(`Country: ${feedback.country}`, 25, yPosition)
        yPosition += 8
      }

      if (feedback.applicationType) {
        pdf.text(`Application Type: ${feedback.applicationType}`, 25, yPosition)
        yPosition += 8
      }

      pdf.text(`Submitted: ${format(feedback.createdAt, 'MMM d, yyyy')}`, 25, yPosition)
      yPosition += 12

      // Steps
      if (feedback.steps.length > 0) {
        pdf.setFontSize(12)
        pdf.text('Process Steps:', 25, yPosition)
        yPosition += 8

        feedback.steps
          .sort((a, b) => {
            if (!a.completedAt && !b.completedAt) return 0
            if (!a.completedAt) return 1
            if (!b.completedAt) return -1
            return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
          })
          .forEach(step => {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
              pdf.addPage()
              yPosition = 20
            }

            pdf.setFontSize(10)
            const completionText = step.completedAt 
              ? format(step.completedAt, 'MMM d, yyyy')
              : 'Not completed'
            
            pdf.text(`• ${step.stepName} - ${completionText}`, 30, yPosition)
            yPosition += 6

            if (step.comment) {
              const comment = step.comment.length > 80 
                ? step.comment.substring(0, 80) + '...' 
                : step.comment
              pdf.text(`  Comment: ${comment}`, 35, yPosition)
              yPosition += 6
            }
          })
      }

      yPosition += 10 // Space between feedbacks
    })

    // Save the PDF
    pdf.save(`my-immigration-data-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  calculateProcessingTime(feedback: Feedback): string {
    if (!feedback.steps.length) return 'N/A'
    
    const itaStep = feedback.steps.find(step => step.stepType === 'ITA' && step.completedAt)
    if (!itaStep) return 'N/A'
    
    const latestStep = feedback.steps
      .filter(step => step.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
    
    if (!latestStep) return 'N/A'
    
    const diffTime = new Date(latestStep.completedAt!).getTime() - new Date(itaStep.completedAt!).getTime()
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30))
    
    return diffMonths > 0 ? `${diffMonths} months` : 'Less than 1 month'
  }
}

export const exportService = new ExportService()
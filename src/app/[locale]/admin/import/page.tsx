"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImportResult } from "@/lib/csv-import-service"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [report, setReport] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setResult(null)
      setReport("")
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)
    setReport("")

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }
      
      setResult({
        success: data.success,
        progress: data.progress,
        importedFeedbacks: data.importedFeedbacks
      })
      setReport(data.report)
    } catch (error) {
      console.error('Import error:', error)
      setReport(`Import failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setImporting(false)
    }
  }

  const progressPercentage = result 
    ? Math.round((result.progress.processed / result.progress.total) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CSV Data Import</h1>
          <p className="text-muted-foreground mt-2">
            Import immigration tracker data from CSV files
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV file</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
                className="mt-1"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {importing && result && (
          <Card>
            <CardHeader>
              <CardTitle>Import Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={progressPercentage} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {result.progress.processed} of {result.progress.total} records processed
                  ({result.progress.successful} successful, {result.progress.failed} failed)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.progress.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.progress.successful}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.progress.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {((result.progress.successful / result.progress.total) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>

              {result.progress.warnings.length > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.progress.warnings.length} warnings occurred during import.
                    Check the detailed report below.
                  </AlertDescription>
                </Alert>
              )}

              {result.progress.errors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.progress.errors.length} errors occurred during import.
                    Check the detailed report below.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {report && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={report}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
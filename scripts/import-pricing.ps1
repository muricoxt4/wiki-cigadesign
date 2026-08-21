param(
    [string]$WorkbookPath = 'C:\Users\perso\Desktop\controleVendas\CIGA PRICCING.xlsx',
    [string]$Endpoint = 'https://script.google.com/macros/s/AKfycbxjKJIMDo8ke-t5-9Zj3GL6MJa4kvqMxfdieekj-b3fKKjRZGd6nK0HAcUrneKnMtCR/exec',
    [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
$expectedHash = '4a837011cdb524761ce01dedaf0f199358316accac52e6a071cbcbe4cc3f1e9b'
$pricingColumnCount = 10
$excelApp = $null
$workbookObject = $null
$sheetObject = $null
$usedRangeObject = $null
$dataRangeObject = $null

if (-not (Test-Path -LiteralPath $WorkbookPath -PathType Leaf)) {
    throw "Planilha não encontrada: $WorkbookPath"
}

try {
    $excelApp = New-Object -ComObject Excel.Application
    $excelApp.Visible = $false
    $excelApp.DisplayAlerts = $false
    $workbookObject = $excelApp.Workbooks.Open($WorkbookPath, 0, $true)
    $sheetObject = $workbookObject.Worksheets.Item(1)
    $usedRangeObject = $sheetObject.UsedRange
    $usedMatrix = $usedRangeObject.Value2
    $lastDataRow = 0

    for ($rowIndex = 1; $rowIndex -le $usedRangeObject.Rows.Count; $rowIndex++) {
        for ($columnIndex = 1; $columnIndex -le $pricingColumnCount; $columnIndex++) {
            $cellValue = $usedMatrix.GetValue($rowIndex, $columnIndex)
            if ($null -ne $cellValue -and [string]$cellValue -ne '') {
                $lastDataRow = $rowIndex
                break
            }
        }
    }

    if ($lastDataRow -lt 2) { throw 'A planilha não contém produtos para importar.' }

    $dataRangeObject = $sheetObject.Range("A1:J$lastDataRow")
    $dataMatrix = $dataRangeObject.Value2
    $pricingRows = [System.Collections.ArrayList]::new()

    for ($rowIndex = 1; $rowIndex -le $lastDataRow; $rowIndex++) {
        $rowValues = New-Object object[] $pricingColumnCount
        for ($columnIndex = 1; $columnIndex -le $pricingColumnCount; $columnIndex++) {
            $cellValue = $dataMatrix.GetValue($rowIndex, $columnIndex)
            if ($cellValue -is [string]) { $cellValue = $cellValue -replace "`r`n", "`n" }
            $rowValues[$columnIndex - 1] = $cellValue
        }
        [void]$pricingRows.Add($rowValues)
    }

    $pricingJson = ConvertTo-Json -InputObject @($pricingRows) -Depth 4 -Compress
    $hashAlgorithm = [Security.Cryptography.SHA256]::Create()
    try {
        $actualHash = -join ($hashAlgorithm.ComputeHash([Text.Encoding]::UTF8.GetBytes($pricingJson)) | ForEach-Object { $_.ToString('x2') })
    } finally {
        $hashAlgorithm.Dispose()
    }

    if ($actualHash -ne $expectedHash) {
        throw "A planilha mudou desde a auditoria. Hash esperado: $expectedHash; encontrado: $actualHash."
    }

    if ($ValidateOnly) {
        Write-Output "Planilha validada: $($pricingRows.Count - 1) produtos, hash $actualHash."
    } else {
        $response = Invoke-WebRequest -UseBasicParsing -Method Post -Uri $Endpoint -Body @{
            action = 'importPricing'
            callbackToken = 'importacao-tabela-precos'
            pricingData = $pricingJson
        } -ContentType 'application/x-www-form-urlencoded' -MaximumRedirection 10

        if (-not $response.Content.Contains('Tabela de preços importada com sucesso.')) {
            throw 'O Apps Script recusou a importação. Confirme se a versão mais recente foi implantada.'
        }

        Write-Output "Importação concluída: $($pricingRows.Count - 1) produtos enviados para a aba 'Tabela de Preços'."
    }
} finally {
    if ($dataRangeObject) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($dataRangeObject) }
    if ($usedRangeObject) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($usedRangeObject) }
    if ($sheetObject) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($sheetObject) }
    if ($workbookObject) {
        $workbookObject.Close($false)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($workbookObject)
    }
    if ($excelApp) {
        $excelApp.Quit()
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excelApp)
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

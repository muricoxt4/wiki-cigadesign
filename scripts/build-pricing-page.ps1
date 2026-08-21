param(
    [string]$WorkbookPath = 'C:\Users\perso\Desktop\controleVendas\CIGA PRICCING.xlsx'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $WorkbookPath -PathType Leaf)) {
    throw "Planilha de preços não encontrada: $WorkbookPath"
}

Add-Type -AssemblyName System.IO.Compression

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $repositoryRoot 'precos'
$imageDirectory = Join-Path $outputDirectory 'imagens'
[void](New-Item -ItemType Directory -Path $outputDirectory -Force)
[void](New-Item -ItemType Directory -Path $imageDirectory -Force)

$workbookStream = [IO.File]::Open(
    $WorkbookPath,
    [IO.FileMode]::Open,
    [IO.FileAccess]::Read,
    [IO.FileShare]::ReadWrite
)
$archive = New-Object IO.Compression.ZipArchive($workbookStream, [IO.Compression.ZipArchiveMode]::Read)

function Read-ZipText {
    param([string]$EntryPath)

    $entry = $archive.GetEntry($EntryPath)
    if (-not $entry) { throw "Arquivo interno ausente no XLSX: $EntryPath" }
    $reader = New-Object IO.StreamReader($entry.Open())
    try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Normalize-CellText {
    param($Value)
    return (([string]$Value) -replace '\s+', ' ').Trim()
}

try {
    [xml]$sharedStringsXml = Read-ZipText 'xl/sharedStrings.xml'
    [xml]$worksheetXml = Read-ZipText 'xl/worksheets/sheet1.xml'
    [xml]$drawingXml = Read-ZipText 'xl/drawings/drawing1.xml'
    [xml]$drawingRelationshipsXml = Read-ZipText 'xl/drawings/_rels/drawing1.xml.rels'

    $sharedStrings = @(
        $sharedStringsXml.SelectNodes("//*[local-name()='sst']/*[local-name()='si']") | ForEach-Object {
            ($_.SelectNodes(".//*[local-name()='t']") | ForEach-Object InnerText) -join ''
        }
    )

    $cells = @{}
    foreach ($cell in $worksheetXml.SelectNodes("//*[local-name()='c']")) {
        $reference = $cell.GetAttribute('r')
        $type = $cell.GetAttribute('t')
        $valueNode = $cell.SelectSingleNode("*[local-name()='v']")

        if ($type -eq 's' -and $valueNode) {
            $cells[$reference] = $sharedStrings[[int]$valueNode.InnerText]
        } elseif ($type -eq 'inlineStr') {
            $cells[$reference] = ($cell.SelectNodes(".//*[local-name()='t']") | ForEach-Object InnerText) -join ''
        } elseif ($valueNode) {
            $cells[$reference] = $valueNode.InnerText
        } else {
            $cells[$reference] = ''
        }
    }

    if ((Normalize-CellText $cells['A1']) -ne 'Codigo' -or (Normalize-CellText $cells['I1']) -ne 'BRAZIL WEB') {
        throw 'A aba Distribuidor não possui os cabeçalhos esperados nas colunas A e I.'
    }

    $relationshipTargets = @{}
    foreach ($relationship in $drawingRelationshipsXml.SelectNodes("//*[local-name()='Relationship']")) {
        $relationshipTargets[$relationship.GetAttribute('Id')] = [IO.Path]::GetFileName($relationship.GetAttribute('Target'))
    }

    $anchors = @(
        foreach ($anchor in $drawingXml.SelectNodes("//*[local-name()='oneCellAnchor' or local-name()='twoCellAnchor']")) {
            $rowNode = $anchor.SelectSingleNode("*[local-name()='from']/*[local-name()='row']")
            $blip = $anchor.SelectSingleNode(".//*[local-name()='blip']")
            if (-not $rowNode -or -not $blip) { continue }

            $relationshipId = $blip.GetAttribute('embed', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
            [PSCustomObject]@{
                Row = [int]$rowNode.InnerText + 1
                Media = $relationshipTargets[$relationshipId]
            }
        }
    )

    $imageByRow = @{}
    foreach ($group in ($anchors | Group-Object Row)) {
        $rowNumber = [int]$group.Name
        $rowImages = @($group.Group)
        $imageByRow[$rowNumber] = $rowImages[0].Media

        # As imagens de Exploration Silver e Aircraft Carrier Black começam na linha 45.
        if ($rowNumber -eq 45 -and $rowImages.Count -eq 2) {
            $imageByRow[46] = $rowImages[1].Media
        }
    }

    # A planilha usa imagens compartilhadas nos intervalos mesclados D11:D14 e D15:D18.
    foreach ($rowNumber in 11..14) { $imageByRow[$rowNumber] = $imageByRow[12] }
    foreach ($rowNumber in 15..18) { $imageByRow[$rowNumber] = $imageByRow[15] }

    $mediaFiles = @($relationshipTargets.Values | Sort-Object -Unique)
    foreach ($mediaFile in $mediaFiles) {
        $entry = $archive.GetEntry("xl/media/$mediaFile")
        if (-not $entry) { throw "Imagem incorporada ausente: $mediaFile" }

        $destination = Join-Path $imageDirectory $mediaFile
        $inputStream = $entry.Open()
        $outputStream = [IO.File]::Open($destination, [IO.FileMode]::Create, [IO.FileAccess]::Write)
        try { $inputStream.CopyTo($outputStream) } finally { $outputStream.Dispose(); $inputStream.Dispose() }
    }

    $culture = [Globalization.CultureInfo]::GetCultureInfo('pt-BR')
    $products = @(
        foreach ($rowNumber in 2..61) {
            $description = Normalize-CellText $cells["B$rowNumber"]
            $descriptionLower = $description.ToLowerInvariant()
            $collection = if ($descriptionLower -match 'blue planet|black star|moon walker') {
                'Aventur'
            } elseif ($descriptionLower -match 'everest') {
                'Everest'
            } elseif ($descriptionLower -match 'legend of serpent') {
                'Zodiac'
            } elseif ($descriptionLower -match 'hunter|vector|falcon|exploration|z031-') {
                'Edge'
            } else {
                'Outros / Legado'
            }

            $priceValue = [decimal]::Parse([string]$cells["I$rowNumber"], [Globalization.CultureInfo]::InvariantCulture)
            $mediaFile = $imageByRow[$rowNumber]
            if (-not $mediaFile) { throw "Nenhuma imagem foi associada à linha $rowNumber." }

            [PSCustomObject]@{
                row = $rowNumber
                code = Normalize-CellText $cells["A$rowNumber"]
                description = $description
                sku = Normalize-CellText $cells["E$rowNumber"]
                collection = $collection
                price = $priceValue.ToString('C2', $culture)
                priceValue = $priceValue
                image = "imagens/$mediaFile"
            }
        }
    )

    $json = ConvertTo-Json -InputObject $products -Depth 4 -Compress
    $javascript = "window.CIGA_PRICING = $json;`n"
    [IO.File]::WriteAllText(
        (Join-Path $outputDirectory 'produtos.js'),
        $javascript,
        (New-Object Text.UTF8Encoding($false))
    )

    Write-Output "Página de preços atualizada: $($products.Count) itens e $($mediaFiles.Count) imagens extraídas de '$WorkbookPath'."
} finally {
    $archive.Dispose()
    $workbookStream.Dispose()
}

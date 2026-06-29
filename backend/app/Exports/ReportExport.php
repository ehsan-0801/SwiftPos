<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

/** Generic report → Excel sheet (headings + rows from ReportService output). */
class ReportExport implements FromArray, WithHeadings, WithTitle
{
    public function __construct(
        private array $columns,
        private array $rows,
        private string $title = 'Report',
    ) {}

    public function array(): array
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return $this->columns;
    }

    public function title(): string
    {
        return substr($this->title, 0, 31); // Excel sheet-name limit
    }
}

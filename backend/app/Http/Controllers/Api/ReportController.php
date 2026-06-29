<?php

namespace App\Http\Controllers\Api;

use App\Exports\ReportExport;
use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function __construct(private ReportService $reports) {}

    /** Single entry point: /reports/{report}?from=&to=&export=pdf|excel */
    public function show(Request $request, string $report)
    {
        $from = $request->query('from');
        $to = $request->query('to');

        $data = match ($report) {
            'sales' => $this->reports->sales($from, $to),
            'profit' => $this->reports->profit($from, $to),
            'stock' => $this->reports->stock(),
            'low-stock' => $this->reports->lowStock(),
            'purchases' => $this->reports->purchases($from, $to),
            'expenses' => $this->reports->expenses($from, $to),
            'customer-due' => $this->reports->customerDue(),
            'supplier-due' => $this->reports->supplierDue(),
            'top-products' => $this->reports->topProducts($request->integer('limit', 10)),
            'cashier' => $this->reports->cashier($from, $to),
            default => abort(404, 'Unknown report'),
        };

        $export = $request->query('export');

        if ($export === 'pdf') {
            return Pdf::loadView('reports.pdf', [...$data, 'from' => $from, 'to' => $to])
                ->download("{$report}-report.pdf");
        }

        if ($export === 'excel') {
            return Excel::download(
                new ReportExport($data['columns'], $data['rows'], $data['title']),
                "{$report}-report.xlsx"
            );
        }

        return response()->json($data);
    }
}
